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
