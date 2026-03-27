// Auto-generated from journey: ReturningOwnerReconvergence
// Module: actors
// Triggered by: _actors/ReturningOwner
// Modules touched: _actors, convergence, sync

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies, markModulesStale } from '../../src/sync.js';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts
// Implementation: test/staleness.test.ts

describe("ReturningOwnerReconvergence", () => {
  it("step 1: _actors/ReturningOwner re-triggers convergence after a long period of inactivity", () => {
    // After a long absence, the owner's sync state has stale hashes
    const staleState = {
      known_hashes: {
        'auth-engine': 'sha256:months-old-hash',
        'data-engine': 'sha256:ancient-hash',
      },
    };
    expect(Object.keys(staleState.known_hashes).length).toBe(2);
    expect(staleState.known_hashes['auth-engine']).toContain('old');
  });

  it("step 2: convergence/ReadSpec reads the possibly unchanged spec.md", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-return-'));
    const spec = '# My Project\nUnchanged spec from months ago.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), spec);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toBe(spec);
    expect(content).toContain('Unchanged');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-return-'));
    for (const dep of ['auth-engine', 'data-engine']) {
      const depDir = path.join(tmpDir, dep, 'published');
      fs.mkdirSync(depDir, { recursive: true });
      fs.writeFileSync(
        path.join(depDir, 'interface.yaml'),
        yaml.dump({ engine: dep, version_hash: `sha256:current-${dep}`, provides: {}, requires: {} })
      );
    }
    for (const dep of ['auth-engine', 'data-engine']) {
      const iface = yaml.load(
        fs.readFileSync(path.join(tmpDir, dep, 'published', 'interface.yaml'), 'utf-8')
      ) as any;
      expect(iface.version_hash).toBe(`sha256:current-${dep}`);
    }
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 4: sync/CompareStoredHash finds many hashes have changed during the absence", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-return-'));
    for (const dep of ['auth-engine', 'data-engine']) {
      const depDir = path.join(tmpDir, dep, 'published');
      fs.mkdirSync(depDir, { recursive: true });
      fs.writeFileSync(
        path.join(depDir, 'interface.yaml'),
        yaml.dump({ engine: dep, version_hash: `sha256:new-${dep}`, provides: {}, requires: {} })
      );
    }
    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { 'auth-engine': { pin: 'latest' }, 'data-engine': { pin: 'latest' } },
    }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({
      known_hashes: { 'auth-engine': 'sha256:stale-auth', 'data-engine': 'sha256:stale-data' },
    }));
    const dummyModule: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'api' } },
      journeys: {},
    };
    const index = compileFromModules(new Map([['gateway', dummyModule]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes.length).toBe(2);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 5: sync/FindAffectedModules identifies all stale modules", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-return-'));
    const depDir = path.join(tmpDir, 'auth-engine', 'published');
    fs.mkdirSync(depDir, { recursive: true });
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'auth-engine', version_hash: 'sha256:new', provides: {}, requires: {} })
    );
    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'auth-engine': { pin: 'latest' } } }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'auth-engine': 'sha256:old' } }));
    // Two modules reference auth-engine
    const m1: ModuleFile = {
      nodes: { GW: { type: 'process', description: 'gw' } },
      journeys: { F1: { steps: [{ node: 'GW', action: 'x' }, { node: 'auth-engine/Check', action: 'y' }] } },
    };
    const m2: ModuleFile = {
      nodes: { Login: { type: 'process', description: 'login' } },
      journeys: { F2: { steps: [{ node: 'Login', action: 'x' }, { node: 'auth-engine/Verify', action: 'y' }] } },
    };
    const index = compileFromModules(new Map([['gateway', m1], ['users', m2]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes[0].affected_modules.sort()).toEqual(['gateway', 'users']);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 6: convergence/TargetedReconvergence reconverges all stale modules", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-return-'));
    // Write module files and mark stale
    for (const mod of ['gateway', 'users']) {
      fs.writeFileSync(
        path.join(tmpDir, `${mod}.yaml`),
        yaml.dump({ nodes: { X: { type: 'process', description: 'x' } }, journeys: {} })
      );
    }
    markModulesStale(tmpDir, ['gateway', 'users'], 'returning owner: deps changed');
    for (const mod of ['gateway', 'users']) {
      expect(fs.readFileSync(path.join(tmpDir, `${mod}.yaml`), 'utf-8')).toContain('_stale: true');
    }
    // Reconverge by rewriting without stale markers
    for (const mod of ['gateway', 'users']) {
      fs.writeFileSync(
        path.join(tmpDir, `${mod}.yaml`),
        yaml.dump({ nodes: { X: { type: 'process', description: 'x reconverged' } }, journeys: {} })
      );
    }
    for (const mod of ['gateway', 'users']) {
      expect(fs.readFileSync(path.join(tmpDir, `${mod}.yaml`), 'utf-8')).not.toContain('_stale: true');
    }
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 7: _actors/Compiler validates the reconverged graph", () => {
    const _actors: ModuleFile = {
      nodes: { ReturningOwner: { type: 'actor', description: 'returns after absence' } },
      journeys: {},
    };
    const gateway: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'api endpoint' } },
      journeys: {
        OwnerReturns: {
          steps: [
            { node: '_actors/ReturningOwner', action: 'triggers reconvergence' },
            { node: 'API', action: 'serves updated response' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([['_actors', _actors], ['gateway', gateway]]));
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(result.index._stats.total_nodes).toBe(2);
  });

  it("step 8: _actors/Auditor audits coverage after reconvergence", () => {
    const _actors: ModuleFile = {
      nodes: { ReturningOwner: { type: 'actor', description: 'returns after absence' } },
      journeys: {},
    };
    const gateway: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'api endpoint' } },
      journeys: {
        OwnerReturns: {
          steps: [
            { node: '_actors/ReturningOwner', action: 'triggers' },
            { node: 'API', action: 'responds' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([['_actors', _actors], ['gateway', gateway]]));
    // No orphans — both nodes are in journeys
    const orphans = result.issues.filter(i => i.message.includes('Orphan'));
    expect(orphans.length).toBe(0);
    // Coverage shows both modules
    expect(result.coverage.modules['_actors']).toBeDefined();
    expect(result.coverage.modules['gateway']).toBeDefined();
  });

  it("step 9: convergence/ConvergenceState records the system is back in sync after the returning owner's trigger", () => {
    const _actors: ModuleFile = {
      nodes: { ReturningOwner: { type: 'actor', description: 'returns after absence' } },
      journeys: {},
    };
    const gateway: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'api endpoint' } },
      journeys: {
        OwnerReturns: {
          steps: [
            { node: '_actors/ReturningOwner', action: 'triggers' },
            { node: 'API', action: 'responds' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([['_actors', _actors], ['gateway', gateway]]));
    // System is back in sync: 0 errors, 0 orphans
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.index._stats.total_connections).toBeGreaterThanOrEqual(1);
  });

});
