// Auto-generated from journey: DeprecatedModuleCleanup
// Module: actors
// Triggered by: _actors/DeprecatedModule
// Modules touched: _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts
// Implementation: test/pando8.test.ts
// Implementation: test/pando9.test.ts

// A deprecated module with nodes but no journeys referencing them
const deprecatedModule: ModuleFile = {
  nodes: {
    OldHandler: { type: 'process', description: 'legacy request handler — no longer used' },
    OldStore: { type: 'artifact', description: 'legacy data store — deprecated' },
    OldValidator: { type: 'rule', description: 'legacy validation rule — superseded' },
    OldEndpoint: { type: 'interface', description: 'legacy endpoint — retired' },
  },
  journeys: {},
};

// An active module that has journeys
const activeModule: ModuleFile = {
  nodes: {
    NewHandler: { type: 'process', description: 'current request handler' },
    NewStore: { type: 'artifact', description: 'current data store' },
  },
  journeys: {
    HandleRequest: {
      steps: [
        { node: 'NewHandler', action: 'processes request' },
        { node: 'NewStore', action: 'stores result' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['deprecated', deprecatedModule],
  ['active', activeModule],
]));

describe("DeprecatedModuleCleanup", () => {
  it("step 1: _actors/DeprecatedModule exists on disk but is no longer relevant to the current spec", () => {
    // The deprecated module is compiled and present in the index
    expect(result.coverage.modules['deprecated']).toBeDefined();
    expect(result.coverage.modules['deprecated'].nodes).toBe(4);
    // But it has zero journeys
    expect(result.coverage.modules['deprecated'].journeys).toBe(0);
  });

  it("step 2: compilation/OrphanDetection detects that the module's nodes are no longer referenced by any journey", () => {
    // All 4 deprecated nodes are orphans — not in any journey
    const orphanWarnings = result.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan') && i.module === 'deprecated'
    );
    expect(orphanWarnings.length).toBe(4);
    for (const name of ['OldHandler', 'OldStore', 'OldValidator', 'OldEndpoint']) {
      expect(orphanWarnings.some(w => w.message.includes(name))).toBe(true);
    }
  });

  it("step 3: compilation/IsolatedModuleDetection detects that the module has zero cross-module connections", () => {
    // The deprecated module has zero cross-module connections
    expect(result.coverage.modules['deprecated'].cross_module_connections).toBe(0);
    // It's isolated — has > 3 nodes and zero cross-module connections
    expect(result.index._stats.isolated_modules).toBeGreaterThanOrEqual(1);
    // Check that active module is NOT isolated
    expect(result.coverage.modules['active'].cross_module_connections).toBe(0);
    // Active module has 2 nodes (≤3) so isolation check doesn't apply
    expect(result.coverage.modules['active'].nodes).toBe(2);
  });

  it("step 4: compilation/CompilationResult reports the module as both orphaned and isolated", () => {
    // Stats confirm orphans and isolated modules exist
    expect(result.index._stats.orphans).toBeGreaterThanOrEqual(4);
    expect(result.index._stats.isolated_modules).toBeGreaterThanOrEqual(1);
    // The deprecated module's coverage shows it's disconnected
    const depCov = result.coverage.modules['deprecated'];
    expect(depCov.connections).toBe(0);
    expect(depCov.cross_module_connections).toBe(0);
    expect(depCov.journeys).toBe(0);
  });

  it("step 5: _actors/Auditor flags the deprecated module during coverage audit", () => {
    // Coverage report lists orphan nodes
    expect(result.coverage.orphans.length).toBeGreaterThanOrEqual(4);
    // All deprecated nodes appear in orphans list
    for (const name of ['OldHandler', 'OldStore', 'OldValidator', 'OldEndpoint']) {
      expect(result.coverage.orphans.some(o => o.includes(name))).toBe(true);
    }
    // The deprecated module appears in isolated_modules
    expect(result.coverage.isolated_modules).toContain('deprecated');
  });

  it("step 6: convergence/AuditGapFix targeted fix removes or archives the deprecated module", () => {
    // After removing the deprecated module, the graph is clean
    const cleanResult = compileFromModules(new Map([
      ['active', activeModule],
    ]));
    // No orphan warnings
    const orphans = cleanResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    expect(orphans.length).toBe(0);
    // No isolated modules
    expect(cleanResult.index._stats.isolated_modules).toBe(0);
    expect(cleanResult.index._stats.orphans).toBe(0);
    // Only active module remains
    expect(cleanResult.index._stats.modules).toBe(1);
    expect(cleanResult.coverage.modules['deprecated']).toBeUndefined();
  });

});
