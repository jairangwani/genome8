// Auto-generated from journey: ValidateActorsBeforeProceeding
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      ValidateActorCompleteness: { type: 'process', description: 'checks that actor discovery produced valid results before proceeding to module creation' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActivitiesActorList: { type: 'artifact', description: 'the list of actors discovered from the activities perspective before merging' },
      ThreatsActorList: { type: 'artifact', description: 'the list of actors discovered from the threats perspective before merging' },
      LifecycleActorList: { type: 'artifact', description: 'the list of actors discovered from the lifecycle perspective before merging' },
      ValidateThreeAngleCompleteness: { type: 'process', description: 'checks that all 3 discovery angles produced at least one actor each' },
      ThreeAngleDiscovery: { type: 'rule', description: 'actors must be discovered from exactly 3 angles (activities, threats, lifecycle) to ensure comprehensive coverage' },
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
      ValidateActorYAMLStructure: { type: 'process', description: 'checks that each entry in _actors.yaml has type actor and a non-empty description' },
    },
    journeys: {
      ValidateActorsBeforeProceeding: {
        steps: [
          { node: 'ActivitiesActorList', action: 'provides the activities-angle results for completeness checking' },
          { node: 'ThreatsActorList', action: 'provides the threats-angle results for completeness checking' },
          { node: 'LifecycleActorList', action: 'provides the lifecycle-angle results for completeness checking' },
          { node: 'ValidateThreeAngleCompleteness', action: 'checks that the activities angle produced at least one actor' },
          { node: 'ValidateThreeAngleCompleteness', action: 'checks that the threats angle produced at least one actor' },
          { node: 'ValidateThreeAngleCompleteness', action: 'checks that the lifecycle angle produced at least one actor' },
          { node: 'ThreeAngleDiscovery', action: 'confirms all 3 angles are satisfied' },
          { node: 'ActorsFile', action: 'provides the written _actors.yaml for structural validation' },
          { node: 'ValidateActorYAMLStructure', action: 'checks that every entry has type actor and a non-empty description' },
          { node: 'ValidateActorYAMLStructure', action: 'flags any malformed entries for correction before compilation' },
          { node: 'convergence/ValidateActorCompleteness', action: 'receives the validation result and proceeds if all checks pass' },
        ],
      },
    },
  });

  return modules;
}

describe("ValidateActorsBeforeProceeding", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ValidateActorsBeforeProceeding'];

  it("step 1: actors/ActivitiesActorList provides the activities-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('ValidateActorsBeforeProceeding'))).toBe(true);
  });

  it("step 2: actors/ThreatsActorList provides the threats-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → actors/ThreatsActorList", () => {
    const src = result.index.nodes['actors/ActivitiesActorList'];
    expect(src.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → actors/LifecycleActorList", () => {
    const src = result.index.nodes['actors/ThreatsActorList'];
    expect(src.followed_by).toContain('actors/LifecycleActorList');
  });

  it("step 4: actors/ValidateThreeAngleCompleteness checks that the activities angle produced at least one actor", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("connection: actors/LifecycleActorList → actors/ValidateThreeAngleCompleteness", () => {
    const src = result.index.nodes['actors/LifecycleActorList'];
    expect(src.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 5: actors/ValidateThreeAngleCompleteness checks that the threats angle produced at least one actor", () => {
    // Same node repeated — validate it participates in consecutive steps
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
    expect(node.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("connection: actors/ValidateThreeAngleCompleteness → actors/ValidateThreeAngleCompleteness", () => {
    // Self-connection: same node appears in consecutive steps
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.preceded_by).toContain('actors/ValidateThreeAngleCompleteness');
    expect(node.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 6: actors/ValidateThreeAngleCompleteness checks that the lifecycle angle produced at least one actor", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("connection: actors/ValidateThreeAngleCompleteness → actors/ValidateThreeAngleCompleteness", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.preceded_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 7: actors/ThreeAngleDiscovery confirms all 3 angles are satisfied", () => {
    const node = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("connection: actors/ValidateThreeAngleCompleteness → actors/ThreeAngleDiscovery", () => {
    const src = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(src.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("step 8: actors/ActorsFile provides the written _actors.yaml for structural validation", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("connection: actors/ThreeAngleDiscovery → actors/ActorsFile", () => {
    const src = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 9: actors/ValidateActorYAMLStructure checks that every entry has type actor and a non-empty description", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ValidateActorYAMLStructure", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 10: actors/ValidateActorYAMLStructure flags any malformed entries for correction before compilation", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → actors/ValidateActorYAMLStructure", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
    expect(node.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 11: convergence/ValidateActorCompleteness receives the validation result and proceeds if all checks pass", () => {
    const node = result.index.nodes['convergence/ValidateActorCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → convergence/ValidateActorCompleteness", () => {
    const src = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(src.followed_by).toContain('convergence/ValidateActorCompleteness');
  });

  it("journey has 11 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(11);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
