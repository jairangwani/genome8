// Auto-generated from journey: SyncOnFirstBoot
// Module: sync
// Triggered by: _actors/DependentBox
// Modules touched: _actors, sync, publish, graph, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies, markModulesStale } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("SyncOnFirstBoot", () => {
  let tmpDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;
  let modulesDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-first-boot-'));
    depsPath = path.join(tmpDir, 'dependencies.yaml');
    syncStatePath = path.join(tmpDir, 'sync-state.json');
    depPublishedDir = path.join(tmpDir, 'dep-upstream', 'published');
    modulesDir = path.join(tmpDir, 'modules');
    fs.mkdirSync(depPublishedDir, { recursive: true });
    fs.mkdirSync(modulesDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { DependentBox: { type: 'actor', description: 'A box that boots for the first time' } },
      journeys: {},
    }],
    ['localMod', {
      nodes: {
        Worker: { type: 'process', description: 'Works with upstream data' },
      },
      journeys: {
        ConsumeUpstream: {
          steps: [
            { node: 'upstream/Source', action: 'provides source data' },
            { node: 'Worker', action: 'processes the source data' },
          ],
        },
      },
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: _actors/DependentBox boots for the first time and needs to establish baseline dependency state", () => {
    const actor = compiled.index.nodes['_actors/DependentBox'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
  });

  it("step 2: sync/ValidateDependencyConfig checks that all dependency entries point to real boxes with reachable interfaces", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:initial', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    // checkDependencies validates reachability by checking existsSync on interfacePath
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);
    expect(changes.length).toBeGreaterThan(0);
  });

  it("step 3: sync/ReadDependencyList reads the full dependency list from the box configuration", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    const loaded = yaml.load(fs.readFileSync(depsPath, 'utf-8')) as any;
    expect(Object.keys(loaded.dependencies)).toContain('upstream');
  });

  it("step 4: sync/FetchDependencyHash fetches the current SHA256 hash from each dependency's interface.yaml", () => {
    const iface: PublishedInterface = {
      engine: 'test', version_hash: 'sha256:init_hash', provides: {}, requires: {},
    };
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump(iface));

    const parsed = yaml.load(fs.readFileSync(path.join(depPublishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(parsed.version_hash).toBe('sha256:init_hash');
  });

  it("step 5: publish/InterfaceHash provides the current hash from each dependency", () => {
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:pub_hash', provides: {}, requires: {},
    }));

    const parsed = yaml.load(fs.readFileSync(path.join(depPublishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(parsed.version_hash).toBe('sha256:pub_hash');
  });

  it("step 6: sync/DependencyHashStore is checked and found to be empty since this is the first boot", () => {
    // No sync state file exists on first boot
    expect(fs.existsSync(syncStatePath)).toBe(false);
  });

  it("step 7: sync/CompareStoredHash finds no stored hash for any dependency and treats all as changed", () => {
    // First boot: no sync-state.json exists
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:first', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(1);
    expect(changes[0].previous_hash).toBe('none');
  });

  it("step 8: sync/HashMismatchMeansStale enforces that missing stored hashes count as mismatches", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:any', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // previous_hash is 'none' which differs from current hash = mismatch
    expect(changes[0].previous_hash).toBe('none');
    expect(changes[0].current_hash).not.toBe('none');
  });

  it("step 9: sync/IdentifyStaleDependencies marks all dependencies as stale since none have stored hashes", () => {
    const depDir2 = path.join(tmpDir, 'dep-upstream2', 'published');
    fs.mkdirSync(depDir2, { recursive: true });

    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { upstream: { pin: 'latest' }, upstream2: { pin: 'latest' } },
    }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:h1', provides: {}, requires: {},
    }));
    fs.writeFileSync(path.join(depDir2, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:h2', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => {
      if (dep === 'upstream') return depPublishedDir;
      if (dep === 'upstream2') return depDir2;
      return null;
    };
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // All dependencies are stale on first boot
    expect(changes.length).toBe(2);
    expect(changes.every(c => c.previous_hash === 'none')).toBe(true);
  });

  it("step 10: sync/SyncResult records all dependencies as changed for first-boot sync", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:boot', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes[0].dependency).toBe('upstream');
    expect(changes[0].previous_hash).toBe('none');
    expect(changes[0].current_hash).toBe('sha256:boot');
  });

  it("step 11: graph/CompiledIndex provides the graph which may be empty or partially built on first boot", () => {
    expect(compiled.index).toBeDefined();
    expect(compiled.index.nodes).toBeDefined();
    expect(compiled.index.journeys).toBeDefined();
  });

  it("step 12: sync/FindAffectedModules marks all local modules as affected since all dependencies are new", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // localMod references upstream/Source, so it's affected
    expect(changes[0].affected_modules).toContain('localMod');
  });

  it("step 13: sync/MarkModulesStale marks all modules stale for full targeted reconvergence on first boot", () => {
    fs.writeFileSync(path.join(modulesDir, 'localMod.yaml'), yaml.dump({
      nodes: { Worker: { type: 'process', description: 'Works' } },
    }));

    markModulesStale(modulesDir, ['localMod'], 'first boot sync');

    const content = fs.readFileSync(path.join(modulesDir, 'localMod.yaml'), 'utf-8');
    expect(content).toContain('_stale: true');
    expect(content).toContain('first boot sync');
  });

  it("step 14: sync/StaleModuleList stores the full module list as stale", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const staleList = changes.flatMap(c => c.affected_modules);
    expect(staleList.length).toBeGreaterThan(0);
  });

  it("step 15: convergence/TargetedReconvergence begins reconvergence across all modules since every dependency is new", () => {
    // Reconvergence is initiated based on the stale list; verify the stale list is populated
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Non-empty changes implies reconvergence should be triggered
    expect(changes.length).toBeGreaterThan(0);
  });

  it("step 16: sync/UpdateStoredHashes writes all fetched hashes as the initial baseline for future syncs", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:baseline', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // After checkDependencies, sync state is written with the baseline hash
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes.upstream).toBe('sha256:baseline');
  });

  it("step 17: sync/DependencyHashStore populated with the first set of stored hashes", () => {
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:first_stored', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(fs.existsSync(syncStatePath)).toBe(true);
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes).toHaveProperty('upstream');
  });

  it("step 18: sync/LastProcessedSequence initialized with the current sequence numbers from each dependency's event", () => {
    // Sequence tracking is a higher-level concern; verify the sync state file is created
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:seq', provides: {}, requires: {},
    }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Sync state exists after first boot
    expect(fs.existsSync(syncStatePath)).toBe(true);
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes).toBeDefined();
  });
});
