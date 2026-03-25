// Auto-generated from journey: MergeAndWriteActors
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['MergeAndWriteActors'];
const steps = journey.steps;

describe("MergeAndWriteActors", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(8);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['actors', 'convergence'])
    );
  });

  it("step 1: actors/ActivitiesActorList provides the activities-perspective actors for merging", () => {
    // Node: actors/ActivitiesActorList (artifact)
    // Action: provides the activities-perspective actors for merging
    const step = steps[0];
    expect(step.node).toBe('actors/ActivitiesActorList');
    expect(step.step_number).toBe(1);

    const node = index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // First step in journey — no predecessor within this journey
    // but the node has predecessors from DiscoverActorsFromSpec journey
    expect(node.preceded_by.length).toBeGreaterThan(0);
  });

  it("step 2: actors/ThreatsActorList provides the threats-perspective actors for merging", () => {
    // Node: actors/ThreatsActorList (artifact)
    // Action: provides the threats-perspective actors for merging
    const step = steps[1];
    expect(step.node).toBe('actors/ThreatsActorList');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // Preceded by ActivitiesActorList in this journey's step sequence
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActivitiesActorList'])
    );
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-perspective actors for merging", () => {
    // Node: actors/LifecycleActorList (artifact)
    // Action: provides the lifecycle-perspective actors for merging
    const step = steps[2];
    expect(step.node).toBe('actors/LifecycleActorList');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // Preceded by ThreatsActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ThreatsActorList'])
    );
  });

  it("step 4: actors/MergeAndDeduplicate combines all actors, removes duplicates, keeps best descriptions", () => {
    // Node: actors/MergeAndDeduplicate (process)
    // Action: combines all actors, removes duplicates, keeps best descriptions
    const step = steps[3];
    expect(step.node).toBe('actors/MergeAndDeduplicate');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicates');
    // Preceded by LifecycleActorList (the last of the three input lists)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
    // Followed by MergedActorList (the output artifact)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/MergedActorList'])
    );
  });

  it("step 5: actors/MergedActorList stores the final deduplicated actor set", () => {
    // Node: actors/MergedActorList (artifact)
    // Action: stores the final deduplicated actor set
    const step = steps[4];
    expect(step.node).toBe('actors/MergedActorList');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('deduplicated');
    // Preceded by MergeAndDeduplicate
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
    // Followed by WriteActorsFile
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 6: actors/WriteActorsFile writes the merged actors to _actors.yaml", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes the merged actors to _actors.yaml
    const step = steps[5];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(6);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by MergedActorList, followed by ActorsFile
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergedActorList'])
    );
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 7: actors/ActorsFile the _actors.yaml file is now on disk in the modules directory", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: the _actors.yaml file is now on disk in the modules directory
    const step = steps[6];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // ActorsFile is used across multiple modules — it has cross-module connections
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: convergence/ConvergenceState records that actor discovery is complete", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: records that actor discovery is complete
    const step = steps[7];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(8);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('convergence');
    // ConvergenceState is a cross-module artifact referenced from actors
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
    // Preceded by ActorsFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("journey forms a linear pipeline: 3 inputs → merge → deduplicated list → write → file → state", () => {
    // Verify strictly linear step sequence with no node revisits
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'actors/ActivitiesActorList',
      'actors/ThreatsActorList',
      'actors/LifecycleActorList',
      'actors/MergeAndDeduplicate',
      'actors/MergedActorList',
      'actors/WriteActorsFile',
      'actors/ActorsFile',
      'convergence/ConvergenceState',
    ]);
  });

  it("only the final step crosses a module boundary", () => {
    // Steps 1-7 are in actors module, only step 8 is in convergence
    const actorsSteps = steps.filter(s => s.node.startsWith('actors/'));
    const convergenceSteps = steps.filter(s => s.node.startsWith('convergence/'));
    expect(actorsSteps).toHaveLength(7);
    expect(convergenceSteps).toHaveLength(1);
    expect(convergenceSteps[0].step_number).toBe(8);
  });

  it("no actor triggers this journey — it is a data pipeline, not actor-initiated", () => {
    // The first step is an artifact (ActivitiesActorList), not an actor node.
    // So the journey has no triggering actor.
    expect(journey.actor).toBeNull();
  });
});
