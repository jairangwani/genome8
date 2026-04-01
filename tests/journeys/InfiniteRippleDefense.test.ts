// Auto-generated from journey: InfiniteRippleDefense
// Module: actors
// Triggered by: _actors/InfiniteLoopTrigger
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      InfiniteLoopTrigger: { type: 'actor', description: 'an adversary who crafts circular dependencies or oscillating changes to cause unbounded ripple' },
    },
  });

  modules.set('events', {
    nodes: {
      DetectEventFileChange: { type: 'process', description: 'detects changes to event files in dependency published directories via fs.watch' },
      OscillationCooldown: { type: 'rule', description: 'suppresses re-trigger when the same dependency fires within the cooldown window to prevent oscillation' },
      DebounceEvents: { type: 'process', description: 'batches rapid events into a single sync trigger to prevent event storms' },
    },
  });

  modules.set('sync', {
    nodes: {
      CompareStoredHash: { type: 'process', description: 'compares a fetched hash against the stored hash to detect changes' },
      SkipIfAllCurrent: { type: 'process', description: 'aborts sync when all dependency hashes match stored values' },
    },
    journeys: {
      InfiniteRippleDefense: {
        steps: [
          { node: '_actors/InfiniteLoopTrigger', action: 'crafts circular dependencies or oscillating changes to cause unbounded ripple' },
          { node: 'events/DetectEventFileChange', action: 'detects the rapid sequence of events' },
          { node: 'events/OscillationCooldown', action: 'suppresses re-trigger because the same dependency fired within the cooldown window' },
          { node: 'events/DebounceEvents', action: 'batches the rapid events into a single sync trigger' },
          { node: 'CompareStoredHash', action: 'compares hashes and finds they cycle back to a previous state' },
          { node: 'SkipIfAllCurrent', action: 'aborts because the effective state has not changed' },
        ],
      },
    },
  });

  return modules;
}

describe("InfiniteRippleDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['InfiniteRippleDefense'];

  it("step 1: _actors/InfiniteLoopTrigger crafts circular dependencies or oscillating changes to cause unbounded ripple", () => {
    const node = result.index.nodes['_actors/InfiniteLoopTrigger'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('InfiniteRippleDefense'))).toBe(true);
  });

  it("step 2: events/DetectEventFileChange detects the rapid sequence of events", () => {
    const node = result.index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/InfiniteLoopTrigger');
  });

  it("connection: _actors/InfiniteLoopTrigger → events/DetectEventFileChange", () => {
    const src = result.index.nodes['_actors/InfiniteLoopTrigger'];
    expect(src.followed_by).toContain('events/DetectEventFileChange');
  });

  it("step 3: events/OscillationCooldown suppresses re-trigger because the same dependency fired within the cooldown window", () => {
    const node = result.index.nodes['events/OscillationCooldown'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('events/DetectEventFileChange');
  });

  it("connection: events/DetectEventFileChange → events/OscillationCooldown", () => {
    const src = result.index.nodes['events/DetectEventFileChange'];
    expect(src.followed_by).toContain('events/OscillationCooldown');
  });

  it("step 4: events/DebounceEvents batches the rapid events into a single sync trigger", () => {
    const node = result.index.nodes['events/DebounceEvents'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/OscillationCooldown');
  });

  it("connection: events/OscillationCooldown → events/DebounceEvents", () => {
    const src = result.index.nodes['events/OscillationCooldown'];
    expect(src.followed_by).toContain('events/DebounceEvents');
  });

  it("step 5: sync/CompareStoredHash compares hashes and finds they cycle back to a previous state", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/DebounceEvents');
  });

  it("connection: events/DebounceEvents → sync/CompareStoredHash", () => {
    const src = result.index.nodes['events/DebounceEvents'];
    expect(src.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 6: sync/SkipIfAllCurrent aborts because the effective state has not changed", () => {
    const node = result.index.nodes['sync/SkipIfAllCurrent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/SkipIfAllCurrent", () => {
    const src = result.index.nodes['sync/CompareStoredHash'];
    expect(src.followed_by).toContain('sync/SkipIfAllCurrent');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
