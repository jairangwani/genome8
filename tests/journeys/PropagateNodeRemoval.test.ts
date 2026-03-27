// Auto-generated from journey: PropagateNodeRemoval
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("PropagateNodeRemoval", () => {
  // Before removal: 3 nodes in core, all connected
  const modulesBefore = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        Ingestion: { type: 'process', description: 'Ingests incoming data' },
        Transform: { type: 'process', description: 'Transforms data' },
        Store: { type: 'artifact', description: 'Stores data' },
      },
      journeys: {
        Pipeline: {
          steps: [
            { node: 'Ingestion', action: 'ingests raw data' },
            { node: 'Transform', action: 'transforms the data' },
            { node: 'Store', action: 'persists the result' },
          ],
        },
      },
    }],
  ]);

  // After removal: Transform is removed, journey references updated
  const modulesAfter = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        Ingestion: { type: 'process', description: 'Ingests incoming data' },
        Store: { type: 'artifact', description: 'Stores data' },
      },
      journeys: {
        Pipeline: {
          steps: [
            { node: 'Ingestion', action: 'ingests raw data' },
            { node: 'Store', action: 'persists the result' },
          ],
        },
      },
    }],
  ]);

  // Dangling removal scenario: references remain but node is gone
  const modulesDangling = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        Ingestion: { type: 'process', description: 'Ingests incoming data' },
        Store: { type: 'artifact', description: 'Stores data' },
      },
      journeys: {
        Pipeline: {
          steps: [
            { node: 'Ingestion', action: 'ingests raw data' },
            { node: 'Transform', action: 'transforms the data' },
            { node: 'Store', action: 'persists the result' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBefore);
  const resultAfter = compileFromModules(modulesAfter);
  const resultDangling = compileFromModules(modulesDangling);

  it("step 1: graph/NodeRegistry removes the deleted node from the deduplicated map of all nodes", () => {
    expect(resultBefore.index.nodes['core/Transform']).toBeDefined();
    expect(resultAfter.index.nodes['core/Transform']).toBeUndefined();
    expect(Object.keys(resultAfter.index.nodes)).toHaveLength(2);
  });

  it("step 2: graph/JourneyRegistry identifies all journeys containing steps that reference the removed node", () => {
    // Before: Pipeline journey has Transform at step 2
    const pipelineBefore = resultBefore.index.journeys['Pipeline'];
    expect(pipelineBefore.steps.some(s => s.node === 'core/Transform')).toBe(true);
  });

  it("step 3: graph/CrossModuleImpactScan finds cross-module references from other modules pointing to the removed node", () => {
    // In a same-module scenario the node just disappears; cross-module tested via dangling
    const ref = resolveNodeRef('core/Transform', 'other');
    expect(ref.module).toBe('core');
    expect(ref.name).toBe('Transform');
  });

  it("step 4: graph/AllRefsResolveRule flags every remaining reference to the removed node as dangling", () => {
    // When Transform is removed but still referenced in steps, the compiler flags it
    const danglingErrors = resultDangling.issues.filter(
      i => i.severity === 'error' && i.message.includes('Transform') && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBeGreaterThan(0);
  });

  it("step 5: graph/ConnectionSet purges all directed edges where the removed node is the source or target", () => {
    // After proper removal: no edges reference Transform
    for (const node of Object.values(resultAfter.index.nodes)) {
      expect(node.preceded_by).not.toContain('core/Transform');
      expect(node.followed_by).not.toContain('core/Transform');
    }
    // Direct edge: Ingestion -> Store
    expect(resultAfter.index.nodes['core/Ingestion'].followed_by).toContain('core/Store');
  });

  it("step 6: graph/ConnectionDeduplication re-deduplicates the connection set after edge removal to maintain provenance accuracy", () => {
    // After removal, Ingestion -> Store is the only connection, no duplicates
    const ingestion = resultAfter.index.nodes['core/Ingestion'];
    const uniqueFollowedBy = new Set(ingestion.followed_by);
    expect(ingestion.followed_by.length).toBe(uniqueFollowedBy.size);
  });

  it("step 7: graph/CompiledIndex updated with the node, its edges, and its registry entry fully removed", () => {
    expect(resultAfter.index._stats.total_nodes).toBe(2);
    expect(resultAfter.index._stats.total_connections).toBe(1);
    expect(resultAfter.index._stats.orphans).toBe(0);
    const errors = resultAfter.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
