// Auto-generated from journey: InfiniteRippleDefense
// Module: actors
// Triggered by: _actors/InfiniteLoopTrigger
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { detectOscillation, checkRippleDepthLimit } from '../../src/sync.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/sync.ts

function buildRippleModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      InfiniteLoopTrigger: { type: 'actor', description: 'Crafts circular dependencies or oscillating changes to cause unbounded ripple' },
    },
    journeys: {},
  });

  modules.set('events', {
    nodes: {
      DetectEventFileChange: { type: 'process', description: 'Detects the rapid sequence of events' },
      OscillationCooldown: { type: 'rule', description: 'Suppresses re-trigger within the cooldown window' },
      DebounceEvents: { type: 'process', description: 'Batches the rapid events into a single sync trigger' },
    },
    journeys: {},
  });

  modules.set('sync', {
    nodes: {
      CompareStoredHash: { type: 'process', description: 'Compares hashes and finds they cycle back to a previous state' },
      SkipIfAllCurrent: { type: 'process', description: 'Aborts because the effective state has not changed' },
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
  const modules = buildRippleModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['InfiniteRippleDefense'];

  it("step 1: _actors/InfiniteLoopTrigger crafts circular dependencies or oscillating changes to cause unbounded ripple", () => {
    const node = result.index.nodes['_actors/InfiniteLoopTrigger'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: events/DetectEventFileChange detects the rapid sequence of events", () => {
    const node = result.index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/InfiniteLoopTrigger');
  });

  it("connection: _actors/InfiniteLoopTrigger → events/DetectEventFileChange", () => {
    const from = result.index.nodes['_actors/InfiniteLoopTrigger'];
    expect(from.followed_by).toContain('events/DetectEventFileChange');
  });

  it("step 3: events/OscillationCooldown suppresses re-trigger because the same dependency fired within the cooldown window", () => {
    const node = result.index.nodes['events/OscillationCooldown'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('events/DetectEventFileChange');
  });

  it("connection: events/DetectEventFileChange → events/OscillationCooldown", () => {
    const from = result.index.nodes['events/DetectEventFileChange'];
    expect(from.followed_by).toContain('events/OscillationCooldown');
  });

  it("step 4: events/DebounceEvents batches the rapid events into a single sync trigger", () => {
    const node = result.index.nodes['events/DebounceEvents'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/OscillationCooldown');
  });

  it("connection: events/OscillationCooldown → events/DebounceEvents", () => {
    const from = result.index.nodes['events/OscillationCooldown'];
    expect(from.followed_by).toContain('events/DebounceEvents');
  });

  it("step 5: sync/CompareStoredHash compares hashes and finds they cycle back to a previous state", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/DebounceEvents');
  });

  it("connection: events/DebounceEvents → sync/CompareStoredHash", () => {
    const from = result.index.nodes['events/DebounceEvents'];
    expect(from.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 6: sync/SkipIfAllCurrent aborts because the effective state has not changed", () => {
    const node = result.index.nodes['sync/SkipIfAllCurrent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/SkipIfAllCurrent", () => {
    const from = result.index.nodes['sync/CompareStoredHash'];
    expect(from.followed_by).toContain('sync/SkipIfAllCurrent');
  });

  it("oscillation is detected when box ID appears in origin chain (A→B→A cycle)", () => {
    expect(detectOscillation(['boxA', 'boxB'], 'boxA')).toBe(true);
    expect(detectOscillation(['boxA', 'boxB', 'boxC'], 'boxA')).toBe(true);
    expect(detectOscillation(['boxB', 'boxC'], 'boxA')).toBe(false);
  });

  it("ripple depth limit stops propagation at configured max", () => {
    expect(checkRippleDepthLimit(['a', 'b', 'c'], 3)).toBe(true);
    expect(checkRippleDepthLimit(['a', 'b', 'c', 'd'], 3)).toBe(true);
    expect(checkRippleDepthLimit(['a', 'b'], 3)).toBe(false);
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
