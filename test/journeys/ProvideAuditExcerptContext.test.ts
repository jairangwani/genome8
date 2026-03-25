// Auto-generated from journey: ProvideAuditExcerptContext
// Module: audit
// Modules touched: convergence, excerpt, graph, audit

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ProvideAuditExcerptContext'];
const steps = journey.steps;

describe("ProvideAuditExcerptContext", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(11);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'excerpt', 'graph', 'audit'])
    );
  });

  it("step 1: convergence/TargetedAudit requests focused context for each auditor to check a specific module", () => {
    // Node: convergence/TargetedAudit (process)
    // Action: requests focused context for each auditor to check a specific module
    const step = steps[0];
    expect(step.node).toBe('convergence/TargetedAudit');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 auditors');
    expect(node.module).toBe('convergence');
    // Followed by SelectTargetModule in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/SelectTargetModule'])
    );
  });

  it("step 2: excerpt/SelectTargetModule identifies the module the auditor will examine", () => {
    // Node: excerpt/SelectTargetModule (process)
    // Action: identifies the module the auditor will examine
    const step = steps[1];
    expect(step.node).toBe('excerpt/SelectTargetModule');
    expect(step.step_number).toBe(2);

    const node = index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('which module');
    expect(node.module).toBe('excerpt');
    // Preceded by TargetedAudit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/TargetedAudit'])
    );
    // Followed by CompiledIndex in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/CompiledIndex'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph for extraction", () => {
    // Node: graph/CompiledIndex (artifact)
    // Action: provides the full compiled graph for extraction
    const step = steps[2];
    expect(step.node).toBe('graph/CompiledIndex');
    expect(step.step_number).toBe(3);

    const node = index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('merged');
    expect(node.module).toBe('graph');
    // Preceded by SelectTargetModule in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/SelectTargetModule'])
    );
    // Followed by CollectLocalNodes in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectLocalNodes'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the target module's nodes for the auditor to review", () => {
    // Node: excerpt/CollectLocalNodes (process)
    // Action: extracts the target module's nodes for the auditor to review
    const step = steps[3];
    expect(step.node).toBe('excerpt/CollectLocalNodes');
    expect(step.step_number).toBe(4);

    const node = index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('nodes');
    expect(node.module).toBe('excerpt');
    // Preceded by CompiledIndex in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/CompiledIndex'])
    );
    // Followed by CollectLocalJourneys in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectLocalJourneys'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the target module's journeys for the auditor to review", () => {
    // Node: excerpt/CollectLocalJourneys (process)
    // Action: extracts the target module's journeys for the auditor to review
    const step = steps[4];
    expect(step.node).toBe('excerpt/CollectLocalJourneys');
    expect(step.step_number).toBe(5);

    const node = index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('journeys');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectLocalNodes in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectLocalNodes'])
    );
    // Followed by CollectCrossModuleConnections in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectCrossModuleConnections'])
    );
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows how the target module connects to others", () => {
    // Node: excerpt/CollectCrossModuleConnections (process)
    // Action: shows how the target module connects to others
    const step = steps[5];
    expect(step.node).toBe('excerpt/CollectCrossModuleConnections');
    expect(step.step_number).toBe(6);

    const node = index.nodes['excerpt/CollectCrossModuleConnections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('different module');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectLocalJourneys in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectLocalJourneys'])
    );
    // Followed by CollectWarnings in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectWarnings'])
    );
  });

  it("step 7: excerpt/CollectWarnings includes any compilation warnings relevant to this module", () => {
    // Node: excerpt/CollectWarnings (process)
    // Action: includes any compilation warnings relevant to this module
    const step = steps[6];
    expect(step.node).toBe('excerpt/CollectWarnings');
    expect(step.step_number).toBe(7);

    const node = index.nodes['excerpt/CollectWarnings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('warnings');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectCrossModuleConnections in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectCrossModuleConnections'])
    );
    // Followed by AssembleExcerpt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/AssembleExcerpt'])
    );
  });

  it("step 8: excerpt/AssembleExcerpt combines all sections into an audit-focused excerpt", () => {
    // Node: excerpt/AssembleExcerpt (process)
    // Action: combines all sections into an audit-focused excerpt
    const step = steps[7];
    expect(step.node).toBe('excerpt/AssembleExcerpt');
    expect(step.step_number).toBe(8);

    const node = index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('combines');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectWarnings in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectWarnings'])
    );
    // Followed by TruncateToLimit in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/TruncateToLimit'])
    );
  });

  it("step 9: excerpt/TruncateToLimit trims to the ~200 line budget", () => {
    // Node: excerpt/TruncateToLimit (process)
    // Action: trims to the ~200 line budget
    const step = steps[8];
    expect(step.node).toBe('excerpt/TruncateToLimit');
    expect(step.step_number).toBe(9);

    const node = index.nodes['excerpt/TruncateToLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('200 lines');
    expect(node.module).toBe('excerpt');
    // Preceded by AssembleExcerpt in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/AssembleExcerpt'])
    );
    // Followed by ExcerptOutput in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/ExcerptOutput'])
    );
  });

  it("step 10: excerpt/ExcerptOutput provides the focused excerpt to the auditor", () => {
    // Node: excerpt/ExcerptOutput (artifact)
    // Action: provides the focused excerpt to the auditor
    const step = steps[9];
    expect(step.node).toBe('excerpt/ExcerptOutput');
    expect(step.step_number).toBe(10);

    const node = index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('200 line');
    expect(node.module).toBe('excerpt');
    // Preceded by TruncateToLimit in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/TruncateToLimit'])
    );
    // Followed by GenerateAuditPrompt in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
  });

  it("step 11: audit/GenerateAuditPrompt wraps the excerpt with the specific coverage angle instructions", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: wraps the excerpt with the specific coverage angle instructions
    const step = steps[10];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('focused prompt');
    expect(node.module).toBe('audit');
    // Preceded by ExcerptOutput in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/ExcerptOutput'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full audit excerpt context sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/TargetedAudit',
      'excerpt/SelectTargetModule',
      'graph/CompiledIndex',
      'excerpt/CollectLocalNodes',
      'excerpt/CollectLocalJourneys',
      'excerpt/CollectCrossModuleConnections',
      'excerpt/CollectWarnings',
      'excerpt/AssembleExcerpt',
      'excerpt/TruncateToLimit',
      'excerpt/ExcerptOutput',
      'audit/GenerateAuditPrompt',
    ]);
  });

  it("excerpt module handles the collection pipeline (steps 2, 4-10)", () => {
    const excerptSteps = steps.filter(s => s.node.startsWith('excerpt/'));
    expect(excerptSteps).toHaveLength(8);
  });

  it("collection phase gathers 4 sections sequentially: nodes → journeys → connections → warnings (steps 4-7)", () => {
    const collectionSteps = steps.slice(3, 7).map(s => s.node);
    expect(collectionSteps).toEqual([
      'excerpt/CollectLocalNodes',
      'excerpt/CollectLocalJourneys',
      'excerpt/CollectCrossModuleConnections',
      'excerpt/CollectWarnings',
    ]);
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'excerpt', 'graph', 'audit']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
