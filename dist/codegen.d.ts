/**
 * codegen.ts — Generate code skeletons from the journey graph.
 *
 * For each process node that has a files: field, generate a skeleton
 * implementation file. The agent fills in the actual implementation.
 */
import type { CompiledIndex } from './types.js';
export interface CodegenResult {
    generated: string[];
    skipped: string[];
}
/**
 * Generate code skeleton files for all process nodes that have files: field.
 */
export declare function generateCodeSkeletons(index: CompiledIndex, projectDir: string): CodegenResult;
