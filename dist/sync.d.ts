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
