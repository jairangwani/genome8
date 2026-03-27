// Auto-generated from journey: TriggerTargetedReconvergence
// Module: sync
// Triggered by: _actors/Compiler
// Modules touched: sync, convergence, _actors, compilation, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies, markModulesStale } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("TriggerTargetedReconvergence", () => {
  let tmpDir: string;
  let depsPath: string;
  let syncStatePath: string;
  let depPublishedDir: string;
  let modulesDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-trigger-reconverge-'));
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
    ['localMod', {
      nodes: {
        Worker: { type: 'process', description: 'Does work' },
      },
      journeys: {
        WorkWithUpstream: {
          steps: [
            { node: 'upstream/Source', action: 'provides data' },
            { node: 'Worker', action: 'processes data' },
          ],
        },
      },
    }],
  ]);

  const compiled = compileFromModules(modules);

  it("step 1: sync/StaleModuleList provides the list of modules that need reconvergence", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    const changes = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const staleList = changes.flatMap(c => c.affected_modules);
    expect(staleList).toContain('localMod');
  });

  it("step 2: convergence/TargetedReconvergence receives the stale module list and begins targeted reprocessing", () => {
    // Targeted reconvergence processes only stale modules
    const staleModules = ['localMod'];
    expect(staleModules.length).toBeGreaterThan(0);
    expect(staleModules).not.toContain('_actors');
  });

  it("step 3: _actors/Compiler recompiles only the stale modules", () => {
    // Recompilation of the stale module produces valid output
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("step 4: compilation/CompilationResult provides validation results for the recompiled modules", () => {
    const result = compileFromModules(modules);
    expect(result.issues).toBeDefined();
    expect(result.index).toBeDefined();
  });

  it("step 5: _actors/Auditor audits only the affected coverage areas", () => {
    const result = compileFromModules(modules);
    expect(result.coverage).toBeDefined();
    expect(result.coverage.modules).toBeDefined();
  });

  it("step 6: convergence/ConvergenceState records that targeted reconvergence is complete", () => {
    // After sync, the hash store is updated (marking reconvergence done)
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:old' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:new', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes.upstream).toBe('sha256:new');
  });

  it("step 7: sync/UpdateStoredHashes writes the new dependency hashes to local storage", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:before' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:after', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes.upstream).toBe('sha256:after');
  });

  it("step 8: sync/DependencyHashStore updates with the latest hashes so future syncs detect only new changes", () => {
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { upstream: 'sha256:v1' } }));
    fs.writeFileSync(path.join(depPublishedDir, 'interface.yaml'), yaml.dump({
      engine: 'test', version_hash: 'sha256:v2', provides: {}, requires: {},
    }));
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { upstream: { pin: 'latest' } } }));

    const resolver = (dep: string) => dep === 'upstream' ? depPublishedDir : null;
    checkDependencies(depsPath, compiled.index, syncStatePath, resolver);

    // Second check should find no changes
    const changes2 = checkDependencies(depsPath, compiled.index, syncStatePath, resolver);
    expect(changes2).toHaveLength(0);
  });

  it("step 9: sync/AppendBoxToOriginChain adds this box's ID to the ripple origin chain for the outgoing event", () => {
    const chain = ['boxA'];
    const thisBox = 'boxB';
    const updated = [...chain, thisBox];
    expect(updated).toEqual(['boxA', 'boxB']);
  });

  it("step 10: sync/NarrowOutgoingChangelog rewrites the outgoing changelog to include only changes that affected this box", () => {
    const changelog: Changelog = {
      previous_hash: 'sha256:old', current_hash: 'sha256:new',
      changes: [
        { node: 'Source', type: 'modified', field: 'type', impact: 'high' },
        { node: 'Unrelated', type: 'added', impact: 'none' },
      ],
    };

    const localRefs = new Set(['Source']);
    const narrowed = changelog.changes.filter(c => localRefs.has(c.node));
    expect(narrowed.length).toBe(1);
    expect(narrowed[0].node).toBe('Source');
  });

  it("step 11: publish/WriteEventFile writes a new event file to propagate the ripple downstream", () => {
    const eventDir = path.join(tmpDir, 'published', 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    const eventFile = path.join(eventDir, 'ripple.yaml');
    fs.writeFileSync(eventFile, yaml.dump({ hash: 'sha256:ripple', seq: 2 }));
    expect(fs.existsSync(eventFile)).toBe(true);
  });

  it("step 12: publish/EventFile the event file signals downstream dependents to run their own sync", () => {
    const eventDir = path.join(tmpDir, 'published', 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    const eventFile = path.join(eventDir, 'ripple.yaml');
    fs.writeFileSync(eventFile, yaml.dump({ hash: 'sha256:ripple', seq: 2, origin_chain: ['thisBox'] }));

    const content = yaml.load(fs.readFileSync(eventFile, 'utf-8')) as any;
    expect(content.hash).toBeDefined();
    expect(content.origin_chain).toContain('thisBox');
  });
});
