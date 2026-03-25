// Auto-generated from journey: ProvideActorsToCompilation
// Module: actors
// Triggered by: _actors/Compiler
// Modules touched: actors, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ProvideActorsToCompilation'];
const steps = journey.steps;

describe("ProvideActorsToCompilation", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['actors', '_actors', 'compilation', 'graph'])
    );
  });

  it("step 1: actors/ActorsFile provides the validated _actors.yaml file on disk", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: provides the validated _actors.yaml file on disk
    const step = steps[0];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(1);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // First step — followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 2: _actors/Compiler includes _actors.yaml in the set of files to parse", () => {
    // Node: _actors/Compiler (actor)
    // Action: includes _actors.yaml in the set of files to parse
    const step = steps[1];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(2);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Compiler is the journey trigger (first actor node encountered)
    expect(journey.actor).toBe('_actors/Compiler');
    // Preceded by ActorsFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
    // Followed by YAMLParsing in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/YAMLParsing'])
    );
  });

  it("step 3: compilation/YAMLParsing parses _actors.yaml into structured actor node definitions", () => {
    // Node: compilation/YAMLParsing (process)
    // Action: parses _actors.yaml into structured actor node definitions
    const step = steps[2];
    expect(step.node).toBe('compilation/YAMLParsing');
    expect(step.step_number).toBe(3);

    const node = index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by NodeDefinition in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/NodeDefinition'])
    );
    // Cross-module connections from _actors→compilation and compilation→graph edges
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: graph/NodeDefinition creates a node definition for each discovered actor", () => {
    // Node: graph/NodeDefinition (process)
    // Action: creates a node definition for each discovered actor
    const step = steps[3];
    expect(step.node).toBe('graph/NodeDefinition');
    expect(step.step_number).toBe(4);

    const node = index.nodes['graph/NodeDefinition'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('graph');
    // Preceded by YAMLParsing in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/YAMLParsing'])
    );
    // Followed by NodeRegistry in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/NodeRegistry'])
    );
  });

  it("step 5: graph/NodeRegistry registers each actor node so _actors/ references in journeys can resolve", () => {
    // Node: graph/NodeRegistry (artifact)
    // Action: registers each actor node so _actors/ references in journeys can resolve
    const step = steps[4];
    expect(step.node).toBe('graph/NodeRegistry');
    expect(step.step_number).toBe(5);

    const node = index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('graph');
    // Preceded by NodeDefinition in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/NodeDefinition'])
    );
    // Followed by CompiledIndex in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/CompiledIndex'])
    );
  });

  it("step 6: graph/CompiledIndex the compiled index now contains all actor nodes alongside module nodes", () => {
    // Node: graph/CompiledIndex (artifact)
    // Action: the compiled index now contains all actor nodes alongside module nodes
    const step = steps[5];
    expect(step.node).toBe('graph/CompiledIndex');
    expect(step.step_number).toBe(6);

    const node = index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('graph');
    // Preceded by NodeRegistry in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/NodeRegistry'])
    );
    // CompiledIndex is referenced across many modules
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
    expect(node.in_journeys.length).toBeGreaterThan(0);
  });

  it("journey forms a linear pipeline: file → compiler → parse → define → register → index", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'actors/ActorsFile',
      '_actors/Compiler',
      'compilation/YAMLParsing',
      'graph/NodeDefinition',
      'graph/NodeRegistry',
      'graph/CompiledIndex',
    ]);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['actors', '_actors', 'compilation', 'graph']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("every consecutive step pair crosses a module boundary except the last two", () => {
    // actors→_actors, _actors→compilation, compilation→graph, graph→graph, graph→graph
    const modules = steps.map(s => s.node.split('/')[0]);
    expect(modules[0]).not.toBe(modules[1]); // actors → _actors
    expect(modules[1]).not.toBe(modules[2]); // _actors → compilation
    expect(modules[2]).not.toBe(modules[3]); // compilation → graph
    expect(modules[3]).toBe(modules[4]);     // graph → graph
    expect(modules[4]).toBe(modules[5]);     // graph → graph
  });

  it("Compiler is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/Compiler');
    const node = index.nodes['_actors/Compiler'];
    expect(node.type).toBe('actor');
  });
});
