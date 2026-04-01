// Auto-generated from journey: ProvideFixExcerptToWorker
// Module: audit
// Modules touched: audit, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('excerpt', {
    nodes: {
      SelectTargetModule: { type: 'process', description: 'identifies the module the auditor will examine' },
      CollectLocalNodes: { type: 'process', description: 'extracts the target module nodes for the auditor to review' },
      CollectLocalJourneys: { type: 'process', description: 'extracts the target module journeys for the auditor to review' },
      CollectCrossModuleConnections: { type: 'process', description: 'shows how the target module connects to others' },
      CollectModuleSource: { type: 'process', description: 'reads the raw YAML so the worker can edit the specific file' },
      AssembleExcerpt: { type: 'process', description: 'assembles the final excerpt including all context sections for the worker' },
      TruncateToLimit: { type: 'process', description: 'trims to the ~200 line budget' },
      ExcerptOutput: { type: 'artifact', description: 'the assembled excerpt text ready to be sent to the worker as context' },
    },
  });

  modules.set('graph', {
    nodes: {
      CompiledIndex: { type: 'artifact', description: 'the full compiled index containing all nodes, journeys, and connections across all modules' },
    },
  });

  modules.set('audit', {
    nodes: {
      SelectNextGapToFix: { type: 'process', description: 'picks the highest-priority unfixed gap from the prioritized list and advances the pointer to the next gap' },
      ProvideFixContext: { type: 'process', description: 'assembles the target module excerpt, the specific gap description, and surrounding graph context into a complete fix payload for the LLM worker' },
      BuildGapFixPrompt: { type: 'process', description: 'builds a targeted fix prompt for each gap specifying exactly which module to edit and what coverage to add' },
    },
    journeys: {
      ProvideFixExcerptToWorker: {
        steps: [
          { node: 'SelectNextGapToFix', action: 'identifies which module contains the gap to be fixed' },
          { node: 'excerpt/SelectTargetModule', action: 'targets the module that needs the fix' },
          { node: 'graph/CompiledIndex', action: 'provides the compiled graph showing current state including the gap' },
          { node: 'excerpt/CollectLocalNodes', action: 'extracts the module nodes so the worker knows what exists' },
          { node: 'excerpt/CollectLocalJourneys', action: 'extracts the module journeys so the worker knows current coverage' },
          { node: 'excerpt/CollectCrossModuleConnections', action: 'shows cross-module connections relevant to the gap' },
          { node: 'excerpt/CollectModuleSource', action: 'reads the raw YAML so the worker can edit the specific file' },
          { node: 'excerpt/AssembleExcerpt', action: 'builds the fix-focused excerpt combining gap details with module context' },
          { node: 'excerpt/TruncateToLimit', action: 'ensures the excerpt fits within the line budget' },
          { node: 'excerpt/ExcerptOutput', action: 'provides the excerpt to the fix prompt builder' },
          { node: 'ProvideFixContext', action: 'combines the excerpt with the specific gap description into the fix payload' },
          { node: 'BuildGapFixPrompt', action: 'packages the fix context into the prompt sent to the LLM worker' },
        ],
      },
    },
  });

  return modules;
}

describe("ProvideFixExcerptToWorker", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideFixExcerptToWorker'];

  it("step 1: audit/SelectNextGapToFix identifies which module contains the gap to be fixed", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('ProvideFixExcerptToWorker'))).toBe(true);
  });

  it("step 2: excerpt/SelectTargetModule targets the module that needs the fix", () => {
    const node = result.index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → excerpt/SelectTargetModule", () => {
    const src = result.index.nodes['audit/SelectNextGapToFix'];
    expect(src.followed_by).toContain('excerpt/SelectTargetModule');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph showing current state including the gap", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/SelectTargetModule');
  });

  it("connection: excerpt/SelectTargetModule → graph/CompiledIndex", () => {
    const src = result.index.nodes['excerpt/SelectTargetModule'];
    expect(src.followed_by).toContain('graph/CompiledIndex');
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes so the worker knows what exists", () => {
    const node = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("connection: graph/CompiledIndex → excerpt/CollectLocalNodes", () => {
    const src = result.index.nodes['graph/CompiledIndex'];
    expect(src.followed_by).toContain('excerpt/CollectLocalNodes');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys so the worker knows current coverage", () => {
    const node = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalNodes');
  });

  it("connection: excerpt/CollectLocalNodes → excerpt/CollectLocalJourneys", () => {
    const src = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(src.followed_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows cross-module connections relevant to the gap", () => {
    const node = result.index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("connection: excerpt/CollectLocalJourneys → excerpt/CollectCrossModuleConnections", () => {
    const src = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(src.followed_by).toContain('excerpt/CollectCrossModuleConnections');
  });

  it("step 7: excerpt/CollectModuleSource reads the raw YAML so the worker can edit the specific file", () => {
    const node = result.index.nodes['excerpt/CollectModuleSource'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectCrossModuleConnections');
  });

  it("connection: excerpt/CollectCrossModuleConnections → excerpt/CollectModuleSource", () => {
    const src = result.index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(src.followed_by).toContain('excerpt/CollectModuleSource');
  });

  it("step 8: excerpt/AssembleExcerpt builds the fix-focused excerpt combining gap details with module context", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectModuleSource');
  });

  it("connection: excerpt/CollectModuleSource → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['excerpt/CollectModuleSource'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const node = result.index.nodes['excerpt/TruncateToLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/TruncateToLimit", () => {
    const src = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(src.followed_by).toContain('excerpt/TruncateToLimit');
  });

  it("step 10: excerpt/ExcerptOutput provides the excerpt to the fix prompt builder", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/TruncateToLimit');
  });

  it("connection: excerpt/TruncateToLimit → excerpt/ExcerptOutput", () => {
    const src = result.index.nodes['excerpt/TruncateToLimit'];
    expect(src.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 11: audit/ProvideFixContext combines the excerpt with the specific gap description into the fix payload", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → audit/ProvideFixContext", () => {
    const src = result.index.nodes['excerpt/ExcerptOutput'];
    expect(src.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 12: audit/BuildGapFixPrompt packages the fix context into the prompt sent to the LLM worker", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → audit/BuildGapFixPrompt", () => {
    const src = result.index.nodes['audit/ProvideFixContext'];
    expect(src.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("journey has 12 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(12);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
