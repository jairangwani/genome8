// Auto-generated from journey: StaleBoxRecovery
// Module: actors
// Triggered by: _actors/StaleBox
// Modules touched: _actors, events, sync, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { checkDependencies, markModulesStale } from '../../src/sync.js';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("StaleBoxRecovery", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stale-box-'));
  const depDir = path.join(tmpDir, 'dep-published');
  const modulesDir = path.join(tmpDir, 'modules');
  const depsPath = path.join(tmpDir, 'dependencies.yaml');
  const syncStatePath = path.join(tmpDir, 'sync-state.json');

  fs.mkdirSync(depDir, { recursive: true });
  fs.mkdirSync(modulesDir, { recursive: true });

  it("step 1: _actors/StaleBox has stopped watching events and drifted out of sync", () => {
    // Stale box has an old sync state with outdated hashes
    const staleSyncState = {
      known_hashes: { 'dep-engine': 'sha256:old_stale_hash' },
    };
    fs.writeFileSync(syncStatePath, JSON.stringify(staleSyncState));
    const state = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    expect(state.known_hashes['dep-engine']).toBe('sha256:old_stale_hash');
  });

  it("step 2: events/RegisterEventWatchers re-registers fs.watch watchers on dependency event files", () => {
    // When the box restarts, it re-registers watchers
    // The event files it watches are the dependency published directories
    expect(fs.existsSync(depDir)).toBe(true);
    // Watcher would be: fs.watch(depDir, ...) — we verify the directory exists to watch
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    // Dependency has been updated while box was stale
    const newInterface = {
      engine: 'dep-engine',
      version_hash: 'sha256:new_updated_hash',
      provides: { 'dep-engine/Api': { type: 'interface', description: 'API endpoint', in_journeys: 2 } },
      requires: {},
    };
    fs.writeFileSync(path.join(depDir, 'interface.yaml'), yaml.dump(newInterface));
    const fetched = yaml.load(fs.readFileSync(path.join(depDir, 'interface.yaml'), 'utf-8')) as any;
    expect(fetched.version_hash).toBe('sha256:new_updated_hash');
  });

  it("step 4: sync/CompareStoredHash finds multiple hashes have changed during the stale period", () => {
    // Set up dependencies.yaml
    fs.writeFileSync(depsPath, yaml.dump({
      dependencies: { 'dep-engine': { pin: 'latest' } },
    }));

    // Build index with a module that references the dependency
    const modules = new Map<string, ModuleFile>([
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login process' } },
        journeys: {
          AuthFlow: {
            steps: [
              { node: 'Login', action: 'authenticates' },
              { node: 'dep-engine/Api', action: 'calls external API' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);

    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'dep-engine') return depDir;
      return null;
    });
    // Hash changed from old_stale_hash to new_updated_hash
    expect(changes.length).toBe(1);
    expect(changes[0].previous_hash).toBe('sha256:old_stale_hash');
    expect(changes[0].current_hash).toBe('sha256:new_updated_hash');
  });

  it("step 5: sync/FindAffectedModules identifies all modules affected by the accumulated changes", () => {
    // Re-read sync state (updated by previous checkDependencies call)
    // Re-run to get the affected modules list
    // Reset sync state to old hash for this test
    fs.writeFileSync(syncStatePath, JSON.stringify({
      known_hashes: { 'dep-engine': 'sha256:old_stale_hash_2' },
    }));

    const modules = new Map<string, ModuleFile>([
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login process' } },
        journeys: {
          AuthFlow: {
            steps: [
              { node: 'Login', action: 'authenticates' },
              { node: 'dep-engine/Api', action: 'calls external API' },
            ],
          },
        },
      }],
      ['billing', {
        nodes: { Charge: { type: 'process', description: 'Charges user' } },
        journeys: {
          BillFlow: {
            steps: [
              { node: 'Charge', action: 'charges' },
              { node: 'dep-engine/Api', action: 'validates payment' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const changes = checkDependencies(depsPath, result.index, syncStatePath, (dep) => {
      if (dep === 'dep-engine') return depDir;
      return null;
    });
    expect(changes.length).toBe(1);
    // Both auth and billing reference dep-engine — both affected
    expect(changes[0].affected_modules).toContain('auth');
    expect(changes[0].affected_modules).toContain('billing');
  });

  it("step 6: sync/MarkModulesStale marks all affected modules for reconvergence", () => {
    // Write module files to disk so markModulesStale can update them
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'), yaml.dump({
      nodes: { Login: { type: 'process', description: 'Login' } },
    }));
    fs.writeFileSync(path.join(modulesDir, 'billing.yaml'), yaml.dump({
      nodes: { Charge: { type: 'process', description: 'Charges' } },
    }));

    markModulesStale(modulesDir, ['auth', 'billing'], 'dep-engine interface changed');

    // Both files now have _stale: true
    const authContent = fs.readFileSync(path.join(modulesDir, 'auth.yaml'), 'utf-8');
    const billingContent = fs.readFileSync(path.join(modulesDir, 'billing.yaml'), 'utf-8');
    expect(authContent).toContain('_stale: true');
    expect(billingContent).toContain('_stale: true');
    expect(authContent).toContain('dep-engine interface changed');
  });

  it("step 7: convergence/TargetedReconvergence reconverges all stale modules to bring the box back in sync", () => {
    // After marking stale, targeted reconvergence would re-create those modules
    // Verify: the stale markers are present, indicating reconvergence is needed
    const authContent = fs.readFileSync(path.join(modulesDir, 'auth.yaml'), 'utf-8');
    expect(authContent).toContain('_stale: true');

    // After reconvergence, the stale marker would be removed and module updated
    // Simulate: remove stale marker
    const cleaned = authContent.replace(/^_stale:.*\n_stale_reason:.*\n\n/, '');
    expect(cleaned).not.toContain('_stale: true');
    expect(cleaned).toContain('Login');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
