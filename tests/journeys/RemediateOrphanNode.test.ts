// Auto-generated from journey: RemediateOrphanNode
// Module: graph
// Triggered by: _actors/Auditor
// Modules touched: _actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("RemediateOrphanNode", () => {
  // Before remediation: OrphanProcess is not in any journey
  const modulesBefore = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Auditor: { type: 'actor', description: 'Audits graph for orphans' },
        LLMWorker: { type: 'actor', description: 'AI worker that fixes gaps' },
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ActiveProcess: { type: 'process', description: 'Active process in a journey' },
        OrphanProcess: { type: 'process', description: 'Not referenced by any journey' },
        DataStore: { type: 'artifact', description: 'Stores processed data' },
      },
      journeys: {
        DoWork: {
          steps: [
            { node: '_actors/Auditor', action: 'identifies orphan nodes' },
            { node: 'ActiveProcess', action: 'processes data' },
            { node: 'DataStore', action: 'stores data' },
          ],
        },
      },
    }],
  ]);

  // After remediation: OrphanProcess is added to a journey
  const modulesAfter = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Auditor: { type: 'actor', description: 'Audits graph for orphans' },
        LLMWorker: { type: 'actor', description: 'AI worker that fixes gaps' },
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ActiveProcess: { type: 'process', description: 'Active process in a journey' },
        OrphanProcess: { type: 'process', description: 'Was orphaned, now connected' },
        DataStore: { type: 'artifact', description: 'Stores processed data' },
      },
      journeys: {
        DoWork: {
          steps: [
            { node: '_actors/Auditor', action: 'identifies orphan nodes' },
            { node: 'ActiveProcess', action: 'processes data' },
            { node: 'OrphanProcess', action: 'performs supplementary processing' },
            { node: 'DataStore', action: 'stores data' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBefore);
  const resultAfter = compileFromModules(modulesAfter);

  it("step 1: _actors/Auditor identifies an orphan node that exists but appears in no journey", () => {
    const orphan = resultBefore.index.nodes['mymod/OrphanProcess'];
    expect(orphan).toBeDefined();
    expect(orphan.in_journeys).toHaveLength(0);
    expect(orphan.preceded_by).toHaveLength(0);
    expect(orphan.followed_by).toHaveLength(0);
  });

  it("step 2: graph/NoIsolationRule confirms the node violates the no-isolation constraint", () => {
    const orphanWarnings = resultBefore.issues.filter(
      i => i.message.includes('Orphan') && i.message.includes('OrphanProcess')
    );
    expect(orphanWarnings.length).toBeGreaterThan(0);
    expect(orphanWarnings[0].severity).toBe('warning');
  });

  it("step 3: graph/CompiledIndex provides context about the orphan node's type, module, and neighboring nodes", () => {
    const orphan = resultBefore.index.nodes['mymod/OrphanProcess'];
    expect(orphan.type).toBe('process');
    expect(orphan.module).toBe('mymod');
    expect(resultBefore.coverage.orphans).toContain('mymod/OrphanProcess');
  });

  it("step 4: excerpt/ExcerptOutput provides focused context for the module containing the orphan", () => {
    // The coverage module entry exists for the orphan's module
    const coverage = resultBefore.coverage.modules['mymod'];
    expect(coverage).toBeDefined();
    expect(coverage.nodes).toBe(3);
  });

  it("step 5: _actors/LLMWorker writes a new journey or adds a step to an existing journey that connects the orphan", () => {
    const llm = resultAfter.index.nodes['_actors/LLMWorker'];
    expect(llm).toBeDefined();
    expect(llm.type).toBe('actor');
  });

  it("step 6: graph/JourneyDefinition parses the new or updated journey containing the orphan node", () => {
    const journey = resultAfter.index.journeys['DoWork'];
    expect(journey).toBeDefined();
    expect(journey.steps.some(s => s.node === 'mymod/OrphanProcess')).toBe(true);
  });

  it("step 7: graph/StepDefinition parses the new step that references the formerly orphan node", () => {
    const journey = resultAfter.index.journeys['DoWork'];
    const orphanStep = journey.steps.find(s => s.node === 'mymod/OrphanProcess');
    expect(orphanStep).toBeDefined();
    expect(orphanStep!.action).toBeTruthy();
    expect(orphanStep!.step_number).toBeGreaterThan(0);
  });

  it("step 8: graph/ConnectionComputation recomputes connections including the new step", () => {
    const orphan = resultAfter.index.nodes['mymod/OrphanProcess'];
    expect(orphan.preceded_by).toContain('mymod/ActiveProcess');
    expect(orphan.followed_by).toContain('mymod/DataStore');
  });

  it("step 9: graph/IncrementalMerge merges the updated journey and connections into the compiled index", () => {
    // The compiled index now includes connections for the formerly orphan node
    expect(resultAfter.index._stats.total_connections).toBeGreaterThan(
      resultBefore.index._stats.total_connections
    );
  });

  it("step 10: graph/CompiledIndex updated with the orphan now connected through a journey", () => {
    const orphan = resultAfter.index.nodes['mymod/OrphanProcess'];
    expect(orphan.in_journeys.length).toBeGreaterThan(0);
    expect(resultAfter.coverage.orphans).not.toContain('mymod/OrphanProcess');
  });

  it("step 11: _actors/Compiler revalidates to confirm the orphan count decreased", () => {
    expect(resultAfter.index._stats.orphans).toBeLessThan(resultBefore.index._stats.orphans);

    // The LLMWorker and Compiler are still orphans (not in any journey),
    // but OrphanProcess is no longer an orphan
    const afterOrphans = resultAfter.coverage.orphans;
    expect(afterOrphans).not.toContain('mymod/OrphanProcess');
  });
});
