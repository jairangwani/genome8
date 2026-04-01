/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
/**
 * Check all dependencies for interface changes.
 */
export function checkDependencies(dependenciesPath, index, syncStatePath, resolveDependencyPath) {
    const changes = [];
    // Read dependencies.yaml
    if (!fs.existsSync(dependenciesPath))
        return [];
    const deps = yaml.load(fs.readFileSync(dependenciesPath, 'utf-8'));
    if (!deps?.dependencies)
        return [];
    // Read sync state (known hashes)
    let syncState = { known_hashes: {} };
    if (fs.existsSync(syncStatePath)) {
        try {
            syncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
        }
        catch { /* fresh start */ }
    }
    // Guard against concurrent sync operations
    if (syncState.sync_in_progress) {
        // Check for stale lock (>5 min old)
        const lockAge = syncState.sync_started_at
            ? Date.now() - new Date(syncState.sync_started_at).getTime()
            : Infinity;
        if (lockAge < 5 * 60 * 1000) {
            // Another sync is running and lock is fresh — skip
            return [];
        }
        // Stale lock — proceed and take over
    }
    syncState.sync_in_progress = true;
    syncState.sync_started_at = new Date().toISOString();
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState, null, 2));
    for (const [depName, config] of Object.entries(deps.dependencies)) {
        // Resolve dependency path
        const depPublishedDir = resolveDependencyPath(depName);
        if (!depPublishedDir)
            continue;
        const interfacePath = path.join(depPublishedDir, 'interface.yaml');
        if (!fs.existsSync(interfacePath)) {
            // Dependency unavailable
            if (config.fallback === 'last_known_good') {
                // Keep running on cached version — no change
                continue;
            }
            continue;
        }
        // Read dependency's current interface
        let depInterface;
        try {
            depInterface = yaml.load(fs.readFileSync(interfacePath, 'utf-8'));
        }
        catch {
            continue;
        }
        const currentHash = depInterface.version_hash;
        const knownHash = syncState.known_hashes[depName];
        // Check if pinned to specific version
        if (config.pin !== 'latest' && config.pin !== currentHash) {
            // Pinned to old version — don't update, but alert if configured
            if (config.alert_on_update && currentHash !== knownHash) {
                // New version available but we're pinned
                // Store that we've seen it but don't trigger reconvergence
                syncState.known_hashes[depName] = currentHash;
            }
            continue;
        }
        // Check if hash changed
        if (knownHash && knownHash === currentHash) {
            continue; // No change
        }
        // Hash changed! Find affected local modules
        const affectedModules = findAffectedModules(depName, index);
        // Read changelog if available
        let changelog = null;
        const changelogPath = path.join(depPublishedDir, 'changelog.yaml');
        if (fs.existsSync(changelogPath)) {
            try {
                changelog = yaml.load(fs.readFileSync(changelogPath, 'utf-8'));
            }
            catch { /* no changelog */ }
        }
        changes.push({
            dependency: depName,
            previous_hash: knownHash ?? 'none',
            current_hash: currentHash,
            affected_modules: affectedModules,
            changelog,
        });
        // Update known hash
        syncState.known_hashes[depName] = currentHash;
    }
    // Release sync lock and save state
    syncState.sync_in_progress = false;
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState, null, 2));
    return changes;
}
/**
 * Find which local modules reference a dependency's nodes in their journeys.
 */
function findAffectedModules(depName, index) {
    const affected = new Set();
    for (const [, journey] of Object.entries(index.journeys)) {
        for (const step of journey.steps) {
            // Check if step references the dependency
            if (step.node.startsWith(depName + '/')) {
                affected.add(journey.module);
            }
        }
    }
    return [...affected];
}
/**
 * Mark modules as stale by adding _stale: true to their YAML files.
 */
export function markModulesStale(modulesDir, modules, reason) {
    for (const mod of modules) {
        const filePath = path.join(modulesDir, `${mod}.yaml`);
        if (!fs.existsSync(filePath))
            continue;
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('_stale: true'))
            continue; // already stale
        // Prepend stale marker
        const updated = `_stale: true\n_stale_reason: "${reason}"\n\n${content}`;
        fs.writeFileSync(filePath, updated);
    }
}
export function parseEventPayload(eventFilePath) {
    try {
        const raw = fs.readFileSync(eventFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.interface_hash || typeof parsed.sequence_number !== 'number') {
            return null;
        }
        return {
            interface_hash: parsed.interface_hash,
            changelog_summary: parsed.changelog_summary ?? [],
            origin_chain: parsed.origin_chain ?? [],
            sequence_number: parsed.sequence_number,
            dependency: parsed.dependency ?? '',
        };
    }
    catch {
        return null;
    }
}
/**
 * Check if an event's sequence number is newer than the last processed sequence.
 * Returns true if the event should be processed, false if it should be discarded.
 */
export function checkEventSequence(syncState, dependency, incomingSequence) {
    const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? -1;
    return incomingSequence > lastProcessed;
}
/**
 * Detect oscillation in a ripple origin chain.
 * Returns true if this box's ID appears in the chain (A→B→A cycle).
 */
export function detectOscillation(originChain, boxId) {
    return originChain.includes(boxId);
}
/**
 * Validate dependency configuration: check that each dependency's
 * directory exists and interface.yaml is present.
 */
