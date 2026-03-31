// Auto-generated from journey: DeprecatedModuleCleanup
// Module: actors
// Triggered by: _actors/DeprecatedModule
// Modules touched: _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DeprecatedModuleCleanup", () => {
  it("step 1: _actors/DeprecatedModule exists on disk but is no longer relevant to the current spec", () => {
    // A module exists but no journeys reference its nodes
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deprecated-'));
    fs.writeFileSync(path.join(tmpDir, 'legacy.yaml'), yaml.dump({
      nodes: {
        OldFeature: { type: 'process', description: 'A deprecated feature' },
        OldStore: { type: 'artifact', description: 'Legacy data store' },
      },
    }));
    expect(fs.existsSync(path.join(tmpDir, 'legacy.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 2: compilation/OrphanDetection detects that the module's nodes are no longer referenced by any journey", () => {
    // Module with nodes but no journeys = all nodes are orphans
    const modules = new Map<string, ModuleFile>([
      ['legacy', {
        nodes: {
          OldFeature: { type: 'process', description: 'Deprecated feature' },
          OldStore: { type: 'artifact', description: 'Legacy store' },
        },
      }],
      ['active', {
        nodes: {
          NewFeature: { type: 'process', description: 'Active feature' },
        },
        journeys: {
          UseNew: {
            steps: [{ node: 'NewFeature', action: 'does new thing' }],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Legacy nodes are orphans — not in any journey
    expect(result.coverage.orphans).toContain('legacy/OldFeature');
    expect(result.coverage.orphans).toContain('legacy/OldStore');
  });

  it("step 3: compilation/IsolatedModuleDetection detects that the module has zero cross-module connections", () => {
    // Isolation detection requires >3 nodes in the module
    const modules = new Map<string, ModuleFile>([
      ['legacy', {
        nodes: {
          OldFeature: { type: 'process', description: 'Deprecated feature' },
          OldStore: { type: 'artifact', description: 'Legacy store' },
          OldApi: { type: 'interface', description: 'Legacy API' },
          OldRule: { type: 'rule', description: 'Legacy rule' },
        },
      }],
      ['active', {
        nodes: {
          NewFeature: { type: 'process', description: 'Active' },
        },
        journeys: {
          UseNew: {
            steps: [{ node: 'NewFeature', action: 'does work' }],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Legacy module has >3 nodes and 0 cross-module connections → isolated
    expect(result.coverage.modules['legacy'].cross_module_connections).toBe(0);
    expect(result.coverage.isolated_modules).toContain('legacy');
  });

  it("step 4: compilation/CompilationResult reports the module as both orphaned and isolated", () => {
    const modules = new Map<string, ModuleFile>([
      ['legacy', {
        nodes: {
          OldFeature: { type: 'process', description: 'Deprecated feature' },
          OldStore: { type: 'artifact', description: 'Legacy store' },
          OldApi: { type: 'interface', description: 'Legacy API' },
          OldRule: { type: 'rule', description: 'Legacy rule' },
        },
      }],
      ['active', {
        nodes: {
          NewFeature: { type: 'process', description: 'Active' },
        },
        journeys: {
          UseNew: {
            steps: [{ node: 'NewFeature', action: 'does work' }],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Stats reflect the orphans and isolation
    expect(result.index._stats.orphans).toBeGreaterThanOrEqual(4); // all 4 legacy nodes
    expect(result.index._stats.isolated_modules).toBeGreaterThanOrEqual(1);
    // Coverage reports match
    expect(result.coverage.orphans.length).toBeGreaterThanOrEqual(4);
    expect(result.coverage.isolated_modules).toContain('legacy');
  });

  it("step 5: _actors/Auditor flags the deprecated module during coverage audit", () => {
    const modules = new Map<string, ModuleFile>([
      ['legacy', {
        nodes: { OldFeature: { type: 'process', description: 'Deprecated' } },
      }],
      ['active', {
        nodes: { NewFeature: { type: 'process', description: 'Active' } },
        journeys: {
          UseNew: { steps: [{ node: 'NewFeature', action: 'works' }] },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Coverage report shows legacy module has 0 journeys, 0 connections
    const legacyCov = result.coverage.modules['legacy'];
    expect(legacyCov).toBeDefined();
    expect(legacyCov.journeys).toBe(0);
    expect(legacyCov.connections).toBe(0);
    expect(legacyCov.cross_module_connections).toBe(0);
  });

  it("step 6: convergence/AuditGapFix targeted fix removes or archives the deprecated module", () => {
    // Simulate removing the deprecated module file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deprecated-'));
    fs.writeFileSync(path.join(tmpDir, 'legacy.yaml'), yaml.dump({
      nodes: { OldFeature: { type: 'process', description: 'Deprecated' } },
    }));
    fs.writeFileSync(path.join(tmpDir, 'active.yaml'), yaml.dump({
      nodes: { NewFeature: { type: 'process', description: 'Active' } },
      journeys: {
        UseNew: { steps: [{ node: 'NewFeature', action: 'works' }] },
      },
    }));

    // Before removal: 2 modules
    let result = compile(tmpDir);
    expect(result.index._stats.modules).toBe(2);

    // Remove deprecated module
    fs.unlinkSync(path.join(tmpDir, 'legacy.yaml'));

    // After removal: 1 module, 0 orphans, 0 isolated
    result = compile(tmpDir);
    expect(result.index._stats.modules).toBe(1);
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.isolated_modules).toBe(0);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
