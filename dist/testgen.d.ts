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
/**
 * Scan filled test assertions for trivial patterns that pass without
 * verifying actual journey step behavior. Returns flagged test names.
 * Enables RejectTrivialAssertionFill journey.
 */
export declare function detectTrivialAssertions(testContent: string): string[];
/**
 * Compare describe/it blocks in a filled test file against the journey's
 * step list. Returns mismatches (added, removed, or merged test cases).
 * Enables RecoverFromTestCaseStructureMismatch journey.
 */
export declare function validateTestCaseStructure(testContent: string, journey: CompiledJourney): {
    valid: boolean;
    expected: string[];
    actual: string[];
    missing: string[];
    extra: string[];
};
/**
 * Classify a test failure's root cause after fix retries are exhausted.
 * Returns 'code_bug', 'test_bug', or 'graph_bug'.
 * Enables EscalateGraphBugToConvergence and EscalateGraphBugToAudit journeys.
 */
export declare function diagnoseFailureRoot(failure: {
    file: string;
    test: string;
    error: string;
}, fixHistory: Array<{
    attempt: number;
    error: string;
}>): 'code_bug' | 'test_bug' | 'graph_bug';
/**
 * Check whether implementation files exist for a module's nodes before
 * generating or filling test skeletons. Returns missing file paths.
 * Enables SkipTestsForUnfilledModule journey.
 */
export declare function detectMissingImplementation(journey: CompiledJourney, index: CompiledIndex, projectDir: string): string[];
/**
 * Read all journeys from the compiled index and return them as a flat list.
 * Standalone export for the ReadJourneySteps node.
 */
export declare function readJourneySteps(index: CompiledIndex): Array<{
    name: string;
    module: string;
    steps: CompiledJourney['steps'];
}>;
/**
 * Verify that every journey has a filled test file on disk.
 * Returns journeys still missing their test file.
 * Standalone export for the ConfirmAllTestsFilled node.
 */
export declare function confirmAllTestsFilled(index: CompiledIndex, testDir: string): string[];
/**
 * Verify that the test result report shows zero failures.
 * Standalone export for the ConfirmAllTestsPassing node.
 */
export declare function confirmAllTestsPassing(result: TestResult): boolean;
/**
 * Compare pre-fix and post-fix test results to detect new failures
 * that did not exist before the fix was applied.
 * Standalone export for the DetectFixInducedRegression node.
 */
export declare function detectFixInducedRegression(preFix: TestResult, postFix: TestResult): {
    regressed: boolean;
    newFailures: string[];
};
/**
 * Build a targeted fix prompt for a test failure.
 * Standalone export for the GenerateFixPrompt node.
 */
export declare function generateFixPrompt(failure: {
    file: string;
    test: string;
    error: string;
}, implFile?: string): string;
