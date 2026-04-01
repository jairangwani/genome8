// Auto-generated from journey: ReturningOwnerReconvergence
// Module: actors
// Triggered by: _actors/ReturningOwner
// Modules touched: _actors, convergence, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ReturningOwner: { type: 'actor', description: 'a project owner who re-triggers convergence after a long period of inactivity' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
      Auditor: { type: 'actor', description: 'the audit engine that checks spec coverage and flags gaps' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'reads the spec.md file from disk as the first pipeline step' },
      TargetedReconvergence: { type: 'process', description: 'reconverges only the modules affected by a change rather than re-running the entire pipeline' },
      ConvergenceState: { type: 'artifact', description: 'JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'fetches the current interface hash from a dependency published directory' },
      CompareStoredHash: { type: 'process', description: 'compares a fetched hash against the stored hash to detect changes' },
      FindAffectedModules: { type: 'process', description: 'identifies modules affected by dependency changes based on the dependency mapping' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ReturningOwnerReconvergence'];

  it("step 1: _actors/ReturningOwner re-triggers convergence after a long period of inactivity", () => {
    const node = result.index.nodes['_actors/ReturningOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('ReturningOwnerReconvergence'))).toBe(true);
  });

  it("step 2: convergence/ReadSpec reads the possibly unchanged spec.md", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ReturningOwner');
  });

  it("connection: _actors/ReturningOwner → convergence/ReadSpec", () => {
    const src = result.index.nodes['_actors/ReturningOwner'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → sync/FetchDependencyHash", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 4: sync/CompareStoredHash finds many hashes have changed during the absence", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const src = result.index.nodes['sync/FetchDependencyHash'];
    expect(src.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 5: sync/FindAffectedModules identifies all stale modules", () => {
    const node = result.index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/FindAffectedModules", () => {
    const src = result.index.nodes['sync/CompareStoredHash'];
    expect(src.followed_by).toContain('sync/FindAffectedModules');
  });

  it("step 6: convergence/TargetedReconvergence reconverges all stale modules", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FindAffectedModules');
  });

  it("connection: sync/FindAffectedModules → convergence/TargetedReconvergence", () => {
    const src = result.index.nodes['sync/FindAffectedModules'];
    expect(src.followed_by).toContain('convergence/TargetedReconvergence');
  });

  it("step 7: _actors/Compiler validates the reconverged graph", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/TargetedReconvergence'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 8: _actors/Auditor audits coverage after reconvergence", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → _actors/Auditor", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 9: convergence/ConvergenceState records the system is back in sync after the returning owner's trigger", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → convergence/ConvergenceState", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
