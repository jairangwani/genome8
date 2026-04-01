/**
 * publish.ts — Auto-generate published interface + changelog.
 *
 * After each compile, generates:
 * - published/interface.yaml (what this engine provides + requires)
 * - published/changelog.yaml (what changed since last version)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
/**
 * Generate published interface from compiled index.
 */
export function generateInterface(index, engineName) {
    const provides = {};
    const requires = {};
    for (const [fullName, node] of Object.entries(index.nodes)) {
        const module = fullName.split('/')[0];
        // Nodes in this engine = provides
        provides[fullName] = {
            type: node.type,
            description: node.description,
            in_journeys: node.in_journeys.length,
        };
        // Cross-module connections where the OTHER module is external = requires
        for (const conn of node.cross_module_connections) {
            const connModule = conn.split('/')[0];
            // Check if connModule is NOT one of our modules
            if (!index.nodes[conn]) {
                // This is an external reference we couldn't resolve
                requires[conn] = `Referenced in ${node.in_journeys[0] || 'unknown journey'}`;
            }
        }
    }
    // Also scan journey steps for external refs
    for (const [, journey] of Object.entries(index.journeys)) {
        for (const step of journey.steps) {
            if (!index.nodes[step.node]) {
                requires[step.node] = `${journey.name} step ${step.step_number}`;
            }
        }
    }
    const content = JSON.stringify({ provides, requires }, null, 2);
    const version_hash = 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
    return { engine: engineName, version_hash, provides, requires };
}
/**
 * Generate changelog by diffing two interfaces.
 */
export function generateChangelog(previous, current) {
    const changes = [];
    const prevProvides = previous?.provides ?? {};
    const currProvides = current.provides;
    // Find added nodes
    for (const [name, node] of Object.entries(currProvides)) {
        if (!prevProvides[name]) {
            changes.push({
                node: name,
                type: 'added',
                impact: `New ${node.type}: ${node.description}`,
            });
        }
    }
    // Find removed nodes
    for (const [name, node] of Object.entries(prevProvides)) {
        if (!currProvides[name]) {
            changes.push({
                node: name,
                type: 'removed',
                impact: `Removed ${node.type}: ${node.description}. Dependents must find alternative.`,
            });
        }
    }
    // Find modified nodes
    for (const [name, curr] of Object.entries(currProvides)) {
        const prev = prevProvides[name];
        if (!prev)
            continue;
        if (prev.description !== curr.description) {
            changes.push({
                node: name,
                type: 'modified',
                field: 'description',
                was: prev.description,
                now: curr.description,
                impact: `${name} description changed. Dependents should review.`,
            });
        }
        if (prev.type !== curr.type) {
            changes.push({
                node: name,
                type: 'modified',
                field: 'type',
                was: prev.type,
                now: curr.type,
                impact: `${name} type changed from ${prev.type} to ${curr.type}.`,
            });
        }
    }
    return {
        previous_hash: previous?.version_hash ?? 'none',
        current_hash: current.version_hash,
        changes,
    };
}
/**
 * Validate that all journey refs in the exported interface resolve to
 * exported nodes or are explicitly marked as external requirements.
 */
export function validateExportedInterface(interface_, index) {
    const errors = [];
    const exportedNodes = new Set(Object.keys(interface_.provides));
    for (const [, journey] of Object.entries(index.journeys)) {
        for (const step of journey.steps) {
            if (!exportedNodes.has(step.node) && !interface_.requires[step.node]) {
                // Node is neither exported nor declared as external requirement
                // This is OK if the node is internal — only flag if it's a dangling ref
                if (!index.nodes[step.node]) {
                    errors.push(`Journey "${journey.name}" step ${step.step_number}: ref ${step.node} is not exported, not required, and not in index`);
                }
            }
        }
    }
    return errors;
}
/**
 * Detect corrupted previous hash file. Returns true if the hash is invalid.
 */
