// Auto-generated from journey: ProvideCodegenExcerptContext
// Module: codegen
// Modules touched: codegen, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ProvideCodegenExcerptContext", () => {
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'Compiled graph for understanding node purposes', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['excerpt', {
      nodes: {
        SelectTargetModule: { type: 'process', description: 'Targets the module for excerpt generation' },
        CollectLocalNodes: { type: 'process', description: 'Extracts the modules nodes with types and descriptions' },
        CollectLocalJourneys: { type: 'process', description: 'Extracts the modules journeys showing node interactions' },
        CollectCrossModuleConnections: { type: 'process', description: 'Identifies imports and dependencies needed' },
        LensRelevance: { type: 'rule', description: 'Filters context to implementation-relevant details' },
        AssembleExcerpt: { type: 'process', description: 'Builds the codegen-focused excerpt', files: ['src/excerpt.ts'] },
        TruncateToLimit: { type: 'process', description: 'Ensures the excerpt fits within the line budget' },
        ExcerptOutput: { type: 'artifact', description: 'Implementation-focused excerpt for the fill task' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        SelectNextModuleToFill: { type: 'process', description: 'Identifies which module needs an excerpt' },
        ProvideCodegenExcerpt: { type: 'process', description: 'Wraps the excerpt with codegen-specific instructions' },
      },
      journeys: {
        ProvideCodegenExcerptContext: {
          steps: [
            { node: 'SelectNextModuleToFill', action: 'identifies which module needs an excerpt for its fill pass' },
            { node: 'excerpt/SelectTargetModule', action: 'targets the module for excerpt generation' },
            { node: 'graph/CompiledIndex', action: 'provides the compiled graph for understanding node purposes and connections' },
            { node: 'excerpt/CollectLocalNodes', action: 'extracts the modules nodes with types and descriptions' },
            { node: 'excerpt/CollectLocalJourneys', action: 'extracts the modules journeys showing how nodes interact' },
            { node: 'excerpt/CollectCrossModuleConnections', action: 'identifies imports and dependencies the implementation needs' },
            { node: 'excerpt/LensRelevance', action: 'filters context to implementation-relevant details' },
            { node: 'excerpt/AssembleExcerpt', action: 'builds the codegen-focused excerpt prioritizing implementation guidance' },
            { node: 'excerpt/TruncateToLimit', action: 'ensures the excerpt fits within the line budget' },
            { node: 'excerpt/ExcerptOutput', action: 'provides the implementation-focused excerpt for the fill task' },
            { node: 'ProvideCodegenExcerpt', action: 'wraps the excerpt with codegen-specific instructions for the LLM worker' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: codegen/SelectNextModuleToFill identifies which module needs an excerpt for its fill pass", () => {
    const node = result.index.nodes['codegen/SelectNextModuleToFill'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    const journey = result.index.journeys['ProvideCodegenExcerptContext'];
    expect(journey.steps[0].node).toBe('codegen/SelectNextModuleToFill');
  });

  it("step 2: excerpt/SelectTargetModule targets the module for excerpt generation", () => {
    const node = result.index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Cross-module connection from codegen to excerpt
    expect(node.cross_module_connections).toContain('codegen/SelectNextModuleToFill');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph for understanding node purposes and connections", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.files).toContain('src/types.ts');
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes with types and descriptions for implementation guidance", () => {
    const node = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys showing how nodes interact in sequences", () => {
    const node = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('excerpt/CollectLocalNodes');
  });

  it("step 6: excerpt/CollectCrossModuleConnections identifies imports and dependencies the implementation needs to reference", () => {
    const node = result.index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("step 7: excerpt/LensRelevance filters context to implementation-relevant details emphasizing node descriptions and journey flows", () => {
    const node = result.index.nodes['excerpt/LensRelevance'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('excerpt/CollectCrossModuleConnections');
  });

  it("step 8: excerpt/AssembleExcerpt builds the codegen-focused excerpt prioritizing implementation guidance", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/excerpt.ts');
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const node = result.index.nodes['excerpt/TruncateToLimit'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 10: excerpt/ExcerptOutput provides the implementation-focused excerpt for the fill task", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/TruncateToLimit');
  });

  it("step 11: codegen/ProvideCodegenExcerpt wraps the excerpt with codegen-specific instructions for the LLM worker", () => {
    const node = result.index.nodes['codegen/ProvideCodegenExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Last step — cross-module connection from excerpt
    expect(node.cross_module_connections).toContain('excerpt/ExcerptOutput');
    const journey = result.index.journeys['ProvideCodegenExcerptContext'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('codegen/ProvideCodegenExcerpt');
  });

});
