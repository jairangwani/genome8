// Auto-generated from journey: ValidateActorsBeforeProceeding
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildValidationModules(opts?: { missingAngle?: 'activities' | 'threats' | 'lifecycle'; badType?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  const actorNodes: Record<string, { type: string; description: string }> = {};
  if (!opts?.missingAngle || opts.missingAngle !== 'activities') {
    actorNodes.ProjectOwner = { type: 'actor', description: 'Person who wrote the spec' };
  }
  if (!opts?.missingAngle || opts.missingAngle !== 'threats') {
    actorNodes.MaliciousSpecAuthor = { type: 'actor', description: 'Adversary injecting malicious spec content' };
  }
  if (!opts?.missingAngle || opts.missingAngle !== 'lifecycle') {
    actorNodes.NewProjectAdopter = { type: 'actor', description: 'First-time user onboarding' };
  }
  if (opts?.badType) {
    actorNodes.BadActor = { type: 'process', description: 'This should be type actor but is process' };
  }

  modules.set('_actors', { nodes: actorNodes, journeys: {} });

  modules.set('actors', {
    nodes: {
      ActivitiesActorList: { type: 'artifact', description: 'Stores the activities-perspective actors' },
      ThreatsActorList: { type: 'artifact', description: 'Stores the threats-perspective actors' },
      LifecycleActorList: { type: 'artifact', description: 'Stores the lifecycle-perspective actors' },
      ValidateThreeAngleCompleteness: { type: 'process', description: 'Checks that each angle produced at least one actor' },
      ThreeAngleDiscovery: { type: 'rule', description: 'Enforces all 3 angles are satisfied' },
      ActorsFile: { type: 'artifact', description: 'The _actors.yaml file on disk' },
      ValidateActorYAMLStructure: { type: 'process', description: 'Checks that every entry has type actor and a non-empty description' },
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

  modules.set('convergence', {
    nodes: {
      ValidateActorCompleteness: { type: 'process', description: 'Receives actor validation result and proceeds if all checks pass' },
    },
    journeys: {},
  });

  return modules;
}

describe("ValidateActorsBeforeProceeding", () => {
  const modules = buildValidationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ValidateActorsBeforeProceeding'];

  it("step 1: actors/ActivitiesActorList provides the activities-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: actors/ThreatsActorList provides the threats-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → actors/ThreatsActorList", () => {
    const from = result.index.nodes['actors/ActivitiesActorList'];
    expect(from.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-angle results for completeness checking", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → actors/LifecycleActorList", () => {
    const from = result.index.nodes['actors/ThreatsActorList'];
    expect(from.followed_by).toContain('actors/LifecycleActorList');
  });

  it("step 4: actors/ValidateThreeAngleCompleteness checks that the activities angle produced at least one actor", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("connection: actors/LifecycleActorList → actors/ValidateThreeAngleCompleteness", () => {
    const from = result.index.nodes['actors/LifecycleActorList'];
    expect(from.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 5: actors/ValidateThreeAngleCompleteness checks that the threats angle produced at least one actor", () => {
    // Same node reused — it appears multiple times in the journey
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("connection: actors/ValidateThreeAngleCompleteness → actors/ValidateThreeAngleCompleteness", () => {
    // Self-connection: same node appears in consecutive steps
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.preceded_by).toContain('actors/ValidateThreeAngleCompleteness');
    expect(node.followed_by).toContain('actors/ValidateThreeAngleCompleteness');
  });

  it("step 6: actors/ValidateThreeAngleCompleteness checks that the lifecycle angle produced at least one actor", () => {
    const node = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
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
    const from = result.index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(from.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("step 8: actors/ActorsFile provides the written _actors.yaml for structural validation", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("connection: actors/ThreeAngleDiscovery → actors/ActorsFile", () => {
    const from = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("step 9: actors/ValidateActorYAMLStructure checks that every entry has type actor and a non-empty description", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ValidateActorYAMLStructure", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 10: actors/ValidateActorYAMLStructure flags any malformed entries for correction before compilation", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    // Self-connection from step 9 to step 10
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → actors/ValidateActorYAMLStructure", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 11: convergence/ValidateActorCompleteness receives the validation result and proceeds if all checks pass", () => {
    const node = result.index.nodes['convergence/ValidateActorCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → convergence/ValidateActorCompleteness", () => {
    const from = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(from.followed_by).toContain('convergence/ValidateActorCompleteness');
  });

  it("all 3 actor angle nodes exist in the _actors module", () => {
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/MaliciousSpecAuthor']).toBeDefined();
    expect(result.index.nodes['_actors/NewProjectAdopter']).toBeDefined();
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
