// Auto-generated from journey: DiscoveryAngleBiasDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['DiscoveryAngleBiasDefense'];
const steps = journey.steps;

describe("DiscoveryAngleBiasDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(11);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation'])
    );
  });

  it("step 1: _actors/MaliciousSpecAuthor writes a spec heavily weighted toward one domain to suppress other discovery angles", () => {
    // Node: _actors/MaliciousSpecAuthor (actor)
    // Action: writes a spec heavily weighted toward one domain to suppress other discovery angles
    const step = steps[0];
    expect(step.node).toBe('_actors/MaliciousSpecAuthor');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('adversarial');
    // MaliciousSpecAuthor is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 2: actors/DiscoverFromActivities discovers a disproportionately large number of actors from the biased spec", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: discovers a disproportionately large number of actors from the biased spec
    const step = steps[1];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    expect(node.module).toBe('actors');
    // Preceded by MaliciousSpecAuthor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/MaliciousSpecAuthor'])
    );
    // Followed by DiscoverFromThreats in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/DiscoverFromThreats discovers zero or very few threat actors because the spec avoids threat language", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: discovers zero or very few threat actors because the spec avoids threat language
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

  it("step 4: actors/DiscoverFromLifecycle discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios
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
    // Followed by ActivitiesActorList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActivitiesActorList'])
    );
  });

  it("step 5: actors/ActivitiesActorList stores the inflated activities actor set", () => {
    // Node: actors/ActivitiesActorList (artifact)
    // Action: stores the inflated activities actor set
    const step = steps[4];
    expect(step.node).toBe('actors/ActivitiesActorList');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('activities');
    expect(node.module).toBe('actors');
    // Preceded by DiscoverFromLifecycle in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
    // Followed by ThreatsActorList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ThreatsActorList'])
    );
  });

  it("step 6: actors/ThreatsActorList stores the suppressed threats actor set", () => {
    // Node: actors/ThreatsActorList (artifact)
    // Action: stores the suppressed threats actor set
    const step = steps[5];
    expect(step.node).toBe('actors/ThreatsActorList');
    expect(step.step_number).toBe(6);

    const node = index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('threats');
    expect(node.module).toBe('actors');
    // Preceded by ActivitiesActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActivitiesActorList'])
    );
    // Followed by LifecycleActorList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
  });

  it("step 7: actors/LifecycleActorList stores the suppressed lifecycle actor set", () => {
    // Node: actors/LifecycleActorList (artifact)
    // Action: stores the suppressed lifecycle actor set
    const step = steps[6];
    expect(step.node).toBe('actors/LifecycleActorList');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('lifecycle');
    expect(node.module).toBe('actors');
    // Preceded by ThreatsActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ThreatsActorList'])
    );
    // Followed by DetectDiscoveryAngleBias in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DetectDiscoveryAngleBias'])
    );
  });

  it("step 8: actors/DetectDiscoveryAngleBias computes the ratio of actors from each angle to the total", () => {
    // Node: actors/DetectDiscoveryAngleBias (process)
    // Action: computes the ratio of actors from each angle to the total
    const step = steps[7];
    expect(step.node).toBe('actors/DetectDiscoveryAngleBias');
    expect(step.step_number).toBe(8);

    const node = index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threshold');
    expect(node.module).toBe('actors');
    // Preceded by LifecycleActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
    // Followed by ValidateThreeAngleCompleteness in this journey
    // (steps 8→9 are same node, edge is from step 9→10)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateThreeAngleCompleteness'])
    );
  });

  it("step 9: actors/DetectDiscoveryAngleBias flags angles producing less than the minimum threshold proportion as suppressed", () => {
    // Node: actors/DetectDiscoveryAngleBias (process)
    // Action: flags angles producing less than the minimum threshold proportion as suppressed
    const step = steps[8];
    expect(step.node).toBe('actors/DetectDiscoveryAngleBias');
    expect(step.step_number).toBe(9);

    // Same node as step 8, appearing twice to model two-phase analysis
    const node = index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(node.description).toContain('angle suppression');
  });

  it("step 10: actors/ValidateThreeAngleCompleteness confirms that the suppressed angles violate the completeness requirement", () => {
    // Node: actors/ValidateThreeAngleCompleteness (process)
    // Action: confirms that the suppressed angles violate the completeness requirement
    const step = steps[9];
    expect(step.node).toBe('actors/ValidateThreeAngleCompleteness');
    expect(step.step_number).toBe(10);

    const node = index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 discovery angles');
    expect(node.module).toBe('actors');
    // Preceded by DetectDiscoveryAngleBias in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DetectDiscoveryAngleBias'])
    );
    // Followed by ErrorReport in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
  });

  it("step 11: compilation/ErrorReport records the angle bias with the specific ratios and which angles were suppressed", () => {
    // Node: compilation/ErrorReport (artifact)
    // Action: records the angle bias with the specific ratios and which angles were suppressed
    const step = steps[10];
    expect(step.node).toBe('compilation/ErrorReport');
    expect(step.step_number).toBe(11);

    const node = index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('validation errors');
    expect(node.module).toBe('compilation');
    // Preceded by ValidateThreeAngleCompleteness in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateThreeAngleCompleteness'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full bias-then-detection sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/MaliciousSpecAuthor',
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
      'actors/ActivitiesActorList',
      'actors/ThreatsActorList',
      'actors/LifecycleActorList',
      'actors/DetectDiscoveryAngleBias',
      'actors/DetectDiscoveryAngleBias',
      'actors/ValidateThreeAngleCompleteness',
      'compilation/ErrorReport',
    ]);
  });

  it("three discovery angles run sequentially (steps 2-4), then three artifacts store results (steps 5-7)", () => {
    const discoverySteps = steps.slice(1, 4);
    expect(discoverySteps.map(s => s.node)).toEqual([
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
    ]);
    const artifactSteps = steps.slice(4, 7);
    expect(artifactSteps.map(s => s.node)).toEqual([
      'actors/ActivitiesActorList',
      'actors/ThreatsActorList',
      'actors/LifecycleActorList',
    ]);
    artifactSteps.forEach(s => {
      const node = index.nodes[s.node];
      expect(node.type).toBe('artifact');
    });
  });

  it("DetectDiscoveryAngleBias appears twice for two-phase analysis (compute ratios then flag suppressed)", () => {
    const biasSteps = steps.filter(s => s.node === 'actors/DetectDiscoveryAngleBias');
    expect(biasSteps).toHaveLength(2);
    expect(biasSteps[0].step_number).toBe(8);
    expect(biasSteps[1].step_number).toBe(9);
  });

  it("actors module dominates the journey with 9 of 11 steps", () => {
    const actorsSteps = steps.filter(s => s.node.startsWith('actors/'));
    expect(actorsSteps).toHaveLength(9);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("MaliciousSpecAuthor is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node.type).toBe('actor');
  });
});
