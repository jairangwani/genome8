// Auto-generated from journey: InfiniteRippleDefense
// Module: actors
// Triggered by: _actors/InfiniteLoopTrigger
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['InfiniteRippleDefense'];
const steps = journey.steps;

describe("InfiniteRippleDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'events', 'sync'])
    );
  });

  it("step 1: _actors/InfiniteLoopTrigger crafts circular dependencies or oscillating changes to cause unbounded ripple", () => {
    // Node: _actors/InfiniteLoopTrigger (actor)
    // Action: crafts circular dependencies or oscillating changes to cause unbounded ripple
    const step = steps[0];
    expect(step.node).toBe('_actors/InfiniteLoopTrigger');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/InfiniteLoopTrigger'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('circular');
    // InfiniteLoopTrigger is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/InfiniteLoopTrigger');
    // Followed by DetectEventFileChange in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/DetectEventFileChange'])
    );
  });

  it("step 2: events/DetectEventFileChange detects the rapid sequence of events", () => {
    // Node: events/DetectEventFileChange (process)
    // Action: detects the rapid sequence of events
    const step = steps[1];
    expect(step.node).toBe('events/DetectEventFileChange');
    expect(step.step_number).toBe(2);

    const node = index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fs.watch');
    expect(node.module).toBe('events');
    // Preceded by InfiniteLoopTrigger in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/InfiniteLoopTrigger'])
    );
    // Followed by OscillationCooldown in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/OscillationCooldown'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: events/OscillationCooldown suppresses re-trigger because the same dependency fired within the cooldown window", () => {
    // Node: events/OscillationCooldown (rule)
    // Action: suppresses re-trigger because the same dependency fired within the cooldown window
    const step = steps[2];
    expect(step.node).toBe('events/OscillationCooldown');
    expect(step.step_number).toBe(3);

    const node = index.nodes['events/OscillationCooldown'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('cooldown');
    expect(node.module).toBe('events');
    // Preceded by DetectEventFileChange in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/DetectEventFileChange'])
    );
    // Followed by DebounceEvents in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/DebounceEvents'])
    );
  });

  it("step 4: events/DebounceEvents batches the rapid events into a single sync trigger", () => {
    // Node: events/DebounceEvents (process)
    // Action: batches the rapid events into a single sync trigger
    const step = steps[3];
    expect(step.node).toBe('events/DebounceEvents');
    expect(step.step_number).toBe(4);

    const node = index.nodes['events/DebounceEvents'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('batches');
    expect(node.module).toBe('events');
    // Preceded by OscillationCooldown in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/OscillationCooldown'])
    );
    // Followed by CompareStoredHash in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
  });

  it("step 5: sync/CompareStoredHash compares hashes and finds they cycle back to a previous state", () => {
    // Node: sync/CompareStoredHash (process)
    // Action: compares hashes and finds they cycle back to a previous state
    const step = steps[4];
    expect(step.node).toBe('sync/CompareStoredHash');
    expect(step.step_number).toBe(5);

    const node = index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('hash');
    expect(node.module).toBe('sync');
    // Preceded by DebounceEvents in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/DebounceEvents'])
    );
    // Followed by SkipIfAllCurrent in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/SkipIfAllCurrent'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: sync/SkipIfAllCurrent aborts because the effective state has not changed", () => {
    // Node: sync/SkipIfAllCurrent (process)
    // Action: aborts because the effective state has not changed
    const step = steps[5];
    expect(step.node).toBe('sync/SkipIfAllCurrent');
    expect(step.step_number).toBe(6);

    const node = index.nodes['sync/SkipIfAllCurrent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('aborts');
    expect(node.module).toBe('sync');
    // Preceded by CompareStoredHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
  });

  it("journey forms the full attack-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/InfiniteLoopTrigger',
      'events/DetectEventFileChange',
      'events/OscillationCooldown',
      'events/DebounceEvents',
      'sync/CompareStoredHash',
      'sync/SkipIfAllCurrent',
    ]);
  });

  it("defense has two layers: events module suppresses rapid fire, sync module detects no real change", () => {
    // Layer 1: events module cooldown and debounce (steps 2-4)
    const eventsSteps = steps.filter(s => s.node.startsWith('events/'));
    expect(eventsSteps).toHaveLength(3);
    expect(eventsSteps.map(s => s.node)).toEqual([
      'events/DetectEventFileChange',
      'events/OscillationCooldown',
      'events/DebounceEvents',
    ]);
    // Layer 2: sync module hash comparison and skip (steps 5-6)
    const syncSteps = steps.filter(s => s.node.startsWith('sync/'));
    expect(syncSteps).toHaveLength(2);
    expect(syncSteps.map(s => s.node)).toEqual([
      'sync/CompareStoredHash',
      'sync/SkipIfAllCurrent',
    ]);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'events', 'sync']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("InfiniteLoopTrigger is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/InfiniteLoopTrigger');
    const node = index.nodes['_actors/InfiniteLoopTrigger'];
    expect(node.type).toBe('actor');
  });
});
