/**
 * testgen.ts — Generate test skeletons from journeys.
 *
 * Each journey step becomes a test case.
 * Engine generates the skeleton. Agent fills assertions.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { CompiledIndex, CompiledJourney } from './types.js';

/**
 * Generate test files for all journeys.
 */
export function generateTests(index: CompiledIndex, testDir: string): string[] {
  const generatedFiles: string[] = [];
  const journeyDir = path.join(testDir, 'journeys');

  if (!fs.existsSync(journeyDir)) {
    fs.mkdirSync(journeyDir, { recursive: true });
  }

  for (const [name, journey] of Object.entries(index.journeys)) {
    const testContent = generateJourneyTest(name, journey, index);
    const filePath = path.join(journeyDir, `${name}.test.ts`);
    fs.writeFileSync(filePath, testContent);
    generatedFiles.push(filePath);
  }

  return generatedFiles;
}

/**
 * Generate test content for a single journey.
 */
export function generateJourneyTest(
  name: string,
  journey: CompiledJourney,
  index: CompiledIndex
): string {
  const lines: string[] = [];

  lines.push(`// Auto-generated from journey: ${name}`);
  lines.push(`// Module: ${journey.module}`);
  if (journey.actor) {
    lines.push(`// Triggered by: ${journey.actor}`);
  }
  lines.push(`// Modules touched: ${journey.modules_touched.join(', ')}`);
  lines.push('');
  lines.push("import { describe, it, expect } from 'vitest';");
  lines.push('');

  // Add imports for nodes that have implementation files
  const imports = new Set<string>();
  for (const step of journey.steps) {
    const node = index.nodes[step.node];
    if (node?.files?.length) {
      for (const file of node.files) {
        imports.add(`// Implementation: ${file}`);
      }
    }
  }
  if (imports.size > 0) {
    for (const imp of imports) lines.push(imp);
    lines.push('');
  }

  lines.push(`describe("${name}", () => {`);

  for (let i = 0; i < journey.steps.length; i++) {
    const step = journey.steps[i];
    const node = index.nodes[step.node];
    const nodeType = node ? ` (${node.type})` : '';
    const hasCode = node?.files?.length ? ` — has code: ${node.files[0]}` : '';

    lines.push(`  it("step ${step.step_number}: ${step.node} ${step.action}", () => {`);
    lines.push(`    // Node: ${step.node}${nodeType}${hasCode}`);
    lines.push(`    // Action: ${step.action}`);
    lines.push('    // TODO: agent fills assertion');
    lines.push('  });');
    lines.push('');

    // Connection assertion: consecutive step pair forms a connection
    if (i > 0) {
      const prev = journey.steps[i - 1];
      lines.push(`  it("connection: ${prev.node} → ${step.node}", () => {`);
      lines.push(`    // Assert that the output of step ${prev.step_number} feeds into step ${step.step_number}`);
      lines.push('    // TODO: agent fills connection assertion');
      lines.push('  });');
      lines.push('');
    }
  }

  lines.push('});');

  return lines.join('\n');
}

/**
 * Map import statements linking test files to codegen output.
 * Scans node files to generate appropriate import paths.
 */
export function mapTestImports(
  journey: CompiledJourney,
  index: CompiledIndex,
  testDir: string
): string[] {
  const imports: string[] = [];
  const seen = new Set<string>();

  for (const step of journey.steps) {
    const node = index.nodes[step.node];
    if (!node?.files?.length) continue;
    for (const file of node.files) {
      if (seen.has(file)) continue;
      seen.add(file);
      // Compute relative path from test file to implementation
      const testFilePath = path.join(testDir, 'journeys', `${journey.name}.test.ts`);
      const relPath = path.relative(path.dirname(testFilePath), file)
        .replace(/\\/g, '/') // normalize for Windows
        .replace(/\.ts$/, '.js');
      const moduleName = path.basename(file, path.extname(file));
      imports.push(`import { ${toPascalCase(moduleName)} } from '${relPath.startsWith('.') ? relPath : './' + relPath}';`);
    }
  }
  return imports;
}

function toPascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

/**
 * Run test files and collect results.
 * Returns pass/fail status and failure details.
 */
export interface TestResult {
  total: number;
  passed: number;
  failed: number;
  failures: Array<{ file: string; test: string; error: string }>;
}

