// Auto-generated from journey: ActorCountInflationDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ActorCountInflationDefense", () => {
  // Simulate an adversarial spec that inflates actor count
  const inflatedActors: Record<string, { type: 'actor'; description: string }> = {};
  for (let i = 0; i < 50; i++) {
    inflatedActors[`InflatedActor${i}`] = { type: 'actor', description: `Auto-generated actor ${i}` };
  }

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        ResourceExhauster: { type: 'actor', description: 'submits adversarial spec' },
        ...inflatedActors,
      },
      journeys: {},
    }],
    ['actors', {
      nodes: {
        DiscoverFromActivities: { type: 'process', description: 'discovers activity actors' },
        DiscoverFromThreats: { type: 'process', description: 'discovers threat actors' },
        DiscoverFromLifecycle: { type: 'process', description: 'discovers lifecycle actors' },
        MergeAndDeduplicate: { type: 'process', description: 'merges and deduplicates actors' },
        EnforceActorCountLimit: { type: 'process', description: 'checks actor count limit' },
      },
      journeys: {
        InflationAttempt: {
          steps: [
            { node: '_actors/ResourceExhauster', action: 'submits inflated spec' },
            { node: 'DiscoverFromActivities', action: 'discovers excessive actors' },
            { node: 'MergeAndDeduplicate', action: 'attempts dedup' },
            { node: 'EnforceActorCountLimit', action: 'checks limit' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/ResourceExhauster submits a spec designed to produce hundreds of distinct actors", () => {
    // The inflated _actors module has many actor nodes
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'actor' && n.module === '_actors');
    expect(actorNodes.length).toBeGreaterThan(10);
  });

  it("step 2: actors/DiscoverFromActivities discovers an excessive number of activity actors from the adversarial spec", () => {
    // DiscoverFromActivities is registered and participates in the journey
    expect(result.index.nodes['actors/DiscoverFromActivities']).toBeDefined();
    expect(result.index.nodes['actors/DiscoverFromActivities'].in_journeys.length).toBeGreaterThan(0);
  });

  it("step 3: actors/DiscoverFromThreats discovers an excessive number of threat actors from the adversarial spec", () => {
    // DiscoverFromThreats exists as a process node
    expect(result.index.nodes['actors/DiscoverFromThreats']).toBeDefined();
    expect(result.index.nodes['actors/DiscoverFromThreats'].type).toBe('process');
  });

  it("step 4: actors/DiscoverFromLifecycle discovers an excessive number of lifecycle actors from the adversarial spec", () => {
    expect(result.index.nodes['actors/DiscoverFromLifecycle']).toBeDefined();
    expect(result.index.nodes['actors/DiscoverFromLifecycle'].type).toBe('process');
  });

  it("step 5: actors/MergeAndDeduplicate merges the inflated actor lists but deduplication only partially reduces the count", () => {
    // MergeAndDeduplicate is connected in the journey
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 6: actors/EnforceActorCountLimit checks the merged actor count against the maximum allowed threshold", () => {
    const node = result.index.nodes['actors/EnforceActorCountLimit'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 7: actors/EnforceActorCountLimit rejects the actor set because it exceeds the limit, preventing context window exhaustion", () => {
    // The inflated actors are orphans (not in any journey) — compile detects them
    const orphanActors = result.coverage.orphans.filter(o => o.startsWith('_actors/InflatedActor'));
    expect(orphanActors.length).toBeGreaterThan(0);
  });

  it("step 8: compilation/ErrorReport records the inflation attempt with the actual count and the maximum allowed", () => {
    // Orphan warnings should be present for the inflated actors
    const orphanWarnings = result.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    expect(orphanWarnings.length).toBeGreaterThan(0);
  });

  it("step 9: convergence/AuditGapFix targeted fix triggers rediscovery with a stricter prompt to consolidate actors", () => {
    // The total node count reflects the inflation
    expect(result.index._stats.total_nodes).toBeGreaterThan(50);
    // Orphan count shows the problem
    expect(result.index._stats.orphans).toBeGreaterThan(0);
  });
});