export function detectCorruptedHash(hashString) {
    if (!hashString)
        return false; // no hash = first time, not corruption
    if (!hashString.startsWith('sha256:'))
        return true;
    const hex = hashString.slice(7);
    return !/^[a-f0-9]{64}$/.test(hex);
}
/**
 * Write event file to signal downstream dependents.
 * Contains interface hash, changelog summary, origin chain, and sequence number.
 */
export function writeEventFile(publishedDir, interface_, changelog, originChain, boxId) {
    const eventDir = publishedDir;
    const eventPath = path.join(eventDir, 'event.json');
    // Read existing event to get sequence number
    let sequenceNumber = 1;
    if (fs.existsSync(eventPath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
            sequenceNumber = (existing.sequence_number ?? 0) + 1;
        }
        catch { /* first event */ }
    }
    const event = {
        interface_hash: interface_.version_hash,
        changelog_summary: changelog.changes.map(c => `${c.type}: ${c.node}`),
        origin_chain: [...originChain, boxId],
        sequence_number: sequenceNumber,
        dependency: interface_.engine,
        timestamp: new Date().toISOString(),
    };
    // Atomic write: write temp then rename
    const tempPath = eventPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(event, null, 2));
    fs.renameSync(tempPath, eventPath);
}
/**
 * Atomic file write: write to temp file then rename.
 * Prevents partial writes from leaving corrupted files on disk.
 */
export function atomicWrite(filePath, content) {
    const tempPath = filePath + '.tmp';
    fs.writeFileSync(tempPath, content);
    fs.renameSync(tempPath, filePath);
}
/**
 * Write published interface and changelog to disk.
 */
export function publishInterface(publishedDir, index, engineName) {
    if (!fs.existsSync(publishedDir)) {
        fs.mkdirSync(publishedDir, { recursive: true });
    }
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    // Read previous interface if exists
    let previous = null;
    if (fs.existsSync(interfacePath)) {
        try {
            previous = yaml.load(fs.readFileSync(interfacePath, 'utf-8'));
            // Detect corrupted previous hash — treat as first-time publish
            if (previous && detectCorruptedHash(previous.version_hash)) {
                console.log('  [publish] Previous hash corrupted — treating as first-time publish');
                previous = null;
            }
        }
        catch { /* first time */ }
    }
    // Generate new interface
    const interface_ = generateInterface(index, engineName);
    // Skip publish if unchanged
    if (previous && previous.version_hash === interface_.version_hash) {
        return {
            interface_,
            changelog: { previous_hash: previous.version_hash, current_hash: interface_.version_hash, changes: [] },
            skipped: true,
        };
    }
    // Validate exported interface
    const validationErrors = validateExportedInterface(interface_, index);
    if (validationErrors.length > 0) {
        console.log(`  [publish] ${validationErrors.length} validation warnings in exported interface`);
    }
    // Generate changelog
    const changelog = generateChangelog(previous, interface_);
    // Atomic write files
    atomicWrite(interfacePath, yaml.dump(interface_, { lineWidth: 120, noRefs: true }));
    atomicWrite(changelogPath, yaml.dump(changelog, { lineWidth: 120, noRefs: true }));
    return { interface_, changelog, skipped: false };
}
/**
 * On cold start, scan the publish output directory for orphan .tmp files
 * left by atomic write operations that crashed between temp file creation
 * and rename. Removes them to prevent disk accumulation.
 * Enables CleanupOrphanTempFilesOnColdStart journey.
 */
export function detectOrphanTempFiles(publishedDir) {
    if (!fs.existsSync(publishedDir))
        return [];
    const removed = [];
    const entries = fs.readdirSync(publishedDir);
    for (const entry of entries) {
        if (entry.endsWith('.tmp')) {
            const tmpPath = path.join(publishedDir, entry);
            fs.unlinkSync(tmpPath);
            removed.push(entry);
        }
    }
    return removed;
}
/**
 * Before incrementing the event sequence counter, check if the last event
 * file already has the expected next sequence number (indicating a retry
 * of an already-written event). Skips increment to prevent double-counting.
 * Enables GuardSequenceCounterOnPublishRetry journey.
 */
