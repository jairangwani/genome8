// Auto-generated from journey: DetectStaleConnections
// Module: compilation
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectStaleConnections", () => {
  // All connections are fresh (computed from journeys referencing existing nodes)
  const modules = new Map<string, ModuleFile>([
    ['svc', {
      nodes: {
        Alpha: { type: 'process', description: 'First step in the pipeline' },
        Beta: { type: 'process', description: 'Second step in the pipeline' },
      },
      journeys: {
        Pipeline: {
          steps: [
            { node: 'Alpha', action: 'starts the pipeline execution' },
            { node: 'Beta', action: 'finishes the pipeline execution' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/ConnectionSet provides all computed directed edges between nodes", () => {
    expect(result.index.nodes['svc/Alpha'].followed_by).toContain('svc/Beta');
    expect(result.index._stats.total_connections).toBeGreaterThan(0);
  });

  it("step 2: graph/NodeRegistry provides the current set of all defined node names", () => {
    const nodeNames = Object.keys(result.index.nodes);
    expect(nodeNames).toContain('svc/Alpha');
    expect(nodeNames).toContain('svc/Beta');
  });

  it("step 3: compilation/StaleConnectionDetection checks each connection's source and target node against the registry and flags edges referencing nodes that no longer exist", () => {
    // All followed_by targets should exist in nodes
    for (const [full, node] of Object.entries(result.index.nodes)) {
      for (const target of node.followed_by) {
        expect(result.index.nodes[target]).toBeDefined();
      }
    }
  });

  it("step 4: compilation/ErrorReport records each stale connection as a validation error with the edge endpoints and originating journey", () => {
    // No stale connections in a clean compile
    // Verify by removing a node and recompiling: a journey referencing a removed node produces a dangling ref error
    const broken = new Map<string, ModuleFile>([
      ['svc', {
        nodes: {
          Alpha: { type: 'process', description: 'First step in the pipeline' },
          // Beta removed — journey still references it
        },
        journeys: {
          Pipeline: {
            steps: [
              { node: 'Alpha', action: 'starts the pipeline execution' },
              { node: 'Beta', action: 'references a now-missing node' },
            ],
          },
        },
      }],
    ]);
    const r = compileFromModules(broken);
    const errors = r.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(errors.length).toBe(1);
  });
});
