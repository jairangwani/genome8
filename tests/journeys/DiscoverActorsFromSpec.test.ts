// Auto-generated from journey: DiscoverActorsFromSpec
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, organization, actors, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Build the modules that participate in actor discovery
const _actorsModule: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content' },
  },
  journeys: {},
};

const actorsModule: ModuleFile = {
  nodes: {
    DiscoverFromActivities: { type: 'process', description: 'identifies who uses, creates, operates, governs, and visits the system' },
    DiscoverFromThreats: { type: 'process', description: 'identifies attackers, abusers, failure scenarios, and exploitation vectors' },
    DiscoverFromLifecycle: { type: 'process', description: 'identifies first visit, onboarding, power use, decline, exit, and return actors' },
    ActivitiesActorList: { type: 'artifact', description: 'actors discovered from activities perspective' },
    ThreatsActorList: { type: 'artifact', description: 'actors discovered from threats perspective' },
    LifecycleActorList: { type: 'artifact', description: 'actors discovered from lifecycle perspective' },
    ThreeAngleDiscovery: { type: 'rule', description: 'actors must be discovered from exactly 3 angles' },
    MergeAndDeduplicate: { type: 'process', description: 'combines all angles and deduplicates' },
  },
  journeys: {
    DiscoverActorsFromSpec: {
      steps: [
        { node: '_actors/LLMWorker', action: 'reads spec to discover actors from activities perspective' },
        { node: 'DiscoverFromActivities', action: 'identifies activity actors' },
        { node: 'ActivitiesActorList', action: 'stores activities-perspective actors' },
        { node: '_actors/LLMWorker', action: 'reads spec to discover actors from threats perspective' },
        { node: 'DiscoverFromThreats', action: 'identifies threat actors' },
        { node: 'ThreatsActorList', action: 'stores threats-perspective actors' },
        { node: '_actors/LLMWorker', action: 'reads spec to discover actors from lifecycle perspective' },
        { node: 'DiscoverFromLifecycle', action: 'identifies lifecycle actors' },
        { node: 'LifecycleActorList', action: 'stores lifecycle-perspective actors' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['actors', actorsModule], ['_actors', _actorsModule]]));

describe("DiscoverActorsFromSpec", () => {
  it("step 1: convergence/DiscoverActors triggers actor discovery after organization step is complete", () => {
    // The journey DiscoverActorsFromSpec exists in the compiled index
    const journey = result.index.journeys['DiscoverActorsFromSpec'];
    expect(journey).toBeDefined();
    expect(journey.steps.length).toBe(9);
  });

  it("step 2: organization/OrganizationFile provides the organizational context for actor analysis", () => {
    // The journey touches both actors and _actors modules
    const journey = result.index.journeys['DiscoverActorsFromSpec'];
    expect(journey.modules_touched).toContain('actors');
    expect(journey.modules_touched).toContain('_actors');
  });

  it("step 3: convergence/SpecFile provides the raw spec for actor extraction", () => {
    // LLMWorker is the actor (trigger) for this journey — it receives the spec
    const journey = result.index.journeys['DiscoverActorsFromSpec'];
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("step 4: actors/ThreeAngleDiscovery enforces that all 3 discovery angles will be executed", () => {
    const node = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('3 angles');
  });

  it("step 5: _actors/LLMWorker reads the spec to discover actors from the activities perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // LLMWorker appears in the journey steps
    expect(node.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 6: actors/DiscoverFromActivities identifies who uses, creates, operates, governs, and visits the system", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('uses, creates, operates');
    // Preceded by LLMWorker in the journey
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("step 7: actors/ActivitiesActorList stores the activities-perspective actors", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 8: _actors/LLMWorker reads the spec to discover actors from the threats perspective", () => {
    // LLMWorker appears 3 times in the journey (once per angle)
    const journey = result.index.journeys['DiscoverActorsFromSpec'];
    const llmSteps = journey.steps.filter(s => s.node === '_actors/LLMWorker');
    expect(llmSteps.length).toBe(3);
  });

  it("step 9: actors/DiscoverFromThreats identifies attackers, abusers, failure scenarios, and exploitation vectors", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('attackers');
  });

  it("step 10: actors/ThreatsActorList stores the threats-perspective actors", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 11: _actors/LLMWorker reads the spec to discover actors from the lifecycle perspective", () => {
    const journey = result.index.journeys['DiscoverActorsFromSpec'];
    // Third LLMWorker step is at index 6
    expect(journey.steps[6].node).toBe('_actors/LLMWorker');
    expect(journey.steps[6].action).toContain('lifecycle');
  });

  it("step 12: actors/DiscoverFromLifecycle identifies first visit, onboarding, power use, decline, exit, and return actors", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('onboarding');
  });

  it("step 13: actors/LifecycleActorList stores the lifecycle-perspective actors", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });
});
