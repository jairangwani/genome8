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
 * Validate that all journey refs in the exported interface resolve to
 * exported nodes or are explicitly marked as external requirements.
 */
export declare function validateExportedInterface(interface_: PublishedInterface, index: CompiledIndex): string[];
/**
 * Detect corrupted previous hash file. Returns true if the hash is invalid.
 */
export declare function detectCorruptedHash(hashString: string | undefined): boolean;
/**
 * Write event file to signal downstream dependents.
 * Contains interface hash, changelog summary, origin chain, and sequence number.
 */
export declare function writeEventFile(publishedDir: string, interface_: PublishedInterface, changelog: Changelog, originChain: string[], boxId: string): void;
/**
 * Atomic file write: write to temp file then rename.
 * Prevents partial writes from leaving corrupted files on disk.
 */
export declare function atomicWrite(filePath: string, content: string): void;
/**
 * Write published interface and changelog to disk.
 */
export declare function publishInterface(publishedDir: string, index: CompiledIndex, engineName: string): {
    interface_: PublishedInterface;
    changelog: Changelog;
    skipped: boolean;
};