export function guardSequenceCounter(eventPath, expectedNext) {
    if (!fs.existsSync(eventPath))
        return false;
    try {
        const existing = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
        return existing.sequence_number === expectedNext;
    }
    catch {
        return false;
    }
}
/**
 * Collect nodes to be exported as the box's public interface.
 * Standalone export for the CollectExportedNodes node.
 */
export function collectExportedNodes(index) {
    const nodes = {};
    for (const [name, node] of Object.entries(index.nodes)) {
        nodes[name] = {
            type: node.type,
            description: node.description,
            in_journeys: node.in_journeys.length,
        };
    }
    return nodes;
}
/**
 * Collect journeys to be exported as the box's public interface.
 * Standalone export for the CollectExportedJourneys node.
 */
export function collectExportedJourneys(index) {
    const journeys = {};
    for (const [name, journey] of Object.entries(index.journeys)) {
        journeys[name] = {
            steps: journey.steps.length,
            module: journey.module,
        };
    }
    return journeys;
}
/**
 * Compute the SHA256 interface hash from the provides and requires maps.
 * Standalone export for the ComputeInterfaceHash node.
 */
export function computeInterfaceHash(provides, requires) {
    const content = JSON.stringify({ provides, requires }, null, 2);
    return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}
/**
 * Compare new hash against the previously published hash.
 * Returns 'changed', 'unchanged', or 'first_publish'.
 * Standalone export for the ComparePreviousHash node.
 */
export function comparePreviousHash(previousHash, currentHash) {
    if (!previousHash)
        return 'first_publish';
    return previousHash === currentHash ? 'unchanged' : 'changed';
}
/**
 * After writing interface.yaml, re-read it, recompute the SHA256 from
 * the file content, and verify it matches the embedded hash.
 * Standalone export for the VerifyPublishedHashIntegrity node.
 */
export function verifyPublishedHashIntegrity(interfacePath) {
    if (!fs.existsSync(interfacePath)) {
        return { verified: false, error: 'interface.yaml not found' };
    }
    try {
        const raw = fs.readFileSync(interfacePath, 'utf-8');
        const iface = yaml.load(raw);
        if (!iface?.version_hash) {
            return { verified: false, error: 'no version_hash in interface' };
        }
        const recomputed = computeInterfaceHash(iface.provides, iface.requires ?? {});
        if (recomputed !== iface.version_hash) {
            return { verified: false, error: `hash mismatch: file=${iface.version_hash}, recomputed=${recomputed}` };
        }
        return { verified: true };
    }
    catch (e) {
        return { verified: false, error: `parse error: ${e.message}` };
    }
}
/**
 * After writing both event file and interface.yaml, verify their hashes match.
 * Standalone export for the CrossCheckEventInterfaceHash node.
 */
export function crossCheckEventInterfaceHash(interfacePath, eventFilePath) {
    try {
        const iface = yaml.load(fs.readFileSync(interfacePath, 'utf-8'));
        const event = JSON.parse(fs.readFileSync(eventFilePath, 'utf-8'));
        const interfaceHash = iface?.version_hash;
        const eventHash = event?.interface_hash ?? event?.hash;
        return {
            match: interfaceHash === eventHash,
            interfaceHash,
            eventHash,
        };
    }
    catch {
        return { match: false };
    }
}
/**
 * Remove partially written publish artifacts to restore pre-publish state.
 * Standalone export for the RollbackPartialPublish node.
 */
export function rollbackPartialPublish(publishedDir, artifacts = ['interface.yaml', 'changelog.yaml']) {
    const rolledBack = [];
    for (const artifact of artifacts) {
        const tempPath = path.join(publishedDir, artifact + '.tmp');
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
            rolledBack.push(artifact + '.tmp');
        }
    }
    return rolledBack;
}
/**
 * Detect exactly which publish pipeline step was interrupted after a crash.
 * Standalone export for the DetectPublishInterruptionPoint node.
 */