export function validateDependencyConfig(deps, resolveDependencyPath) {
    const errors = [];
    for (const depName of Object.keys(deps)) {
        const depPath = resolveDependencyPath(depName);
        if (!depPath) {
            errors.push({ dependency: depName, error: 'dependency directory not found' });
            continue;
        }
        const interfacePath = path.join(depPath, 'interface.yaml');
        if (!fs.existsSync(interfacePath)) {
            errors.push({ dependency: depName, error: 'interface.yaml not found' });
        }
    }
    return errors;
}
/**
 * Filter affected modules by comparing their cross-module references
 * against a changelog's changed nodes. Only modules that reference
 * actually-changed nodes remain in the affected set.
 */
export function filterUnrelatedChanges(affectedModules, changelog, index) {
    if (!changelog || !changelog.changes.length) {
        return affectedModules; // No changelog to filter with
    }
    // Build set of changed node names from changelog
    const changedNodes = new Set(changelog.changes.map(c => c.node));
    return affectedModules.filter(mod => {
        // Check if any node in this module references a changed dependency node
        for (const [, node] of Object.entries(index.nodes)) {
            if (node.module !== mod)
                continue;
            for (const ref of node.cross_module_connections) {
                if (changedNodes.has(ref) || changedNodes.has(ref.split('/')[1])) {
                    return true;
                }
            }
        }
        return false;
    });
}
/**
 * Append this box's ID to the ripple origin chain for downstream propagation.
 */
export function appendToOriginChain(existingChain, boxId) {
    return [...existingChain, boxId];
}
/**
 * Narrow outgoing changelog to include only changes that affected this box.
 * Removes entries for nodes not referenced by any local module.
 */
export function narrowChangelog(changelog, index) {
    // Build set of all external nodes referenced locally
    const referencedNodes = new Set();
    for (const node of Object.values(index.nodes)) {
        for (const ref of node.cross_module_connections) {
            referencedNodes.add(ref);
            referencedNodes.add(ref.split('/')[1]); // bare name too
        }
    }
    const narrowedChanges = changelog.changes.filter(c => referencedNodes.has(c.node) || referencedNodes.has(c.node.split('/')[1]));
    return {
        previous_hash: changelog.previous_hash,
        current_hash: changelog.current_hash,
        changes: narrowedChanges,
    };
}
/**
 * Clear a stale sync lock on startup.
 * If the lock is older than maxAge (default 5 min), release it.
 * Returns true if a stale lock was cleared.
 */
export function clearStaleSyncLock(syncStatePath, maxAge = 5 * 60 * 1000) {
    if (!fs.existsSync(syncStatePath))
        return false;
    try {
        const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
        if (!state.sync_in_progress)
            return false;
        const age = state.sync_started_at
            ? Date.now() - new Date(state.sync_started_at).getTime()
            : Infinity;
        if (age >= maxAge) {
            state.sync_in_progress = false;
            fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
}
/**
 * Detect gaps in event sequence numbers for a dependency.
 * Returns the missing sequence numbers between last processed and current.
 * Enables ScanForMissedEventsOnWake and DetectAndRecoverMissedEventSequence.
 */
export function detectMissedEvents(syncState, dependency, currentSequence) {
    const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? 0;
    if (currentSequence <= lastProcessed + 1)
        return []; // No gap
    const missed = [];
    for (let i = lastProcessed + 1; i < currentSequence; i++) {
        missed.push(i);
    }
    return missed;
}
/**
 * Update the last processed sequence number for a dependency.
 * Called after successfully processing an event.
 */
export function updateProcessedSequence(syncStatePath, dependency, sequenceNumber) {
    let state = { known_hashes: {} };
    if (fs.existsSync(syncStatePath)) {
        try {
            state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
        }
        catch { /* fresh start */ }
    }
    if (!state.last_processed_sequence)
        state.last_processed_sequence = {};
    state.last_processed_sequence[dependency] = sequenceNumber;
    fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
}
/**
 * Check if the ripple origin chain exceeds the configured depth limit.
 * Returns true if the chain is too deep and propagation should be suppressed.
 * Enables EnforceSyncRippleDepthLimit journey.
 */
export function checkRippleDepthLimit(originChain, maxDepth) {
    return originChain.length >= maxDepth;
}
/**
 * Release the sync lock unconditionally — used in error recovery paths
 * to prevent permanent lock deadlock after unexpected failures.
 * Enables ReleaseSyncLockOnPipelineError journey.
 */
export function releaseSyncLockOnError(syncStatePath) {
    if (!fs.existsSync(syncStatePath))
        return;
    try {
        const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
        if (state.sync_in_progress) {
            state.sync_in_progress = false;
            fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
        }
    }
    catch { /* nothing to release */ }
}
/**
 * After markModulesStale runs, reads back each expected stale marker
 * to verify the writes succeeded. Returns modules where the marker is missing.
 * Enables RecoverInterruptedStaleMarkingOnRestart journey.
 */
export function detectStaleMarkingWriteFailure(modulesDir, expectedStale) {
    const failed = [];
    for (const mod of expectedStale) {
        const filePath = path.join(modulesDir, `${mod}.yaml`);
        if (!fs.existsSync(filePath)) {
            failed.push(mod);
            continue;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        if (!content.includes('_stale: true')) {
            failed.push(mod);
        }
    }
    return failed;
}
//# sourceMappingURL=sync.js.map