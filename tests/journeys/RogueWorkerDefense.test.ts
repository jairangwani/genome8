// Auto-generated from journey: RogueWorkerDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Rogue worker produces hallucinated actors that no journey references
const rogueActors: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    PhantomAdmin: { type: 'actor', description: 'hallucinated admin user that does not exist in spec' },
    GhostOperator: { type: 'actor', description: 'hallucinated operator role with no journey coverage' },
  },
  journeys: {},
};

// Only ProjectOwner is referenced in a journey
const gatewayModule: ModuleFile = {
  nodes: {
    EntryPoint: { type: 'process', description: 'handles incoming requests' },
  },
  journeys: {
    HandleRequest: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'sends a request' },
        { node: 'EntryPoint', action: 'processes the request' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['_actors', rogueActors],
  ['gateway', gatewayModule],
]));

describe("RogueWorkerDefense", () => {
  it("step 1: _actors/RogueWorker produces subtly wrong actor content with hallucinated or phantom actors", () => {
    // Rogue worker created 4 actors — 2 are hallucinated (PhantomAdmin, GhostOperator)
    expect(result.index.nodes['_actors/PhantomAdmin']).toBeDefined();
    expect(result.index.nodes['_actors/GhostOperator']).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(5); // 4 actors + 1 process
  });

  it("step 2: actors/WriteActorsFile writes the rogue content to _actors.yaml", () => {
    // All 4 actors are in the compiled index
    for (const name of ['ProjectOwner', 'LLMWorker', 'PhantomAdmin', 'GhostOperator']) {
      expect(result.index.nodes[`_actors/${name}`]).toBeDefined();
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
  });

  it("step 3: actors/ActorsFile contains the hallucinated actors", () => {
    // The hallucinated actors exist but have no journey coverage
    expect(result.index.nodes['_actors/PhantomAdmin'].in_journeys.length).toBe(0);
    expect(result.index.nodes['_actors/GhostOperator'].in_journeys.length).toBe(0);
  });

  it("step 4: actors/ValidateActorCoverage checks that every actor appears in at least one journey", () => {
    // ProjectOwner is in the HandleRequest journey — it has coverage
    expect(result.index.nodes['_actors/ProjectOwner'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // LLMWorker, PhantomAdmin, GhostOperator are not in any journey
    expect(result.index.nodes['_actors/LLMWorker'].in_journeys.length).toBe(0);
    expect(result.index.nodes['_actors/PhantomAdmin'].in_journeys.length).toBe(0);
    expect(result.index.nodes['_actors/GhostOperator'].in_journeys.length).toBe(0);
  });

  it("step 5: compilation/OrphanDetection flags hallucinated actors that no journey references as orphans", () => {
    // Orphan detection produces warnings for nodes not in any journey
    const orphanWarnings = result.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    // PhantomAdmin, GhostOperator, and LLMWorker should all be flagged as orphans
    expect(orphanWarnings.length).toBeGreaterThanOrEqual(2);
    const orphanNames = orphanWarnings.map(w => w.message);
    expect(orphanNames.some(m => m.includes('PhantomAdmin'))).toBe(true);
    expect(orphanNames.some(m => m.includes('GhostOperator'))).toBe(true);
  });

  it("step 6: convergence/AuditGapFix targeted fix removes orphan actors that cannot be connected to any journey", () => {
    // After identifying orphans, removing them and recompiling produces a clean graph
    const cleanActors: ModuleFile = {
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
      },
      journeys: {},
    };
    const cleanResult = compileFromModules(new Map([
      ['_actors', cleanActors],
      ['gateway', gatewayModule],
    ]));
    // No orphan warnings for actor nodes
    const actorOrphans = cleanResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan') && i.module === '_actors'
    );
    expect(actorOrphans.length).toBe(0);
    expect(cleanResult.index._stats.total_nodes).toBe(2); // 1 actor + 1 process
  });

});
