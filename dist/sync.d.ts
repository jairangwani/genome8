/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */
import type { CompiledIndex, Changelog } from './types.js';
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
}
/**
 * Check all dependencies for interface changes.
 */
export declare function checkDependencies(dependenciesPath: string, index: CompiledIndex, syncStatePath: string, resolveDependencyPath: (depName: string) => string | null): SyncChange[];
/**
 * Mark modules as stale by adding _stale: true to their YAML files.
 */
export declare function markModulesStale(modulesDir: string, modules: string[], reason: string): void;
