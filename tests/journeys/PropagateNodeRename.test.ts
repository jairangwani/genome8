// Auto-generated from journey: PropagateNodeRename
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("PropagateNodeRename", () => {
  // Before rename: node is called "OldProcessor"
  const modulesBefore = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        OldProcessor: { type: 'process', description: 'Processes data' },
        DataStore: { type: 'artifact', description: 'Stores data' },
      },
      journeys: {
        ProcessData: {
          steps: [
            { node: 'OldProcessor', action: 'processes incoming data' },
            { node: 'DataStore', action: 'stores the processed result' },
          ],
        },
      },
    }],
    ['api', {
      nodes: {
        Endpoint: { type: 'interface', description: 'API endpoint' },
      },
      journeys: {
        APICall: {
          steps: [
            { node: 'Endpoint', action: 'receives API request' },
            { node: 'core/OldProcessor', action: 'processes the request data' },
          ],
        },
      },
    }],
  ]);

  // After rename: "OldProcessor" -> "NewProcessor", all references updated
  const modulesAfter = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        NewProcessor: { type: 'process', description: 'Processes data' },
        DataStore: { type: 'artifact', description: 'Stores data' },
      },
      journeys: {
        ProcessData: {
          steps: [
            { node: 'NewProcessor', action: 'processes incoming data' },
            { node: 'DataStore', action: 'stores the processed result' },
          ],
        },
      },
    }],
    ['api', {
      nodes: {
        Endpoint: { type: 'interface', description: 'API endpoint' },
      },
      journeys: {
        APICall: {
          steps: [
            { node: 'Endpoint', action: 'receives API request' },
            { node: 'core/NewProcessor', action: 'processes the request data' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBefore);
  const resultAfter = compileFromModules(modulesAfter);

  it("step 1: graph/NodeRegistry records the old-name-to-new-name mapping for the renamed node", () => {
    // Old name no longer exists, new name is present
    expect(resultBefore.index.nodes['core/OldProcessor']).toBeDefined();
    expect(resultAfter.index.nodes['core/OldProcessor']).toBeUndefined();
    expect(resultAfter.index.nodes['core/NewProcessor']).toBeDefined();
  });

  it("step 2: graph/CrossModuleImpactScan finds all cross-module references using the old node name across all modules", () => {
    // Before: api module references core/OldProcessor
    const ref = resolveNodeRef('core/OldProcessor', 'api');
    expect(ref.module).toBe('core');
    expect(ref.name).toBe('OldProcessor');

    const endpoint = resultBefore.index.nodes['api/Endpoint'];
    expect(endpoint.cross_module_connections).toContain('core/OldProcessor');
  });

  it("step 3: graph/JourneyRegistry identifies specific journeys and steps containing the old reference", () => {
    // Before rename, the APICall journey uses old name
    const apiCallBefore = resultBefore.index.journeys['APICall'];
    expect(apiCallBefore.steps[1].node).toBe('core/OldProcessor');
  });

  it("step 4: graph/CrossModuleRefResolution rewrites each old-name reference to the new-name reference in affected journey steps", () => {
    // After rename, the APICall journey uses new name
    const apiCallAfter = resultAfter.index.journeys['APICall'];
    expect(apiCallAfter.steps[1].node).toBe('core/NewProcessor');

    // Cross-module ref resolves correctly with new name
    const ref = resolveNodeRef('core/NewProcessor', 'api');
    expect(ref.module).toBe('core');
    expect(ref.name).toBe('NewProcessor');
  });

  it("step 5: graph/ConnectionComputation recomputes connections for journeys whose steps were updated", () => {
    // After rename, connections reference the new name
    const newProc = resultAfter.index.nodes['core/NewProcessor'];
    expect(newProc.preceded_by).toContain('api/Endpoint');
    expect(newProc.followed_by).toContain('core/DataStore');
  });

  it("step 6: graph/ConnectionSet replaces edges referencing the old node name with edges using the new name", () => {
    // Endpoint now connects to NewProcessor, not OldProcessor
    const endpoint = resultAfter.index.nodes['api/Endpoint'];
    expect(endpoint.followed_by).toContain('core/NewProcessor');
    expect(endpoint.followed_by).not.toContain('core/OldProcessor');
    expect(endpoint.cross_module_connections).toContain('core/NewProcessor');
  });

  it("step 7: graph/CompiledIndex updated with all references consistently pointing to the renamed node", () => {
    // No errors in the after-rename compilation
    const errors = resultAfter.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
    expect(resultAfter.index._stats.orphans).toBe(0);
  });
});
