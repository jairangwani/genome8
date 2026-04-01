/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { PublishedInterface, DependenciesFile, DependencyConfig, CompiledIndex, Changelog } from './types.js';

export interface SyncChange {
  dependency: string;
  previous_hash: string;
  current_hash: string;
  affected_modules: string[];
  changelog: Changelog | null;
}

export interface SyncState {
  known_hashes: Record<string, string>;       // dependency → last known hash
  sync_in_progress?: boolean;                 // Guard against concurrent sync operations
  sync_started_at?: string;                   // Timestamp of last sync start (for stale lock detection)
  last_processed_sequence?: Record<string, number>; // dependency → last processed event sequence number
  box_id?: string;                            // This box's ID for oscillation chain tracking
}

/**
 * Check all dependencies for interface changes.
 */
export function checkDependencies(
  dependenciesPath: string,
  index: CompiledIndex,
  syncStatePath: string,
  resolveDependencyPath: (depName: string) => string | null
): SyncChange[] {
  const changes: SyncChange[] = [];

  // Read dependencies.yaml
  if (!fs.existsSync(dependenciesPath)) return [];
  const deps = yaml.load(fs.readFileSync(dependenciesPath, 'utf-8')) as DependenciesFile;
  if (!deps?.dependencies) return [];

  // Read sync state (known hashes)
  let syncState: SyncState = { known_hashes: {} };
  if (fs.existsSync(syncStatePath)) {
    try {
      syncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    } catch { /* fresh start */ }
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
    if (!depPublishedDir) continue;

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
    let depInterface: PublishedInterface;
    try {
      depInterface = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    } catch { continue; }

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
    let changelog: Changelog | null = null;
    const changelogPath = path.join(depPublishedDir, 'changelog.yaml');
    if (fs.existsSync(changelogPath)) {
      try {
        changelog = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
      } catch { /* no changelog */ }
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
function findAffectedModules(depName: string, index: CompiledIndex): string[] {
  const affected = new Set<string>();

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
export function markModulesStale(
  modulesDir: string,
  modules: string[],
  reason: string
): void {
  for (const mod of modules) {
    const filePath = path.join(modulesDir, `${mod}.yaml`);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('_stale: true')) continue; // already stale

    // Prepend stale marker
    const updated = `_stale: true\n_stale_reason: "${reason}"\n\n${content}`;
    fs.writeFileSync(filePath, updated);
  }
}

/**
 * Parse an event file payload. Event files contain JSON with interface hash,
 * changelog summary, origin chain, and sequence number.
 */
export interface EventPayload {
  interface_hash: string;
  changelog_summary?: string[];
  origin_chain: string[];
  sequence_number: number;
  dependency: string;
}

export function parseEventPayload(eventFilePath: string): EventPayload | null {
  try {
    const raw = fs.readFileSync(eventFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as EventPayload;
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
  } catch {
    return null;
  }
}

/**
 * Check if an event's sequence number is newer than the last processed sequence.
 * Returns true if the event should be processed, false if it should be discarded.
 */
export function checkEventSequence(
  syncState: SyncState,
  dependency: string,
  incomingSequence: number
): boolean {
  const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? -1;
  return incomingSequence > lastProcessed;
}

/**
 * Detect oscillation in a ripple origin chain.
 * Returns true if this box's ID appears in the chain (A→B→A cycle).
 */
export function detectOscillation(
  originChain: string[],
  boxId: string
): boolean {
  return originChain.includes(boxId);
}

/**
 * Validate dependency configuration: check that each dependency's
 * directory exists and interface.yaml is present.
 */
export function validateDependencyConfig(
  deps: Record<string, DependencyConfig>,
  resolveDependencyPath: (depName: string) => string | null
): Array<{ dependency: string; error: string }> {
  const errors: Array<{ dependency: string; error: string }> = [];

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
export function filterUnrelatedChanges(
  affectedModules: string[],
  changelog: Changelog | null,
  index: CompiledIndex
): string[] {
  if (!changelog || !changelog.changes.length) {
    return affectedModules; // No changelog to filter with
  }

  // Build set of changed node names from changelog
  const changedNodes = new Set(changelog.changes.map(c => c.node));

  return affectedModules.filter(mod => {
    // Check if any node in this module references a changed dependency node
    for (const [, node] of Object.entries(index.nodes)) {
      if (node.module !== mod) continue;
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
export function appendToOriginChain(
  existingChain: string[],
  boxId: string
): string[] {
  return [...existingChain, boxId];
}

/**
 * Narrow outgoing changelog to include only changes that affected this box.
 * Removes entries for nodes not referenced by any local module.
 */
export function narrowChangelog(
  changelog: Changelog,
  index: CompiledIndex
): Changelog {
  // Build set of all external nodes referenced locally
  const referencedNodes = new Set<string>();
  for (const node of Object.values(index.nodes)) {
    for (const ref of node.cross_module_connections) {
      referencedNodes.add(ref);
      referencedNodes.add(ref.split('/')[1]); // bare name too
    }
  }

  const narrowedChanges = changelog.changes.filter(c =>
    referencedNodes.has(c.node) || referencedNodes.has(c.node.split('/')[1])
  );

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
export function clearStaleSyncLock(syncStatePath: string, maxAge = 5 * 60 * 1000): boolean {
  if (!fs.existsSync(syncStatePath)) return false;
  try {
    const state: SyncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    if (!state.sync_in_progress) return false;
    const age = state.sync_started_at
      ? Date.now() - new Date(state.sync_started_at).getTime()
      : Infinity;
    if (age >= maxAge) {
      state.sync_in_progress = false;
      fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
      return true;
    }
    return false;
  } catch { return false; }
}

/**
 * Detect gaps in event sequence numbers for a dependency.
 * Returns the missing sequence numbers between last processed and current.
 * Enables ScanForMissedEventsOnWake and DetectAndRecoverMissedEventSequence.
 */
export function detectMissedEvents(
  syncState: SyncState,
  dependency: string,
  currentSequence: number
): number[] {
  const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? 0;
  if (currentSequence <= lastProcessed + 1) return []; // No gap
  const missed: number[] = [];
  for (let i = lastProcessed + 1; i < currentSequence; i++) {
    missed.push(i);
  }
  return missed;
}

/**
 * Update the last processed sequence number for a dependency.
 * Called after successfully processing an event.
 */
export function updateProcessedSequence(
  syncStatePath: string,
  dependency: string,
  sequenceNumber: number
): void {
  let state: SyncState = { known_hashes: {} };
  if (fs.existsSync(syncStatePath)) {
    try {
      state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    } catch { /* fresh start */ }
  }
  if (!state.last_processed_sequence) state.last_processed_sequence = {};
  state.last_processed_sequence[dependency] = sequenceNumber;
  fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
}

/**
 * Check if the ripple origin chain exceeds the configured depth limit.
 * Returns true if the chain is too deep and propagation should be suppressed.
 * Enables EnforceSyncRippleDepthLimit journey.
 */
export function checkRippleDepthLimit(
  originChain: string[],
  maxDepth: number
): boolean {
  return originChain.length >= maxDepth;
}

/**
 * Release the sync lock unconditionally — used in error recovery paths
 * to prevent permanent lock deadlock after unexpected failures.
 * Enables ReleaseSyncLockOnPipelineError journey.
 */
export function releaseSyncLockOnError(syncStatePath: string): void {
  if (!fs.existsSync(syncStatePath)) return;
  try {
    const state: SyncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    if (state.sync_in_progress) {
      state.sync_in_progress = false;
      fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
    }
  } catch { /* nothing to release */ }
}

/**
 * After markModulesStale runs, reads back each expected stale marker
 * to verify the writes succeeded. Returns modules where the marker is missing.
 * Enables RecoverInterruptedStaleMarkingOnRestart journey.
 */
export function detectStaleMarkingWriteFailure(
  modulesDir: string,
  expectedStale: string[]
): string[] {
  const failed: string[] = [];
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

/**
 * Read the dependencies.yaml file and return the dependency config map.
 * Standalone export for the ReadDependencyList node.
 */
export function readDependencyList(
  dependenciesPath: string
): Record<string, DependencyConfig> {
  if (!fs.existsSync(dependenciesPath)) return {};
  try {
    const deps = yaml.load(fs.readFileSync(dependenciesPath, 'utf-8')) as DependenciesFile;
    return deps?.dependencies ?? {};
  } catch { return {}; }
}

/**
 * Fetch the current interface hash for a single dependency.
 * Standalone export for the FetchDependencyHash node.
 */
export function fetchDependencyHash(
  depPublishedDir: string
): string | null {
  const interfacePath = path.join(depPublishedDir, 'interface.yaml');
  if (!fs.existsSync(interfacePath)) return null;
  try {
    const iface = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    return iface?.version_hash ?? null;
  } catch { return null; }
}

/**
 * Compare a fetched hash against the stored hash for a dependency.
 * Returns 'changed', 'unchanged', or 'new' (no stored hash).
 * Standalone export for the CompareStoredHash node.
 */
export function compareStoredHash(
  syncState: SyncState,
  dependency: string,
  currentHash: string
): 'changed' | 'unchanged' | 'new' {
  const known = syncState.known_hashes[dependency];
  if (!known) return 'new';
  return known === currentHash ? 'unchanged' : 'changed';
}

/**
 * Update stored hashes in the sync state file for one or more dependencies.
 * Standalone export for the UpdateStoredHashes node.
 */
export function updateStoredHashes(
  syncStatePath: string,
  updates: Record<string, string>
): void {
  let state: SyncState = { known_hashes: {} };
  if (fs.existsSync(syncStatePath)) {
    try { state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8')); } catch { /* fresh */ }
  }
  Object.assign(state.known_hashes, updates);
  fs.writeFileSync(syncStatePath, JSON.stringify(state, null, 2));
}

/**
 * Identify which dependencies have stale (changed) hashes.
 * Returns dependency names whose current hash differs from stored.
 * Standalone export for the IdentifyStaleDependencies node.
 */
export function identifyStaleDependencies(
  syncState: SyncState,
  currentHashes: Record<string, string>
): string[] {
  return Object.entries(currentHashes).filter(([dep, hash]) => {
    const known = syncState.known_hashes[dep];
    return !known || known !== hash;
  }).map(([dep]) => dep);
}

/**
 * Count the total number of stale modules across all changed dependencies.
 * Standalone export for the ComputeStaleModuleCount node.
 */
export function computeStaleModuleCount(changes: SyncChange[]): number {
  const allModules = new Set<string>();
  for (const c of changes) {
    for (const m of c.affected_modules) allModules.add(m);
  }
  return allModules.size;
}

/**
 * Compute the full ripple scope: the set of unique affected modules
 * across all dependency changes.
 * Standalone export for the ComputeRippleScope node.
 */
export function computeRippleScope(changes: SyncChange[]): string[] {
  const scope = new Set<string>();
  for (const c of changes) {
    for (const m of c.affected_modules) scope.add(m);
  }
  return [...scope].sort();
}

/**
 * After writing hashes to sync state, re-read the file and verify
 * the stored values match what was written.
 * Standalone export for the VerifyHashAfterStore node.
 */
export function verifyHashAfterStore(
  syncStatePath: string,
  expected: Record<string, string>
): { verified: boolean; mismatches: string[] } {
  const mismatches: string[] = [];
  try {
    const state: SyncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    for (const [dep, hash] of Object.entries(expected)) {
      if (state.known_hashes[dep] !== hash) {
        mismatches.push(dep);
      }
    }
  } catch {
    return { verified: false, mismatches: Object.keys(expected) };
  }
  return { verified: mismatches.length === 0, mismatches };
}

/**
 * Cross-validate an event file's hash against the fetched interface hash.
 * Returns true if they match.
 * Standalone export for the CrossValidateEventHashWithFetchedHash node.
 */
export function crossValidateEventHash(
  eventPayload: EventPayload,
  fetchedHash: string
): boolean {
  return eventPayload.interface_hash === fetchedHash;
}

/**
 * Detect if the sync state file was partially written (e.g. truncated JSON).
 * Returns true if the file exists but is corrupt.
 * Standalone export for the DetectPartialHashUpdate node.
 */
export function detectPartialHashUpdate(syncStatePath: string): boolean {
  if (!fs.existsSync(syncStatePath)) return false;
  try {
    const raw = fs.readFileSync(syncStatePath, 'utf-8');
    JSON.parse(raw);
    return false; // Valid JSON — no partial update
  } catch {
    return true; // Corrupt — partial write detected
  }
}

/**
 * Re-read module files before reconvergence to confirm they are still stale.
 * Returns modules that are confirmed stale (have _stale: true marker).
 * Standalone export for the VerifyStalenessBeforeReconvergence node.
 */
export function verifyStalenessBeforeReconvergence(
  modulesDir: string,
  candidates: string[]
): string[] {
  return candidates.filter(mod => {
    const filePath = path.join(modulesDir, `${mod}.yaml`);
    if (!fs.existsSync(filePath)) return false;
    return fs.readFileSync(filePath, 'utf-8').includes('_stale: true');
  });
}

/**
 * Sort stale modules deterministically by name for consistent processing order.
 * Standalone export for the EnforceDeterministicStaleOrder node.
 */
export function enforceDeterministicStaleOrder(modules: string[]): string[] {
  return [...modules].sort();
}

/**
 * Canonicalize changelog entries by sorting changes alphabetically by node name
 * before narrowing, ensuring deterministic output.
 * Standalone export for the CanonicalizeChangelogForNarrowing node.
 */
export function canonicalizeChangelogForNarrowing(changelog: Changelog): Changelog {
  return {
    previous_hash: changelog.previous_hash,
    current_hash: changelog.current_hash,
    changes: [...changelog.changes].sort((a, b) => a.node.localeCompare(b.node)),
  };
}

/**
 * Validate the integrity of the hash store on cold start.
 * Checks that the file is valid JSON, has a known_hashes map, and all values are strings.
 * Standalone export for the ValidateHashStoreIntegrityOnStartup node.
 */
export function validateHashStoreIntegrity(
  syncStatePath: string
): { valid: boolean; error?: string } {
  if (!fs.existsSync(syncStatePath)) return { valid: true }; // No file = fresh start
  try {
    const raw = fs.readFileSync(syncStatePath, 'utf-8');
    const state = JSON.parse(raw);
    if (!state.known_hashes || typeof state.known_hashes !== 'object') {
      return { valid: false, error: 'missing or invalid known_hashes' };
    }
    for (const [dep, hash] of Object.entries(state.known_hashes)) {
      if (typeof hash !== 'string') {
        return { valid: false, error: `non-string hash for dependency ${dep}` };
      }
    }
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: `corrupt JSON: ${e.message}` };
  }
}

/**
 * Reconcile sequence numbers after a crash by reading the sync state
 * and the latest event files on disk.
 * Standalone export for the ReconcileSequenceNumbersOnRestart node.
 */
export function reconcileSequenceNumbers(
  syncStatePath: string,
  eventDirs: Array<{ dependency: string; eventsDir: string }>
): Record<string, number> {
  let state: SyncState = { known_hashes: {} };
  if (fs.existsSync(syncStatePath)) {
    try { state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8')); } catch { /* fresh */ }
  }
  const reconciled: Record<string, number> = { ...(state.last_processed_sequence ?? {}) };

  for (const { dependency, eventsDir } of eventDirs) {
    if (!fs.existsSync(eventsDir)) continue;
    const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.event')).sort();
    if (files.length === 0) continue;
    const latestFile = path.join(eventsDir, files[files.length - 1]);
    try {
      const event = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
      const diskSeq = typeof event.sequence_number === 'number' ? event.sequence_number : -1;
      const stateSeq = reconciled[dependency] ?? -1;
      reconciled[dependency] = Math.max(diskSeq, stateSeq);
    } catch { /* skip corrupt event files */ }
  }

  return reconciled;
}

/**
 * Verify that an outgoing event file was successfully written to disk.
 * Standalone export for the VerifyOutgoingEventWritten node.
 */
export function verifyOutgoingEventWritten(eventFilePath: string): boolean {
  if (!fs.existsSync(eventFilePath)) return false;
  try {
    const raw = fs.readFileSync(eventFilePath, 'utf-8');
    JSON.parse(raw); // Verify valid JSON
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate the format of an event file: must be valid JSON with required fields.
 * Standalone export for the ValidateEventFileFormat node (events module).
 */
export function validateEventFileFormat(
  eventFilePath: string
): { valid: boolean; error?: string } {
  if (!fs.existsSync(eventFilePath)) return { valid: false, error: 'file not found' };
  try {
    const raw = fs.readFileSync(eventFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.hash && !parsed.interface_hash) {
      return { valid: false, error: 'missing hash field' };
    }
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: `invalid JSON: ${e.message}` };
  }
}

/**
 * Detect duplicate event sequence numbers for a dependency.
 * Returns true if the incoming sequence was already processed.
 * Standalone export for the DetectDuplicateEventSequence node.
 */
export function detectDuplicateEventSequence(
  syncState: SyncState,
  dependency: string,
  sequenceNumber: number
): boolean {
  const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? -1;
  return sequenceNumber <= lastProcessed;
}

/**
 * Detect if an event file was partially written (truncated/empty).
 * Returns true if the file exists but cannot be fully parsed.
 * Standalone export for the DetectPartiallyWrittenEventFile node.
 */
export function detectPartiallyWrittenEventFile(eventFilePath: string): boolean {
  if (!fs.existsSync(eventFilePath)) return false;
  try {
    const raw = fs.readFileSync(eventFilePath, 'utf-8');
    if (raw.trim().length === 0) return true;
    JSON.parse(raw);
    return false;
  } catch {
    return true;
  }
}

/**
 * Prioritize events by impact: events affecting more modules rank higher.
 * Returns events sorted by descending affected module count.
 * Standalone export for the PrioritizeEventsByImpact node.
 */
export function prioritizeEventsByImpact(
  events: Array<{ dependency: string; affectedModules: string[] }>
): Array<{ dependency: string; affectedModules: string[] }> {
  return [...events].sort((a, b) => b.affectedModules.length - a.affectedModules.length);
}
