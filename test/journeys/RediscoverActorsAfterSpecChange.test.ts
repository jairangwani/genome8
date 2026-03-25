// Auto-generated from journey: RediscoverActorsAfterSpecChange
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, actors, _actors

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['RediscoverActorsAfterSpecChange'];
const steps = journey.steps;

describe("RediscoverActorsAfterSpecChange", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(14);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'actors', '_actors'])
    );
  });

  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and actors may need updating", () => {
    // Node: convergence/TargetedReconvergence (process)
    // Action: signals that the spec has changed and actors may need updating
    const step = steps[0];
    expect(step.node).toBe('convergence/TargetedReconvergence');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Followed by SpecFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/SpecFile'])
    );
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    // Node: convergence/SpecFile (artifact)
    // Action: provides the changed spec content
    const step = steps[1];
    expect(step.node).toBe('convergence/SpecFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('spec.md');
    // Preceded by TargetedReconvergence in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/TargetedReconvergence'])
    );
    // Followed by RediscoverActorsOnSpecChange in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/RediscoverActorsOnSpecChange'])
    );
    // SpecFile is referenced across multiple modules
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/RediscoverActorsOnSpecChange reads the current _actors.yaml to know the existing actor set", () => {
    // Node: actors/RediscoverActorsOnSpecChange (process)
    // Action: reads the current _actors.yaml to know the existing actor set
    const step = steps[2];
    expect(step.node).toBe('actors/RediscoverActorsOnSpecChange');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/RediscoverActorsOnSpecChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('actors');
    // Preceded by SpecFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/SpecFile'])
    );
    // Followed by LLMWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
  });

  it("step 4: _actors/LLMWorker re-analyzes the changed spec from the activities perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: re-analyzes the changed spec from the activities perspective
    const step = steps[3];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(4);
    expect(step.action).toContain('activities');

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // LLMWorker is the journey trigger (first actor node encountered)
    expect(journey.actor).toBe('_actors/LLMWorker');
    // Preceded by RediscoverActorsOnSpecChange in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/RediscoverActorsOnSpecChange'])
    );
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 5: actors/DiscoverFromActivities re-identifies activity actors from the updated spec", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: re-identifies activity actors from the updated spec
    const step = steps[4];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    // Preceded by LLMWorker in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by LLMWorker in this journey (next angle)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
  });

  it("step 6: _actors/LLMWorker re-analyzes the changed spec from the threats perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: re-analyzes the changed spec from the threats perspective
    const step = steps[5];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(6);
    expect(step.action).toContain('threats');
  });

  it("step 7: actors/DiscoverFromThreats re-identifies threat actors from the updated spec", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: re-identifies threat actors from the updated spec
    const step = steps[6];
    expect(step.node).toBe('actors/DiscoverFromThreats');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threat');
    // Preceded by LLMWorker in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by LLMWorker in this journey (next angle)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
  });

  it("step 8: _actors/LLMWorker re-analyzes the changed spec from the lifecycle perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: re-analyzes the changed spec from the lifecycle perspective
    const step = steps[7];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(8);
    expect(step.action).toContain('lifecycle');

    // LLMWorker appears 3 times — once per discovery angle
    const llmSteps = steps.filter(s => s.node === '_actors/LLMWorker');
    expect(llmSteps).toHaveLength(3);
  });

  it("step 9: actors/DiscoverFromLifecycle re-identifies lifecycle actors from the updated spec", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: re-identifies lifecycle actors from the updated spec
    const step = steps[8];
    expect(step.node).toBe('actors/DiscoverFromLifecycle');
    expect(step.step_number).toBe(9);

    const node = index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('lifecycle');
    // Preceded by LLMWorker in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by MergeAndDeduplicate in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
  });

  it("step 10: actors/MergeAndDeduplicate merges the rediscovered actors and removes duplicates", () => {
    // Node: actors/MergeAndDeduplicate (process)
    // Action: merges the rediscovered actors and removes duplicates
    const step = steps[9];
    expect(step.node).toBe('actors/MergeAndDeduplicate');
    expect(step.step_number).toBe(10);

    const node = index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicates');
    // Preceded by DiscoverFromLifecycle in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
    // Followed by UpdateActorsFileAfterRediscovery in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/UpdateActorsFileAfterRediscovery'])
    );
  });

  it("step 11: actors/UpdateActorsFileAfterRediscovery diffs the rediscovered set against the existing actors to find additions and removals", () => {
    // Node: actors/UpdateActorsFileAfterRediscovery (process)
    // Action: diffs the rediscovered set against the existing actors to find additions and removals
    const step = steps[10];
    expect(step.node).toBe('actors/UpdateActorsFileAfterRediscovery');
    expect(step.step_number).toBe(11);

    const node = index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('orphan');
    // Preceded by MergeAndDeduplicate in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
  });

  it("step 12: actors/UpdateActorsFileAfterRediscovery adds new actors to _actors.yaml and flags removed actors for orphan detection", () => {
    // Node: actors/UpdateActorsFileAfterRediscovery (process)
    // Action: adds new actors to _actors.yaml and flags removed actors for orphan detection
    const step = steps[11];
    expect(step.node).toBe('actors/UpdateActorsFileAfterRediscovery');
    expect(step.step_number).toBe(12);

    // UpdateActorsFileAfterRediscovery appears twice (steps 11-12)
    const updateSteps = steps.filter(
      s => s.node === 'actors/UpdateActorsFileAfterRediscovery'
    );
    expect(updateSteps).toHaveLength(2);

    // After the two update steps, WriteActorsFile follows
    const node = index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 13: actors/WriteActorsFile writes the updated _actors.yaml to disk", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes the updated _actors.yaml to disk
    const step = steps[12];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(13);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by UpdateActorsFileAfterRediscovery in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/UpdateActorsFileAfterRediscovery'])
    );
    // Followed by ActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 14: actors/ActorsFile the updated actor file is ready for recompilation", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: the updated actor file is ready for recompilation
    const step = steps[13];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(14);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by WriteActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("journey forms the full node sequence: trigger → spec → rediscover → 3×(LLM→discover) → merge → update → write → file", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/TargetedReconvergence',
      'convergence/SpecFile',
      'actors/RediscoverActorsOnSpecChange',
      '_actors/LLMWorker',
      'actors/DiscoverFromActivities',
      '_actors/LLMWorker',
      'actors/DiscoverFromThreats',
      '_actors/LLMWorker',
      'actors/DiscoverFromLifecycle',
      'actors/MergeAndDeduplicate',
      'actors/UpdateActorsFileAfterRediscovery',
      'actors/UpdateActorsFileAfterRediscovery',
      'actors/WriteActorsFile',
      'actors/ActorsFile',
    ]);
  });

  it("three discovery angles run sequentially: activities → threats → lifecycle", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(activitiesIdx).toBeLessThan(threatsIdx);
    expect(threatsIdx).toBeLessThan(lifecycleIdx);
  });

  it("each discovery angle is preceded by an LLMWorker call", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(steps[activitiesIdx - 1].node).toBe('_actors/LLMWorker');
    expect(steps[threatsIdx - 1].node).toBe('_actors/LLMWorker');
    expect(steps[lifecycleIdx - 1].node).toBe('_actors/LLMWorker');
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'actors', '_actors']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("LLMWorker is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
    const node = index.nodes['_actors/LLMWorker'];
    expect(node.type).toBe('actor');
  });
});
