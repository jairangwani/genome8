// Auto-generated from journey: NewProjectAdoption
// Module: actors
// Triggered by: _actors/NewProjectAdopter
// Modules touched: _actors, convergence, organization, actors

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['NewProjectAdoption'];
const steps = journey.steps;

describe("NewProjectAdoption", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(9);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'convergence', 'organization', 'actors'])
    );
  });

  it("step 1: _actors/NewProjectAdopter encounters genome8 and wants to try it on their project", () => {
    // Node: _actors/NewProjectAdopter (actor)
    // Action: encounters genome8 and wants to try it on their project
    const step = steps[0];
    expect(step.node).toBe('_actors/NewProjectAdopter');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/NewProjectAdopter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('first time');
    // NewProjectAdopter is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/NewProjectAdopter');
    // Followed by ProjectOwner in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/ProjectOwner'])
    );
  });

  it("step 2: _actors/ProjectOwner writes their first spec.md describing their system", () => {
    // Node: _actors/ProjectOwner (actor)
    // Action: writes their first spec.md describing their system
    const step = steps[1];
    expect(step.node).toBe('_actors/ProjectOwner');
    expect(step.step_number).toBe(2);

    const node = index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('spec.md');
    // Preceded by NewProjectAdopter in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/NewProjectAdopter'])
    );
    // Followed by ConvergenceCLI in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceCLI'])
    );
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence for the first time", () => {
    // Node: convergence/ConvergenceCLI (interface)
    // Action: receives the command to start convergence for the first time
    const step = steps[2];
    expect(step.node).toBe('convergence/ConvergenceCLI');
    expect(step.step_number).toBe(3);

    const node = index.nodes['convergence/ConvergenceCLI'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.description).toContain('command-line');
    expect(node.module).toBe('convergence');
    // Preceded by ProjectOwner in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ProjectOwner'])
    );
    // Followed by ReadSpec in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: convergence/ReadSpec reads the new project's spec.md", () => {
    // Node: convergence/ReadSpec (process)
    // Action: reads the new project's spec.md
    const step = steps[3];
    expect(step.node).toBe('convergence/ReadSpec');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Preceded by ConvergenceCLI in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceCLI'])
    );
    // Followed by IdentifyModules in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
  });

  it("step 5: organization/IdentifyModules discovers the project's modules from the spec", () => {
    // Node: organization/IdentifyModules (process)
    // Action: discovers the project's modules from the spec
    const step = steps[4];
    expect(step.node).toBe('organization/IdentifyModules');
    expect(step.step_number).toBe(5);

    const node = index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('organization');
    // Preceded by ReadSpec in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: actors/DiscoverFromActivities discovers the project's actors from the activities angle", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: discovers the project's actors from the activities angle
    const step = steps[5];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(6);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    // Preceded by IdentifyModules in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
    // Followed by DiscoverFromThreats in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
  });

  it("step 7: actors/DiscoverFromThreats discovers threat actors relevant to the new project", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: discovers threat actors relevant to the new project
    const step = steps[6];
    expect(step.node).toBe('actors/DiscoverFromThreats');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threat');
    // Preceded by DiscoverFromActivities in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    // Followed by DiscoverFromLifecycle in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
  });

  it("step 8: actors/DiscoverFromLifecycle discovers lifecycle actors for the new project", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: discovers lifecycle actors for the new project
    const step = steps[7];
    expect(step.node).toBe('actors/DiscoverFromLifecycle');
    expect(step.step_number).toBe(8);

    const node = index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('lifecycle');
    // Preceded by DiscoverFromThreats in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
  });

  it("step 9: convergence/ConvergenceState tracks the first-time convergence through all pipeline steps", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: tracks the first-time convergence through all pipeline steps
    const step = steps[8];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(9);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Preceded by DiscoverFromLifecycle in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full first-time adoption sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/NewProjectAdopter',
      '_actors/ProjectOwner',
      'convergence/ConvergenceCLI',
      'convergence/ReadSpec',
      'organization/IdentifyModules',
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
      'convergence/ConvergenceState',
    ]);
  });

  it("three discovery angles run sequentially: activities → threats → lifecycle", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(activitiesIdx).toBeLessThan(threatsIdx);
    expect(threatsIdx).toBeLessThan(lifecycleIdx);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'convergence', 'organization', 'actors']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("NewProjectAdopter is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/NewProjectAdopter');
    const node = index.nodes['_actors/NewProjectAdopter'];
    expect(node.type).toBe('actor');
  });
});
