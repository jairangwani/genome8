/**
 * excerpt.ts — Smart excerpt generation.
 * ~200 lines of focused context per module per turn.
 * Shows: your nodes, your journeys, what comes before/after,
 * cross-module connections, orphans, warnings.
 */
import type { CompiledIndex, CoverageReport, ValidationIssue } from './types.js';
export interface ExcerptInput {
    round: number;
    focusModule: string;
    index: CompiledIndex;
    coverage: CoverageReport;
    issues: ValidationIssue[];
    moduleFileContent: string;
    specSections?: string;
}
export declare function generateExcerpt(input: ExcerptInput): string;
/**
 * Collect all cross-module connections for a given module.
 * Returns inbound and outbound connections with their source/target context.
 * Standalone export for the CollectCrossModuleConnections node.
 */
export declare function collectCrossModuleConnections(focusModule: string, index: CompiledIndex): {
    inbound: Array<{
        from: string;
        to: string;
    }>;
    outbound: Array<{
        from: string;
        to: string;
    }>;
};
/**
 * Validate that all cross-module refs in an excerpt resolve to real nodes.
 * Returns unresolvable refs.
 * Standalone export for the ValidateCrossModuleRefIntegrity node.
 */
export declare function validateCrossModuleRefIntegrity(focusModule: string, index: CompiledIndex): string[];
/**
 * Validate that an excerpt contains all mandatory sections.
 * Returns names of missing sections.
 * Standalone export for the ValidateExcerptCompleteness node.
 */
export declare function validateExcerptCompleteness(excerpt: string): string[];
/**
 * Generate excerpts for multiple modules in a single pass.
 * Returns a map of module name → excerpt string.
 * Standalone export for the BatchGenerateExcerpts node.
 */
export declare function batchGenerateExcerpts(modules: string[], round: number, index: CompiledIndex, coverage: CoverageReport, issues: ValidationIssue[], moduleContents: Record<string, string>, specSections?: string): Record<string, string>;
