// Auto-generated from journey: MergeAndWriteActors
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActivitiesActorList: { type: 'artifact', description: 'the list of actors discovered from the activities perspective before merging' },
      ThreatsActorList: { type: 'artifact', description: 'the list of actors discovered from the threats perspective before merging' },
      LifecycleActorList: { type: 'artifact', description: 'the list of actors discovered from the lifecycle perspective before merging' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
      MergedActorList: { type: 'artifact', description: 'the deduplicated combined actor list from all 3 discovery angles' },
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
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

  return modules;
}

describe("MergeAndWriteActors", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MergeAndWriteActors'];

  it("step 1: actors/ActivitiesActorList provides the activities-perspective actors for merging", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('MergeAndWriteActors'))).toBe(true);
  });

  it("step 2: actors/ThreatsActorList provides the threats-perspective actors for merging", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → actors/ThreatsActorList", () => {
    const src = result.index.nodes['actors/ActivitiesActorList'];
    expect(src.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-perspective actors for merging", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → actors/LifecycleActorList", () => {
    const src = result.index.nodes['actors/ThreatsActorList'];
    expect(src.followed_by).toContain('actors/LifecycleActorList');
  });

  it("step 4: actors/MergeAndDeduplicate combines all actors, removes duplicates, keeps best descriptions", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/LifecycleActorList');
  });

  it("connection: actors/LifecycleActorList → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/LifecycleActorList'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 5: actors/MergedActorList stores the final deduplicated actor set", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/MergedActorList", () => {
    const src = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(src.followed_by).toContain('actors/MergedActorList');
  });

  it("step 6: actors/WriteActorsFile writes the merged actors to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/WriteActorsFile", () => {
    const src = result.index.nodes['actors/MergedActorList'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 7: actors/ActorsFile the _actors.yaml file is now on disk in the modules directory", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 8: convergence/ConvergenceState records that actor discovery is complete", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → convergence/ConvergenceState", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
