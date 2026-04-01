// Auto-generated from journey: YAMLTamperingDefense
// Module: actors
// Triggered by: _actors/YAMLTamperer
// Modules touched: _actors, actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      YAMLTamperer: { type: 'actor', description: 'an adversary who directly edits YAML module files to inject invalid or corrupt content' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('compilation', {
    nodes: {
      YAMLErrorReporting: { type: 'process', description: 'catches and reports YAML syntax errors encountered during module parsing' },
      CompilationResult: { type: 'artifact', description: 'the final compilation output containing the index, issues, and coverage report' },
    },
  });

  modules.set('graph', {
    nodes: {
      NodeTypeSchema: { type: 'rule', description: 'validates that each node has a valid type (actor, process, artifact, interface, rule) and required fields' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
    },
    journeys: {
      YAMLTamperingDefense: {
        steps: [
          { node: '_actors/YAMLTamperer', action: 'directly edits _actors.yaml to inject invalid actor definitions or corrupt entries' },
          { node: 'ActorsFile', action: 'contains the tampered content' },
          { node: '_actors/Compiler', action: 'runs compilation on the tampered file' },
          { node: 'compilation/YAMLErrorReporting', action: 'catches any YAML syntax errors from the tampering' },
          { node: 'graph/NodeTypeSchema', action: 'validates that tampered entries still conform to the actor type schema' },
          { node: 'compilation/CompilationResult', action: 'reports validation errors from the tampered content' },
        ],
      },
    },
  });

  return modules;
}

describe("YAMLTamperingDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['YAMLTamperingDefense'];

  it("step 1: _actors/YAMLTamperer directly edits _actors.yaml to inject invalid actor definitions or corrupt entries", () => {
    const node = result.index.nodes['_actors/YAMLTamperer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('YAMLTamperingDefense'))).toBe(true);
  });

  it("step 2: actors/ActorsFile contains the tampered content", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/YAMLTamperer');
  });

  it("connection: _actors/YAMLTamperer → actors/ActorsFile", () => {
    const src = result.index.nodes['_actors/YAMLTamperer'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 3: _actors/Compiler runs compilation on the tampered file", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → _actors/Compiler", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/YAMLErrorReporting catches any YAML syntax errors from the tampering", () => {
    const node = result.index.nodes['compilation/YAMLErrorReporting'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/YAMLErrorReporting", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/YAMLErrorReporting');
  });

  it("step 5: graph/NodeTypeSchema validates that tampered entries still conform to the actor type schema", () => {
    const node = result.index.nodes['graph/NodeTypeSchema'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/YAMLErrorReporting');
  });

  it("connection: compilation/YAMLErrorReporting → graph/NodeTypeSchema", () => {
    const src = result.index.nodes['compilation/YAMLErrorReporting'];
    expect(src.followed_by).toContain('graph/NodeTypeSchema');
  });

  it("step 6: compilation/CompilationResult reports validation errors from the tampered content", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeTypeSchema');
  });

  it("connection: graph/NodeTypeSchema → compilation/CompilationResult", () => {
    const src = result.index.nodes['graph/NodeTypeSchema'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
