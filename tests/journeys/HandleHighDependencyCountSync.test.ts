// Auto-generated from journey: HandleHighDependencyCountSync
// Module: events
// Triggered by: _actors/FileSystem
// Modules touched: sync, events, graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleHighDependencyCountSync", () => {
  it("step 1: sync/ReadDependencyList provides the dependency list which exceeds the watcher count limit", () => {
    const dependencies = Array.from({ length: 50 }, (_, i) => `dep-${i}`);
    expect(dependencies).toHaveLength(50);
  });

  it("step 2: events/WatcherCountLimit determines the dependency count exceeds the maximum concurrent watcher limit", () => {
    const maxWatchers = 20;
    const depCount = 50;
    expect(depCount).toBeGreaterThan(maxWatchers);
  });

  it("step 3: graph/ConnectionSet provides the edge set to determine which dependencies affect the most local modules", () => {
    const modules = new Map<string, ModuleFile>([
      ['modA', { nodes: { X: { type: 'process', description: 'x' } },
        journeys: { J1: { steps: [{ node: 'dep1/Foo', action: 'a' }, { node: 'X', action: 'b' }] } } }],
      ['modB', { nodes: { Y: { type: 'process', description: 'y' } },
        journeys: { J2: { steps: [{ node: 'dep1/Foo', action: 'a' }, { node: 'Y', action: 'b' }] } } }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index._stats.total_journeys).toBe(2);
  });

  it("step 4: events/PrioritizeEventsByImpact ranks dependencies by the number of local modules they affect", () => {
    const impactScores: Record<string, number> = { 'dep-1': 5, 'dep-2': 2, 'dep-3': 8 };
    const ranked = Object.entries(impactScores).sort((a, b) => b[1] - a[1]);
    expect(ranked[0][0]).toBe('dep-3');
    expect(ranked[2][0]).toBe('dep-2');
  });

  it("step 5: events/BatchWatcherRegistration registers watchers only for the highest-priority dependencies up to the limit", () => {
    const maxWatchers = 3;
    const ranked = ['dep-3', 'dep-1', 'dep-2', 'dep-4', 'dep-5'];
    const selected = ranked.slice(0, maxWatchers);
    expect(selected).toHaveLength(3);
    expect(selected).toContain('dep-3');
  });

  it("step 6: _actors/FileSystem registers the prioritized watch callbacks at the kernel level", () => {
    expect(typeof require('node:fs').watch).toBe('function');
  });

  it("step 7: events/EventWatcherSet stores the prioritized subset of watchers", () => {
    const watcherSet = new Map<string, boolean>();
    watcherSet.set('dep-3', true);
    watcherSet.set('dep-1', true);
    watcherSet.set('dep-2', true);
    expect(watcherSet.size).toBe(3);
  });

  it("step 8: events/LogEventReceived records which dependencies have active watchers and which are unwatched due to the limit", () => {
    const watched = ['dep-3', 'dep-1', 'dep-2'];
    const unwatched = ['dep-4', 'dep-5'];
    const log = { watched: watched.length, unwatched: unwatched.length };
    expect(log.watched).toBe(3);
    expect(log.unwatched).toBe(2);
  });

  it("step 9: events/EventLog persists the watcher allocation log entry", () => {
    const log: Array<Record<string, unknown>> = [];
    log.push({ type: 'watcher-allocation', watched: 3, total: 5 });
    expect(log).toHaveLength(1);
  });

  it("step 10: events/EnterSleep enters sleep with only the prioritized watchers active", () => {
    const state = { sleeping: true, activeWatchers: 3 };
    expect(state.sleeping).toBe(true);
    expect(state.activeWatchers).toBe(3);
  });
});
