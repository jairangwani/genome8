// Auto-generated from journey: EndToEndActorDiscoveryToModuleCreation
// Module: actors
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence, actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts
// Implementation: src/excerpt.ts

function buildEndToEndModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module
  modules.set('_actors', {
    nodes: {
      ProjectOwner: { type: 'actor', description: 'Has written spec.md describing their system' },
      Compiler: { type: 'actor', description: 'The compilation engine' },
    },
    journeys: {},
  });

  // convergence module
  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'Reads the spec from disk' },
      WriteOrganization: { type: 'process', description: 'Organization step produces the module list' },
      DiscoverActors: { type: 'process', description: 'Triggers actor discovery after organization is complete' },
      ModuleCreation: { type: 'process', description: 'Begins creating modules with actors available as valid references' },
    },
    journeys: {},
  });

  // actors module
  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Discovers activity actors from the spec' },
      DiscoverFromThreats: { type: 'process', description: 'Discovers threat actors from the spec' },
      DiscoverFromLifecycle: { type: 'process', description: 'Discovers lifecycle actors from the spec' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges and deduplicates actors from all 3 angles' },
      WriteActorsFile: { type: 'process', description: 'Writes _actors.yaml to disk' },
      ValidateActorYAMLStructure: { type: 'process', description: 'Validates the written file has correct structure' },
      ProvideActorsForModuleCreation: { type: 'process', description: 'Supplies the actor list to each module excerpt context' },
    },
    journeys: {
      EndToEndActorDiscoveryToModuleCreation: {
        steps: [
          { node: '_actors/ProjectOwner', action: 'has written spec.md describing their system' },
          { node: 'convergence/ReadSpec', action: 'reads the spec from disk' },
          { node: 'convergence/WriteOrganization', action: 'organization step produces the module list' },
          { node: 'convergence/DiscoverActors', action: 'triggers actor discovery after organization is complete' },
          { node: 'DiscoverFromActivities', action: 'discovers activity actors from the spec' },
          { node: 'DiscoverFromThreats', action: 'discovers threat actors from the spec' },
          { node: 'DiscoverFromLifecycle', action: 'discovers lifecycle actors from the spec' },
          { node: 'MergeAndDeduplicate', action: 'merges and deduplicates actors from all 3 angles' },
          { node: 'WriteActorsFile', action: 'writes _actors.yaml to disk' },
          { node: 'ValidateActorYAMLStructure', action: 'validates the written file has correct structure' },
          { node: '_actors/Compiler', action: 'compiles _actors.yaml into the graph alongside module files' },
          { node: 'graph/NodeRegistry', action: 'registers actor nodes so journey steps can reference _actors/ActorName' },
          { node: 'convergence/ModuleCreation', action: 'begins creating modules with actors available as valid references' },
          { node: 'ProvideActorsForModuleCreation', action: 'supplies the actor list to each module excerpt context' },
          { node: 'excerpt/AssembleExcerpt', action: 'includes relevant actors in the module creation excerpt' },
        ],
      },
    },
  });

  // graph module
  modules.set('graph', {
    nodes: {
      NodeRegistry: { type: 'artifact', description: 'Registry of all known nodes so references can resolve' },
    },
    journeys: {},
  });

  // excerpt module
  modules.set('excerpt', {
    nodes: {
      AssembleExcerpt: { type: 'process', description: 'Assembles the final excerpt with actors, nodes, journeys' },
    },
    journeys: {},
  });

  return modules;
}

describe("EndToEndActorDiscoveryToModuleCreation", () => {
  const modules = buildEndToEndModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EndToEndActorDiscoveryToModuleCreation'];

  it("step 1: _actors/ProjectOwner has written spec.md describing their system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: convergence/ReadSpec reads the spec from disk", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const from = result.index.nodes['_actors/ProjectOwner'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: convergence/WriteOrganization organization step produces the module list", () => {
    const node = result.index.nodes['convergence/WriteOrganization'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → convergence/WriteOrganization", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('convergence/WriteOrganization');
  });

  it("step 4: convergence/DiscoverActors triggers actor discovery after organization is complete", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('convergence/WriteOrganization');
  });

  it("connection: convergence/WriteOrganization → convergence/DiscoverActors", () => {
    const from = result.index.nodes['convergence/WriteOrganization'];
    expect(from.followed_by).toContain('convergence/DiscoverActors');
  });

  it("step 5: actors/DiscoverFromActivities discovers activity actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['convergence/DiscoverActors'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 6: actors/DiscoverFromThreats discovers threat actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 7: actors/DiscoverFromLifecycle discovers lifecycle actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 8: actors/MergeAndDeduplicate merges and deduplicates actors from all 3 angles", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 9: actors/WriteActorsFile writes _actors.yaml to disk", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/WriteActorsFile", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 10: actors/ValidateActorYAMLStructure validates the written file has correct structure", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ValidateActorYAMLStructure", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 11: _actors/Compiler compiles _actors.yaml into the graph alongside module files", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → _actors/Compiler", () => {
    const from = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: graph/NodeRegistry registers actor nodes so journey steps can reference _actors/ActorName", () => {
    const node = result.index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → graph/NodeRegistry", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('graph/NodeRegistry');
  });

  it("step 13: convergence/ModuleCreation begins creating modules with actors available as valid references", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('graph/NodeRegistry');
  });

  it("connection: graph/NodeRegistry → convergence/ModuleCreation", () => {
    const from = result.index.nodes['graph/NodeRegistry'];
    expect(from.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 14: actors/ProvideActorsForModuleCreation supplies the actor list to each module's excerpt context", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → actors/ProvideActorsForModuleCreation", () => {
    const from = result.index.nodes['convergence/ModuleCreation'];
    expect(from.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 15: excerpt/AssembleExcerpt includes relevant actors in the module creation excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/AssembleExcerpt", () => {
    const from = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(from.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("journey covers full pipeline from spec to excerpt (15 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(15);
    expect(journey.steps[0].node).toBe('_actors/ProjectOwner');
    expect(journey.steps[14].node).toBe('excerpt/AssembleExcerpt');
  });

  it("journey actor is ProjectOwner (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/ProjectOwner');
  });

  it("triggered_by_actors propagates through the pipeline", () => {
    const readSpec = result.index.nodes['convergence/ReadSpec'];
    expect(readSpec.triggered_by_actors).toContain('_actors/ProjectOwner');
  });

  it("excerpt includes actor context", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'actors',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: '',
    });
    expect(excerpt).toContain('TRIGGERED BY');
    expect(excerpt).toContain('ProjectOwner');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
