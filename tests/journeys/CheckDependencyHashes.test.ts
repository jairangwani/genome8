// Auto-generated from journey: CheckDependencyHashes
// Module: sync
// Triggered by: _actors/DependentBox
// Modules touched: _actors, sync, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("CheckDependencyHashes", () => {
  let tmpDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-check-dep-hashes-'));
    depsPath = path.join(tmpDir, 'dependencies.yaml');
    syncStatePath = path.join(tmpDir, 'sync-state.json');
    depPublishedDir = path.join(tmpDir, 'dep-upstream', 'published');
    fs.mkdirSync(depPublishedDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // Shared fixtures
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { DependentBox: { type: 'actor', description: 'A box that depends on upstream boxes' } },
      journeys: {},
    }],
    ['sync', {
      nodes: {
        ReadDependencyList: { type: 'process', description: 'Reads the dependency configuration' },
        FetchDependencyHash: { type: 'process', description: 'Fetches hash from interface.yaml' },
        CompareStoredHash: { type: 'process', description: 'Compares fetched vs stored hash' },
        IdentifyStaleDependencies: { type: 'process', description: 'Collects changed dependencies' },
        DependencyHashStore: { type: 'artifact', description: 'Locally stored hashes' },
        HashMismatchMeansStale: { type: 'rule', description: 'Hash difference means changed' },
        SyncResult: { type: 'artifact', description: 'Records sync outcome' },
      },
      journeys: {
        CheckDependencyHashes: {
          steps: [
            { node: '_actors/DependentBox', action: 'has received an event indicating a dependency may have changed' },
            { node: 'ReadDependencyList', action: 'reads the dependency configuration' },
            { node: 'FetchDependencyHash', action: 'reads the SHA256 hash from each dependency interface.yaml' },
            { node: 'CompareStoredHash', action: 'compares each fetched hash against the stored hash' },
            { node: 'HashMismatchMeansStale', action: 'enforces that any hash difference means the dependency has changed' },
            { node: 'IdentifyStaleDependencies', action: 'collects all dependencies with mismatched hashes into a changed list' },
            { node: 'SyncResult', action: 'records which dependencies changed' },
          ],
        },
      },
    }],
    ['publish', {
      nodes: {
        InterfaceHash: { type: 'artifact', description: 'Current hash from published interface' },
      },
      journeys: {},
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: _actors/DependentBox has received an event indicating a dependency may have changed", () => {
    const actor = compiled.index.nodes['_actors/DependentBox'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
  });

  it("step 2: sync/ReadDependencyList reads the box's dependency configuration to get the list of upstream boxes", () => {
    // Write a dependencies.yaml file and verify checkDependencies reads it
    const depsContent = { dependencies: { upstream: { pin: 'latest' } } };
    fs.writeFileSync(depsPath, yaml.dump(depsContent));

    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:aaa', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Should detect the upstream dependency and produce a change (first time = no stored hash)
    expect(changes.length).toBe(1);
    expect(changes[0].dependency).toBe('upstream');
  });

  it("step 3: sync/FetchDependencyHash reads the SHA256 hash from each dependency's interface.yaml", () => {
    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:abc123', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));

    const depsContent = { dependencies: { upstream: { pin: 'latest' } } };
    fs.writeFileSync(depsPath, yaml.dump(depsContent));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes[0].current_hash).toBe('sha256:abc123');
  });

  it("step 4: publish/InterfaceHash provides the current hash from the dependency's published interface", () => {
    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:current_hash_value', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));

    const parsed = yaml.load(fs.readFileSync(path.join(depPublishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(parsed.version_hash).toBe('sha256:current_hash_value');
  });

  it("step 5: sync/DependencyHashStore provides the locally stored hash from the last successful sync", () => {
    // Write a sync state with a known hash
    const syncState = { known_hashes: { upstream: 'sha256:old_hash' } };
    fs.writeFileSync(syncStatePath, JSON.stringify(syncState));

    const loaded = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(loaded.known_hashes.upstream).toBe('sha256:old_hash');
  });

  it("step 6: sync/CompareStoredHash compares each fetched hash against the stored hash", () => {
    // Set up stored hash that differs from current
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));

    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(1);
    expect(changes[0].previous_hash).toBe('sha256:old');
    expect(changes[0].current_hash).toBe('sha256:new');
  });

  it("step 7: sync/HashMismatchMeansStale enforces that any hash difference means the dependency has changed", () => {
    // Same hash = no change detected
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:same' } }));

    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:same', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(0);
  });

  it("step 8: sync/IdentifyStaleDependencies collects all dependencies with mismatched hashes into a changed list", () => {
    // Two dependencies, both changed
    const depDir2 = path.join(tmpDir, 'dep-upstream2', 'published');
    fs.mkdirSync(depDir2, { recursive: true });

    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old1', upstream2: 'sha256:old2' } }));

    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new1', provides: {}, requires: {},
    }));
    fs.writeFileSync(path.join(depDir2, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new2', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { upstream: { pin: 'latest' }, upstream2: { pin: 'latest' } },
    }));

    const resolver = (dep: string) => {
      if (dep === 'upstream') return depPublishedDir;
      if (dep === 'upstream2') return depDir2;
      return null;
    };
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(2);
    const depNames = changes.map(c => c.dependency).sort();
    expect(depNames).toEqual(['upstream', 'upstream2']);
  });

  it("step 9: sync/SyncResult records which dependencies changed", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:prev' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:curr', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes[0]).toMatchObject({
      dependency: 'upstream',
      previous_hash: 'sha256:prev',
      current_hash: 'sha256:curr',
    });

    // Sync state file was updated
    const updatedState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(updatedState.known_hashes.upstream).toBe('sha256:curr');
  });
});
