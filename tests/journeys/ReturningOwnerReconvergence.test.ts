// Auto-generated from journey: ReturningOwnerReconvergence
// Module: actors
// Triggered by: _actors/ReturningOwner
// Modules touched: _actors, convergence, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts
// Implementation: src/sync.ts

function buildReturningOwnerModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ReturningOwner: { type: 'actor', description: 'Re-triggers convergence after a long period of inactivity' },
      Compiler: { type: 'actor', description: 'Validates the reconverged graph' },
      Auditor: { type: 'actor', description: 'Audits coverage after reconvergence' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'Reads the possibly unchanged spec.md' },
      TargetedReconvergence: { type: 'process', description: 'Reconverges all stale modules' },
      ConvergenceState: { type: 'artifact', description: 'Records the system is back in sync after the returning owner trigger' },
    },
    journeys: {},
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'Fetches current hashes from all dependencies' },
      CompareStoredHash: { type: 'process', description: 'Finds many hashes have changed during the absence' },
      FindAffectedModules: { type: 'process', description: 'Identifies all stale modules' },
    },
    journeys: {
      ReturningOwnerReconvergence: {
        steps: [
          { node: '_actors/ReturningOwner', action: 're-triggers convergence after a long period of inactivity' },
          { node: 'convergence/ReadSpec', action: 'reads the possibly unchanged spec.md' },
          { node: 'FetchDependencyHash', action: 'fetches current hashes from all dependencies' },
          { node: 'CompareStoredHash', action: 'finds many hashes have changed during the absence' },
          { node: 'FindAffectedModules', action: 'identifies all stale modules' },
          { node: 'convergence/TargetedReconvergence', action: 'reconverges all stale modules' },
          { node: '_actors/Compiler', action: 'validates the reconverged graph' },
          { node: '_actors/Auditor', action: 'audits coverage after reconvergence' },
          { node: 'convergence/ConvergenceState', action: 'records the system is back in sync after the returning owner trigger' },
        ],
      },
    },
  });

  return modules;
}

describe("ReturningOwnerReconvergence", () => {
  const modules = buildReturningOwnerModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ReturningOwnerReconvergence'];

  it("step 1: _actors/ReturningOwner re-triggers convergence after a long period of inactivity", () => {
    const node = result.index.nodes['_actors/ReturningOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: convergence/ReadSpec reads the possibly unchanged spec.md", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ReturningOwner');
  });

  it("connection: _actors/ReturningOwner → convergence/ReadSpec", () => {
    const from = result.index.nodes['_actors/ReturningOwner'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → sync/FetchDependencyHash", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 4: sync/CompareStoredHash finds many hashes have changed during the absence", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const from = result.index.nodes['sync/FetchDependencyHash'];
    expect(from.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 5: sync/FindAffectedModules identifies all stale modules", () => {
    const node = result.index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/FindAffectedModules", () => {
    const from = result.index.nodes['sync/CompareStoredHash'];
    expect(from.followed_by).toContain('sync/FindAffectedModules');
  });

  it("step 6: convergence/TargetedReconvergence reconverges all stale modules", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FindAffectedModules');
  });

  it("connection: sync/FindAffectedModules → convergence/TargetedReconvergence", () => {
    const from = result.index.nodes['sync/FindAffectedModules'];
    expect(from.followed_by).toContain('convergence/TargetedReconvergence');
  });

  it("step 7: _actors/Compiler validates the reconverged graph", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → _actors/Compiler", () => {
    const from = result.index.nodes['convergence/TargetedReconvergence'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 8: _actors/Auditor audits coverage after reconvergence", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → _actors/Auditor", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 9: convergence/ConvergenceState records the system is back in sync after the returning owner's trigger", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → convergence/ConvergenceState", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full reconvergence pipeline (9 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(9);
    expect(journey.steps[0].node).toBe('_actors/ReturningOwner');
    expect(journey.steps[8].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is ReturningOwner", () => {
    expect(journey.actor).toBe('_actors/ReturningOwner');
  });

  it("triggered_by_actors propagates through the pipeline", () => {
    const readSpec = result.index.nodes['convergence/ReadSpec'];
    expect(readSpec.triggered_by_actors).toContain('_actors/ReturningOwner');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
