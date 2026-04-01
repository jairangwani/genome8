// Auto-generated from journey: StaleBoxRecovery
// Module: actors
// Triggered by: _actors/StaleBox
// Modules touched: _actors, events, sync, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      StaleBox: { type: 'actor', description: 'a genome8 box that has stopped watching events and drifted out of sync with its dependencies' },
    },
  });

  modules.set('events', {
    nodes: {
      RegisterEventWatchers: { type: 'process', description: 're-registers fs.watch watchers on dependency event files after a restart or stale recovery' },
    },
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'fetches the current interface hash from a dependency published directory' },
      CompareStoredHash: { type: 'process', description: 'compares a fetched hash against the stored hash to detect changes' },
      FindAffectedModules: { type: 'process', description: 'identifies modules affected by dependency changes based on the dependency mapping' },
      MarkModulesStale: { type: 'process', description: 'marks affected modules for reconvergence in the convergence state' },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'reconverges only the modules affected by a change rather than re-running the entire pipeline' },
    },
    journeys: {
      StaleBoxRecovery: {
        steps: [
          { node: '_actors/StaleBox', action: 'has stopped watching events and drifted out of sync' },
          { node: 'events/RegisterEventWatchers', action: 're-registers fs.watch watchers on dependency event files' },
          { node: 'sync/FetchDependencyHash', action: 'fetches current hashes from all dependencies' },
          { node: 'sync/CompareStoredHash', action: 'finds multiple hashes have changed during the stale period' },
          { node: 'sync/FindAffectedModules', action: 'identifies all modules affected by the accumulated changes' },
          { node: 'sync/MarkModulesStale', action: 'marks all affected modules for reconvergence' },
          { node: 'TargetedReconvergence', action: 'reconverges all stale modules to bring the box back in sync' },
        ],
      },
    },
  });

  return modules;
}

describe("StaleBoxRecovery", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['StaleBoxRecovery'];

  it("step 1: _actors/StaleBox has stopped watching events and drifted out of sync", () => {
    const node = result.index.nodes['_actors/StaleBox'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('StaleBoxRecovery'))).toBe(true);
  });

  it("step 2: events/RegisterEventWatchers re-registers fs.watch watchers on dependency event files", () => {
    const node = result.index.nodes['events/RegisterEventWatchers'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/StaleBox');
  });

  it("connection: _actors/StaleBox → events/RegisterEventWatchers", () => {
    const src = result.index.nodes['_actors/StaleBox'];
    expect(src.followed_by).toContain('events/RegisterEventWatchers');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/RegisterEventWatchers');
  });

  it("connection: events/RegisterEventWatchers → sync/FetchDependencyHash", () => {
    const src = result.index.nodes['events/RegisterEventWatchers'];
    expect(src.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 4: sync/CompareStoredHash finds multiple hashes have changed during the stale period", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const src = result.index.nodes['sync/FetchDependencyHash'];
    expect(src.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 5: sync/FindAffectedModules identifies all modules affected by the accumulated changes", () => {
    const node = result.index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/FindAffectedModules", () => {
    const src = result.index.nodes['sync/CompareStoredHash'];
    expect(src.followed_by).toContain('sync/FindAffectedModules');
  });

  it("step 6: sync/MarkModulesStale marks all affected modules for reconvergence", () => {
    const node = result.index.nodes['sync/MarkModulesStale'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FindAffectedModules');
  });

  it("connection: sync/FindAffectedModules → sync/MarkModulesStale", () => {
    const src = result.index.nodes['sync/FindAffectedModules'];
    expect(src.followed_by).toContain('sync/MarkModulesStale');
  });

  it("step 7: convergence/TargetedReconvergence reconverges all stale modules to bring the box back in sync", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/MarkModulesStale');
  });

  it("connection: sync/MarkModulesStale → convergence/TargetedReconvergence", () => {
    const src = result.index.nodes['sync/MarkModulesStale'];
    expect(src.followed_by).toContain('convergence/TargetedReconvergence');
  });

  it("journey has 7 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(7);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
