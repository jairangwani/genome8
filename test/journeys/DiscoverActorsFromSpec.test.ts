// Auto-generated from journey: DiscoverActorsFromSpec
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, organization, actors, _actors

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['DiscoverActorsFromSpec'];
const steps = journey.steps;

describe("DiscoverActorsFromSpec", () => {
  it("journey exists in compiled index with correct module and step count", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(13);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'organization', 'actors', '_actors'])
    );
  });

  it("step 1: convergence/DiscoverActors triggers actor discovery after organization step is complete", () => {
    // Node: convergence/DiscoverActors (process)
    // Action: triggers actor discovery after organization step is complete
    const step = steps[0];
    expect(step.node).toBe('convergence/DiscoverActors');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // DiscoverActors is followed by OrganizationFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['organization/OrganizationFile'])
    );
  });

  it("step 2: organization/OrganizationFile provides the organizational context for actor analysis", () => {
    // Node: organization/OrganizationFile (artifact)
    // Action: provides the organizational context for actor analysis
    const step = steps[1];
    expect(step.node).toBe('organization/OrganizationFile');

    const node = index.nodes['organization/OrganizationFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('organization');
    // OrganizationFile is a cross-module artifact used by actors discovery
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: convergence/SpecFile provides the raw spec for actor extraction", () => {
    // Node: convergence/SpecFile (artifact)
    // Action: provides the raw spec for actor extraction
    const step = steps[2];
    expect(step.node).toBe('convergence/SpecFile');

    const node = index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // SpecFile is the sole human input — referenced across many modules
    expect(node.in_journeys.length).toBeGreaterThan(0);
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: actors/ThreeAngleDiscovery enforces that all 3 discovery angles will be executed", () => {
    // Node: actors/ThreeAngleDiscovery (rule)
    // Action: enforces that all 3 discovery angles will be executed
    const step = steps[3];
    expect(step.node).toBe('actors/ThreeAngleDiscovery');

    const node = index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('3 angles');
    // Rule node must appear before any of the 3 discovery processes
    expect(step.step_number).toBeLessThan(
      steps.find(s => s.node === 'actors/DiscoverFromActivities')!.step_number
    );
  });

  it("step 5: _actors/LLMWorker reads the spec to discover actors from the activities perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: reads the spec to discover actors from the activities perspective
    const step = steps[4];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.action).toContain('activities');

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // LLMWorker is the journey trigger (first actor encountered)
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("step 6: actors/DiscoverFromActivities identifies who uses, creates, operates, governs, and visits the system", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: identifies who uses, creates, operates, governs, and visits the system
    const step = steps[5];
    expect(step.node).toBe('actors/DiscoverFromActivities');

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    // Activities discovery is preceded by LLMWorker and followed by ActivitiesActorList
    expect(node.preceded_by).toEqual(expect.arrayContaining(['_actors/LLMWorker']));
    expect(node.followed_by).toEqual(expect.arrayContaining(['actors/ActivitiesActorList']));
  });

  it("step 7: actors/ActivitiesActorList stores the activities-perspective actors", () => {
    // Node: actors/ActivitiesActorList (artifact)
    // Action: stores the activities-perspective actors
    const step = steps[6];
    expect(step.node).toBe('actors/ActivitiesActorList');

    const node = index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // ActivitiesActorList feeds into the next LLMWorker call for threats angle
    expect(node.followed_by).toEqual(expect.arrayContaining(['_actors/LLMWorker']));
  });

  it("step 8: _actors/LLMWorker reads the spec to discover actors from the threats perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: reads the spec to discover actors from the threats perspective
    const step = steps[7];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.action).toContain('threats');
    // Same actor node used 3 times — once per discovery angle
    const llmSteps = steps.filter(s => s.node === '_actors/LLMWorker');
    expect(llmSteps).toHaveLength(3);
  });

  it("step 9: actors/DiscoverFromThreats identifies attackers, abusers, failure scenarios, and exploitation vectors", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: identifies attackers, abusers, failure scenarios, and exploitation vectors
    const step = steps[8];
    expect(step.node).toBe('actors/DiscoverFromThreats');

    const node = index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threat');
    expect(node.preceded_by).toEqual(expect.arrayContaining(['_actors/LLMWorker']));
    expect(node.followed_by).toEqual(expect.arrayContaining(['actors/ThreatsActorList']));
  });

  it("step 10: actors/ThreatsActorList stores the threats-perspective actors", () => {
    // Node: actors/ThreatsActorList (artifact)
    // Action: stores the threats-perspective actors
    const step = steps[9];
    expect(step.node).toBe('actors/ThreatsActorList');

    const node = index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('actors');
  });

  it("step 11: _actors/LLMWorker reads the spec to discover actors from the lifecycle perspective", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: reads the spec to discover actors from the lifecycle perspective
    const step = steps[10];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.action).toContain('lifecycle');
  });

  it("step 12: actors/DiscoverFromLifecycle identifies first visit, onboarding, power use, decline, exit, and return actors", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: identifies first visit, onboarding, power use, decline, exit, and return actors
    const step = steps[11];
    expect(step.node).toBe('actors/DiscoverFromLifecycle');

    const node = index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('lifecycle');
    expect(node.preceded_by).toEqual(expect.arrayContaining(['_actors/LLMWorker']));
    expect(node.followed_by).toEqual(expect.arrayContaining(['actors/LifecycleActorList']));
  });

  it("step 13: actors/LifecycleActorList stores the lifecycle-perspective actors", () => {
    // Node: actors/LifecycleActorList (artifact)
    // Action: stores the lifecycle-perspective actors
    const step = steps[12];
    expect(step.node).toBe('actors/LifecycleActorList');

    const node = index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('actors');
    // This is the last step
    expect(step.step_number).toBe(13);
  });

  it("three discovery processes run sequentially: activities → threats → lifecycle", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(activitiesIdx).toBeLessThan(threatsIdx);
    expect(threatsIdx).toBeLessThan(lifecycleIdx);
  });

  it("each discovery angle produces its own artifact before the next angle begins", () => {
    const activitiesListIdx = steps.findIndex(s => s.node === 'actors/ActivitiesActorList');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const threatsListIdx = steps.findIndex(s => s.node === 'actors/ThreatsActorList');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    // Activities artifact stored before threats discovery starts
    expect(activitiesListIdx).toBeLessThan(threatsIdx);
    // Threats artifact stored before lifecycle discovery starts
    expect(threatsListIdx).toBeLessThan(lifecycleIdx);
  });

  it("all three actor list artifacts connect to the merge pipeline", () => {
    const activitiesNode = index.nodes['actors/ActivitiesActorList'];
    const threatsNode = index.nodes['actors/ThreatsActorList'];
    const lifecycleNode = index.nodes['actors/LifecycleActorList'];

    // In MergeAndWriteActors, the three lists feed into MergeAndDeduplicate.
    // The compiled graph tracks direct consecutive-step edges.
    // All three lists must have outgoing connections (followed_by non-empty)
    // showing they are consumed downstream — not dead-end artifacts.
    expect(activitiesNode.followed_by.length).toBeGreaterThan(0);
    expect(threatsNode.followed_by.length).toBeGreaterThan(0);
    expect(lifecycleNode.followed_by.length).toBeGreaterThan(0);

    // MergeAndDeduplicate is preceded by LifecycleActorList (last list in MergeAndWriteActors)
    // and by all three Discover processes (in RediscoverActorsAfterSpecChange).
    // The key invariant: MergeAndDeduplicate has predecessors and all three lists are not orphans.
    const mergeNode = index.nodes['actors/MergeAndDeduplicate'];
    expect(mergeNode.preceded_by.length).toBeGreaterThan(0);
    expect(mergeNode.preceded_by).toEqual(
      expect.arrayContaining(['actors/LifecycleActorList'])
    );
  });

  it("journey crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'organization', 'actors', '_actors']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
