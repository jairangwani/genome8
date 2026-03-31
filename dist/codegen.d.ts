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
