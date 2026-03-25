// Auto-generated from journey: ValidateActorsBeforeProceeding
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ValidateActorsBeforeProceeding'];
const steps = journey.steps;

describe("ValidateActorsBeforeProceeding", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(11);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['actors', 'convergence'])
    );
  });

  it("step 1: actors/ActivitiesActorList provides the activities-angle results for completeness checking", () => {
    // Node: actors/ActivitiesActorList (artifact)
    // Action: provides the activities-angle results for completeness checking
    const step = steps[0];
    expect(step.node).toBe('actors/ActivitiesActorList');
    expect(step.step_number).toBe(1);

    const node = index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('activities');
    // First step — followed by ThreatsActorList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ThreatsActorList'])
    );
  });

  it("step 2: actors/ThreatsActorList provides the threats-angle results for completeness checking", () => {
    // Node: actors/ThreatsActorList (artifact)
    // Action: provides the threats-angle results for completeness checking
    const step = steps[1];
    expect(step.node).toBe('actors/ThreatsActorList');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('threats');
    // Preceded by ActivitiesActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActivitiesActorList'])
    );
    // Followed by LifecycleActorList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-angle results for completeness checking", () => {
    // Node: actors/LifecycleActorList (artifact)
    // Action: provides the lifecycle-angle results for completeness checking
    const step = steps[2];
    expect(step.node).toBe('actors/LifecycleActorList');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('lifecycle');
    // Preceded by ThreatsActorList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ThreatsActorList'])
    );
    // Followed by ValidateThreeAngleCompleteness in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateThreeAngleCompleteness'])
    );
  });

  it("step 4: actors/ValidateThreeAngleCompleteness checks that the activities angle produced at least one actor", () => {
    // Node: actors/ValidateThreeAngleCompleteness (process)
    // Action: checks that the activities angle produced at least one actor
    const step = steps[3];
    expect(step.node).toBe('actors/ValidateThreeAngleCompleteness');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 discovery angles');
    // Preceded by LifecycleActorList (the direct predecessor in step sequence)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
  });

  it("step 5: actors/ValidateThreeAngleCompleteness checks that the threats angle produced at least one actor", () => {
    // Node: actors/ValidateThreeAngleCompleteness (process)
    // Action: checks that the threats angle produced at least one actor
    const step = steps[4];
    expect(step.node).toBe('actors/ValidateThreeAngleCompleteness');
    expect(step.step_number).toBe(5);
    // Same node as step 4 — repeated for each angle check
    expect(step.node).toBe(steps[3].node);
  });

  it("step 6: actors/ValidateThreeAngleCompleteness checks that the lifecycle angle produced at least one actor", () => {
    // Node: actors/ValidateThreeAngleCompleteness (process)
    // Action: checks that the lifecycle angle produced at least one actor
    const step = steps[5];
    expect(step.node).toBe('actors/ValidateThreeAngleCompleteness');
    expect(step.step_number).toBe(6);

    // ValidateThreeAngleCompleteness appears 3 consecutive times (steps 4-6)
    const validateSteps = steps.filter(
      s => s.node === 'actors/ValidateThreeAngleCompleteness'
    );
    expect(validateSteps).toHaveLength(3);
    // After the 3 validation steps, ThreeAngleDiscovery follows
    const node = index.nodes['actors/ValidateThreeAngleCompleteness'];
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ThreeAngleDiscovery'])
    );
  });

  it("step 7: actors/ThreeAngleDiscovery confirms all 3 angles are satisfied", () => {
    // Node: actors/ThreeAngleDiscovery (rule)
    // Action: confirms all 3 angles are satisfied
    const step = steps[6];
    expect(step.node).toBe('actors/ThreeAngleDiscovery');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('3 angles');
    // Preceded by ValidateThreeAngleCompleteness in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateThreeAngleCompleteness'])
    );
    // Followed by ActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 8: actors/ActorsFile provides the written _actors.yaml for structural validation", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: provides the written _actors.yaml for structural validation
    const step = steps[7];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(8);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by ThreeAngleDiscovery in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ThreeAngleDiscovery'])
    );
    // Followed by ValidateActorYAMLStructure in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
  });

  it("step 9: actors/ValidateActorYAMLStructure checks that every entry has type actor and a non-empty description", () => {
    // Node: actors/ValidateActorYAMLStructure (process)
    // Action: checks that every entry has type actor and a non-empty description
    const step = steps[8];
    expect(step.node).toBe('actors/ValidateActorYAMLStructure');
    expect(step.step_number).toBe(9);

    const node = index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('type actor');
    // Preceded by ActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 10: actors/ValidateActorYAMLStructure flags any malformed entries for correction before compilation", () => {
    // Node: actors/ValidateActorYAMLStructure (process)
    // Action: flags any malformed entries for correction before compilation
    const step = steps[9];
    expect(step.node).toBe('actors/ValidateActorYAMLStructure');
    expect(step.step_number).toBe(10);

    // ValidateActorYAMLStructure appears twice (steps 9-10)
    const yamlValSteps = steps.filter(
      s => s.node === 'actors/ValidateActorYAMLStructure'
    );
    expect(yamlValSteps).toHaveLength(2);
    // After the two validation steps, convergence/ValidateActorCompleteness follows
    const node = index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ValidateActorCompleteness'])
    );
  });

  it("step 11: convergence/ValidateActorCompleteness receives the validation result and proceeds if all checks pass", () => {
    // Node: convergence/ValidateActorCompleteness (process)
    // Action: receives the validation result and proceeds if all checks pass
    const step = steps[10];
    expect(step.node).toBe('convergence/ValidateActorCompleteness');
    expect(step.step_number).toBe(11);

    const node = index.nodes['convergence/ValidateActorCompleteness'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Preceded by ValidateActorYAMLStructure in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
    // Cross-module connection from actors to convergence
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey has two phases: 3-angle completeness check (steps 1-7) then YAML structure check (steps 8-11)", () => {
    // Phase 1: three actor lists → three validation checks → rule confirmation
    const phase1Nodes = steps.slice(0, 7).map(s => s.node);
    expect(phase1Nodes).toEqual([
      'actors/ActivitiesActorList',
      'actors/ThreatsActorList',
      'actors/LifecycleActorList',
      'actors/ValidateThreeAngleCompleteness',
      'actors/ValidateThreeAngleCompleteness',
      'actors/ValidateThreeAngleCompleteness',
      'actors/ThreeAngleDiscovery',
    ]);
    // Phase 2: actors file → structural validation → convergence handoff
    const phase2Nodes = steps.slice(7).map(s => s.node);
    expect(phase2Nodes).toEqual([
      'actors/ActorsFile',
      'actors/ValidateActorYAMLStructure',
      'actors/ValidateActorYAMLStructure',
      'convergence/ValidateActorCompleteness',
    ]);
  });

  it("only the final step crosses a module boundary", () => {
    const actorsSteps = steps.filter(s => s.node.startsWith('actors/'));
    const convergenceSteps = steps.filter(s => s.node.startsWith('convergence/'));
    expect(actorsSteps).toHaveLength(10);
    expect(convergenceSteps).toHaveLength(1);
    expect(convergenceSteps[0].step_number).toBe(11);
  });

  it("no actor triggers this journey — it is a validation pipeline, not actor-initiated", () => {
    // The first step is an artifact (ActivitiesActorList), not an actor node
    expect(journey.actor).toBeNull();
  });
});