export function runTests(testDir: string): TestResult {
  const { execSync } = require('node:child_process') as typeof import('node:child_process');
  try {
    execSync(`npx vitest run --reporter=json "${testDir}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 120_000,
    });
    return { total: 0, passed: 0, failed: 0, failures: [] };
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    const output = execErr.stdout || '';
    // Parse JSON reporter output
    try {
      const result = JSON.parse(output);
      const failures: TestResult['failures'] = [];
      for (const suite of result.testResults ?? []) {
        for (const test of suite.assertionResults ?? []) {
          if (test.status === 'failed') {
            failures.push({
              file: suite.name,
              test: test.fullName,
              error: test.failureMessages?.join('\n') ?? 'Unknown error',
            });
          }
        }
      }
      return {
        total: result.numTotalTests ?? 0,
        passed: result.numPassedTests ?? 0,
        failed: result.numFailedTests ?? 0,
        failures,
      };
    } catch {
      return { total: 0, passed: 0, failed: 0, failures: [{ file: testDir, test: 'runner', error: output }] };
    }
  }
}

/**
 * Generate test content for a single journey (string only, no file write).
 * Useful for in-memory testing.
 */
export function generateJourneyTestString(
  name: string,
  journey: CompiledJourney,
  index: CompiledIndex
): string {
  return generateJourneyTest(name, journey, index);
}

/**
 * Scan filled test assertions for trivial patterns that pass without
 * verifying actual journey step behavior. Returns flagged test names.
 * Enables RejectTrivialAssertionFill journey.
 */
export function detectTrivialAssertions(testContent: string): string[] {
  const trivialPatterns = [
    /expect\s*\(\s*true\s*\)\s*\.\s*toBe\s*\(\s*true\s*\)/,
    /expect\s*\(\s*1\s*\)\s*\.\s*toBe\s*\(\s*1\s*\)/,
    /expect\s*\([^)]+\)\s*\.\s*toBeDefined\s*\(\s*\)\s*;?\s*$/,
    /\/\/\s*TODO:\s*agent fills assertion/,
  ];

  const flagged: string[] = [];
  const itBlocks = testContent.matchAll(/it\s*\(\s*["'](.+?)["']\s*,\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g);

  for (const match of itBlocks) {
    const testName = match[1];
    const body = match[2].trim();
    // Empty body
    if (!body || body === '//') {
      flagged.push(testName);
      continue;
    }
    // Only trivial assertions
    const hasSubstantive = body.split('\n').some(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return false;
      return !trivialPatterns.some(p => p.test(trimmed));
    });
    if (!hasSubstantive) {
      flagged.push(testName);
    }
  }
  return flagged;
}

/**
 * Compare describe/it blocks in a filled test file against the journey's
 * step list. Returns mismatches (added, removed, or merged test cases).
 * Enables RecoverFromTestCaseStructureMismatch journey.
 */
export function validateTestCaseStructure(
  testContent: string,
  journey: CompiledJourney
): { valid: boolean; expected: string[]; actual: string[]; missing: string[]; extra: string[] } {
  // Extract expected test names from journey steps
  const expected = journey.steps.map(
    s => `step ${s.step_number}: ${s.node} ${s.action}`
  );

  // Extract actual it() block names from test content
  const actual: string[] = [];
  const itMatches = testContent.matchAll(/it\s*\(\s*["'](.+?)["']/g);
  for (const m of itMatches) {
    actual.push(m[1]);
  }

  // Find step tests (exclude connection tests)
  const actualSteps = actual.filter(a => a.startsWith('step '));
  const missing = expected.filter(e => !actualSteps.includes(e));
  const extra = actualSteps.filter(a => !expected.includes(a));

  return {
    valid: missing.length === 0 && extra.length === 0,
    expected,
    actual: actualSteps,
    missing,
    extra,
  };
}

/**
 * Classify a test failure's root cause after fix retries are exhausted.
 * Returns 'code_bug', 'test_bug', or 'graph_bug'.
 * Enables EscalateGraphBugToConvergence and EscalateGraphBugToAudit journeys.
 */
export function diagnoseFailureRoot(
  failure: { file: string; test: string; error: string },
  fixHistory: Array<{ attempt: number; error: string }>
): 'code_bug' | 'test_bug' | 'graph_bug' {
  // If all fixes were syntactically valid but semantically wrong → graph bug
  const allSyntaxValid = fixHistory.every(f =>
    !f.error.includes('SyntaxError') && !f.error.includes('Cannot find')
  );
  if (allSyntaxValid && fixHistory.length >= 2) {
    return 'graph_bug';
  }

  // If error mentions import/module resolution → code bug (missing implementation)
  if (/cannot find module|import.*not found|is not exported/i.test(failure.error)) {
    return 'code_bug';
  }

  // If error is assertion-related → test bug
  if (/expect.*received|toBe|toEqual|assertion/i.test(failure.error)) {
    return 'test_bug';
  }

  return 'code_bug';
}

/**
 * Check whether implementation files exist for a module's nodes before
 * generating or filling test skeletons. Returns missing file paths.
 * Enables SkipTestsForUnfilledModule journey.
 */
export function detectMissingImplementation(
  journey: CompiledJourney,
  index: CompiledIndex,
  projectDir: string
): string[] {
  const missing: string[] = [];
  const checked = new Set<string>();

  for (const step of journey.steps) {
    const node = index.nodes[step.node];
    if (!node?.files?.length) continue;
    for (const file of node.files) {
      if (checked.has(file)) continue;
      checked.add(file);
      const absPath = path.resolve(projectDir, file);
      if (!fs.existsSync(absPath)) {
        missing.push(file);
      }
    }
  }
  return missing;
}
