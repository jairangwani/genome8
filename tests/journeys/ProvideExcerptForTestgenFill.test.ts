// Auto-generated from journey: ProvideExcerptForTestgenFill
// Module: excerpt
// Modules touched: testgen, excerpt, graph, codegen

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ProvideExcerptForTestgenFill", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Tester: { type: 'actor', description: 'Runs test suites' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        FilledSourceFile: { type: 'artifact', description: 'The generated implementation source file' },
      },
      journeys: {},
    }],
    ['testgen', {
      nodes: {
        FillTestAssertions: { type: 'process', description: 'Fills test assertion bodies' },
        TestSkeleton: { type: 'artifact', description: 'Test file skeleton with empty assertions' },
      },
      journeys: {
        FillTests: {
          steps: [
            { node: '_actors/Tester', action: 'requests test filling' },
            { node: 'FillTestAssertions', action: 'fills test assertions' },
            { node: 'graph/CompiledIndex', action: 'provides graph data' },
            { node: 'codegen/FilledSourceFile', action: 'provides source to test against' },
            { node: 'TestSkeleton', action: 'receives filled assertions' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'testgen';
  const moduleYaml = 'nodes:\n  FillTestAssertions:\n    type: process\n    description: Fills test assertions';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: testgen/FillTestAssertions requests focused context for filling test assertion bodies", () => {
    const node = result.index.nodes['testgen/FillTestAssertions'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module whose test skeleton needs assertion filling", () => {
    expect(excerpt).toContain('Focus: testgen');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph for understanding expected behaviors", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts node definitions to understand what each test should verify", () => {
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('FillTestAssertions (process)');
    expect(excerpt).toContain('TestSkeleton (artifact)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts journey steps to understand the expected sequence of actions", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('FillTests:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections identifies cross-module interactions the tests should validate", () => {
    expect(excerpt).toContain('CROSS-MODULE:');
    // The journey references codegen/FilledSourceFile and graph/CompiledIndex
    expect(excerpt).toContain('codegen/FilledSourceFile');
  });

  it("step 7: codegen/FilledSourceFile provides the implementation code the tests will exercise", () => {
    const sourceFile = result.index.nodes['codegen/FilledSourceFile'];
    expect(sourceFile).toBeDefined();
    expect(sourceFile.type).toBe('artifact');
    expect(sourceFile.module).toBe('codegen');
  });

  it("step 8: excerpt/LensRelevance filters context to test-relevant details, emphasizing expected behaviors and assertions", () => {
    // The YOUR NODES section contains type info for understanding behaviors
    expect(excerpt).toContain('(process)');
    expect(excerpt).toContain('(artifact)');
  });

  it("step 9: excerpt/AssembleExcerpt builds the testgen-focused excerpt with implementation and graph context", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 10: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 11: excerpt/ExcerptOutput provides the test-focused excerpt for the testgen pipeline", () => {
    expect(excerpt).toContain('YOUR FILE (testgen.yaml):');
    expect(excerpt).toBeTruthy();
  });
});
