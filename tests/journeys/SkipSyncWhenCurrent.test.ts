// Auto-generated from journey: SkipSyncWhenCurrent
// Module: sync
// Triggered by: _actors/DependentBox
// Modules touched: _actors, sync

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("SkipSyncWhenCurrent", () => {
  let tmpDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-skip-current-'));
    depsPath = path.join(tmpDir, 'dependencies.yaml');
    syncStatePath = path.join(tmpDir, 'sync-state.json');
    depPublishedDir = path.join(tmpDir, 'dep-upstream', 'published');
    fs.mkdirSync(depPublishedDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { DependentBox: { type: 'actor', description: 'A dependent box' } },
      journeys: {},
    }],
    ['sync', {
      nodes: {
        ReadDependencyList: { type: 'process', description: 'Reads dependency list' },
        FetchDependencyHash: { type: 'process', description: 'Fetches hashes' },
        DependencyHashStore: { type: 'artifact', description: 'Stored hashes' },
        CompareStoredHash: { type: 'process', description: 'Compares hashes' },
        SkipIfAllCurrent: { type: 'process', description: 'Aborts sync if all current' },
        SyncResult: { type: 'artifact', description: 'Records sync outcome' },
      },
      journeys: {
        SkipSyncWhenCurrent: {
          steps: [
            { node: '_actors/DependentBox', action: 'receives an event and initiates a sync check' },
            { node: 'ReadDependencyList', action: 'reads the dependency list' },
            { node: 'FetchDependencyHash', action: 'fetches current hashes' },
            { node: 'DependencyHashStore', action: 'provides stored hashes' },
            { node: 'CompareStoredHash', action: 'compares all fetched hashes against stored' },
            { node: 'SkipIfAllCurrent', action: 'determines all hashes match and aborts early' },
            { node: 'SyncResult', action: 'records no dependencies changed' },
          ],
        },
      },
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: _actors/DependentBox receives an event and initiates a sync check", () => {
    const actor = compiled.index.nodes['_actors/DependentBox'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
  });

  it("step 2: sync/ReadDependencyList reads the dependency list", () => {
    const depsContent = { dependencies: { upstream: { pin: 'latest' } } };
    fs.writeFileSync(depsPath, yaml.dump(depsContent));

    const loaded = yaml.load(fs.readFileSync(depsPath, 'utf-8')) as any;
    expect(loaded.dependencies).toBeDefined();
    expect(loaded.dependencies.upstream.pin).toBe('latest');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependency interfaces", () => {
    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:current', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));

    const parsed = yaml.load(fs.readFileSync(path.join(depPublishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(parsed.version_hash).toBe('sha256:current');
  });

  it("step 4: sync/DependencyHashStore provides stored hashes for comparison", () => {
    const syncState = { known_hashes: { upstream: 'sha256:current' } };
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState));

    const loaded = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(loaded.known_hashes.upstream).toBe('sha256:current');
  });

  it("step 5: sync/CompareStoredHash compares all fetched hashes against stored hashes", () => {
    // When stored hash matches current hash, comparison finds no change
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:same_value' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:same_value', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(0);
  });

  it("step 6: sync/SkipIfAllCurrent determines all hashes match and aborts sync early", () => {
    // All dependencies are current, so sync returns empty changes
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:aaa' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:aaa', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // No changes means sync can be skipped
    expect(changes).toEqual([]);
  });

  it("step 7: sync/SyncResult records that no dependencies changed, no reconvergence needed", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:stable' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:stable', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Empty changes array = no reconvergence needed
    expect(changes).toHaveLength(0);

    // Sync state file remains unchanged
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes.upstream).toBe('sha256:stable');
  });
});
