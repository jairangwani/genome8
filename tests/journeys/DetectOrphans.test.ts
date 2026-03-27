// Auto-generated from journey: DetectOrphans
// Module: compilation
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectOrphans", () => {
  const modules = new Map<string, ModuleFile>([
    ['core', {
      nodes: {
        UsedNode: { type: 'process', description: 'This node is referenced in a journey' },
        OrphanNode: { type: 'process', description: 'This node is not referenced in any journey' },
      },
      journeys: {
        Flow: {
          steps: [
            { node: 'UsedNode', action: 'performs its task' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/CompiledIndex provides all nodes and all journey steps", () => {
    // Both nodes exist in the compiled index
    expect(result.index.nodes['core/UsedNode']).toBeDefined();
    expect(result.index.nodes['core/OrphanNode']).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(2);
  });

  it("step 2: compilation/OrphanDetection compares node registry against step references and flags unreferenced nodes", () => {
    // OrphanNode has no journey membership, no connections
    const orphan = result.index.nodes['core/OrphanNode'];
    expect(orphan.in_journeys.length).toBe(0);
    expect(orphan.preceded_by.length).toBe(0);
    expect(orphan.followed_by.length).toBe(0);
    expect(result.index._stats.orphans).toBe(1);
  });

  it("step 3: compilation/ErrorReport records each orphan node as a validation error", () => {
    // Orphan detection produces a warning issue
    const orphanIssues = result.issues.filter(i => i.message.includes('Orphan'));
    expect(orphanIssues.length).toBe(1);
    expect(orphanIssues[0].severity).toBe('warning');
    expect(orphanIssues[0].message).toContain('OrphanNode');

    // Also verify it appears in the coverage orphans list
    expect(result.coverage.orphans).toContain('core/OrphanNode');
  });
});
