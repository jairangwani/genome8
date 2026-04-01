// Auto-generated from journey: DiscoverActorsFromSpec
// Module: actors
// Triggered by: convergence/DiscoverActors
// Modules touched: convergence, organization, actors, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
    },
  });

  modules.set('convergence', {
    nodes: {
      DiscoverActors: { type: 'process', description: 'delegates to LLM to discover actors from 3 angles (activities, threats, lifecycle) and write _actors.yaml' },
      SpecFile: { type: 'artifact', description: 'the spec.md file written by the ProjectOwner as the sole human input' },
    },
  });

  modules.set('organization', {
    nodes: {
      OrganizationFile: { type: 'artifact', description: 'the ORGANIZATION.md file containing scope, module list, dependency order, and independence analysis' },
    },
  });

  modules.set('actors', {
    nodes: {
      ThreeAngleDiscovery: { type: 'rule', description: 'actors must be discovered from exactly 3 angles (activities, threats, lifecycle) to ensure comprehensive coverage' },
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      ActivitiesActorList: { type: 'artifact', description: 'the list of actors discovered from the activities perspective before merging' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      ThreatsActorList: { type: 'artifact', description: 'the list of actors discovered from the threats perspective before merging' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
      LifecycleActorList: { type: 'artifact', description: 'the list of actors discovered from the lifecycle perspective before merging' },
    },
    journeys: {
      DiscoverActorsFromSpec: {
        steps: [
          { node: 'convergence/DiscoverActors', action: 'triggers actor discovery after organization step is complete' },
          { node: 'organization/OrganizationFile', action: 'provides the organizational context for actor analysis' },
          { node: 'convergence/SpecFile', action: 'provides the raw spec for actor extraction' },
          { node: 'ThreeAngleDiscovery', action: 'enforces that all 3 discovery angles will be executed' },
          { node: '_actors/LLMWorker', action: 'reads the spec to discover actors from the activities perspective' },
          { node: 'DiscoverFromActivities', action: 'identifies who uses, creates, operates, governs, and visits the system' },
          { node: 'ActivitiesActorList', action: 'stores the activities-perspective actors' },
          { node: '_actors/LLMWorker', action: 'reads the spec to discover actors from the threats perspective' },
          { node: 'DiscoverFromThreats', action: 'identifies attackers, abusers, failure scenarios, and exploitation vectors' },
          { node: 'ThreatsActorList', action: 'stores the threats-perspective actors' },
          { node: '_actors/LLMWorker', action: 'reads the spec to discover actors from the lifecycle perspective' },
          { node: 'DiscoverFromLifecycle', action: 'identifies first visit, onboarding, power use, decline, exit, and return actors' },
          { node: 'LifecycleActorList', action: 'stores the lifecycle-perspective actors' },
        ],
      },
    },
  });

  return modules;
}

describe("DiscoverActorsFromSpec", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DiscoverActorsFromSpec'];

  it("step 1: convergence/DiscoverActors triggers actor discovery after organization step is complete", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('DiscoverActorsFromSpec'))).toBe(true);
  });

  it("step 2: organization/OrganizationFile provides the organizational context for actor analysis", () => {
    const node = result.index.nodes['organization/OrganizationFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → organization/OrganizationFile", () => {
    const src = result.index.nodes['convergence/DiscoverActors'];
    expect(src.followed_by).toContain('organization/OrganizationFile');
  });

  it("step 3: convergence/SpecFile provides the raw spec for actor extraction", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/OrganizationFile');
  });

  it("connection: organization/OrganizationFile → convergence/SpecFile", () => {
    const src = result.index.nodes['organization/OrganizationFile'];
    expect(src.followed_by).toContain('convergence/SpecFile');
  });

  it("step 4: actors/ThreeAngleDiscovery enforces that all 3 discovery angles will be executed", () => {
    const node = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('convergence/SpecFile');
  });

  it("connection: convergence/SpecFile → actors/ThreeAngleDiscovery", () => {
    const src = result.index.nodes['convergence/SpecFile'];
    expect(src.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("step 5: _actors/LLMWorker reads the spec to discover actors from the activities perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("connection: actors/ThreeAngleDiscovery → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 6: actors/DiscoverFromActivities identifies who uses, creates, operates, governs, and visits the system", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 7: actors/ActivitiesActorList stores the activities-perspective actors", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/ActivitiesActorList", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('actors/ActivitiesActorList');
  });

  it("step 8: _actors/LLMWorker reads the spec to discover actors from the threats perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/ActivitiesActorList'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/DiscoverFromThreats identifies attackers, abusers, failure scenarios, and exploitation vectors", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 10: actors/ThreatsActorList stores the threats-perspective actors", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/ThreatsActorList", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 11: _actors/LLMWorker reads the spec to discover actors from the lifecycle perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/ThreatsActorList'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 12: actors/DiscoverFromLifecycle identifies first visit, onboarding, power use, decline, exit, and return actors", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 13: actors/LifecycleActorList stores the lifecycle-perspective actors", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/LifecycleActorList", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('actors/LifecycleActorList');
  });

  it("LLMWorker appears 3 times with distinct predecessors", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/ThreeAngleDiscovery');
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("journey has 13 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(13);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
