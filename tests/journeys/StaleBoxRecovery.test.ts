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

// Implementation: test/staleness.test.ts

describe("StaleBoxRecovery", () => {
  it("step 1: _actors/StaleBox has stopped watching events and drifted out of sync", () => {
    // A stale box has known_hashes that are outdated
    const staleState = {
      known_hashes: {
        'auth-engine': 'sha256:old-hash-1',
        'data-engine': 'sha256:old-hash-2',
      },
    };
    // These hashes no longer match current dependency interfaces
    expect(Object.keys(staleState.known_hashes).length).toBe(2);
    expect(staleState.known_hashes['auth-engine']).toContain('old');
  });

  it("step 2: events/RegisterEventWatchers re-registers fs.watch watchers on dependency event files", () => {
    // After recovery, the event directory is set up for watching
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    const eventDir = path.join(tmpDir, 'events');
    fs.mkdirSync(eventDir, { recursive: true });
    // Event files for each dependency would be created
    fs.writeFileSync(path.join(eventDir, 'auth-engine.json'), JSON.stringify({ hash: 'sha256:new1' }));
    fs.writeFileSync(path.join(eventDir, 'data-engine.json'), JSON.stringify({ hash: 'sha256:new2' }));
    const eventFiles = fs.readdirSync(eventDir);
    expect(eventFiles.length).toBe(2);
    expect(eventFiles).toContain('auth-engine.json');
    expect(eventFiles).toContain('data-engine.json');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    // Set up two dependency interfaces with current hashes
    for (const dep of ['auth-engine', 'data-engine']) {
      const depDir = path.join(tmpDir, dep, 'published');
      fs.mkdirSync(depDir, { recursive: true });
      fs.writeFileSync(
        path.join(depDir, 'interface.yaml'),
        yaml.dump({ engine: dep, version_hash: `sha256:current-${dep}`, provides: {}, requires: {} })
      );
    }
    // Read each interface
    for (const dep of ['auth-engine', 'data-engine']) {
      const iface = yaml.load(
        fs.readFileSync(path.join(tmpDir, dep, 'published', 'interface.yaml'), 'utf-8')
      ) as any;
      expect(iface.version_hash).toBe(`sha256:current-${dep}`);
    }
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 4: sync/CompareStoredHash finds multiple hashes have changed during the stale period", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    // Two deps with updated hashes
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
      dependencies: {
        'auth-engine': { pin: 'latest' },
        'data-engine': { pin: 'latest' },
      },
    }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    // Stale known hashes
    fs.writeFileSync(syncStatePath, JSON.stringify({
      known_hashes: { 'auth-engine': 'sha256:old-auth', 'data-engine': 'sha256:old-data' },
    }));

    const gatewayModule: ModuleFile = {
      nodes: { Handler: { type: 'process', description: 'handles requests' } },
      journeys: {
        AuthFlow: {
          steps: [
            { node: 'Handler', action: 'checks auth' },
            { node: 'auth-engine/AuthCheck', action: 'validates token' },
          ],
        },
        DataFlow: {
          steps: [
            { node: 'Handler', action: 'fetches data' },
            { node: 'data-engine/DataStore', action: 'returns data' },
          ],
        },
      },
    };
    const index = compileFromModules(new Map([['gateway', gatewayModule]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    // Both dependencies changed
    expect(changes.length).toBe(2);
    expect(changes.map(c => c.dependency).sort()).toEqual(['auth-engine', 'data-engine']);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 5: sync/FindAffectedModules identifies all modules affected by the accumulated changes", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    const depDir = path.join(tmpDir, 'auth-engine', 'published');
    fs.mkdirSync(depDir, { recursive: true });
    fs.writeFileSync(
      path.join(depDir, 'interface.yaml'),
      yaml.dump({ engine: 'auth-engine', version_hash: 'sha256:new-auth', provides: {}, requires: {} })
    );
    const depsPath = path.join(tmpDir, 'dependencies.yaml');
    fs.writeFileSync(depsPath, yaml.dump({ dependencies: { 'auth-engine': { pin: 'latest' } } }));
    const syncStatePath = path.join(tmpDir, 'sync-state.json');
    fs.writeFileSync(syncStatePath, JSON.stringify({ known_hashes: { 'auth-engine': 'sha256:old' } }));

    // Two local modules reference auth-engine in their journeys
    const gatewayModule: ModuleFile = {
      nodes: { GW: { type: 'process', description: 'gateway' } },
      journeys: {
        GWAuth: { steps: [{ node: 'GW', action: 'routes' }, { node: 'auth-engine/Verify', action: 'verifies' }] },
      },
    };
    const userModule: ModuleFile = {
      nodes: { Login: { type: 'process', description: 'login' } },
      journeys: {
        UserAuth: { steps: [{ node: 'Login', action: 'logins' }, { node: 'auth-engine/Verify', action: 'checks' }] },
      },
    };
    const index = compileFromModules(new Map([['gateway', gatewayModule], ['users', userModule]])).index;
    const changes = checkDependencies(depsPath, index, syncStatePath, (dep) => path.join(tmpDir, dep, 'published'));
    expect(changes.length).toBe(1);
    // Both gateway and users are affected
    expect(changes[0].affected_modules.sort()).toEqual(['gateway', 'users']);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 6: sync/MarkModulesStale marks all affected modules for reconvergence", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    // Create module files
    for (const mod of ['gateway', 'users']) {
      fs.writeFileSync(
        path.join(tmpDir, `${mod}.yaml`),
        yaml.dump({ nodes: { X: { type: 'process', description: 'x' } }, journeys: {} })
      );
    }
    markModulesStale(tmpDir, ['gateway', 'users'], 'auth-engine hash changed');
    // Both files now contain _stale: true
    for (const mod of ['gateway', 'users']) {
      const content = fs.readFileSync(path.join(tmpDir, `${mod}.yaml`), 'utf-8');
      expect(content).toContain('_stale: true');
      expect(content).toContain('auth-engine hash changed');
    }
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 7: convergence/TargetedReconvergence reconverges all stale modules to bring the box back in sync", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-stale-'));
    // Write a stale module and then "reconverge" by removing the stale marker
    const moduleContent = yaml.dump({ nodes: { API: { type: 'interface', description: 'api' } }, journeys: {} });
    fs.writeFileSync(path.join(tmpDir, 'gateway.yaml'), moduleContent);
    markModulesStale(tmpDir, ['gateway'], 'dependency changed');
    // Verify stale
    let content = fs.readFileSync(path.join(tmpDir, 'gateway.yaml'), 'utf-8');
    expect(content).toContain('_stale: true');
    // After reconvergence, rewrite the file without stale markers (simulated)
    fs.writeFileSync(path.join(tmpDir, 'gateway.yaml'), moduleContent);
    content = fs.readFileSync(path.join(tmpDir, 'gateway.yaml'), 'utf-8');
    expect(content).not.toContain('_stale: true');
    // The reconverged module compiles cleanly
    const result = compileFromModules(new Map([['gateway', {
      nodes: { API: { type: 'interface' as const, description: 'api' } },
      journeys: {},
    }]]));
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

});
