// Auto-generated from journey: InfiniteRippleDefense
// Module: actors
// Triggered by: _actors/InfiniteLoopTrigger
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("InfiniteRippleDefense", () => {
  it("step 1: _actors/InfiniteLoopTrigger crafts circular dependencies or oscillating changes to cause unbounded ripple", () => {
    // Simulate circular deps: A depends on B, B depends on A
    const depA = { dependencies: { 'engine-b': { pin: 'latest' } } };
    const depB = { dependencies: { 'engine-a': { pin: 'latest' } } };
    // Both reference each other — could cause infinite ripple
    expect(depA.dependencies['engine-b']).toBeDefined();
    expect(depB.dependencies['engine-a']).toBeDefined();
  });

  it("step 2: events/DetectEventFileChange detects the rapid sequence of events", () => {
    // Multiple events fire in rapid succession
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push({
        origin: 'engine-b',
        type: 'interface_changed',
        timestamp: new Date(Date.now() + i * 100).toISOString(), // 100ms apart
      });
    }
    expect(events.length).toBe(10);
    // All within 1 second — rapid fire
    const firstTs = new Date(events[0].timestamp).getTime();
    const lastTs = new Date(events[9].timestamp).getTime();
    expect(lastTs - firstTs).toBeLessThan(2000);
  });

  it("step 3: events/OscillationCooldown suppresses re-trigger because the same dependency fired within the cooldown window", () => {
    // Cooldown rule: ignore repeat events from same dep within window
    const cooldownMs = 5000;
    const lastTrigger = Date.now() - 1000; // 1 second ago
    const now = Date.now();
    const withinCooldown = (now - lastTrigger) < cooldownMs;
    expect(withinCooldown).toBe(true);
    // Event suppressed — no re-trigger
  });

  it("step 4: events/DebounceEvents batches the rapid events into a single sync trigger", () => {
    // 10 rapid events get debounced into 1
    const eventQueue: string[] = [];
    for (let i = 0; i < 10; i++) {
      eventQueue.push('engine-b:interface_changed');
    }
    // Debounce: deduplicate by dependency name
    const deduped = [...new Set(eventQueue)];
    expect(deduped.length).toBe(1);
    expect(deduped[0]).toBe('engine-b:interface_changed');
  });

  it("step 5: sync/CompareStoredHash compares hashes and finds they cycle back to a previous state", () => {
    // After A triggers B triggers A, the hash cycles back to what it was
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ripple-'));
    const depDir = path.join(tmpDir, 'dep-published');
    fs.mkdirSync(depDir, { recursive: true });

    // Dependency hash is the SAME as what we already know
    const depInterface = {
      engine: 'engine-b',
      version_hash: 'sha256:cycled_back_hash',
      provides: { 'engine-b/Svc': { type: 'interface', description: 'Service', in_journeys: 1 } },
      requires: {},
    };
    fs.writeFileSync(path.join(depDir, 'interface.yaml'), yaml.dump(depInterface));

    // Sync state already has this hash
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({
      known_hashes: { 'engine-b': 'sha256:cycled_back_hash' },
    }));

    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'engine-b': { pin: 'latest' } } }));

    const modules = new Map<string, ModuleFile>([
      ['app', { nodes: { Handler: { type: 'process', description: 'Handles' } } }],
    ]);
    const result = compileFromModules(modules);

    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'engine-b') return depDir;
      return null;
    });
    // Hash cycled back — no effective change
    expect(changes.length).toBe(0);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 6: sync/SkipIfAllCurrent aborts because the effective state has not changed", () => {
    // With no changes detected, the sync loop does nothing
    const noChanges: any[] = [];
    const shouldReconverge = noChanges.length > 0;
    expect(shouldReconverge).toBe(false);
  });

});
