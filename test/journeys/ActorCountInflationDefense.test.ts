// Auto-generated from journey: ActorCountInflationDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ActorCountInflationDefense'];
const steps = journey.steps;

describe("ActorCountInflationDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(9);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation', 'convergence'])
    );
  });

  it("step 1: _actors/ResourceExhauster submits a spec designed to produce hundreds of distinct actors", () => {
    // Node: _actors/ResourceExhauster (actor)
    // Action: submits a spec designed to produce hundreds of distinct actors
    const step = steps[0];
    expect(step.node).toBe('_actors/ResourceExhauster');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ResourceExhauster'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('unbounded');
    // ResourceExhauster is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/ResourceExhauster');
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 2: actors/DiscoverFromActivities discovers an excessive number of activity actors from the adversarial spec", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: discovers an excessive number of activity actors from the adversarial spec
    const step = steps[1];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    expect(node.module).toBe('actors');
    // Preceded by ResourceExhauster in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ResourceExhauster'])
    );
    // Followed by DiscoverFromThreats in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/DiscoverFromThreats discovers an excessive number of threat actors from the adversarial spec", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: discovers an excessive number of threat actors from the adversarial spec
    const step = steps[2];
    expect(step.node).toBe('actors/DiscoverFromThreats');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threat');
    expect(node.module).toBe('actors');
    // Preceded by DiscoverFromActivities in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    // Followed by DiscoverFromLifecycle in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
  });

  it("step 4: actors/DiscoverFromLifecycle discovers an excessive number of lifecycle actors from the adversarial spec", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: discovers an excessive number of lifecycle actors from the adversarial spec
    const step = steps[3];
    expect(step.node).toBe('actors/DiscoverFromLifecycle');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('lifecycle');
    expect(node.module).toBe('actors');
    // Preceded by DiscoverFromThreats in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
    // Followed by MergeAndDeduplicate in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
  });

  it("step 5: actors/MergeAndDeduplicate merges the inflated actor lists but deduplication only partially reduces the count", () => {
    // Node: actors/MergeAndDeduplicate (process)
    // Action: merges the inflated actor lists but deduplication only partially reduces the count
    const step = steps[4];
    expect(step.node).toBe('actors/MergeAndDeduplicate');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicates');
    expect(node.module).toBe('actors');
    // Preceded by DiscoverFromLifecycle in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
    // Followed by EnforceActorCountLimit in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/EnforceActorCountLimit'])
    );
  });

  it("step 6: actors/EnforceActorCountLimit checks the merged actor count against the maximum allowed threshold", () => {
    // Node: actors/EnforceActorCountLimit (process)
    // Action: checks the merged actor count against the maximum allowed threshold
    const step = steps[5];
    expect(step.node).toBe('actors/EnforceActorCountLimit');
    expect(step.step_number).toBe(6);

    const node = index.nodes['actors/EnforceActorCountLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('caps');
    expect(node.module).toBe('actors');
    // Preceded by MergeAndDeduplicate in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
    // Followed by ErrorReport in this journey (cross-module edge)
    // (steps 6→7 are same node, edge is from step 7→8)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
  });

  it("step 7: actors/EnforceActorCountLimit rejects the actor set because it exceeds the limit, preventing context window exhaustion", () => {
    // Node: actors/EnforceActorCountLimit (process)
    // Action: rejects the actor set because it exceeds the limit, preventing context window exhaustion
    const step = steps[6];
    expect(step.node).toBe('actors/EnforceActorCountLimit');
    expect(step.step_number).toBe(7);

    // Same node as step 6, appearing twice to model two-phase enforcement
    const node = index.nodes['actors/EnforceActorCountLimit'];
    expect(node.description).toContain('context window exhaustion');
  });

  it("step 8: compilation/ErrorReport records the inflation attempt with the actual count and the maximum allowed", () => {
    // Node: compilation/ErrorReport (artifact)
    // Action: records the inflation attempt with the actual count and the maximum allowed
    const step = steps[7];
    expect(step.node).toBe('compilation/ErrorReport');
    expect(step.step_number).toBe(8);

    const node = index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('validation errors');
    expect(node.module).toBe('compilation');
    // Preceded by EnforceActorCountLimit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/EnforceActorCountLimit'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: convergence/AuditGapFix targeted fix triggers rediscovery with a stricter prompt to consolidate actors", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix triggers rediscovery with a stricter prompt to consolidate actors
    const step = steps[8];
    expect(step.node).toBe('convergence/AuditGapFix');
    expect(step.step_number).toBe(9);

    const node = index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted');
    expect(node.module).toBe('convergence');
    // Preceded by ErrorReport in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full inflation-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ResourceExhauster',
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
      'actors/MergeAndDeduplicate',
      'actors/EnforceActorCountLimit',
      'actors/EnforceActorCountLimit',
      'compilation/ErrorReport',
      'convergence/AuditGapFix',
    ]);
  });

  it("attack inflates all three angles (steps 1-4), merge partially reduces (step 5), defense caps and reports (steps 6-9)", () => {
    // Attack: adversarial spec produces excessive actors across all angles
    const discoverySteps = steps.slice(1, 4);
    expect(discoverySteps.map(s => s.node)).toEqual([
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
    ]);
    // Merge: deduplication only partially helps
    expect(steps[4].node).toBe('actors/MergeAndDeduplicate');
    // Defense: count limit enforcement, error report, fix
    const defenseSteps = steps.slice(5);
    expect(defenseSteps.every(s =>
      s.node.startsWith('actors/') || s.node.startsWith('compilation/') || s.node.startsWith('convergence/')
    )).toBe(true);
  });

  it("three discovery angles run sequentially: activities → threats → lifecycle", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(activitiesIdx).toBeLessThan(threatsIdx);
    expect(threatsIdx).toBeLessThan(lifecycleIdx);
  });

  it("EnforceActorCountLimit appears twice for two-phase enforcement (check then reject)", () => {
    const limitSteps = steps.filter(s => s.node === 'actors/EnforceActorCountLimit');
    expect(limitSteps).toHaveLength(2);
    expect(limitSteps[0].step_number).toBe(6);
    expect(limitSteps[1].step_number).toBe(7);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ResourceExhauster is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ResourceExhauster');
    const node = index.nodes['_actors/ResourceExhauster'];
    expect(node.type).toBe('actor');
  });
});