export function detectPublishInterruptionPoint(publishedDir) {
    const interfaceExists = fs.existsSync(path.join(publishedDir, 'interface.yaml'));
    const changelogExists = fs.existsSync(path.join(publishedDir, 'changelog.yaml'));
    const eventsDir = path.join(publishedDir, 'events');
    const hasEvents = fs.existsSync(eventsDir) && fs.readdirSync(eventsDir).some(f => f.endsWith('.event'));
    if (!interfaceExists)
        return 'pre-interface';
    if (!changelogExists)
        return 'post-interface-pre-changelog';
    if (!hasEvents)
        return 'post-changelog-pre-event';
    return 'complete';
}
/**
 * On cold start, read the sequence number from the last event file on disk
 * to restore the counter baseline.
 * Standalone export for the RestoreSequenceCounterFromDisk node.
 */
export function restoreSequenceCounterFromDisk(eventsDir) {
    if (!fs.existsSync(eventsDir))
        return 0;
    const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.event')).sort();
    if (files.length === 0)
        return 0;
    try {
        const last = JSON.parse(fs.readFileSync(path.join(eventsDir, files[files.length - 1]), 'utf-8'));
        return typeof last.sequence_number === 'number' ? last.sequence_number : 0;
    }
    catch {
        return 0;
    }
}
/**
 * Validate the in-memory interface structure against required schema
 * before serialization.
 * Standalone export for the ValidateInterfaceYamlSchema node.
 */
export function validateInterfaceSchema(iface) {
    const errors = [];
    if (!iface.engine || typeof iface.engine !== 'string')
        errors.push('missing or invalid engine name');
    if (!iface.version_hash || typeof iface.version_hash !== 'string')
        errors.push('missing version_hash');
    if (iface.version_hash && !/^sha256:[a-f0-9]{64}$/.test(iface.version_hash))
        errors.push('version_hash not a valid sha256 hex');
    if (!iface.provides || typeof iface.provides !== 'object')
        errors.push('missing provides map');
    return { valid: errors.length === 0, errors };
}
/**
 * Validate changelog structure before serialization.
 * Standalone export for the ValidateChangelogYamlSchema node.
 */
export function validateChangelogSchema(changelog) {
    const errors = [];
    if (typeof changelog.previous_hash !== 'string')
        errors.push('missing previous_hash');
    if (typeof changelog.current_hash !== 'string')
        errors.push('missing current_hash');
    if (!Array.isArray(changelog.changes))
        errors.push('changes is not an array');
    for (const entry of changelog.changes) {
        if (!entry.node)
            errors.push(`changelog entry missing node field`);
        if (!entry.type)
            errors.push(`changelog entry missing type field`);
    }
    return { valid: errors.length === 0, errors };
}
/**
 * Sort exported nodes and journeys alphabetically before hash computation
 * to guarantee identical content always produces identical hash.
 * Standalone export for the CanonicalizeHashInput node.
 */
export function canonicalizeHashInput(provides, requires) {
    const sortedProvides = {};
    for (const key of Object.keys(provides).sort()) {
        sortedProvides[key] = provides[key];
    }
    const sortedRequires = {};
    for (const key of Object.keys(requires).sort()) {
        sortedRequires[key] = requires[key];
    }
    return { provides: sortedProvides, requires: sortedRequires };
}
/**
 * Sort changelog changes alphabetically by name for deterministic output.
 * Standalone export for the CanonicalizeChangelogDiffOutput node.
 */
export function canonicalizeChangelogDiff(changelog) {
    return {
        previous_hash: changelog.previous_hash,
        current_hash: changelog.current_hash,
        changes: [...changelog.changes].sort((a, b) => a.node.localeCompare(b.node)),
    };
}
/**
 * Detect when previous interface.yaml is present but unparsable.
 * Standalone export for the DetectCorruptedPreviousInterface node.
 */
export function detectCorruptedPreviousInterface(interfacePath) {
    if (!fs.existsSync(interfacePath))
        return false;
    try {
        const iface = yaml.load(fs.readFileSync(interfacePath, 'utf-8'));
        if (!iface?.provides || !iface?.version_hash)
            return true;
        return false;
    }
    catch {
        return true;
    }
}
//# sourceMappingURL=publish.js.map