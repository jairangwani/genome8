/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */
import type { DependencyConfig, CompiledIndex, Changelog } from './types.js';
export interface SyncChange {
    dependency: string;
    previous_hash: string;
    current_hash: string;
    affected_modules: string[];
    changelog: Changelog | null;
}
export interface SyncState {
    known_hashes: Record<string, string>;
    sync_in_progress?: boolean;
    sync_started_at?: string;
    last_processed_sequence?: Record<string, number>;
    box_id?: string;
}
/**
 * Check all dependencies for interface changes.
 */
export declare function checkDependencies(dependenciesPath: string, index: CompiledIndex, syncStatePath: string, resolveDependencyPath: (depName: string) => string | null): SyncChange[];
/**
 * Mark modules as stale by adding _stale: true to their YAML files.
 */
export declare function markModulesStale(modulesDir: string, modules: string[], reason: string): void;
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
export declare function parseEventPayload(eventFilePath: string): EventPayload | null;
/**
 * Check if an event's sequence number is newer than the last processed sequence.
 * Returns true if the event should be processed, false if it should be discarded.
 */
export declare function checkEventSequence(syncState: SyncState, dependency: string, incomingSequence: number): boolean;
/**
 * Detect oscillation in a ripple origin chain.
 * Returns true if this box's ID appears in the chain (A→B→A cycle).
 */
export declare function detectOscillation(originChain: string[], boxId: string): boolean;
/**
 * Validate dependency configuration: check that each dependency's
 * directory exists and interface.yaml is present.
 */
export declare function validateDependencyConfig(deps: Record<string, DependencyConfig>, resolveDependencyPath: (depName: string) => string | null): Array<{
    dependency: string;
    error: string;
}>;
/**
 * Filter affected modules by comparing their cross-module references
 * against a changelog's changed nodes. Only modules that reference
 * actually-changed nodes remain in the affected set.
 */
export declare function filterUnrelatedChanges(affectedModules: string[], changelog: Changelog | null, index: CompiledIndex): string[];
/**
 * Append this box's ID to the ripple origin chain for downstream propagation.
 */
export declare function appendToOriginChain(existingChain: string[], boxId: string): string[];
/**
 * Narrow outgoing changelog to include only changes that affected this box.
 * Removes entries for nodes not referenced by any local module.
 */
export declare function narrowChangelog(changelog: Changelog, index: CompiledIndex): Changelog;
/**
 * Clear a stale sync lock on startup.
 * If the lock is older than maxAge (default 5 min), release it.
 * Returns true if a stale lock was cleared.
 */
export declare function clearStaleSyncLock(syncStatePath: string, maxAge?: number): boolean;
/**
 * Detect gaps in event sequence numbers for a dependency.
 * Returns the missing sequence numbers between last processed and current.
 * Enables ScanForMissedEventsOnWake and DetectAndRecoverMissedEventSequence.
 */
export declare function detectMissedEvents(syncState: SyncState, dependency: string, currentSequence: number): number[];
/**
 * Update the last processed sequence number for a dependency.
 * Called after successfully processing an event.
 */
export declare function updateProcessedSequence(syncStatePath: string, dependency: string, sequenceNumber: number): void;
/**
 * Check if the ripple origin chain exceeds the configured depth limit.
 * Returns true if the chain is too deep and propagation should be suppressed.
 * Enables EnforceSyncRippleDepthLimit journey.
 */
export declare function checkRippleDepthLimit(originChain: string[], maxDepth: number): boolean;
/**
 * Release the sync lock unconditionally — used in error recovery paths
 * to prevent permanent lock deadlock after unexpected failures.
 * Enables ReleaseSyncLockOnPipelineError journey.
 */
export declare function releaseSyncLockOnError(syncStatePath: string): void;
/**
 * After markModulesStale runs, reads back each expected stale marker
 * to verify the writes succeeded. Returns modules where the marker is missing.
 * Enables RecoverInterruptedStaleMarkingOnRestart journey.
 */
export declare function detectStaleMarkingWriteFailure(modulesDir: string, expectedStale: string[]): string[];
/**
 * Read the dependencies.yaml file and return the dependency config map.
 * Standalone export for the ReadDependencyList node.
 */
export declare function readDependencyList(dependenciesPath: string): Record<string, DependencyConfig>;
/**
 * Fetch the current interface hash for a single dependency.
 * Standalone export for the FetchDependencyHash node.
 */
export declare function fetchDependencyHash(depPublishedDir: string): string | null;
/**
 * Compare a fetched hash against the stored hash for a dependency.
 * Returns 'changed', 'unchanged', or 'new' (no stored hash).
 * Standalone export for the CompareStoredHash node.
 */
