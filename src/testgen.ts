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

  for (const step of journey.steps) {
    const node = index.nodes[step.node];
    const nodeType = node ? ` (${node.type})` : '';
    const hasCode = node?.files?.length ? ` — has code: ${node.files[0]}` : '';

    lines.push(`  it("step ${step.step_number}: ${step.node} ${step.action}", () => {`);
    lines.push(`    // Node: ${step.node}${nodeType}${hasCode}`);
    lines.push(`    // Action: ${step.action}`);
    lines.push('    // TODO: agent fills assertion');
    lines.push('  });');
    lines.push('');
  }

  lines.push('});');

  return lines.join('\n');
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
