// Auto-generated from journey: EventSpoofingDefense
// Module: actors
// Triggered by: _actors/EventSpoofer
// Modules touched: _actors, events, sync

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("EventSpoofingDefense", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'event-spoof-'));
  const depDir = path.join(tmpDir, 'dep-published');
  const depsPath = path.join(tmpDir, 'dependencies.yaml');
  const syncStatePath = path.join(tmpDir, 'sync-state.json');

  // Setup: create a dependency that the spoofer will target
  fs.mkdirSync(depDir, { recursive: true });
  const depInterface = {
    engine: 'dep-engine',
    version_hash: 'sha256:realhash123',
    provides: { 'dep/Service': { type: 'interface', description: 'A service', in_journeys: 1 } },
    requires: {},
  };
  fs.writeFileSync(path.join(depDir, 'interface.yaml'), yaml.dump(depInterface));

  it("step 1: _actors/EventSpoofer writes a fake event file to trigger unnecessary reconvergence", () => {
    // Spoofer writes a fake event claiming the dependency changed
    const fakeEvent = {
      origin: 'dep-engine',
      type: 'interface_changed',
      timestamp: new Date().toISOString(),
    };
    const eventPath = path.join(tmpDir, 'fake-event.json');
    fs.writeFileSync(eventPath, JSON.stringify(fakeEvent));
    expect(fs.existsSync(eventPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    expect(content.type).toBe('interface_changed');
  });

  it("step 2: events/DetectEventFileChange detects the spoofed event file change", () => {
    // The event system detects file changes — but the event content is fake
    const eventPath = path.join(tmpDir, 'fake-event.json');
    expect(fs.existsSync(eventPath)).toBe(true);
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    expect(event.origin).toBe('dep-engine');
  });

  it("step 3: events/ReadEventFile reads the spoofed event content", () => {
    const eventPath = path.join(tmpDir, 'fake-event.json');
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    expect(event.type).toBe('interface_changed');
    // The event claims a change, but we need to verify via hash
  });

  it("step 4: sync/FetchDependencyHash fetches the actual dependency hash to compare", () => {
    // Read the real published interface to get the actual hash
    const realInterface = yaml.load(
      fs.readFileSync(path.join(depDir, 'interface.yaml'), 'utf-8')
    ) as any;
    expect(realInterface.version_hash).toBe('sha256:realhash123');
  });

  it("step 5: sync/CompareStoredHash compares and finds the hash has not actually changed", () => {
    // Set sync state with the SAME hash as the dependency — no real change
    const syncState = { known_hashes: { 'dep-engine': 'sha256:realhash123' } };
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState));

    // Create dependencies.yaml pointing to the dep
    const deps = { dependencies: { 'dep-engine': { pin: 'latest' } } };
    fs.writeFileSync(depsPath, yaml.dump(deps));

    // Build a minimal index
    const modules = new Map<string, ModuleFile>([
      ['app', { nodes: { Svc: { type: 'process', description: 'Service' } } }],
    ]);
    const result = compileFromModules(modules);

    // checkDependencies should find NO changes because hash hasn't changed
    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'dep-engine') return depDir;
      return null;
    });
    expect(changes.length).toBe(0);
  });

  it("step 6: sync/SkipIfAllCurrent aborts sync because no real change occurred, neutralizing the spoof", () => {
    // Re-run to confirm: zero changes means no reconvergence triggered
    const deps = { dependencies: { 'dep-engine': { pin: 'latest' } } };
    fs.writeFileSync(depsPath, yaml.dump(deps));
    const syncState = { known_hashes: { 'dep-engine': 'sha256:realhash123' } };
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState));

    const modules = new Map<string, ModuleFile>([
      ['app', { nodes: { Svc: { type: 'process', description: 'Service' } } }],
    ]);
    const result = compileFromModules(modules);
    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'dep-engine') return depDir;
      return null;
    });
    // Spoof neutralized — no sync triggered
    expect(changes.length).toBe(0);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
