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
 * Generate test content for a single journey (string only, no file write).
 * Useful for in-memory testing.
 */
export declare function generateJourneyTestString(name: string, journey: CompiledJourney, index: CompiledIndex): string;
