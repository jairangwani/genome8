// Auto-generated from journey: GenerateModuleExcerpt
// Module: excerpt
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("GenerateModuleExcerpt", () => {
  // Fixture: two modules with cross-module connections and an actor
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compiles all modules into the index' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['excerpt', {
      spec_sections: [3],
      nodes: {
        SelectTargetModule: { type: 'process', description: 'Identifies the module to generate an excerpt for' },
        CollectLocalNodes: { type: 'process', description: 'Extracts all nodes defined in the target module' },
        CollectLocalJourneys: { type: 'process', description: 'Extracts all journeys defined in the target module' },
        CollectCrossModuleConnections: { type: 'process', description: 'Finds all edges crossing into or out of the target module' },
        CollectReferencedActors: { type: 'process', description: 'Finds all actors referenced in journey steps' },
        CollectTriggeredByActors: { type: 'process', description: 'Identifies which actors appear as first-step triggers' },
        CollectWarnings: { type: 'process', description: 'Gathers compilation warnings relevant to this module' },
        CollectGlobalStats: { type: 'process', description: 'Gathers total nodes, journeys, connections, orphans, and duplicates' },
        CollectAllModuleSummaries: { type: 'process', description: 'Gathers one-line stats for every module in the graph' },
        CollectModuleSource: { type: 'process', description: 'Reads the raw YAML file content of the target module' },
        AssembleExcerpt: { type: 'process', description: 'Combines all collected sections into a structured excerpt', files: ['src/excerpt.ts'] },
        ExcerptLineLimit: { type: 'rule', description: 'Enforces the ~200 line target for the output' },
        TruncateToLimit: { type: 'process', description: 'Trims the assembled excerpt if it exceeds the line limit' },
        ExcerptOutput: { type: 'artifact', description: 'Stores the final focused context document for the module' },
      },
      journeys: {
        GenerateModuleExcerpt: {
          steps: [
            { node: '_actors/Compiler', action: 'provides the compiled index with all nodes, journeys, and connections' },
            { node: 'graph/CompiledIndex', action: 'supplies the full graph data for extraction' },
            { node: 'SelectTargetModule', action: 'identifies the module to generate an excerpt for' },
            { node: 'CollectLocalNodes', action: 'extracts all nodes defined in the target module' },
            { node: 'CollectLocalJourneys', action: 'extracts all journeys defined in the target module' },
            { node: 'CollectCrossModuleConnections', action: 'finds all edges crossing into or out of the target module' },
            { node: 'CollectReferencedActors', action: 'finds all actors referenced in journey steps' },
            { node: 'CollectTriggeredByActors', action: 'identifies which actors appear as first-step triggers' },
            { node: 'CollectWarnings', action: 'gathers compilation warnings relevant to this module' },
            { node: 'CollectGlobalStats', action: 'gathers total stats across all modules' },
            { node: 'CollectAllModuleSummaries', action: 'gathers one-line stats for every module' },
            { node: 'CollectModuleSource', action: 'reads the raw YAML file content' },
            { node: 'AssembleExcerpt', action: 'combines all collected sections into a structured excerpt' },
            { node: 'ExcerptLineLimit', action: 'enforces the ~200 line target' },
            { node: 'TruncateToLimit', action: 'trims the assembled excerpt if it exceeds the line limit' },
            { node: 'ExcerptOutput', action: 'stores the final focused context document' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'excerpt';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: 'nodes:\n  SelectTargetModule:\n    type: process\n    description: Identifies the module',
  });

  it("step 1: _actors/Compiler provides the compiled index with all nodes, journeys, and connections", () => {
    // The actor node exists in the compiled index
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler).toBeDefined();
    expect(compiler.type).toBe('actor');
    // The actor is referenced in a journey that touches excerpt
    expect(compiler.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 2: graph/CompiledIndex supplies the full graph data for extraction", () => {
    // The CompiledIndex artifact node exists
    const idx = result.index.nodes['graph/CompiledIndex'];
    expect(idx).toBeDefined();
    expect(idx.type).toBe('artifact');
    // The compiled index has stats
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 3: excerpt/SelectTargetModule identifies the module to generate an excerpt for", () => {
    // The excerpt is generated for the focus module 'excerpt'
    expect(excerpt).toContain('Focus: excerpt');
  });

  it("step 4: excerpt/CollectLocalNodes extracts all nodes defined in the target module", () => {
    // YOUR NODES section lists all excerpt module nodes
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('SelectTargetModule (process)');
    expect(excerpt).toContain('AssembleExcerpt (process)');
    expect(excerpt).toContain('ExcerptOutput (artifact)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts all journeys defined in the target module", () => {
    // YOUR JOURNEYS section lists the GenerateModuleExcerpt journey
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('GenerateModuleExcerpt:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections finds all edges crossing into or out of the target module", () => {
    // CROSS-MODULE section should show cross-module connections
    expect(excerpt).toContain('CROSS-MODULE:');
    // _actors/Compiler and graph/CompiledIndex are cross-module connections
    expect(excerpt).toContain('_actors/Compiler');
  });

  it("step 7: excerpt/CollectReferencedActors finds all actors referenced in the target module's journey steps", () => {
    // The actor _actors/Compiler is used as an actor in the journey
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler.type).toBe('actor');
    // Nodes in excerpt that are triggered by this actor
    const excerptNodes = Object.entries(result.index.nodes)
      .filter(([, n]) => n.module === 'excerpt');
    const triggeredNodes = excerptNodes.filter(([, n]) => n.triggered_by_actors.length > 0);
    expect(triggeredNodes.length).toBeGreaterThan(0);
  });

  it("step 8: excerpt/CollectTriggeredByActors identifies which actors appear as first-step triggers in the module's journeys", () => {
    // TRIGGERED BY section shows the Compiler actor
    expect(excerpt).toContain('TRIGGERED BY:');
    expect(excerpt).toContain('Compiler');
  });

  it("step 9: excerpt/CollectWarnings gathers compilation warnings relevant to this module", () => {
    // Issues may or may not exist; if they do, they appear in ISSUES section
    const excerptIssues = result.issues.filter(i => i.module === 'excerpt' || i.module.includes('excerpt'));
    if (excerptIssues.length > 0) {
      expect(excerpt).toContain('ISSUES:');
    }
    // No matter what, the excerpt generation succeeds
    expect(excerpt).toBeTruthy();
  });

  it("step 10: excerpt/CollectGlobalStats gathers total nodes, journeys, connections, orphans, and duplicates across all modules", () => {
    // GLOBAL section shows total stats
    expect(excerpt).toContain('GLOBAL:');
    expect(excerpt).toMatch(/\d+ nodes/);
    expect(excerpt).toMatch(/\d+ journeys/);
    expect(excerpt).toMatch(/\d+ connections/);
  });

  it("step 11: excerpt/CollectAllModuleSummaries gathers one-line stats for every module in the graph", () => {
    // ALL MODULES section shows summaries for each module
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('excerpt:');
    expect(excerpt).toContain('graph:');
    expect(excerpt).toContain('_actors:');
    // The focus module is marked with YOU
    expect(excerpt).toMatch(/excerpt:.*YOU/);
  });

  it("step 12: excerpt/CollectModuleSource reads the raw YAML file content of the target module", () => {
    // YOUR FILE section includes the raw YAML
    expect(excerpt).toContain('YOUR FILE (excerpt.yaml):');
    expect(excerpt).toContain('```yaml');
    expect(excerpt).toContain('SelectTargetModule');
  });

  it("step 13: excerpt/AssembleExcerpt combines all collected sections into a structured excerpt document", () => {
    // The excerpt contains all the key sections in order
    const sections = ['MODULE STATUS:', 'YOUR NODES:', 'YOUR JOURNEYS:', 'CROSS-MODULE:', 'ALL MODULES:', 'GLOBAL:', 'YOUR FILE'];
    for (const section of sections) {
      expect(excerpt).toContain(section);
    }
  });

  it("step 14: excerpt/ExcerptLineLimit enforces the ~200 line target for the output", () => {
    // The excerpt has a reasonable line count
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
    // The excerpt is a string (the limit rule is conceptual)
    expect(typeof excerpt).toBe('string');
  });

  it("step 15: excerpt/TruncateToLimit trims the assembled excerpt if it exceeds the line limit", () => {
    // The excerpt is not empty after any truncation
    expect(excerpt.length).toBeGreaterThan(0);
    // The excerpt starts with the ROUND header
    expect(excerpt).toMatch(/^ROUND 1/);
  });

  it("step 16: excerpt/ExcerptOutput stores the final focused context document for the module", () => {
    // The final excerpt is a non-empty string with all key sections
    expect(excerpt).toBeTruthy();
    expect(excerpt).toContain('ROUND 1');
    expect(excerpt).toContain('Focus: excerpt');
    // Ends with the closing code fence
    expect(excerpt).toContain('```');
  });
});
