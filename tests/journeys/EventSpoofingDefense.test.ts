// Auto-generated from journey: EventSpoofingDefense
// Module: actors
// Triggered by: _actors/EventSpoofer
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      EventSpoofer: { type: 'actor', description: 'an adversary who writes fake event files to trigger unnecessary reconvergence' },
    },
  });

  modules.set('events', {
    nodes: {
      DetectEventFileChange: { type: 'process', description: 'detects changes to event files in dependency published directories via fs.watch' },
      ReadEventFile: { type: 'process', description: 'reads the content of a changed event file to extract dependency and hash information' },
    },
  });

  modules.set('sync', {
    nodes: {
      FetchDependencyHash: { type: 'process', description: 'fetches the current interface hash from a dependency published directory' },
      CompareStoredHash: { type: 'process', description: 'compares a fetched hash against the stored hash to detect changes' },
      SkipIfAllCurrent: { type: 'process', description: 'aborts sync when all dependency hashes match stored values' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EventSpoofingDefense'];

  it("step 1: _actors/EventSpoofer writes a fake event file to trigger unnecessary reconvergence", () => {
    const node = result.index.nodes['_actors/EventSpoofer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('EventSpoofingDefense'))).toBe(true);
  });

  it("step 2: events/DetectEventFileChange detects the spoofed event file change", () => {
    const node = result.index.nodes['events/DetectEventFileChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/EventSpoofer');
  });

  it("connection: _actors/EventSpoofer → events/DetectEventFileChange", () => {
    const src = result.index.nodes['_actors/EventSpoofer'];
    expect(src.followed_by).toContain('events/DetectEventFileChange');
  });

  it("step 3: events/ReadEventFile reads the spoofed event content", () => {
    const node = result.index.nodes['events/ReadEventFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/DetectEventFileChange');
  });

  it("connection: events/DetectEventFileChange → events/ReadEventFile", () => {
    const src = result.index.nodes['events/DetectEventFileChange'];
    expect(src.followed_by).toContain('events/ReadEventFile');
  });

  it("step 4: sync/FetchDependencyHash fetches the actual dependency hash to compare", () => {
    const node = result.index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('events/ReadEventFile');
  });

  it("connection: events/ReadEventFile → sync/FetchDependencyHash", () => {
    const src = result.index.nodes['events/ReadEventFile'];
    expect(src.followed_by).toContain('sync/FetchDependencyHash');
  });

  it("step 5: sync/CompareStoredHash compares and finds the hash has not actually changed", () => {
    const node = result.index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('sync/FetchDependencyHash');
  });

  it("connection: sync/FetchDependencyHash → sync/CompareStoredHash", () => {
    const src = result.index.nodes['sync/FetchDependencyHash'];
    expect(src.followed_by).toContain('sync/CompareStoredHash');
  });

  it("step 6: sync/SkipIfAllCurrent aborts sync because no real change occurred, neutralizing the spoof", () => {
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
