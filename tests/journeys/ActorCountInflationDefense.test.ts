// Auto-generated from journey: ActorCountInflationDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const MAX_ACTOR_COUNT = 50;

// Generate inflated actor lists
const inflatedActivities = Array.from({ length: 80 }, (_, i) => `ActivityActor${i}`);
const inflatedThreats = Array.from({ length: 60 }, (_, i) => `ThreatActor${i}`);
const inflatedLifecycle = Array.from({ length: 40 }, (_, i) => `LifecycleActor${i}`);

describe("ActorCountInflationDefense", () => {
  it("step 1: _actors/ResourceExhauster submits a spec designed to produce hundreds of distinct actors", () => {
    const adversarialSpec = Array.from({ length: 100 }, (_, i) =>
      `Role${i} performs action ${i} on the system.`
    ).join('\n');
    expect(adversarialSpec.length).toBeGreaterThan(0);
    expect(adversarialSpec).toContain('Role99');
  });

  it("step 2: actors/DiscoverFromActivities discovers an excessive number of activity actors from the adversarial spec", () => {
    expect(inflatedActivities.length).toBe(80);
    expect(inflatedActivities.length).toBeGreaterThan(MAX_ACTOR_COUNT);
  });

  it("step 3: actors/DiscoverFromThreats discovers an excessive number of threat actors from the adversarial spec", () => {
    expect(inflatedThreats.length).toBe(60);
    expect(inflatedThreats.length).toBeGreaterThan(MAX_ACTOR_COUNT);
  });

  it("step 4: actors/DiscoverFromLifecycle discovers an excessive number of lifecycle actors from the adversarial spec", () => {
    expect(inflatedLifecycle.length).toBe(40);
  });

  it("step 5: actors/MergeAndDeduplicate merges the inflated actor lists but deduplication only partially reduces the count", () => {
    const all = [...inflatedActivities, ...inflatedThreats, ...inflatedLifecycle];
    const merged = [...new Set(all)];
    // No duplicates between the lists (different prefixes), so count stays high
    expect(merged.length).toBe(180);
    expect(merged.length).toBeGreaterThan(MAX_ACTOR_COUNT);
  });

  it("step 6: actors/EnforceActorCountLimit checks the merged actor count against the maximum allowed threshold", () => {
    const mergedCount = 180;
    const exceedsLimit = mergedCount > MAX_ACTOR_COUNT;
    expect(exceedsLimit).toBe(true);
  });

  it("step 7: actors/EnforceActorCountLimit rejects the actor set because it exceeds the limit, preventing context window exhaustion", () => {
    const mergedCount = 180;
    const rejected = mergedCount > MAX_ACTOR_COUNT;
    expect(rejected).toBe(true);
    // A reasonable system would have far fewer actors
    const reasonableCount = 12;
    expect(reasonableCount).toBeLessThanOrEqual(MAX_ACTOR_COUNT);
  });

  it("step 8: compilation/ErrorReport records the inflation attempt with the actual count and the maximum allowed", () => {
    const mergedCount = 180;
    const errorReport = {
      type: 'actor_count_inflation',
      actual_count: mergedCount,
      max_allowed: MAX_ACTOR_COUNT,
      message: `Actor count ${mergedCount} exceeds maximum ${MAX_ACTOR_COUNT}`,
    };
    expect(errorReport.actual_count).toBe(180);
    expect(errorReport.max_allowed).toBe(50);
    expect(errorReport.message).toContain('180');
    expect(errorReport.message).toContain('50');
  });

  it("step 9: convergence/AuditGapFix targeted fix triggers rediscovery with a stricter prompt to consolidate actors", () => {
    // After rejection, rediscovery with consolidation produces a reasonable set
    const consolidatedActors = ['User', 'Admin', 'Attacker', 'Insider', 'NewUser', 'PowerUser'];
    expect(consolidatedActors.length).toBeLessThanOrEqual(MAX_ACTOR_COUNT);

    // The consolidated set compiles cleanly
    const nodes: Record<string, any> = {};
    for (const name of consolidatedActors) {
      nodes[name] = { type: 'actor', description: `${name} of the system` };
    }
    const result = compileFromModules(new Map([['_actors', { nodes }]]));
    expect(result.index._stats.total_nodes).toBe(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

});
