// Auto-generated from journey: StaleBoxRecovery
// Module: actors
// Triggered by: _actors/StaleBox
// Modules touched: _actors, events, sync, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileFromModules } from '../../src/compile.js';
import { clearStaleSyncLock, markModulesStale, detectMissedEvents } from '../../src/sync.js';
import type { ModuleFile } from '../../src/types.js';
import type { SyncState } from '../../src/sync.js';

// Implementation: src/sync.ts

function buildStaleBoxModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      StaleBox: { type: 'actor', description: 'Has stopped watching events and drifted out of sync' },
    },
    journeys: {},
  });

  modules.set('events', {
    nodes: {
      RegisterEventWatchers: { type: 'process', description: 'Re-registers fs.watch watchers on dependency event files' },
    },
    journeys: {},
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'Fetches current hashes from all dependencies' },
      CompareStoredHash: { type: 'process', description: 'Finds multiple hashes have changed during the stale period' },
      FindAffectedModules: { type: 'process', description: 'Identifies all modules affected by the accumulated changes' },
      MarkModulesStale: { type: 'process', description: 'Marks all affected modules for reconvergence' },
    },
    journeys: {
      StaleBoxRecovery: {
        steps: [
          { node: '_actors/StaleBox', action: 'has stopped watching events and drifted out of sync' },
          { node: 'events/RegisterEventWatchers', action: 're-registers fs.watch watchers on dependency event files' },
          { node: 'FetchDependencyHash', action: 'fetches current hashes from all dependencies' },
          { node: 'CompareStoredHash', action: 'finds multiple hashes have changed during the stale period' },
          { node: 'FindAffectedModules', action: 'identifies all modules affected by the accumulated changes' },
          { node: 'MarkModulesStale', action: 'marks all affected modules for reconvergence' },
          { node: 'convergence/TargetedReconvergence', action: 'reconverges all stale modules to bring the box back in sync' },
        ],
      },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'Reconverges all stale modules to bring the box back in sync' },
    },
    journeys: {},
  });

  return modules;
}

describe("StaleBoxRecovery", () => {
  const modules = buildStaleBoxModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['StaleBoxRecovery'];

  it("step 1: _actors/StaleBox has stopped watching events and drifted out of sync", () => {
    const node = result.index.nodes['_actors/StaleBox'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: events/RegisterEventWatchers re-registers fs.watch watchers on dependency event files", () => {
    const node = result.index.nodes['events/RegisterEventWatchers'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/StaleBox');
  });

  it("connection: _actors/StaleBox → events/RegisterEventWatchers", () => {
    const from = result.index.nodes['_actors/StaleBox'];
    expect(from.followed_by).toContain('events/RegisterEventWatchers');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/RegisterEventWatchers');
  });

  it("connection: events/RegisterEventWatchers → sync/FetchDependencyHash", () => {
    const from = result.index.nodes['events/RegisterEventWatchers'];
    expect(from.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 4: sync/CompareStoredHash finds multiple hashes have changed during the stale period", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const from = result.index.nodes['sync/FetchDependencyHash'];
    expect(from.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 5: sync/FindAffectedModules identifies all modules affected by the accumulated changes", () => {
    const node = result.index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/FindAffectedModules", () => {
    const from = result.index.nodes['sync/CompareStoredHash'];
    expect(from.followed_by).toContain('sync/FindAffectedModules');
  });

  it("step 6: sync/MarkModulesStale marks all affected modules for reconvergence", () => {
    const node = result.index.nodes['sync/MarkModulesStale'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FindAffectedModules');
  });

  it("connection: sync/FindAffectedModules → sync/MarkModulesStale", () => {
    const from = result.index.nodes['sync/FindAffectedModules'];
    expect(from.followed_by).toContain('sync/MarkModulesStale');
  });

  it("step 7: convergence/TargetedReconvergence reconverges all stale modules to bring the box back in sync", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/MarkModulesStale');
  });

  it("connection: sync/MarkModulesStale → convergence/TargetedReconvergence", () => {
    const from = result.index.nodes['sync/MarkModulesStale'];
    expect(from.followed_by).toContain('convergence/TargetedReconvergence');
  });

  it("stale sync lock is cleared on startup", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stale-lock-'));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    // Write a stale lock (old timestamp)
    const staleState: SyncState = {
      known_hashes: {},
      sync_in_progress: true,
      sync_started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };
    fs.writeFileSync(syncStatePath, JSON.stringify(staleState));
    const cleared = clearStaleSyncLock(syncStatePath);
    expect(cleared).toBe(true);
    const updated: SyncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(updated.sync_in_progress).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("missed events are detected when sequence numbers have gaps", () => {
    const state: SyncState = {
      known_hashes: {},
      last_processed_sequence: { depA: 3 },
    };
    const missed = detectMissedEvents(state, 'depA', 7);
    expect(missed).toEqual([4, 5, 6]);
  });

  it("markModulesStale adds stale marker to module files", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stale-mark-'));
    fs.writeFileSync(path.join(tmpDir, 'modA.yaml'), 'nodes:\n  A:\n    type: process\n');
    markModulesStale(tmpDir, ['modA'], 'dependency changed');
    const content = fs.readFileSync(path.join(tmpDir, 'modA.yaml'), 'utf-8');
    expect(content).toContain('_stale: true');
    expect(content).toContain('dependency changed');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
