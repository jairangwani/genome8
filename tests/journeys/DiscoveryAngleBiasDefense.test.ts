// Auto-generated from journey: DiscoveryAngleBiasDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildBiasModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MaliciousSpecAuthor: { type: 'actor', description: 'Writes a spec heavily weighted toward one domain to suppress other discovery angles' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Discovers a disproportionately large number of actors from the biased spec' },
      DiscoverFromThreats: { type: 'process', description: 'Discovers zero or very few threat actors because the spec avoids threat language' },
      DiscoverFromLifecycle: { type: 'process', description: 'Discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios' },
      ActivitiesActorList: { type: 'artifact', description: 'Stores the inflated activities actor set' },
      ThreatsActorList: { type: 'artifact', description: 'Stores the suppressed threats actor set' },
      LifecycleActorList: { type: 'artifact', description: 'Stores the suppressed lifecycle actor set' },
      DetectDiscoveryAngleBias: { type: 'process', description: 'Computes the ratio of actors from each angle to the total' },
      ValidateThreeAngleCompleteness: { type: 'process', description: 'Confirms that the suppressed angles violate the completeness requirement' },
    },
    journeys: {
      DiscoveryAngleBiasDefense: {
        steps: [
          { node: '_actors/MaliciousSpecAuthor', action: 'writes a spec heavily weighted toward one domain to suppress other discovery angles' },
          { node: 'DiscoverFromActivities', action: 'discovers a disproportionately large number of actors from the biased spec' },
          { node: 'DiscoverFromThreats', action: 'discovers zero or very few threat actors because the spec avoids threat language' },
          { node: 'DiscoverFromLifecycle', action: 'discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios' },
          { node: 'ActivitiesActorList', action: 'stores the inflated activities actor set' },
          { node: 'ThreatsActorList', action: 'stores the suppressed threats actor set' },
          { node: 'LifecycleActorList', action: 'stores the suppressed lifecycle actor set' },
          { node: 'DetectDiscoveryAngleBias', action: 'computes the ratio of actors from each angle to the total' },
          { node: 'DetectDiscoveryAngleBias', action: 'flags angles producing less than the minimum threshold proportion as suppressed' },
          { node: 'ValidateThreeAngleCompleteness', action: 'confirms that the suppressed angles violate the completeness requirement' },
          { node: 'compilation/ErrorReport', action: 'records the angle bias with the specific ratios and which angles were suppressed' },
        ],
      },
    },
  });

  modules.set('compilation', {
    nodes: {
      ErrorReport: { type: 'artifact', description: 'Records the angle bias with the specific ratios and which angles were suppressed' },
    },
    journeys: {},
  });

  return modules;
}

describe("DiscoveryAngleBiasDefense", () => {
  const modules = buildBiasModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DiscoveryAngleBiasDefense'];

  it("step 1: _actors/MaliciousSpecAuthor writes a spec heavily weighted toward one domain to suppress other discovery angles", () => {
    const node = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/DiscoverFromActivities discovers a disproportionately large number of actors from the biased spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/MaliciousSpecAuthor');
  });

  it("connection: _actors/MaliciousSpecAuthor → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 3: actors/DiscoverFromThreats discovers zero or very few threat actors because the spec avoids threat language", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 4: actors/DiscoverFromLifecycle discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 5: actors/ActivitiesActorList stores the inflated activities actor set", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/ActivitiesActorList", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/ActivitiesActorList');
  });

  it("step 6: actors/ThreatsActorList stores the suppressed threats actor set", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → actors/ThreatsActorList", () => {
    const from = result.index.nodes['actors/ActivitiesActorList'];
    expect(from.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 7: actors/LifecycleActorList stores the suppressed lifecycle actor set", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → actors/LifecycleActorList", () => {
    const from = result.index.nodes['actors/ThreatsActorList'];
    expect(from.followed_by).toContain('actors/LifecycleActorList');
  });

  it("step 8: actors/DetectDiscoveryAngleBias computes the ratio of actors from each angle to the total", () => {
    const node = result.index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("connection: actors/LifecycleActorList → actors/DetectDiscoveryAngleBias", () => {
    const from = result.index.nodes['actors/LifecycleActorList'];
    expect(from.followed_by).toContain('actors/DetectDiscoveryAngleBias');
  });

  it("step 9: actors/DetectDiscoveryAngleBias flags angles producing less than the minimum threshold proportion as suppressed", () => {
    const node = result.index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(node).toBeDefined();
    // Self-connection: same node consecutively
    expect(node.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("connection: actors/DetectDiscoveryAngleBias → actors/DetectDiscoveryAngleBias", () => {
    const node = result.index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("step 10: actors/ValidateThreeAngleCompleteness confirms that the suppressed angles violate the completeness requirement", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DetectDiscoveryAngleBias');
  });

  it("connection: actors/DetectDiscoveryAngleBias → actors/ValidateThreeAngleCompleteness", () => {
    const from = result.index.nodes['actors/DetectDiscoveryAngleBias'];
    expect(from.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 11: compilation/ErrorReport records the angle bias with the specific ratios and which angles were suppressed", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("connection: actors/ValidateThreeAngleCompleteness → compilation/ErrorReport", () => {
    const from = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(from.followed_by).toContain('compilation/ErrorReport');
  });

  it("journey covers full bias detection pipeline (11 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(11);
    expect(journey.steps[0].node).toBe('_actors/MaliciousSpecAuthor');
    expect(journey.steps[10].node).toBe('compilation/ErrorReport');
  });

  it("journey actor is MaliciousSpecAuthor", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
