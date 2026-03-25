// Auto-generated from journey: ProvideFixExcerptToWorker
// Module: audit
// Modules touched: audit, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ProvideFixExcerptToWorker'];
const steps = journey.steps;

describe("ProvideFixExcerptToWorker", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(12);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', 'excerpt', 'graph'])
    );
  });

  it("step 1: audit/SelectNextGapToFix identifies which module contains the gap to be fixed", () => {
    // Node: audit/SelectNextGapToFix (process)
    // Action: identifies which module contains the gap to be fixed
    const step = steps[0];
    expect(step.node).toBe('audit/SelectNextGapToFix');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('highest-priority');
    expect(node.module).toBe('audit');
    // Followed by SelectTargetModule in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/SelectTargetModule'])
    );
  });

  it("step 2: excerpt/SelectTargetModule targets the module that needs the fix", () => {
    // Node: excerpt/SelectTargetModule (process)
    // Action: targets the module that needs the fix
    const step = steps[1];
    expect(step.node).toBe('excerpt/SelectTargetModule');
    expect(step.step_number).toBe(2);

    const node = index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('which module');
    expect(node.module).toBe('excerpt');
    // Preceded by SelectNextGapToFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
    // Followed by CompiledIndex in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/CompiledIndex'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: graph/CompiledIndex provides the compiled graph showing current state including the gap", () => {
    // Node: graph/CompiledIndex (artifact)
    // Action: provides the compiled graph showing current state including the gap
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

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes so the worker knows what exists", () => {
    // Node: excerpt/CollectLocalNodes (process)
    // Action: extracts the module's nodes so the worker knows what exists
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

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys so the worker knows current coverage", () => {
    // Node: excerpt/CollectLocalJourneys (process)
    // Action: extracts the module's journeys so the worker knows current coverage
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

  it("step 6: excerpt/CollectCrossModuleConnections shows cross-module connections relevant to the gap", () => {
    // Node: excerpt/CollectCrossModuleConnections (process)
    // Action: shows cross-module connections relevant to the gap
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
    // Followed by CollectModuleSource in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectModuleSource'])
    );
  });

  it("step 7: excerpt/CollectModuleSource reads the raw YAML so the worker can edit the specific file", () => {
    // Node: excerpt/CollectModuleSource (process)
    // Action: reads the raw YAML so the worker can edit the specific file
    const step = steps[6];
    expect(step.node).toBe('excerpt/CollectModuleSource');
    expect(step.step_number).toBe(7);

    const node = index.nodes['excerpt/CollectModuleSource'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('raw YAML');
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

  it("step 8: excerpt/AssembleExcerpt builds the fix-focused excerpt combining gap details with module context", () => {
    // Node: excerpt/AssembleExcerpt (process)
    // Action: builds the fix-focused excerpt combining gap details with module context
    const step = steps[7];
    expect(step.node).toBe('excerpt/AssembleExcerpt');
    expect(step.step_number).toBe(8);

    const node = index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('combines');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectModuleSource in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectModuleSource'])
    );
    // Followed by TruncateToLimit in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/TruncateToLimit'])
    );
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    // Node: excerpt/TruncateToLimit (process)
    // Action: ensures the excerpt fits within the line budget
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

  it("step 10: excerpt/ExcerptOutput provides the excerpt to the fix prompt builder", () => {
    // Node: excerpt/ExcerptOutput (artifact)
    // Action: provides the excerpt to the fix prompt builder
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
    // Followed by ProvideFixContext in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
  });

  it("step 11: audit/ProvideFixContext combines the excerpt with the specific gap description into the fix payload", () => {
    // Node: audit/ProvideFixContext (process)
    // Action: combines the excerpt with the specific gap description into the fix payload
    const step = steps[10];
    expect(step.node).toBe('audit/ProvideFixContext');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fix payload');
    expect(node.module).toBe('audit');
    // Preceded by ExcerptOutput in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/ExcerptOutput'])
    );
    // Followed by BuildGapFixPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/BuildGapFixPrompt'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 12: audit/BuildGapFixPrompt packages the fix context into the prompt sent to the LLM worker", () => {
    // Node: audit/BuildGapFixPrompt (process)
    // Action: packages the fix context into the prompt sent to the LLM worker
    const step = steps[11];
    expect(step.node).toBe('audit/BuildGapFixPrompt');
    expect(step.step_number).toBe(12);

    const node = index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted fix prompt');
    expect(node.module).toBe('audit');
    // Preceded by ProvideFixContext in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
  });

  it("journey forms the full fix excerpt context sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/SelectNextGapToFix',
      'excerpt/SelectTargetModule',
      'graph/CompiledIndex',
      'excerpt/CollectLocalNodes',
      'excerpt/CollectLocalJourneys',
      'excerpt/CollectCrossModuleConnections',
      'excerpt/CollectModuleSource',
      'excerpt/AssembleExcerpt',
      'excerpt/TruncateToLimit',
      'excerpt/ExcerptOutput',
      'audit/ProvideFixContext',
      'audit/BuildGapFixPrompt',
    ]);
  });

  it("excerpt module handles collection and assembly (steps 2-10)", () => {
    const excerptSteps = steps.filter(s => s.node.startsWith('excerpt/'));
    expect(excerptSteps).toHaveLength(8);
  });

  it("fix excerpt includes raw YAML source (step 7) that audit excerpt does not", () => {
    const sourceStep = steps[6];
    expect(sourceStep.node).toBe('excerpt/CollectModuleSource');
    const node = index.nodes['excerpt/CollectModuleSource'];
    expect(node.description).toContain('raw YAML');
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', 'excerpt', 'graph']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
