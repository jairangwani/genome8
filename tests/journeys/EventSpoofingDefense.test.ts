// Auto-generated from journey: EventSpoofingDefense
// Module: actors
// Triggered by: _actors/EventSpoofer
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { checkEventSequence, detectOscillation } from '../../src/sync.js';
import type { ModuleFile } from '../../src/types.js';
import type { SyncState } from '../../src/sync.js';

// Implementation: src/sync.ts

function buildSpoofModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      EventSpoofer: { type: 'actor', description: 'Writes a fake event file to trigger unnecessary reconvergence' },
    },
    journeys: {},
  });

  modules.set('events', {
    nodes: {
      DetectEventFileChange: { type: 'process', description: 'Detects the spoofed event file change' },
      ReadEventFile: { type: 'process', description: 'Reads the spoofed event content' },
    },
    journeys: {},
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'Fetches the actual dependency hash to compare' },
      CompareStoredHash: { type: 'process', description: 'Compares and finds the hash has not actually changed' },
      SkipIfAllCurrent: { type: 'process', description: 'Aborts sync because no real change occurred' },
    },
    journeys: {
      EventSpoofingDefense: {
        steps: [
          { node: '_actors/EventSpoofer', action: 'writes a fake event file to trigger unnecessary reconvergence' },
          { node: 'events/DetectEventFileChange', action: 'detects the spoofed event file change' },
          { node: 'events/ReadEventFile', action: 'reads the spoofed event content' },
          { node: 'FetchDependencyHash', action: 'fetches the actual dependency hash to compare' },
          { node: 'CompareStoredHash', action: 'compares and finds the hash has not actually changed' },
          { node: 'SkipIfAllCurrent', action: 'aborts sync because no real change occurred, neutralizing the spoof' },
        ],
      },
    },
  });

  return modules;
}

describe("EventSpoofingDefense", () => {
  const modules = buildSpoofModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EventSpoofingDefense'];

  it("step 1: _actors/EventSpoofer writes a fake event file to trigger unnecessary reconvergence", () => {
    const node = result.index.nodes['_actors/EventSpoofer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: events/DetectEventFileChange detects the spoofed event file change", () => {
    const node = result.index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/EventSpoofer');
  });

  it("connection: _actors/EventSpoofer → events/DetectEventFileChange", () => {
    const from = result.index.nodes['_actors/EventSpoofer'];
    expect(from.followed_by).toContain('events/DetectEventFileChange');
  });

  it("step 3: events/ReadEventFile reads the spoofed event content", () => {
    const node = result.index.nodes['events/ReadEventFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/DetectEventFileChange');
  });

  it("connection: events/DetectEventFileChange → events/ReadEventFile", () => {
    const from = result.index.nodes['events/DetectEventFileChange'];
    expect(from.followed_by).toContain('events/ReadEventFile');
  });

  it("step 4: sync/FetchDependencyHash fetches the actual dependency hash to compare", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/ReadEventFile');
  });

  it("connection: events/ReadEventFile → sync/FetchDependencyHash", () => {
    const from = result.index.nodes['events/ReadEventFile'];
    expect(from.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 5: sync/CompareStoredHash compares and finds the hash has not actually changed", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const from = result.index.nodes['sync/FetchDependencyHash'];
    expect(from.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 6: sync/SkipIfAllCurrent aborts sync because no real change occurred, neutralizing the spoof", () => {
    const node = result.index.nodes['sync/SkipIfAllCurrent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/CompareStoredHash');
  });

  it("connection: sync/CompareStoredHash → sync/SkipIfAllCurrent", () => {
    const from = result.index.nodes['sync/CompareStoredHash'];
    expect(from.followed_by).toContain('sync/SkipIfAllCurrent');
  });

  it("spoofed event with already-processed sequence is discarded", () => {
    const state: SyncState = {
      known_hashes: { depA: 'sha256:abc' },
      last_processed_sequence: { depA: 5 },
    };
    // Spoofed event replays sequence 3 — should be discarded
    expect(checkEventSequence(state, 'depA', 3)).toBe(false);
    // Spoofed event replays the same sequence 5 — should be discarded
    expect(checkEventSequence(state, 'depA', 5)).toBe(false);
    // Only genuinely new sequence 6 is accepted
    expect(checkEventSequence(state, 'depA', 6)).toBe(true);
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
