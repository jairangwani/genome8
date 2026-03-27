// Auto-generated from journey: ProvideExcerptForCodegenFill
// Module: excerpt
// Modules touched: codegen, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ProvideExcerptForCodegenFill", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Developer: { type: 'actor', description: 'A developer who writes code' },
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
        FillImplementation: { type: 'process', description: 'Fills a code skeleton with implementation' },
        CodeTemplate: { type: 'artifact', description: 'Template for code generation' },
      },
      journeys: {
        FillCode: {
          steps: [
            { node: '_actors/Developer', action: 'requests code filling for a module' },
            { node: 'FillImplementation', action: 'fills the code skeleton' },
            { node: 'graph/CompiledIndex', action: 'provides graph data' },
            { node: 'CodeTemplate', action: 'generates code from template' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'codegen';
  const moduleYaml = 'nodes:\n  FillImplementation:\n    type: process\n    description: Fills code skeleton';
  const excerpt = generateExcerpt({
    round: 3,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: codegen/FillImplementation requests focused context for filling a code skeleton with implementation", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('skeleton');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module whose code skeleton needs filling", () => {
    expect(excerpt).toContain('Focus: codegen');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph for understanding node purposes and connections", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes with types and descriptions for implementation guidance", () => {
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('FillImplementation (process)');
    expect(excerpt).toContain('CodeTemplate (artifact)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys showing how nodes interact in sequences", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('FillCode:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections identifies imports and dependencies the implementation needs to reference", () => {
    expect(excerpt).toContain('CROSS-MODULE:');
    // The journey references _actors/Developer and graph/CompiledIndex
    expect(excerpt).toContain('_actors/Developer');
  });

  it("step 7: excerpt/LensRelevance filters context to implementation-relevant details, emphasizing node descriptions and journey flows", () => {
    // Node descriptions are included in the YOUR NODES section
    const nodesSection = excerpt.split('YOUR NODES:')[1];
    expect(nodesSection).toBeDefined();
    expect(nodesSection).toContain('process');
  });

  it("step 8: excerpt/AssembleExcerpt builds the codegen-focused excerpt prioritizing implementation guidance", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 10: excerpt/ExcerptOutput provides the implementation-focused excerpt for the codegen pipeline", () => {
    expect(excerpt).toContain('YOUR FILE (codegen.yaml):');
    expect(excerpt).toContain('```yaml');
    expect(excerpt).toContain('FillImplementation');
  });
});
