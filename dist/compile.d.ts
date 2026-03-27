/**
 * compile.ts — THE HEART
 *
 * Reads ALL module YAML files.
 * Computes ALL connections from journey steps.
 * No manual edges. Consecutive steps = connections.
 */
import type { ModuleFile, CompiledIndex, ValidationIssue, CoverageReport, PublishedInterface } from './types.js';
export interface CompileResult {
    index: CompiledIndex;
    issues: ValidationIssue[];
    coverage: CoverageReport;
}
/**
 * Detects duplicate step sequences across journeys.
 * If two journeys have the same 3+ consecutive node sequence, flags it.
 * This may indicate copy-paste or redundant journey definitions.
 */
export declare function detectDuplicateSequences(result: CompileResult): Array<{
    sequence: string[];
    journeys: string[];
}>;
export declare function compile(modulesDir: string): CompileResult;
/**
 * Validates that every journey step has a meaningful action description.
 * Flags steps with empty or too-short actions (fewer than 5 characters).
 */
export declare function validateActionQuality(result: CompileResult): ValidationIssue[];
export declare function compileFromModules(modules: Map<string, ModuleFile>, externalInterfaces?: Map<string, PublishedInterface>): CompileResult;
export declare function loadAllModules(modulesDir: string): Map<string, ModuleFile>;
