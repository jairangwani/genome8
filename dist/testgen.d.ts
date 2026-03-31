/**
 * testgen.ts — Generate test skeletons from journeys.
 *
 * Each journey step becomes a test case.
 * Engine generates the skeleton. Agent fills assertions.
 */
import type { CompiledIndex, CompiledJourney } from './types.js';
/**
 * Generate test files for all journeys.
 */
export declare function generateTests(index: CompiledIndex, testDir: string): string[];
/**
 * Generate test content for a single journey.
 */
export declare function generateJourneyTest(name: string, journey: CompiledJourney, index: CompiledIndex): string;
/**
 * Map import statements linking test files to codegen output.
 * Scans node files to generate appropriate import paths.
 */
export declare function mapTestImports(journey: CompiledJourney, index: CompiledIndex, testDir: string): string[];
/**
 * Run test files and collect results.
 * Returns pass/fail status and failure details.
 */
export interface TestResult {
    total: number;
    passed: number;
    failed: number;
    failures: Array<{
        file: string;
        test: string;
        error: string;
    }>;
}
export declare function runTests(testDir: string): TestResult;
/**
 * Generate test content for a single journey (string only, no file write).
 * Useful for in-memory testing.
 */
export declare function generateJourneyTestString(name: string, journey: CompiledJourney, index: CompiledIndex): string;
