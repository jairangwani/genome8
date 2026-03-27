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
