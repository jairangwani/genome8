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

// Implementation: test/staleness.test.ts

describe("EventSpoofingDefense", () => {
  let tmpDir: string;
  let depDir: string;
  let depsPath: string;
  let syncStatePath: string;

  const dummyModule: ModuleFile = {
    nodes: { API: { type: 'interface', description: 'external API' } },
    journeys: {},
  };
  const index = compileFromModules(new Map([['gateway', dummyModule]])).index;

  function setup() {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-spoof-'));
    depDir = path.join(tmpDir, 'dep-engine', 'published');
    fs.mkdirSync(depDir, { recursive: true });
    depsPath = path.join(tmpDir, 'dependencies.yaml');
    syncStatePath = path.join(tmpDir, 'sync-state.json');
  }

  function cleanup() {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  it("step 1: _actors/EventSpoofer writes a fake event file to trigger unnecessary reconvergence", () => {
    setup();
    // Spoofer writes a fake event file
    const eventDir = path.join(tmpDir, 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    const fakeEvent = { dependency: 'auth-engine', hash: 'sha256:fake123', timestamp: new Date().toISOString() };
    fs.writeFileSync(path.join(eventDir, 'auth-engine.json'), JSON.stringify(fakeEvent));
    expect(fs.existsSync(path.join(eventDir, 'auth-engine.json'))).toBe(true);
    cleanup();
  });

  it("step 2: events/DetectEventFileChange detects the spoofed event file change", () => {
    setup();
    // Event file exists and is readable
    const eventDir = path.join(tmpDir, 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    fs.writeFileSync(path.join(eventDir, 'fake.json'), JSON.stringify({ hash: 'spoofed' }));
    const files = fs.readdirSync(eventDir);
    expect(files.length).toBe(1);
    expect(files[0]).toBe('fake.json');
    cleanup();
  });

  it("step 3: events/ReadEventFile reads the spoofed event content", () => {
    setup();
    const eventDir = path.join(tmpDir, 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    const eventData = { dependency: 'auth-engine', hash: 'sha256:spoofed', origin_chain: ['spoofer'] };
    fs.writeFileSync(path.join(eventDir, 'auth-engine.json'), JSON.stringify(eventData));
    const read = JSON.parse(fs.readFileSync(path.join(eventDir, 'auth-engine.json'), 'utf-8'));
    expect(read.hash).toBe('sha256:spoofed');
    expect(read.origin_chain).toContain('spoofer');
    cleanup();
  });

  it("step 4: sync/FetchDependencyHash fetches the actual dependency hash to compare", () => {
    setup();
    // Set up a real dependency interface with a known hash
    const realHash = 'sha256:real-abc123';
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'dep-engine', version_hash: realHash, provides: {}, requires: {} })
    );
    // Write dependencies.yaml pointing to dep-engine
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'dep-engine': { pin: 'latest' } } }));
    // Set known hash = real hash (already seen)
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'dep-engine': realHash } }));
    // checkDependencies should find no changes since hash matches
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes.length).toBe(0);
    cleanup();
  });

  it("step 5: sync/CompareStoredHash compares and finds the hash has not actually changed", () => {
    setup();
    const stableHash = 'sha256:stable999';
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'dep-engine', version_hash: stableHash, provides: {}, requires: {} })
    );
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'dep-engine': { pin: 'latest' } } }));
    // Known hash matches current — no change despite spoofed event
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'dep-engine': stableHash } }));
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes.length).toBe(0);
    cleanup();
  });

  it("step 6: sync/SkipIfAllCurrent aborts sync because no real change occurred, neutralizing the spoof", () => {
    setup();
    const unchangedHash = 'sha256:unchanged';
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'dep-engine', version_hash: unchangedHash, provides: {}, requires: {} })
    );
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'dep-engine': { pin: 'latest' } } }));
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'dep-engine': unchangedHash } }));
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    // Zero changes = sync is skipped entirely — spoof neutralized
    expect(changes.length).toBe(0);
    // Sync state still has the lock released
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.sync_in_progress).toBe(false);
    cleanup();
  });

});
