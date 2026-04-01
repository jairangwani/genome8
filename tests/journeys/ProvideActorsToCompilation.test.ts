// Auto-generated from journey: ProvideActorsToCompilation
// Module: actors
// Triggered by: _actors/Compiler
// Modules touched: actors, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts
// Implementation: src/types.ts

function buildCompilationModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: actors that get parsed into the compiled index
  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'The compilation engine that includes _actors.yaml' },
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec' },
      HumanDeveloper: { type: 'actor', description: 'Developer who builds the system' },
    },
    journeys: {},
  });

  // actors module: provides ActorsFile artifact
  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'The validated _actors.yaml file on disk' },
    },
    journeys: {
      ProvideActorsToCompilation: {
        steps: [
          { node: 'ActorsFile', action: 'provides the validated _actors.yaml file on disk' },
          { node: '_actors/Compiler', action: 'includes _actors.yaml in the set of files to parse' },
          { node: 'compilation/YAMLParsing', action: 'parses _actors.yaml into structured actor node definitions' },
          { node: 'graph/NodeDefinition', action: 'creates a node definition for each discovered actor' },
          { node: 'graph/NodeRegistry', action: 'registers each actor node so _actors/ references in journeys can resolve' },
          { node: 'graph/CompiledIndex', action: 'the compiled index now contains all actor nodes alongside module nodes' },
        ],
      },
    },
  });

  // compilation module
  modules.set('compilation', {
    nodes: {
      YAMLParsing: { type: 'process', description: 'Parses YAML module files into structured data' },
    },
    journeys: {},
  });

  // graph module
  modules.set('graph', {
    nodes: {
      NodeDefinition: { type: 'process', description: 'Creates a node definition for each node entry in a module' },
      NodeRegistry: { type: 'artifact', description: 'Registry of all known nodes so references can resolve' },
      CompiledIndex: { type: 'artifact', description: 'The final compiled index with all nodes, journeys, and connections' },
    },
    journeys: {},
  });

  return modules;
}

describe("ProvideActorsToCompilation", () => {
  const modules = buildCompilationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsToCompilation'];

  it("step 1: actors/ActorsFile provides the validated _actors.yaml file on disk", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: _actors/Compiler includes _actors.yaml in the set of files to parse", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → _actors/Compiler", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    const to = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('_actors/Compiler');
    expect(to.preceded_by).toContain('actors/ActorsFile');
  });

  it("step 3: compilation/YAMLParsing parses _actors.yaml into structured actor node definitions", () => {
    const node = result.index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/YAMLParsing", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/YAMLParsing');
  });

  it("step 4: graph/NodeDefinition creates a node definition for each discovered actor", () => {
    const node = result.index.nodes['graph/NodeDefinition'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/YAMLParsing');
  });

  it("connection: compilation/YAMLParsing → graph/NodeDefinition", () => {
    const from = result.index.nodes['compilation/YAMLParsing'];
    expect(from.followed_by).toContain('graph/NodeDefinition');
  });

  it("step 5: graph/NodeRegistry registers each actor node so _actors/ references in journeys can resolve", () => {
    const node = result.index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeDefinition');
  });

  it("connection: graph/NodeDefinition → graph/NodeRegistry", () => {
    const from = result.index.nodes['graph/NodeDefinition'];
    expect(from.followed_by).toContain('graph/NodeRegistry');
  });

  it("step 6: graph/CompiledIndex the compiled index now contains all actor nodes alongside module nodes", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeRegistry');
  });

  it("connection: graph/NodeRegistry → graph/CompiledIndex", () => {
    const from = result.index.nodes['graph/NodeRegistry'];
    expect(from.followed_by).toContain('graph/CompiledIndex');
  });

  it("_actors nodes are registered in the compiled index alongside module nodes", () => {
    // Actor nodes from _actors module
    expect(result.index.nodes['_actors/Compiler']).toBeDefined();
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/HumanDeveloper']).toBeDefined();

    // Module nodes coexist
    expect(result.index.nodes['actors/ActorsFile']).toBeDefined();
    expect(result.index.nodes['compilation/YAMLParsing']).toBeDefined();
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
  });

  it("all _actors nodes have type actor", () => {
    for (const name of ['Compiler', 'ProjectOwner', 'HumanDeveloper']) {
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
  });

  it("journey actor is _actors/Compiler (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("triggered_by_actors is populated for nodes in the journey", () => {
    const node = result.index.nodes['compilation/YAMLParsing'];
    expect(node.triggered_by_actors).toContain('_actors/Compiler');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
