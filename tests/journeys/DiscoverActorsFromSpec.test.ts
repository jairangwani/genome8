// Auto-generated from journey: DiscoverActorsFromSpec
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, organization, actors, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildActorModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: actors discovered from 3 angles
  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'LLM that analyzes the spec to discover actors' },
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec and owns the project' },
      HumanDeveloper: { type: 'actor', description: 'Developer who builds and maintains the system' },
      MaliciousSpecAuthor: { type: 'actor', description: 'Adversary who injects malicious content into specs' },
      YAMLTamperer: { type: 'actor', description: 'Adversary who directly edits YAML files to corrupt entries' },
      NewProjectAdopter: { type: 'actor', description: 'First-time user onboarding to the system' },
      ReturningOwner: { type: 'actor', description: 'Owner returning after absence to check on progress' },
    },
    journeys: {},
  });

  // actors module: discovery processes and artifacts
  modules.set('actors', {
    nodes: {
      ThreeAngleDiscovery: { type: 'rule', description: 'Enforces that all 3 discovery angles will be executed' },
      DiscoverFromActivities: { type: 'process', description: 'Identifies who uses, creates, operates, governs, and visits the system' },
      ActivitiesActorList: { type: 'artifact', description: 'Stores the activities-perspective actors' },
      DiscoverFromThreats: { type: 'process', description: 'Identifies attackers, abusers, failure scenarios, and exploitation vectors' },
      ThreatsActorList: { type: 'artifact', description: 'Stores the threats-perspective actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'Identifies first visit, onboarding, power use, decline, exit, and return actors' },
      LifecycleActorList: { type: 'artifact', description: 'Stores the lifecycle-perspective actors' },
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

  // convergence module: provides DiscoverActors + SpecFile nodes
  modules.set('convergence', {
    nodes: {
      DiscoverActors: { type: 'process', description: 'Triggers actor discovery after organization is complete' },
      SpecFile: { type: 'artifact', description: 'The spec.md file on disk' },
    },
    journeys: {},
  });

  // organization module: provides OrganizationFile node
  modules.set('organization', {
    nodes: {
      OrganizationFile: { type: 'artifact', description: 'The organization.yaml listing modules and their spec sections' },
    },
    journeys: {},
  });

  return modules;
}

describe("DiscoverActorsFromSpec", () => {
  const modules = buildActorModules();
  const result = compileFromModules(modules);

  it("step 1: convergence/DiscoverActors triggers actor discovery after organization step is complete", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: organization/OrganizationFile provides the organizational context for actor analysis", () => {
    const node = result.index.nodes['organization/OrganizationFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → organization/OrganizationFile", () => {
    const from = result.index.nodes['convergence/DiscoverActors'];
    const to = result.index.nodes['organization/OrganizationFile'];
    expect(from.followed_by).toContain('organization/OrganizationFile');
    expect(to.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("step 3: convergence/SpecFile provides the raw spec for actor extraction", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/OrganizationFile');
  });

  it("connection: organization/OrganizationFile → convergence/SpecFile", () => {
    const from = result.index.nodes['organization/OrganizationFile'];
    expect(from.followed_by).toContain('convergence/SpecFile');
  });

  it("step 4: actors/ThreeAngleDiscovery enforces that all 3 discovery angles will be executed", () => {
    const node = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
  });

  it("connection: convergence/SpecFile → actors/ThreeAngleDiscovery", () => {
    const from = result.index.nodes['convergence/SpecFile'];
    expect(from.followed_by).toContain('actors/ThreeAngleDiscovery');
  });

  it("step 5: _actors/LLMWorker reads the spec to discover actors from the activities perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("connection: actors/ThreeAngleDiscovery → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/ThreeAngleDiscovery'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 6: actors/DiscoverFromActivities identifies who uses, creates, operates, governs, and visits the system", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('uses');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 7: actors/ActivitiesActorList stores the activities-perspective actors", () => {
    const node = result.index.nodes['actors/ActivitiesActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/ActivitiesActorList", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/ActivitiesActorList');
  });

  it("step 8: _actors/LLMWorker reads the spec to discover actors from the threats perspective", () => {
    // LLMWorker is reused — preceded_by should include ActivitiesActorList
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/ActivitiesActorList');
  });

  it("connection: actors/ActivitiesActorList → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/ActivitiesActorList'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/DiscoverFromThreats identifies attackers, abusers, failure scenarios, and exploitation vectors", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromThreats", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 10: actors/ThreatsActorList stores the threats-perspective actors", () => {
    const node = result.index.nodes['actors/ThreatsActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/ThreatsActorList", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/ThreatsActorList');
  });

  it("step 11: _actors/LLMWorker reads the spec to discover actors from the lifecycle perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/ThreatsActorList');
  });

  it("connection: actors/ThreatsActorList → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/ThreatsActorList'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 12: actors/DiscoverFromLifecycle identifies first visit, onboarding, power use, decline, exit, and return actors", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromLifecycle", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 13: actors/LifecycleActorList stores the lifecycle-perspective actors", () => {
    const node = result.index.nodes['actors/LifecycleActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/LifecycleActorList", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/LifecycleActorList');
  });

  it("all 3 discovery angles produce actor nodes in the compiled index", () => {
    // Activities angle actors
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/HumanDeveloper']).toBeDefined();
    // Threats angle actors
    expect(result.index.nodes['_actors/MaliciousSpecAuthor']).toBeDefined();
    expect(result.index.nodes['_actors/YAMLTamperer']).toBeDefined();
    // Lifecycle angle actors
    expect(result.index.nodes['_actors/NewProjectAdopter']).toBeDefined();
    expect(result.index.nodes['_actors/ReturningOwner']).toBeDefined();

    // All should have type 'actor'
    for (const name of ['LLMWorker', 'ProjectOwner', 'HumanDeveloper', 'MaliciousSpecAuthor', 'YAMLTamperer', 'NewProjectAdopter', 'ReturningOwner']) {
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
