/**
 * publish.ts — Auto-generate published interface + changelog.
 *
 * After each compile, generates:
 * - published/interface.yaml (what this engine provides + requires)
 * - published/changelog.yaml (what changed since last version)
 */
import type { CompiledIndex, PublishedInterface, Changelog } from './types.js';
/**
 * Generate published interface from compiled index.
 */
export declare function generateInterface(index: CompiledIndex, engineName: string): PublishedInterface;
/**
 * Generate changelog by diffing two interfaces.
 */
export declare function generateChangelog(previous: PublishedInterface | null, current: PublishedInterface): Changelog;
/**
 * Write published interface and changelog to disk.
 */
export declare function publishInterface(publishedDir: string, index: CompiledIndex, engineName: string): {
    interface_: PublishedInterface;
    changelog: Changelog;
};
