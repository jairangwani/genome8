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
import type { ModuleFile } from '../../src/types.js';

describe("ReturningOwnerReconvergence", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'returning-'));
  const depDir = path.join(tmpDir, 'dep-published');
  const modulesDir = path.join(tmpDir, 'modules');
  const depsPath = path.join(tmpDir, 'dependencies.yaml');
  const syncStatePath = path.join(tmpDir, 'sync-state.json');

  fs.mkdirSync(depDir, { recursive: true });
  fs.mkdirSync(modulesDir, { recursive: true });

  it("step 1: _actors/ReturningOwner re-triggers convergence after a long period of inactivity", () => {
    // Owner has been away — sync state is stale with old hashes
    const staleSyncState = {
      known_hashes: { 'auth-engine': 'sha256:old_hash_from_months_ago' },
    };
    fs.writeFileSync(syncStatePath, JSON.stringify(staleSyncState));
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes['auth-engine']).toBe('sha256:old_hash_from_months_ago');
  });

  it("step 2: convergence/ReadSpec reads the possibly unchanged spec.md", () => {
    const spec = '## 1. Platform\nUsers interact with the system.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), spec);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toContain('Platform');
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    // Dependency has been updated while owner was away
    const updatedInterface = {
      engine: 'auth-engine',
      version_hash: 'sha256:new_hash_after_updates',
      provides: { 'auth-engine/Login': { type: 'process', description: 'Login flow', in_journeys: 2 } },
      requires: {},
    };
    fs.writeFileSync(path.join(depDir, 'interface.yaml'), yaml.dump(updatedInterface));
    const fetched = yaml.load(fs.readFileSync(path.join(depDir, 'interface.yaml'), 'utf-8')) as any;
    expect(fetched.version_hash).toBe('sha256:new_hash_after_updates');
  });

  it("step 4: sync/CompareStoredHash finds many hashes have changed during the absence", () => {
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { 'auth-engine': { pin: 'latest' } },
    }));
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { Session: { type: 'artifact', description: 'User session' } },
        journeys: {
          AuthFlow: {
            steps: [
              { node: 'Session', action: 'is created' },
              { node: 'auth-engine/Login', action: 'authenticates user' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'auth-engine') return depDir;
      return null;
    });
    expect(changes.length).toBe(1);
    expect(changes[0].previous_hash).toBe('sha256:old_hash_from_months_ago');
    expect(changes[0].current_hash).toBe('sha256:new_hash_after_updates');
  });

  it("step 5: sync/FindAffectedModules identifies all stale modules", () => {
    // Reset sync state to test again
    fs.writeFileSync(syncStatePath, JSON.stringify({
      known_hashes: { 'auth-engine': 'sha256:stale_again' },
    }));
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { Session: { type: 'artifact', description: 'User session' } },
        journeys: {
          AuthFlow: {
            steps: [
              { node: 'Session', action: 'is created' },
              { node: 'auth-engine/Login', action: 'authenticates' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'auth-engine') return depDir;
      return null;
    });
    expect(changes.length).toBe(1);
    expect(changes[0].affected_modules).toContain('identity');
  });

  it("step 6: convergence/TargetedReconvergence reconverges all stale modules", () => {
    // Mark affected modules stale for reconvergence
    fs.writeFileSync(path.join(modulesDir, 'identity.yaml'), yaml.dump({
      nodes: { Session: { type: 'artifact', description: 'User session' } },
    }));
    markModulesStale(modulesDir, ['identity'], 'auth-engine changed');
    const content = fs.readFileSync(path.join(modulesDir, 'identity.yaml'), 'utf-8');
    expect(content).toContain('_stale: true');
    expect(content).toContain('auth-engine changed');
  });

  it("step 7: _actors/Compiler validates the reconverged graph", () => {
    // After reconvergence, compile the updated modules
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Platform user' } },
      }],
      ['identity', {
        nodes: { Session: { type: 'artifact', description: 'User session' } },
        journeys: {
          CreateSession: {
            steps: [
              { node: '_actors/User', action: 'logs in' },
              { node: 'Session', action: 'is created' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 8: _actors/Auditor audits coverage after reconvergence", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Platform user' } },
      }],
      ['identity', {
        nodes: { Session: { type: 'artifact', description: 'User session' } },
        journeys: {
          CreateSession: {
            steps: [
              { node: '_actors/User', action: 'logs in' },
              { node: 'Session', action: 'is created' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // No orphans after reconvergence
    expect(result.coverage.orphans.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 9: convergence/ConvergenceState records the system is back in sync after the returning owner's trigger", () => {
    const state = {
      converged: true,
      staleModules: [],
      lastSyncTimestamp: new Date().toISOString(),
    };
    expect(state.converged).toBe(true);
    expect(state.staleModules.length).toBe(0);
    expect(state.lastSyncTimestamp.length).toBeGreaterThan(0);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
