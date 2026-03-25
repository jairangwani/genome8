// Auto-generated from journey: YAMLTamperingDefense
// Module: actors
// Triggered by: _actors/YAMLTamperer
// Modules touched: _actors, actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['YAMLTamperingDefense'];
const steps = journey.steps;

describe("YAMLTamperingDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation', 'graph'])
    );
  });

  it("step 1: _actors/YAMLTamperer directly edits _actors.yaml to inject invalid actor definitions or corrupt entries", () => {
    // Node: _actors/YAMLTamperer (actor)
    // Action: directly edits _actors.yaml to inject invalid actor definitions or corrupt entries
    const step = steps[0];
    expect(step.node).toBe('_actors/YAMLTamperer');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/YAMLTamperer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('YAML');
    // YAMLTamperer is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/YAMLTamperer');
    // Followed by ActorsFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 2: actors/ActorsFile contains the tampered content", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: contains the tampered content
    const step = steps[1];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by YAMLTamperer in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/YAMLTamperer'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Cross-module artifact
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: _actors/Compiler runs compilation on the tampered file", () => {
    // Node: _actors/Compiler (actor)
    // Action: runs compilation on the tampered file
    const step = steps[2];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(3);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Preceded by ActorsFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
    // Followed by YAMLErrorReporting in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/YAMLErrorReporting'])
    );
  });

  it("step 4: compilation/YAMLErrorReporting catches any YAML syntax errors from the tampering", () => {
    // Node: compilation/YAMLErrorReporting (process)
    // Action: catches any YAML syntax errors from the tampering
    const step = steps[3];
    expect(step.node).toBe('compilation/YAMLErrorReporting');
    expect(step.step_number).toBe(4);

    const node = index.nodes['compilation/YAMLErrorReporting'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('YAML syntax errors');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by NodeTypeSchema in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/NodeTypeSchema'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: graph/NodeTypeSchema validates that tampered entries still conform to the actor type schema", () => {
    // Node: graph/NodeTypeSchema (rule)
    // Action: validates that tampered entries still conform to the actor type schema
    const step = steps[4];
    expect(step.node).toBe('graph/NodeTypeSchema');
    expect(step.step_number).toBe(5);

    const node = index.nodes['graph/NodeTypeSchema'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('5 universal types');
    expect(node.module).toBe('graph');
    // Preceded by YAMLErrorReporting in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/YAMLErrorReporting'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: compilation/CompilationResult reports validation errors from the tampered content", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: reports validation errors from the tampered content
    const step = steps[5];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(6);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by NodeTypeSchema in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/NodeTypeSchema'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full attack-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/YAMLTamperer',
      'actors/ActorsFile',
      '_actors/Compiler',
      'compilation/YAMLErrorReporting',
      'graph/NodeTypeSchema',
      'compilation/CompilationResult',
    ]);
  });

  it("every consecutive step pair crosses a module boundary", () => {
    const modules = steps.map(s => s.node.split('/')[0]);
    // _actors→actors→_actors→compilation→graph→compilation
    for (let i = 0; i < modules.length - 1; i++) {
      expect(modules[i]).not.toBe(modules[i + 1]);
    }
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation', 'graph']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("YAMLTamperer is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/YAMLTamperer');
    const node = index.nodes['_actors/YAMLTamperer'];
    expect(node.type).toBe('actor');
  });
});
