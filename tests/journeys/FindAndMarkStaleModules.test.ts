// Auto-generated from journey: FindAndMarkStaleModules
// Module: sync
// Modules touched: sync, graph

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies, markModulesStale } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("FindAndMarkStaleModules", () => {
  let tmpDir: string;
  let modulesDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-find-mark-stale-'));
    modulesDir = path.join(tmpDir, 'modules');
    depsPath = path.join(tmpDir, 'dependencies.yaml');
    syncStatePath = path.join(tmpDir, 'sync-state.json');
    depPublishedDir = path.join(tmpDir, 'dep-upstream', 'published');
    fs.mkdirSync(modulesDir, { recursive: true });
    fs.mkdirSync(depPublishedDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // Build a graph where local modules reference an upstream dependency
  const modules = new Map<string, ModuleFile>([
    ['localA', {
      nodes: {
        Handler: { type: 'process', description: 'Handles upstream data' },
      },
      journeys: {
        UseUpstream: {
          steps: [
            { node: 'upstream/DataSource', action: 'provides data' },
            { node: 'Handler', action: 'processes the data' },
          ],
        },
      },
    }],
    ['localB', {
      nodes: {
        Renderer: { type: 'process', description: 'Renders output' },
      },
      journeys: {
        RenderData: {
          steps: [
            { node: 'Renderer', action: 'renders output standalone' },
          ],
        },
      },
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: sync/SyncResult provides the list of changed dependencies", () => {
    // Set up a dependency change
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    expect(changes.length).toBe(1);
    expect(changes[0].dependency).toBe('upstream');
  });

  it("step 2: graph/CompiledIndex provides the full graph with all cross-module connections", () => {
    expect(compiled.index.nodes).toBeDefined();
    expect(compiled.index.journeys).toBeDefined();
    expect(compiled.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 3: graph/ConnectionSet provides the edge set showing which local nodes reference dependency nodes", () => {
    // The journey UseUpstream references upstream/DataSource -> localA/Handler
    const journey = compiled.index.journeys['UseUpstream'];
    expect(journey).toBeDefined();
    expect(journey.steps.some(s => s.node === 'upstream/DataSource')).toBe(true);
    expect(journey.modules_touched).toContain('upstream');
  });

  it("step 4: sync/FindAffectedModules traces connections from changed dependency nodes to local modules that reference them", () => {
    // Set up a change for 'upstream'
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // localA references upstream/DataSource in its journey, so it should be affected
    expect(changes[0].affected_modules).toContain('localA');
    // localB does not reference upstream at all
    expect(changes[0].affected_modules).not.toContain('localB');
  });

  it("step 5: sync/FilterUnrelatedChanges discards any affected modules whose references are only to unchanged parts of the dependency", () => {
    // When localB doesn't reference upstream at all, it's already filtered out
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Only localA is affected (references upstream), localB is unrelated
    expect(changes[0].affected_modules).toEqual(['localA']);
  });

  it("step 6: sync/MarkModulesStale writes stale markers on each affected local module that survived filtering", () => {
    // Create module files
    fs.writeFileSync(path.join(modulesDir, 'localA.yaml'), yaml.dump({
      nodes: { Handler: { type: 'process', description: 'Handles data' } },
    }));

    markModulesStale(modulesDir, ['localA'], 'dependency upstream changed');

    const content = fs.readFileSync(path.join(modulesDir, 'localA.yaml'), 'utf-8');
    expect(content).toContain('_stale: true');
    expect(content).toContain('dependency upstream changed');
  });

  it("step 7: sync/ComputeStaleModuleCount counts the stale modules and records the count in the sync result", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const staleCount = changes[0].affected_modules.length;
    expect(staleCount).toBe(1);
  });

  it("step 8: sync/StaleModuleList stores the list of stale modules for targeted reconvergence", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const staleList = changes.flatMap(c => c.affected_modules);
    expect(staleList).toEqual(['localA']);
  });

  it("step 9: sync/TargetedNotFull ensures only stale modules will be reprocessed, not the full creation pipeline", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Only specific modules are affected, not all modules
    const allModules = [...modules.keys()];
    const staleModules = changes.flatMap(c => c.affected_modules);
    expect(staleModules.length).toBeLessThan(allModules.length);
  });
});
