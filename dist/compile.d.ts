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
 * Detect destructive edits by comparing node counts before and after a module rewrite.
 * If a rewrite causes significant content loss, returns the affected modules.
 */
export declare function detectDestructiveEdit(before: CompileResult, after: CompileResult): Array<{
    module: string;
    nodesBefore: number;
    nodesAfter: number;
    lost: string[];
}>;
/**
 * Detect field loss after a module rewrite by comparing field presence.
 * Returns modules where fields were silently dropped.
 */
export declare function detectFieldLoss(before: Map<string, ModuleFile>, after: Map<string, ModuleFile>): Array<{
    module: string;
    lostFields: string[];
}>;
/**
 * Incrementally merge a single module into an existing compiled index without full rebuild.
 * Returns updated index + any new issues introduced by this module.
 */
export declare function incrementalMerge(existingResult: CompileResult, moduleName: string, moduleFile: ModuleFile): CompileResult;
/**
 * Merge multiple modules in a single pass (batch incremental).
 * Compiles only the provided modules, useful after loading from disk.
 */
export declare function batchMerge(modules: Map<string, ModuleFile>, externalInterfaces?: Map<string, PublishedInterface>): CompileResult;
/**
 * Compare two CompileResults for structural equality.
 * Returns differences found. Empty array = identical.
 */
export declare function compareResults(a: CompileResult, b: CompileResult): string[];
/**
 * Validates that every journey step has a meaningful action description.
 * Flags steps with empty or too-short actions (fewer than 5 characters).
 */
export declare function validateActionQuality(result: CompileResult): ValidationIssue[];
export declare function compileFromModules(modules: Map<string, ModuleFile>, externalInterfaces?: Map<string, PublishedInterface>): CompileResult;
export declare function loadAllModules(modulesDir: string): Map<string, ModuleFile>;
