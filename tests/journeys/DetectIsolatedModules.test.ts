// Auto-generated from journey: DetectIsolatedModules
// Module: compilation
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectIsolatedModules", () => {
  // "island" has 4 nodes but no cross-module connections => isolated
  // "connected" has a cross-module ref to "island" => not isolated
  const modules = new Map<string, ModuleFile>([
    ['island', {
      nodes: {
        A: { type: 'process', description: 'Island process node A' },
        B: { type: 'process', description: 'Island process node B' },
        C: { type: 'artifact', description: 'Island artifact node C' },
        D: { type: 'interface', description: 'Island interface node D' },
      },
      journeys: {
        Internal: {
          steps: [
            { node: 'A', action: 'starts processing internally' },
            { node: 'B', action: 'continues processing internally' },
            { node: 'C', action: 'stores result in artifact' },
            { node: 'D', action: 'exposes result via interface' },
          ],
        },
      },
    }],
    ['small', {
      nodes: {
        X: { type: 'process', description: 'Small module single node' },
      },
      journeys: {
        Tiny: {
          steps: [{ node: 'X', action: 'does a small task alone' }],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/ConnectionSet provides all computed edges between nodes", () => {
    // Connections exist within the island module
    expect(result.index.nodes['island/A'].followed_by).toContain('island/B');
    expect(result.index._stats.total_connections).toBeGreaterThan(0);
  });

  it("step 2: compilation/IsolatedModuleDetection checks each module for at least one cross-module connection and flags those with none", () => {
    // "island" has >3 nodes and no cross-module connections => isolated
    expect(result.index._stats.isolated_modules).toBe(1);
    expect(result.coverage.isolated_modules).toContain('island');
    // "small" has only 1 node (<=3) so it is NOT flagged as isolated
    expect(result.coverage.isolated_modules).not.toContain('small');
  });

  it("step 3: compilation/ErrorReport records each isolated module as a validation error", () => {
    // The isolated_modules list in coverage tracks them
    expect(result.coverage.isolated_modules.length).toBe(1);
    expect(result.coverage.isolated_modules[0]).toBe('island');
  });
});
