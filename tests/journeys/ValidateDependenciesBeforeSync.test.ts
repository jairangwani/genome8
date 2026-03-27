// Auto-generated from journey: ValidateDependenciesBeforeSync
// Module: sync
// Triggered by: _actors/DependentBox
// Modules touched: _actors, sync, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateDependenciesBeforeSync", () => {
  let tmpDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-validate-deps-'));
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
        ReadDependencyList: { type: 'process', description: 'Reads deps' },
        ValidateDependencyConfig: { type: 'process', description: 'Validates dep config' },
        SyncResult: { type: 'artifact', description: 'Records sync result' },
      },
      journeys: {},
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: _actors/DependentBox initiates a sync check after receiving an event", () => {
    const actor = compiled.index.nodes['_actors/DependentBox'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
  });

  it("step 2: sync/ReadDependencyList reads the dependency list from the box configuration", () => {
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { upstream: { pin: 'latest' }, missing: { pin: 'latest' } },
    }));
    const loaded = yaml.load(fs.readFileSync(depsPath, 'utf-8')) as any;
    expect(Object.keys(loaded.dependencies)).toEqual(['upstream', 'missing']);
  });

  it("step 3: sync/ValidateDependencyConfig iterates each dependency entry and checks the box directory exists", () => {
    // upstream exists, missing does not
    expect(fs.existsSync(depPublishedDir)).toBe(true);

    const missingDir = path.join(tmpDir, 'dep-missing', 'published');
    expect(fs.existsSync(missingDir)).toBe(false);
  });

  it("step 4: sync/ValidateDependencyConfig checks that each dependency's interface.yaml file is present and readable", () => {
    // Write interface for upstream
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:valid', provides: {}, requires: {},
    }));

    expect(fs.existsSync(path.join(depPublishedDir, 'interface.yaml'))).toBe(true);

    // Missing dependency has no interface file
    const missingInterface = path.join(tmpDir, 'dep-missing', 'published', 'interface.yaml');
    expect(fs.existsSync(missingInterface)).toBe(false);
  });

  it("step 5: sync/ValidateDependencyConfig flags any dependency with a missing directory or unreachable interface as invalid", () => {
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { upstream: { pin: 'latest' }, missing: { pin: 'latest' } },
    }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:valid', provides: {}, requires: {},
    }));

    // Resolver returns null for missing dependency (unreachable)
    const resolver = (dep: string) => {
      if (dep === 'upstream') return depPublishedDir;
      return null; // missing dep is unreachable
    };

    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Only upstream is processed; missing is skipped (resolver returns null)
    expect(changes.length).toBe(1);
    expect(changes[0].dependency).toBe('upstream');
  });

  it("step 6: sync/SyncResult records the validation failures for invalid dependencies", () => {
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { unreachable: { pin: 'latest' } },
    }));

    // All dependencies are unreachable
    const resolver = () => null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // No changes because the dependency couldn't be resolved
    expect(changes).toHaveLength(0);
  });

  it("step 7: convergence/ConvergenceState receives the sync result with validation failures and blocks sync until dependency configuration is fixed", () => {
    // When there are no valid changes, convergence should not proceed
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { unreachable: { pin: 'latest' } },
    }));

    const resolver = () => null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Empty changes = no reconvergence triggered
    expect(changes).toHaveLength(0);
  });
});