export declare function compareStoredHash(syncState: SyncState, dependency: string, currentHash: string): 'changed' | 'unchanged' | 'new';
/**
 * Update stored hashes in the sync state file for one or more dependencies.
 * Standalone export for the UpdateStoredHashes node.
 */
export declare function updateStoredHashes(syncStatePath: string, updates: Record<string, string>): void;
/**
 * Identify which dependencies have stale (changed) hashes.
 * Returns dependency names whose current hash differs from stored.
 * Standalone export for the IdentifyStaleDependencies node.
 */
export declare function identifyStaleDependencies(syncState: SyncState, currentHashes: Record<string, string>): string[];
/**
 * Count the total number of stale modules across all changed dependencies.
 * Standalone export for the ComputeStaleModuleCount node.
 */
export declare function computeStaleModuleCount(changes: SyncChange[]): number;
/**
 * Compute the full ripple scope: the set of unique affected modules
 * across all dependency changes.
 * Standalone export for the ComputeRippleScope node.
 */
export declare function computeRippleScope(changes: SyncChange[]): string[];
/**
 * After writing hashes to sync state, re-read the file and verify
 * the stored values match what was written.
 * Standalone export for the VerifyHashAfterStore node.
 */
export declare function verifyHashAfterStore(syncStatePath: string, expected: Record<string, string>): {
    verified: boolean;
    mismatches: string[];
};
/**
 * Cross-validate an event file's hash against the fetched interface hash.
 * Returns true if they match.
 * Standalone export for the CrossValidateEventHashWithFetchedHash node.
 */
export declare function crossValidateEventHash(eventPayload: EventPayload, fetchedHash: string): boolean;
/**
 * Detect if the sync state file was partially written (e.g. truncated JSON).
 * Returns true if the file exists but is corrupt.
 * Standalone export for the DetectPartialHashUpdate node.
 */
export declare function detectPartialHashUpdate(syncStatePath: string): boolean;
/**
 * Re-read module files before reconvergence to confirm they are still stale.
 * Returns modules that are confirmed stale (have _stale: true marker).
 * Standalone export for the VerifyStalenessBeforeReconvergence node.
 */
export declare function verifyStalenessBeforeReconvergence(modulesDir: string, candidates: string[]): string[];
/**
 * Sort stale modules deterministically by name for consistent processing order.
 * Standalone export for the EnforceDeterministicStaleOrder node.
 */
export declare function enforceDeterministicStaleOrder(modules: string[]): string[];
/**
 * Canonicalize changelog entries by sorting changes alphabetically by node name
 * before narrowing, ensuring deterministic output.
 * Standalone export for the CanonicalizeChangelogForNarrowing node.
 */
export declare function canonicalizeChangelogForNarrowing(changelog: Changelog): Changelog;
/**
 * Validate the integrity of the hash store on cold start.
 * Checks that the file is valid JSON, has a known_hashes map, and all values are strings.
 * Standalone export for the ValidateHashStoreIntegrityOnStartup node.
 */
export declare function validateHashStoreIntegrity(syncStatePath: string): {
    valid: boolean;
    error?: string;
};
/**
 * Reconcile sequence numbers after a crash by reading the sync state
 * and the latest event files on disk.
 * Standalone export for the ReconcileSequenceNumbersOnRestart node.
 */
export declare function reconcileSequenceNumbers(syncStatePath: string, eventDirs: Array<{
    dependency: string;
    eventsDir: string;
}>): Record<string, number>;
/**
 * Verify that an outgoing event file was successfully written to disk.
 * Standalone export for the VerifyOutgoingEventWritten node.
 */
export declare function verifyOutgoingEventWritten(eventFilePath: string): boolean;
/**
 * Validate the format of an event file: must be valid JSON with required fields.
 * Standalone export for the ValidateEventFileFormat node (events module).
 */
export declare function validateEventFileFormat(eventFilePath: string): {
    valid: boolean;
    error?: string;
};
/**
 * Detect duplicate event sequence numbers for a dependency.
 * Returns true if the incoming sequence was already processed.
 * Standalone export for the DetectDuplicateEventSequence node.
 */
export declare function detectDuplicateEventSequence(syncState: SyncState, dependency: string, sequenceNumber: number): boolean;
/**
 * Detect if an event file was partially written (truncated/empty).
 * Returns true if the file exists but cannot be fully parsed.
 * Standalone export for the DetectPartiallyWrittenEventFile node.
 */
export declare function detectPartiallyWrittenEventFile(eventFilePath: string): boolean;
/**
 * Prioritize events by impact: events affecting more modules rank higher.
 * Returns events sorted by descending affected module count.
 * Standalone export for the PrioritizeEventsByImpact node.
 */
export declare function prioritizeEventsByImpact(events: Array<{
    dependency: string;
    affectedModules: string[];
}>): Array<{
    dependency: string;
    affectedModules: string[];
}>;
