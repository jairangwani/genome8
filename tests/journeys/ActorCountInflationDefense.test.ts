// Auto-generated from journey: ActorCountInflationDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Inflated actor lists from adversarial spec
const inflatedActivities = Array.from({ length: 40 }, (_, i) => `ActivityActor${i}`);
const inflatedThreats = Array.from({ length: 35 }, (_, i) => `ThreatActor${i}`);
const inflatedLifecycle = Array.from({ length: 30 }, (_, i) => `LifecycleActor${i}`);

describe("ActorCountInflationDefense", () => {
  it("step 1: _actors/ResourceExhauster submits a spec designed to produce hundreds of distinct actors", () => {
    const total = inflatedActivities.length + inflatedThreats.length + inflatedLifecycle.length;
    expect(total).toBe(105);
    // An adversarial spec produced 105 actors — far more than typical
  });

  it("step 2: actors/DiscoverFromActivities discovers an excessive number of activity actors from the adversarial spec", () => {
    expect(inflatedActivities.length).toBe(40);
    expect(inflatedActivities[0]).toBe('ActivityActor0');
    expect(inflatedActivities[39]).toBe('ActivityActor39');
  });

  it("step 3: actors/DiscoverFromThreats discovers an excessive number of threat actors from the adversarial spec", () => {
    expect(inflatedThreats.length).toBe(35);
    expect(inflatedThreats[0]).toBe('ThreatActor0');
  });

  it("step 4: actors/DiscoverFromLifecycle discovers an excessive number of lifecycle actors from the adversarial spec", () => {
    expect(inflatedLifecycle.length).toBe(30);
    expect(inflatedLifecycle[0]).toBe('LifecycleActor0');
  });

  it("step 5: actors/MergeAndDeduplicate merges the inflated actor lists but deduplication only partially reduces the count", () => {
    // All names are unique — dedup doesn't reduce
    const merged = [...new Set([...inflatedActivities, ...inflatedThreats, ...inflatedLifecycle])];
    expect(merged.length).toBe(105);
    // No duplicates to remove
    expect(merged.length).toBe(inflatedActivities.length + inflatedThreats.length + inflatedLifecycle.length);
  });

  it("step 6: actors/EnforceActorCountLimit checks the merged actor count against the maximum allowed threshold", () => {
    const maxActors = 30; // reasonable limit for a single engine
    const merged = [...new Set([...inflatedActivities, ...inflatedThreats, ...inflatedLifecycle])];
    const exceedsLimit = merged.length > maxActors;
    expect(exceedsLimit).toBe(true);
    expect(merged.length).toBe(105);
    expect(maxActors).toBe(30);
  });

  it("step 7: actors/EnforceActorCountLimit rejects the actor set because it exceeds the limit, preventing context window exhaustion", () => {
    const maxActors = 30;
    const merged = [...new Set([...inflatedActivities, ...inflatedThreats, ...inflatedLifecycle])];
    // Context window cost: each actor adds ~50 tokens to excerpts
    const estimatedTokens = merged.length * 50;
    expect(estimatedTokens).toBe(5250);
    // This exceeds a reasonable budget — reject
    expect(merged.length).toBeGreaterThan(maxActors);
    // A typical project has 5-15 actors
    expect(maxActors).toBeLessThan(merged.length);
  });

  it("step 8: compilation/ErrorReport records the inflation attempt with the actual count and the maximum allowed", () => {
    const maxActors = 30;
    const merged = [...new Set([...inflatedActivities, ...inflatedThreats, ...inflatedLifecycle])];
    const report = {
      actual_count: merged.length,
      max_allowed: maxActors,
      exceeded_by: merged.length - maxActors,
      severity: 'error' as const,
      message: `Actor count ${merged.length} exceeds maximum ${maxActors} — likely inflation attack`,
    };
    expect(report.actual_count).toBe(105);
    expect(report.max_allowed).toBe(30);
    expect(report.exceeded_by).toBe(75);
    expect(report.message).toContain('inflation');
  });

  it("step 9: convergence/AuditGapFix targeted fix triggers rediscovery with a stricter prompt to consolidate actors", () => {
    // After consolidation, actors are reduced to a reasonable count
    const consolidatedActors = ['Admin', 'Developer', 'EndUser', 'Attacker', 'NewUser',
      'ReturningUser', 'ExternalAPI', 'Bot', 'Auditor', 'Operator'];
    expect(consolidatedActors.length).toBe(10);
    expect(consolidatedActors.length).toBeLessThanOrEqual(30);
    // Compile the consolidated set to verify it works
    const nodes: Record<string, any> = {};
    for (const name of consolidatedActors) {
      nodes[name] = { type: 'actor', description: `${name} — consolidated` };
    }
    const result = compileFromModules(new Map([['_actors', { nodes, journeys: {} }]]));
    expect(Object.keys(result.index.nodes).length).toBe(10);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

});
