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
/**
 * On cold start, scan the publish output directory for orphan .tmp files
 * left by atomic write operations that crashed between temp file creation
 * and rename. Removes them to prevent disk accumulation.
 * Enables CleanupOrphanTempFilesOnColdStart journey.
 */
export declare function detectOrphanTempFiles(publishedDir: string): string[];
/**
 * Before incrementing the event sequence counter, check if the last event
 * file already has the expected next sequence number (indicating a retry
 * of an already-written event). Skips increment to prevent double-counting.
 * Enables GuardSequenceCounterOnPublishRetry journey.
 */
export declare function guardSequenceCounter(eventPath: string, expectedNext: number): boolean;
/**
 * Collect nodes to be exported as the box's public interface.
 * Standalone export for the CollectExportedNodes node.
 */
export declare function collectExportedNodes(index: CompiledIndex): Record<string, {
    type: string;
    description: string;
    in_journeys: number;
}>;
/**
 * Collect journeys to be exported as the box's public interface.
 * Standalone export for the CollectExportedJourneys node.
 */
export declare function collectExportedJourneys(index: CompiledIndex): Record<string, {
    steps: number;
    module: string;
}>;
/**
 * Compute the SHA256 interface hash from the provides and requires maps.
 * Standalone export for the ComputeInterfaceHash node.
 */
export declare function computeInterfaceHash(provides: PublishedInterface['provides'], requires: Record<string, string>): string;
/**
 * Compare new hash against the previously published hash.
 * Returns 'changed', 'unchanged', or 'first_publish'.
 * Standalone export for the ComparePreviousHash node.
 */
export declare function comparePreviousHash(previousHash: string | null, currentHash: string): 'changed' | 'unchanged' | 'first_publish';
/**
 * After writing interface.yaml, re-read it, recompute the SHA256 from
 * the file content, and verify it matches the embedded hash.
 * Standalone export for the VerifyPublishedHashIntegrity node.
 */
export declare function verifyPublishedHashIntegrity(interfacePath: string): {
    verified: boolean;
    error?: string;
};
/**
 * After writing both event file and interface.yaml, verify their hashes match.
 * Standalone export for the CrossCheckEventInterfaceHash node.
 */
export declare function crossCheckEventInterfaceHash(interfacePath: string, eventFilePath: string): {
    match: boolean;
    interfaceHash?: string;
    eventHash?: string;
};
/**
 * Remove partially written publish artifacts to restore pre-publish state.
 * Standalone export for the RollbackPartialPublish node.
 */
export declare function rollbackPartialPublish(publishedDir: string, artifacts?: string[]): string[];
/**
 * Detect exactly which publish pipeline step was interrupted after a crash.
 * Standalone export for the DetectPublishInterruptionPoint node.
 */
export declare function detectPublishInterruptionPoint(publishedDir: string): 'pre-interface' | 'post-interface-pre-changelog' | 'post-changelog-pre-event' | 'complete';
/**
 * On cold start, read the sequence number from the last event file on disk
 * to restore the counter baseline.
 * Standalone export for the RestoreSequenceCounterFromDisk node.
 */
export declare function restoreSequenceCounterFromDisk(eventsDir: string): number;
/**
 * Validate the in-memory interface structure against required schema
 * before serialization.
 * Standalone export for the ValidateInterfaceYamlSchema node.
 */
export declare function validateInterfaceSchema(iface: PublishedInterface): {
    valid: boolean;
    errors: string[];
};
/**
 * Validate changelog structure before serialization.
 * Standalone export for the ValidateChangelogYamlSchema node.
 */
export declare function validateChangelogSchema(changelog: Changelog): {
    valid: boolean;
    errors: string[];
};
/**
 * Sort exported nodes and journeys alphabetically before hash computation
 * to guarantee identical content always produces identical hash.
 * Standalone export for the CanonicalizeHashInput node.
 */
export declare function canonicalizeHashInput(provides: PublishedInterface['provides'], requires: Record<string, string>): {
    provides: PublishedInterface['provides'];
    requires: Record<string, string>;
};
/**
 * Sort changelog changes alphabetically by name for deterministic output.
 * Standalone export for the CanonicalizeChangelogDiffOutput node.
 */
export declare function canonicalizeChangelogDiff(changelog: Changelog): Changelog;
/**
 * Detect when previous interface.yaml is present but unparsable.
 * Standalone export for the DetectCorruptedPreviousInterface node.
 */
export declare function detectCorruptedPreviousInterface(interfacePath: string): boolean;
