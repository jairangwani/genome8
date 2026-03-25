// Auto-generated from journey: EventSpoofingDefense
// Module: actors
// Triggered by: _actors/EventSpoofer
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['EventSpoofingDefense'];
const steps = journey.steps;

describe("EventSpoofingDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'events', 'sync'])
    );
  });

  it("step 1: _actors/EventSpoofer writes a fake event file to trigger unnecessary reconvergence", () => {
    // Node: _actors/EventSpoofer (actor)
    // Action: writes a fake event file to trigger unnecessary reconvergence
    const step = steps[0];
    expect(step.node).toBe('_actors/EventSpoofer');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/EventSpoofer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('fake event');
    // EventSpoofer is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/EventSpoofer');
    // Followed by DetectEventFileChange in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/DetectEventFileChange'])
    );
  });

  it("step 2: events/DetectEventFileChange detects the spoofed event file change", () => {
    // Node: events/DetectEventFileChange (process)
    // Action: detects the spoofed event file change
    const step = steps[1];
    expect(step.node).toBe('events/DetectEventFileChange');
    expect(step.step_number).toBe(2);

    const node = index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fs.watch');
    expect(node.module).toBe('events');
    // Preceded by EventSpoofer in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/EventSpoofer'])
    );
    // Followed by ReadEventFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/ReadEventFile'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: events/ReadEventFile reads the spoofed event content", () => {
    // Node: events/ReadEventFile (process)
    // Action: reads the spoofed event content
    const step = steps[2];
    expect(step.node).toBe('events/ReadEventFile');
    expect(step.step_number).toBe(3);

    const node = index.nodes['events/ReadEventFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('event file');
    // Preceded by DetectEventFileChange in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/DetectEventFileChange'])
    );
    // Followed by FetchDependencyHash in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/FetchDependencyHash'])
    );
  });

  it("step 4: sync/FetchDependencyHash fetches the actual dependency hash to compare", () => {
    // Node: sync/FetchDependencyHash (process)
    // Action: fetches the actual dependency hash to compare
    const step = steps[3];
    expect(step.node).toBe('sync/FetchDependencyHash');
    expect(step.step_number).toBe(4);

    const node = index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('SHA256');
    expect(node.module).toBe('sync');
    // Preceded by ReadEventFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/ReadEventFile'])
    );
    // Followed by CompareStoredHash in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: sync/CompareStoredHash compares and finds the hash has not actually changed", () => {
    // Node: sync/CompareStoredHash (process)
    // Action: compares and finds the hash has not actually changed
    const step = steps[4];
    expect(step.node).toBe('sync/CompareStoredHash');
    expect(step.step_number).toBe(5);

    const node = index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('hash');
    // Preceded by FetchDependencyHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/FetchDependencyHash'])
    );
    // Followed by SkipIfAllCurrent in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/SkipIfAllCurrent'])
    );
  });

  it("step 6: sync/SkipIfAllCurrent aborts sync because no real change occurred, neutralizing the spoof", () => {
    // Node: sync/SkipIfAllCurrent (process)
    // Action: aborts sync because no real change occurred, neutralizing the spoof
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
      '_actors/EventSpoofer',
      'events/DetectEventFileChange',
      'events/ReadEventFile',
      'sync/FetchDependencyHash',
      'sync/CompareStoredHash',
      'sync/SkipIfAllCurrent',
    ]);
  });

  it("attack flows through events module, defense resolves in sync module", () => {
    // Attack enters via events (steps 1-3)
    const eventsSteps = steps.filter(s =>
      s.node.startsWith('events/') || s.node.startsWith('_actors/')
    );
    expect(eventsSteps).toHaveLength(3);
    // Defense resolves in sync (steps 4-6)
    const syncSteps = steps.filter(s => s.node.startsWith('sync/'));
    expect(syncSteps).toHaveLength(3);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'events', 'sync']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("EventSpoofer is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/EventSpoofer');
    const node = index.nodes['_actors/EventSpoofer'];
    expect(node.type).toBe('actor');
  });
});
