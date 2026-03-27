// Auto-generated from journey: EnforceNoIsolation
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("EnforceNoIsolation", () => {
  // Graph with orphan nodes and connected nodes
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ConnectedNode: { type: 'process', description: 'Used in a journey' },
        OrphanA: { type: 'artifact', description: 'Not in any journey' },
        OrphanB: { type: 'interface', description: 'Also not in any journey' },
        AnotherConnected: { type: 'rule', description: 'Also in the journey' },
      },
      journeys: {
        ActiveJourney: {
          steps: [
            { node: '_actors/Compiler', action: 'initiates check' },
            { node: 'ConnectedNode', action: 'processes data' },
            { node: 'AnotherConnected', action: 'validates output' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/CompiledIndex provides the full graph with all nodes and connections", () => {
    expect(result.index._stats.total_nodes).toBe(5);
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.index._compiled).toBeTruthy();
  });

  it("step 2: graph/NoIsolationRule scans for nodes that appear in no journey and flags them as orphans", () => {
    // OrphanA and OrphanB are not in any journey
    const orphanA = result.index.nodes['mymod/OrphanA'];
    expect(orphanA.in_journeys).toHaveLength(0);
    expect(orphanA.preceded_by).toHaveLength(0);
    expect(orphanA.followed_by).toHaveLength(0);

    const orphanB = result.index.nodes['mymod/OrphanB'];
    expect(orphanB.in_journeys).toHaveLength(0);

    // The stats count orphans
    expect(result.index._stats.orphans).toBe(2);

    // Orphan warnings are issued
    const orphanWarnings = result.issues.filter(i => i.message.includes('Orphan'));
    expect(orphanWarnings).toHaveLength(2);

    // Coverage lists orphans
    expect(result.coverage.orphans).toContain('mymod/OrphanA');
    expect(result.coverage.orphans).toContain('mymod/OrphanB');
  });

  it("step 3: _actors/Compiler reports orphan nodes as validation errors", () => {
    const orphanIssues = result.issues.filter(
      i => i.message.includes('Orphan')
    );
    expect(orphanIssues.length).toBe(2);
    for (const issue of orphanIssues) {
      expect(issue.severity).toBe('warning');
      expect(issue.module).toBe('mymod');
    }

    // Connected nodes are NOT flagged
    const connectedNode = result.index.nodes['mymod/ConnectedNode'];
    expect(connectedNode.in_journeys.length).toBeGreaterThan(0);
  });
});
