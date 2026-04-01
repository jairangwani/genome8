/**
 * codegen.ts — Generate code skeletons from the journey graph.
 *
 * For each process node that has a files: field, generate a skeleton
 * implementation file. The agent fills in the actual implementation.
 */
import type { CompiledIndex, CompiledNode } from './types.js';
export interface CodegenResult {
    generated: string[];
    skipped: string[];
}
/**
 * Generate code skeleton files for all process nodes that have files: field.
 */
export declare function generateCodeSkeletons(index: CompiledIndex, projectDir: string): CodegenResult;
/**
 * Build a prompt for the LLM to fill a skeleton file with working implementation.
 * Returns the prompt string. Caller passes it to the LLM worker.
 */
export declare function buildFillPrompt(skeletonContent: string, fullNodeName: string, node: CompiledNode): string;
export interface FillResult {
    filePath: string;
    success: boolean;
    error?: string;
}
/**
 * Validate that a generated/filled TypeScript file has valid syntax.
 * Runs tsc --noEmit on the file. Returns null if valid, error string if not.
 */
export declare function validateFilledSyntax(filePath: string, projectDir: string): string | null;
/**
 * Write a generated file to disk with retry on failure.
 * Returns true on success, throws with specific reason on failure.
 */
export declare function writeGeneratedFile(filePath: string, content: string, maxRetries?: number): void;
/**
 * Scan filled function bodies for placeholder patterns that indicate
 * the LLM did not produce real implementations.
 * Returns names of functions containing only placeholder code.
 * Enables RejectPlaceholderFill journey.
 */
export declare function detectPlaceholderFill(content: string): string[];
/**
 * Compare exported functions/classes in a filled file against the module's
 * node list to detect added or removed stubs that violate CodeComesFromNodes.
 * Returns {added, removed} stub names.
 * Enables RecoverFromNodeStubMismatch journey.
 */
export declare function detectNodeStubMismatch(content: string, expectedNodes: string[]): {
    added: string[];
    removed: string[];
};
/**
 * Compare the current graph node metadata against an existing source file
 * to determine if the code has drifted and needs a Mode 2 edit-based update.
 * Returns true if the file needs updating.
 * Enables UpdateExistingCodeFromGraph journey.
 */
export declare function detectCodeNeedsUpdate(existingContent: string, node: CompiledNode): boolean;
