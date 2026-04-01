// Auto-generated from journey: EndToEndActorDiscoveryToModuleCreation
// Module: actors
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence, actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ProjectOwner: { type: 'actor', description: 'the human who writes spec.md as the sole input to the system' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'reads the spec.md file from disk as the first pipeline step' },
      WriteOrganization: { type: 'process', description: 'analyzes the spec to produce ORGANIZATION.md with module list and dependencies' },
      DiscoverActors: { type: 'process', description: 'delegates to LLM to discover actors from 3 angles and write _actors.yaml' },
      ModuleCreation: { type: 'process', description: 'creates each module by assembling an excerpt and delegating to the LLM worker' },
    },
  });

  modules.set('graph', {
    nodes: {
      NodeRegistry: { type: 'artifact', description: 'the registry of all compiled nodes indexed by full name' },
    },
  });

  modules.set('excerpt', {
    nodes: {
      AssembleExcerpt: { type: 'process', description: 'assembles the final excerpt including all context sections for the worker' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
      ValidateActorYAMLStructure: { type: 'process', description: 'checks that each entry in _actors.yaml has type actor and a non-empty description' },
      ProvideActorsForModuleCreation: { type: 'process', description: 'supplies the actor list to the excerpt generator so module workers know which _actors/ references are valid' },
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

  return modules;
}

describe("EndToEndActorDiscoveryToModuleCreation", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EndToEndActorDiscoveryToModuleCreation'];

  it("step 1: _actors/ProjectOwner has written spec.md describing their system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('EndToEndActorDiscoveryToModuleCreation'))).toBe(true);
  });

  it("step 2: convergence/ReadSpec reads the spec from disk", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const src = result.index.nodes['_actors/ProjectOwner'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: convergence/WriteOrganization organization step produces the module list", () => {
    const node = result.index.nodes['convergence/WriteOrganization'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → convergence/WriteOrganization", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('convergence/WriteOrganization');
  });

  it("step 4: convergence/DiscoverActors triggers actor discovery after organization is complete", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/WriteOrganization');
  });

  it("connection: convergence/WriteOrganization → convergence/DiscoverActors", () => {
    const src = result.index.nodes['convergence/WriteOrganization'];
    expect(src.followed_by).toContain('convergence/DiscoverActors');
  });

  it("step 5: actors/DiscoverFromActivities discovers activity actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['convergence/DiscoverActors'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 6: actors/DiscoverFromThreats discovers threat actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 7: actors/DiscoverFromLifecycle discovers lifecycle actors from the spec", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 8: actors/MergeAndDeduplicate merges and deduplicates actors from all 3 angles", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 9: actors/WriteActorsFile writes _actors.yaml to disk", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/WriteActorsFile", () => {
    const src = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 10: actors/ValidateActorYAMLStructure validates the written file has correct structure", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ValidateActorYAMLStructure", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 11: _actors/Compiler compiles _actors.yaml into the graph alongside module files", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → _actors/Compiler", () => {
    const src = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: graph/NodeRegistry registers actor nodes so journey steps can reference _actors/ActorName", () => {
    const node = result.index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → graph/NodeRegistry", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('graph/NodeRegistry');
  });

  it("step 13: convergence/ModuleCreation begins creating modules with actors available as valid references", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/NodeRegistry');
  });

  it("connection: graph/NodeRegistry → convergence/ModuleCreation", () => {
    const src = result.index.nodes['graph/NodeRegistry'];
    expect(src.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 14: actors/ProvideActorsForModuleCreation supplies the actor list to each module's excerpt context", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → actors/ProvideActorsForModuleCreation", () => {
    const src = result.index.nodes['convergence/ModuleCreation'];
    expect(src.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 15: excerpt/AssembleExcerpt includes relevant actors in the module creation excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("journey has 15 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(15);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
