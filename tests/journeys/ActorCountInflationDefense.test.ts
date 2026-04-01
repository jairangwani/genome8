// Auto-generated from journey: ActorCountInflationDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildInflationModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ResourceExhauster: { type: 'actor', description: 'Submits a spec designed to produce hundreds of distinct actors' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Discovers an excessive number of activity actors from the adversarial spec' },
      DiscoverFromThreats: { type: 'process', description: 'Discovers an excessive number of threat actors from the adversarial spec' },
      DiscoverFromLifecycle: { type: 'process', description: 'Discovers an excessive number of lifecycle actors from the adversarial spec' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges the inflated actor lists but deduplication only partially reduces the count' },
      EnforceActorCountLimit: { type: 'process', description: 'Checks the merged actor count against the maximum allowed threshold' },
    },
    journeys: {
      ActorCountInflationDefense: {
        steps: [
          { node: '_actors/ResourceExhauster', action: 'submits a spec designed to produce hundreds of distinct actors' },
          { node: 'DiscoverFromActivities', action: 'discovers an excessive number of activity actors from the adversarial spec' },
          { node: 'DiscoverFromThreats', action: 'discovers an excessive number of threat actors from the adversarial spec' },
          { node: 'DiscoverFromLifecycle', action: 'discovers an excessive number of lifecycle actors from the adversarial spec' },
          { node: 'MergeAndDeduplicate', action: 'merges the inflated actor lists but deduplication only partially reduces the count' },
          { node: 'EnforceActorCountLimit', action: 'checks the merged actor count against the maximum allowed threshold' },
          { node: 'EnforceActorCountLimit', action: 'rejects the actor set because it exceeds the limit, preventing context window exhaustion' },
          { node: 'compilation/ErrorReport', action: 'records the inflation attempt with the actual count and the maximum allowed' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix triggers rediscovery with a stricter prompt to consolidate actors' },
        ],
      },
    },
  });

  modules.set('compilation', {
    nodes: {
      ErrorReport: { type: 'artifact', description: 'Records the inflation attempt with the actual count and the maximum allowed' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix triggers rediscovery with a stricter prompt to consolidate actors' },
    },
    journeys: {},
  });

  return modules;
}

describe("ActorCountInflationDefense", () => {
  const modules = buildInflationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorCountInflationDefense'];

  it("step 1: _actors/ResourceExhauster submits a spec designed to produce hundreds of distinct actors", () => {
    const node = result.index.nodes['_actors/ResourceExhauster'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/DiscoverFromActivities discovers an excessive number of activity actors from the adversarial spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ResourceExhauster');
  });

  it("connection: _actors/ResourceExhauster → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['_actors/ResourceExhauster'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 3: actors/DiscoverFromThreats discovers an excessive number of threat actors from the adversarial spec", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 4: actors/DiscoverFromLifecycle discovers an excessive number of lifecycle actors from the adversarial spec", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 5: actors/MergeAndDeduplicate merges the inflated actor lists but deduplication only partially reduces the count", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 6: actors/EnforceActorCountLimit checks the merged actor count against the maximum allowed threshold", () => {
    const node = result.index.nodes['actors/EnforceActorCountLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/EnforceActorCountLimit", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/EnforceActorCountLimit');
  });

  it("step 7: actors/EnforceActorCountLimit rejects the actor set because it exceeds the limit, preventing context window exhaustion", () => {
    const node = result.index.nodes['actors/EnforceActorCountLimit'];
    expect(node).toBeDefined();
    // Self-connection: same node consecutively
    expect(node.followed_by).toContain('compilation/ErrorReport');
  });

  it("connection: actors/EnforceActorCountLimit → actors/EnforceActorCountLimit", () => {
    const node = result.index.nodes['actors/EnforceActorCountLimit'];
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 8: compilation/ErrorReport records the inflation attempt with the actual count and the maximum allowed", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/EnforceActorCountLimit');
  });

  it("connection: actors/EnforceActorCountLimit → compilation/ErrorReport", () => {
    const from = result.index.nodes['actors/EnforceActorCountLimit'];
    expect(from.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 9: convergence/AuditGapFix targeted fix triggers rediscovery with a stricter prompt to consolidate actors", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → convergence/AuditGapFix", () => {
    const from = result.index.nodes['compilation/ErrorReport'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey actor is ResourceExhauster", () => {
    expect(journey.actor).toBe('_actors/ResourceExhauster');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
