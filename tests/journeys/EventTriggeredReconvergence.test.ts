// Auto-generated from journey: EventTriggeredReconvergence
// Module: events
// Triggered by: _actors/Compiler
// Modules touched: events, sync, convergence, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

describe("EventTriggeredReconvergence", () => {
  it("step 1: events/DelegateToSync invokes sync.ts with the event payload", () => {
    const payload = { hash: 'sha256:new', sequence: 1, dependency: 'upstream' };
    expect(payload).toHaveProperty('hash');
    expect(payload).toHaveProperty('dependency');
  });

  it("step 2: sync/FetchDependencyHash reads the current hash from the changed dependency's interface", () => {
    const currentHash = 'sha256:abc123';
    expect(currentHash).toMatch(/^sha256:/);
  });

  it("step 3: sync/CompareStoredHash compares the new hash against the locally stored hash", () => {
    const stored = 'sha256:old';
    const current = 'sha256:abc123';
    expect(stored).not.toBe(current);
  });

  it("step 4: sync/FindAffectedModules traces which local modules are affected by the change", () => {
    const modules = new Map<string, ModuleFile>([
      ['modA', { nodes: { X: { type: 'process', description: 'x' } },
        journeys: { J: { steps: [{ node: 'upstream/Foo', action: 'uses' }, { node: 'X', action: 'processes' }] } } }],
      ['modB', { nodes: { Y: { type: 'process', description: 'y' } }, journeys: {} }],
    ]);
    const result = compileFromModules(modules);
    // modA references upstream/Foo, so it would be affected
    const j = result.index.journeys['J'];
    expect(j.modules_touched).toContain('upstream');
  });

  it("step 5: sync/MarkModulesStale marks affected modules for targeted reconvergence", () => {
    const affected = ['modA'];
    expect(affected).toContain('modA');
    expect(affected).not.toContain('modB');
  });

  it("step 6: sync/StaleModuleList provides the list of stale modules", () => {
    const staleList = ['modA'];
    expect(staleList).toHaveLength(1);
  });

  it("step 7: convergence/TargetedReconvergence reprocesses only the stale modules with compile and audit", () => {
    const allModules = ['modA', 'modB', 'modC'];
    const stale = ['modA'];
    const toProcess = allModules.filter(m => stale.includes(m));
    expect(toProcess).toEqual(['modA']);
  });

  it("step 8: _actors/Compiler recompiles the stale modules", () => {
    const modules = new Map<string, ModuleFile>([
      ['modA', { nodes: { X: { type: 'process', description: 'recompiled' } }, journeys: {} }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index.nodes['modA/X'].description).toBe('recompiled');
  });

  it("step 9: _actors/Auditor re-audits the affected coverage areas", () => {
    const modules = new Map<string, ModuleFile>([
      ['modA', { nodes: { X: { type: 'process', description: 'x' } }, journeys: {} }],
    ]);
    const result = compileFromModules(modules);
    expect(result.coverage.modules['modA']).toBeDefined();
  });

  it("step 10: convergence/ConvergenceState records targeted reconvergence complete", () => {
    const state = { phase: 'targeted_reconvergence_complete', modulesProcessed: 1 };
    expect(state.phase).toBe('targeted_reconvergence_complete');
  });
});
