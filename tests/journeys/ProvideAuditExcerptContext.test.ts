// Auto-generated from journey: ProvideAuditExcerptContext
// Module: audit
// Modules touched: convergence, excerpt, graph, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      TargetedAudit: { type: 'process', description: 'dispatches auditors to check coverage from all angles' },
    },
  });

  modules.set('excerpt', {
    nodes: {
      SelectTargetModule: { type: 'process', description: 'identifies the module the auditor will examine' },
      CollectLocalNodes: { type: 'process', description: 'extracts the target module nodes for the auditor to review' },
      CollectLocalJourneys: { type: 'process', description: 'extracts the target module journeys for the auditor to review' },
      CollectCrossModuleConnections: { type: 'process', description: 'shows how the target module connects to others' },
      CollectWarnings: { type: 'process', description: 'includes any compilation warnings relevant to this module' },
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
      GenerateAuditPrompt: { type: 'process', description: 'builds a focused prompt for each auditor containing the compiled graph excerpt and the specific coverage angle to check' },
    },
    journeys: {
      ProvideAuditExcerptContext: {
        steps: [
          { node: 'convergence/TargetedAudit', action: 'requests focused context for each auditor to check a specific module' },
          { node: 'excerpt/SelectTargetModule', action: 'identifies the module the auditor will examine' },
          { node: 'graph/CompiledIndex', action: 'provides the full compiled graph for extraction' },
          { node: 'excerpt/CollectLocalNodes', action: 'extracts the target module nodes for the auditor to review' },
          { node: 'excerpt/CollectLocalJourneys', action: 'extracts the target module journeys for the auditor to review' },
          { node: 'excerpt/CollectCrossModuleConnections', action: 'shows how the target module connects to others' },
          { node: 'excerpt/CollectWarnings', action: 'includes any compilation warnings relevant to this module' },
          { node: 'excerpt/AssembleExcerpt', action: 'combines all sections into an audit-focused excerpt' },
          { node: 'excerpt/TruncateToLimit', action: 'trims to the ~200 line budget' },
          { node: 'excerpt/ExcerptOutput', action: 'provides the focused excerpt to the auditor' },
          { node: 'GenerateAuditPrompt', action: 'wraps the excerpt with the specific coverage angle instructions' },
        ],
      },
    },
  });

  return modules;
}

describe("ProvideAuditExcerptContext", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideAuditExcerptContext'];

  it("step 1: convergence/TargetedAudit requests focused context for each auditor to check a specific module", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('ProvideAuditExcerptContext'))).toBe(true);
  });

  it("step 2: excerpt/SelectTargetModule identifies the module the auditor will examine", () => {
    const node = result.index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit → excerpt/SelectTargetModule", () => {
    const src = result.index.nodes['convergence/TargetedAudit'];
    expect(src.followed_by).toContain('excerpt/SelectTargetModule');
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph for extraction", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/SelectTargetModule');
  });

  it("connection: excerpt/SelectTargetModule → graph/CompiledIndex", () => {
    const src = result.index.nodes['excerpt/SelectTargetModule'];
    expect(src.followed_by).toContain('graph/CompiledIndex');
  });

  it("step 4: excerpt/CollectLocalNodes extracts the target module's nodes for the auditor to review", () => {
    const node = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("connection: graph/CompiledIndex → excerpt/CollectLocalNodes", () => {
    const src = result.index.nodes['graph/CompiledIndex'];
    expect(src.followed_by).toContain('excerpt/CollectLocalNodes');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the target module's journeys for the auditor to review", () => {
    const node = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalNodes');
  });

  it("connection: excerpt/CollectLocalNodes → excerpt/CollectLocalJourneys", () => {
    const src = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(src.followed_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows how the target module connects to others", () => {
    const node = result.index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("connection: excerpt/CollectLocalJourneys → excerpt/CollectCrossModuleConnections", () => {
    const src = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(src.followed_by).toContain('excerpt/CollectCrossModuleConnections');
  });

  it("step 7: excerpt/CollectWarnings includes any compilation warnings relevant to this module", () => {
    const node = result.index.nodes['excerpt/CollectWarnings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectCrossModuleConnections');
  });

  it("connection: excerpt/CollectCrossModuleConnections → excerpt/CollectWarnings", () => {
    const src = result.index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(src.followed_by).toContain('excerpt/CollectWarnings');
  });

  it("step 8: excerpt/AssembleExcerpt combines all sections into an audit-focused excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectWarnings');
  });

  it("connection: excerpt/CollectWarnings → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['excerpt/CollectWarnings'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 9: excerpt/TruncateToLimit trims to the ~200 line budget", () => {
    const node = result.index.nodes['excerpt/TruncateToLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/TruncateToLimit", () => {
    const src = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(src.followed_by).toContain('excerpt/TruncateToLimit');
  });

  it("step 10: excerpt/ExcerptOutput provides the focused excerpt to the auditor", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/TruncateToLimit');
  });

  it("connection: excerpt/TruncateToLimit → excerpt/ExcerptOutput", () => {
    const src = result.index.nodes['excerpt/TruncateToLimit'];
    expect(src.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 11: audit/GenerateAuditPrompt wraps the excerpt with the specific coverage angle instructions", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → audit/GenerateAuditPrompt", () => {
    const src = result.index.nodes['excerpt/ExcerptOutput'];
    expect(src.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("journey has 11 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(11);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
