// Auto-generated from journey: ProvideActorsToCompilation
// Module: actors
// Triggered by: _actors/Compiler
// Modules touched: actors, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('compilation', {
    nodes: {
      YAMLParsing: { type: 'process', description: 'parses each YAML module file into structured node and journey definitions' },
    },
  });

  modules.set('graph', {
    nodes: {
      NodeDefinition: { type: 'process', description: 'creates a node definition for each discovered node in a module' },
      NodeRegistry: { type: 'artifact', description: 'the registry of all compiled nodes indexed by full name' },
      CompiledIndex: { type: 'artifact', description: 'the final compiled index containing all nodes, journeys, connections, and stats' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
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

  return modules;
}

describe("ProvideActorsToCompilation", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsToCompilation'];

  it("step 1: actors/ActorsFile provides the validated _actors.yaml file on disk", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('ProvideActorsToCompilation'))).toBe(true);
  });

  it("step 2: _actors/Compiler includes _actors.yaml in the set of files to parse", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → _actors/Compiler", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 3: compilation/YAMLParsing parses _actors.yaml into structured actor node definitions", () => {
    const node = result.index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/YAMLParsing", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/YAMLParsing');
  });

  it("step 4: graph/NodeDefinition creates a node definition for each discovered actor", () => {
    const node = result.index.nodes['graph/NodeDefinition'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/YAMLParsing');
  });

  it("connection: compilation/YAMLParsing → graph/NodeDefinition", () => {
    const src = result.index.nodes['compilation/YAMLParsing'];
    expect(src.followed_by).toContain('graph/NodeDefinition');
  });

  it("step 5: graph/NodeRegistry registers each actor node so _actors/ references in journeys can resolve", () => {
    const node = result.index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeDefinition');
  });

  it("connection: graph/NodeDefinition → graph/NodeRegistry", () => {
    const src = result.index.nodes['graph/NodeDefinition'];
    expect(src.followed_by).toContain('graph/NodeRegistry');
  });

  it("step 6: graph/CompiledIndex the compiled index now contains all actor nodes alongside module nodes", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeRegistry');
  });

  it("connection: graph/NodeRegistry → graph/CompiledIndex", () => {
    const src = result.index.nodes['graph/NodeRegistry'];
    expect(src.followed_by).toContain('graph/CompiledIndex');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
