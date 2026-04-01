// Auto-generated from journey: MergeAndWriteActors
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildMergeModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: actors from all 3 angles, with a deliberate duplicate (Admin)
  modules.set('_actors', {
    nodes: {
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec' },
      HumanDeveloper: { type: 'actor', description: 'Developer who builds the system' },
      MaliciousSpecAuthor: { type: 'actor', description: 'Adversary injecting malicious spec content' },
      NewProjectAdopter: { type: 'actor', description: 'First-time user onboarding' },
    },
    journeys: {},
  });

  // actors module: merge/deduplicate processes
  modules.set('actors', {
    nodes: {
      ActivitiesActorList: { type: 'artifact', description: 'Stores the activities-perspective actors' },
      ThreatsActorList: { type: 'artifact', description: 'Stores the threats-perspective actors' },
      LifecycleActorList: { type: 'artifact', description: 'Stores the lifecycle-perspective actors' },
      MergeAndDeduplicate: { type: 'process', description: 'Combines all actors, removes duplicates, keeps best descriptions' },
      MergedActorList: { type: 'artifact', description: 'Stores the final deduplicated actor set' },
      WriteActorsFile: { type: 'process', description: 'Writes the merged actors to _actors.yaml' },
      ActorsFile: { type: 'artifact', description: 'The _actors.yaml file on disk in the modules directory' },
    },
    journeys: {
      MergeAndWriteActors: {
        steps: [
          { node: 'ActivitiesActorList', action: 'provides the activities-perspective actors for merging' },
          { node: 'ThreatsActorList', action: 'provides the threats-perspective actors for merging' },
          { node: 'LifecycleActorList', action: 'provides the lifecycle-perspective actors for merging' },
          { node: 'MergeAndDeduplicate', action: 'combines all actors, removes duplicates, keeps best descriptions' },
          { node: 'MergedActorList', action: 'stores the final deduplicated actor set' },
          { node: 'WriteActorsFile', action: 'writes the merged actors to _actors.yaml' },
          { node: 'ActorsFile', action: 'the _actors.yaml file is now on disk in the modules directory' },
          { node: 'convergence/ConvergenceState', action: 'records that actor discovery is complete' },
        ],
      },
    },
  });

  // convergence module: ConvergenceState artifact
  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'Tracks which convergence steps have completed' },
    },
    journeys: {},
  });

  return modules;
}

describe("MergeAndWriteActors", () => {
  const modules = buildMergeModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MergeAndWriteActors'];

  it("step 1: actors/ActivitiesActorList provides the activities-perspective actors for merging", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: actors/ThreatsActorList provides the threats-perspective actors for merging", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → actors/ThreatsActorList", () => {
    const from = result.index.nodes['actors/ActivitiesActorList'];
    const to = result.index.nodes['actors/ThreatsActorList'];
    expect(from.followed_by).toContain('actors/ThreatsActorList');
    expect(to.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-perspective actors for merging", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → actors/LifecycleActorList", () => {
    const from = result.index.nodes['actors/ThreatsActorList'];
    expect(from.followed_by).toContain('actors/LifecycleActorList');
  });

  it("step 4: actors/MergeAndDeduplicate combines all actors, removes duplicates, keeps best descriptions", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("connection: actors/LifecycleActorList → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/LifecycleActorList'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 5: actors/MergedActorList stores the final deduplicated actor set", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/MergedActorList", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/MergedActorList');
  });

  it("step 6: actors/WriteActorsFile writes the merged actors to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/WriteActorsFile", () => {
    const from = result.index.nodes['actors/MergedActorList'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 7: actors/ActorsFile the _actors.yaml file is now on disk in the modules directory", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("step 8: convergence/ConvergenceState records that actor discovery is complete", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → convergence/ConvergenceState", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has exactly 8 steps covering the full merge pipeline", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(8);
    expect(journey.steps[0].node).toBe('actors/ActivitiesActorList');
    expect(journey.steps[7].node).toBe('convergence/ConvergenceState');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
