// Auto-generated from journey: DeprecatedModuleCleanup
// Module: actors
// Triggered by: _actors/DeprecatedModule
// Modules touched: _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildDeprecatedModules(opts?: { isolated?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      DeprecatedModule: { type: 'actor', description: 'Exists on disk but is no longer relevant to the current spec' },
      Auditor: { type: 'actor', description: 'Flags the deprecated module during coverage audit' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      OrphanDetection: { type: 'process', description: 'Detects nodes no longer referenced by any journey' },
      IsolatedModuleDetection: { type: 'process', description: 'Detects modules with zero cross-module connections' },
      CompilationResult: { type: 'artifact', description: 'Reports the module as both orphaned and isolated' },
    },
    journeys: {
      DeprecatedModuleCleanup: {
        steps: [
          { node: '_actors/DeprecatedModule', action: 'exists on disk but is no longer relevant to the current spec' },
          { node: 'OrphanDetection', action: 'detects that the module nodes are no longer referenced by any journey' },
          { node: 'IsolatedModuleDetection', action: 'detects that the module has zero cross-module connections' },
          { node: 'CompilationResult', action: 'reports the module as both orphaned and isolated' },
          { node: '_actors/Auditor', action: 'flags the deprecated module during coverage audit' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix removes or archives the deprecated module' },
        ],
      },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix removes or archives the deprecated module' },
    },
    journeys: {},
  });

  // A deprecated module that is completely isolated — no cross-module refs
  // Must have > 3 nodes to trigger isolated_modules detection
  if (opts?.isolated) {
    modules.set('deprecated', {
      nodes: {
        OldFeature: { type: 'process', description: 'An old feature no one uses' },
        OldData: { type: 'artifact', description: 'Old data store' },
        OldConfig: { type: 'artifact', description: 'Old config file' },
        OldValidation: { type: 'process', description: 'Old validation step' },
      },
      journeys: {
        OldInternalFlow: {
          steps: [
            { node: 'OldFeature', action: 'does something old' },
            { node: 'OldData', action: 'stores old data' },
            { node: 'OldConfig', action: 'reads old config' },
            { node: 'OldValidation', action: 'validates old data' },
          ],
        },
      },
    });
  }

  return modules;
}

describe("DeprecatedModuleCleanup", () => {
  const modules = buildDeprecatedModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DeprecatedModuleCleanup'];

  it("step 1: _actors/DeprecatedModule exists on disk but is no longer relevant to the current spec", () => {
    const node = result.index.nodes['_actors/DeprecatedModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: compilation/OrphanDetection detects that the module's nodes are no longer referenced by any journey", () => {
    const node = result.index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/DeprecatedModule');
  });

  it("connection: _actors/DeprecatedModule → compilation/OrphanDetection", () => {
    const from = result.index.nodes['_actors/DeprecatedModule'];
    expect(from.followed_by).toContain('compilation/OrphanDetection');
  });

  it("step 3: compilation/IsolatedModuleDetection detects that the module has zero cross-module connections", () => {
    const node = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/OrphanDetection');
  });

  it("connection: compilation/OrphanDetection → compilation/IsolatedModuleDetection", () => {
    const from = result.index.nodes['compilation/OrphanDetection'];
    expect(from.followed_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("step 4: compilation/CompilationResult reports the module as both orphaned and isolated", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("connection: compilation/IsolatedModuleDetection → compilation/CompilationResult", () => {
    const from = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: _actors/Auditor flags the deprecated module during coverage audit", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → _actors/Auditor", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 6: convergence/AuditGapFix targeted fix removes or archives the deprecated module", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → convergence/AuditGapFix", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("isolated module with no cross-module connections is detected", () => {
    const isoModules = buildDeprecatedModules({ isolated: true });
    const isoResult = compileFromModules(isoModules);
    // The 'deprecated' module has only internal journeys — should be flagged as isolated
    expect(isoResult.index._stats.isolated_modules).toBeGreaterThan(0);
    // The deprecated module's coverage should show 0 cross-module connections
    const depCov = isoResult.coverage.modules['deprecated'];
    expect(depCov).toBeDefined();
    expect(depCov.cross_module_connections).toBe(0);
  });

  it("journey actor is DeprecatedModule", () => {
    expect(journey.actor).toBe('_actors/DeprecatedModule');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
