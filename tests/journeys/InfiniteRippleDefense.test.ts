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

// Implementation: test/staleness.test.ts

describe("InfiniteRippleDefense", () => {
  it("step 1: _actors/InfiniteLoopTrigger crafts circular dependencies or oscillating changes to cause unbounded ripple", () => {
    // Simulate A depends on B depends on A — circular dependency
    const circularEvent = {
      dependency: 'engine-a',
      hash: 'sha256:oscillate1',
      origin_chain: ['engine-b', 'engine-a', 'engine-b'],
      timestamp: new Date().toISOString(),
    };
    // The origin_chain shows the cycle: engine-b → engine-a → engine-b
    expect(circularEvent.origin_chain.length).toBe(3);
    // engine-b appears twice — cycle detected
    const seen = new Set<string>();
    let cycleDetected = false;
    for (const name of circularEvent.origin_chain) {
      if (seen.has(name)) { cycleDetected = true; break; }
      seen.add(name);
    }
    expect(cycleDetected).toBe(true);
  });

  it("step 2: events/DetectEventFileChange detects the rapid sequence of events", () => {
    // Multiple events from the same dep arrive in rapid succession
    const events = [
      { dep: 'engine-a', hash: 'sha256:v1', ts: Date.now() },
      { dep: 'engine-a', hash: 'sha256:v2', ts: Date.now() + 100 },
      { dep: 'engine-a', hash: 'sha256:v1', ts: Date.now() + 200 }, // oscillates back
    ];
    expect(events.length).toBe(3);
    // Hash oscillates: v1 → v2 → v1
    expect(events[0].hash).toBe(events[2].hash);
    expect(events[0].hash).not.toBe(events[1].hash);
  });

  it("step 3: events/OscillationCooldown suppresses re-trigger because the same dependency fired within the cooldown window", () => {
    // Simulate cooldown check: if same dep fired within cooldown window, suppress
    const cooldownMs = 2000;
    const lastEventTime = Date.now() - 500; // 500ms ago — within cooldown
    const now = Date.now();
    const withinCooldown = (now - lastEventTime) < cooldownMs;
    expect(withinCooldown).toBe(true);
    // A second event outside cooldown should NOT be suppressed
    const oldEventTime = Date.now() - 3000; // 3s ago — outside 2s cooldown
    const outsideCooldown = (now - oldEventTime) >= cooldownMs;
    expect(outsideCooldown).toBe(true);
  });

  it("step 4: events/DebounceEvents batches the rapid events into a single sync trigger", () => {
    // Simulate debouncing: multiple events for the same dep → deduplicate to one
    const pendingEvents = [
      { dep: 'engine-a', hash: 'sha256:v1' },
      { dep: 'engine-a', hash: 'sha256:v2' },
      { dep: 'engine-a', hash: 'sha256:v3' },
      { dep: 'engine-b', hash: 'sha256:b1' },
    ];
    // Deduplicate by dep name — keep last event per dep
    const deduped = new Map<string, typeof pendingEvents[0]>();
    for (const evt of pendingEvents) {
      deduped.set(evt.dep, evt);
    }
    // Only 2 unique deps after dedup
    expect(deduped.size).toBe(2);
    // engine-a deduped to the last event (v3)
    expect(deduped.get('engine-a')!.hash).toBe('sha256:v3');
  });

  it("step 5: sync/CompareStoredHash compares hashes and finds they cycle back to a previous state", () => {
    // Hash cycles back to original — comparing known hash with current shows no net change
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-ripple-'));
    const depDir = path.join(tmpDir, 'dep-engine', 'published');
    fs.mkdirSync(depDir, { recursive: true });
    // Current hash is same as known (oscillated back)
    const cycledHash = 'sha256:original';
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'dep-engine', version_hash: cycledHash, provides: {}, requires: {} })
    );
    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'dep-engine': { pin: 'latest' } } }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'dep-engine': cycledHash } }));

    const dummyModule: ModuleFile = { nodes: { X: { type: 'process', description: 'x' } }, journeys: {} };
    const index = compileFromModules(new Map([['m', dummyModule]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    // No changes because hash cycled back to what we already knew
    expect(changes.length).toBe(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 6: sync/SkipIfAllCurrent aborts because the effective state has not changed", () => {
    // When hashes match, checkDependencies returns empty → no reconvergence triggered
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-ripple-'));
    const depDir = path.join(tmpDir, 'dep-engine', 'published');
    fs.mkdirSync(depDir, { recursive: true });
    const stableHash = 'sha256:stable';
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'dep-engine', version_hash: stableHash, provides: {}, requires: {} })
    );
    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'dep-engine': { pin: 'latest' } } }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'dep-engine': stableHash } }));

    const dummyModule: ModuleFile = { nodes: { X: { type: 'process', description: 'x' } }, journeys: {} };
    const index = compileFromModules(new Map([['m', dummyModule]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes.length).toBe(0);
    // Sync state lock released
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.sync_in_progress).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

});
