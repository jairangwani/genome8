// Auto-generated from journey: YAMLTamperingDefense
// Module: actors
// Triggered by: _actors/YAMLTamperer
// Modules touched: _actors, actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules, loadAllModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts

function buildTamperingModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      YAMLTamperer: { type: 'actor', description: 'Directly edits _actors.yaml to inject invalid definitions' },
      Compiler: { type: 'actor', description: 'Runs compilation on the tampered file' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'Contains the tampered content' },
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

  modules.set('compilation', {
    nodes: {
      YAMLErrorReporting: { type: 'process', description: 'Catches YAML syntax errors and reports them' },
      CompilationResult: { type: 'artifact', description: 'The compilation output with errors and warnings' },
    },
    journeys: {},
  });

  modules.set('graph', {
    nodes: {
      NodeTypeSchema: { type: 'rule', description: 'Validates that node entries conform to allowed type values' },
    },
    journeys: {},
  });

  return modules;
}

describe("YAMLTamperingDefense", () => {
  const modules = buildTamperingModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['YAMLTamperingDefense'];

  it("step 1: _actors/YAMLTamperer directly edits _actors.yaml to inject invalid actor definitions or corrupt entries", () => {
    const node = result.index.nodes['_actors/YAMLTamperer'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/ActorsFile contains the tampered content", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/YAMLTamperer');
  });

  it("connection: _actors/YAMLTamperer → actors/ActorsFile", () => {
    const from = result.index.nodes['_actors/YAMLTamperer'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("step 3: _actors/Compiler runs compilation on the tampered file", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → _actors/Compiler", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/YAMLErrorReporting catches any YAML syntax errors from the tampering", () => {
    const node = result.index.nodes['compilation/YAMLErrorReporting'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/YAMLErrorReporting", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/YAMLErrorReporting');
  });

  it("step 5: graph/NodeTypeSchema validates that tampered entries still conform to the actor type schema", () => {
    const node = result.index.nodes['graph/NodeTypeSchema'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/YAMLErrorReporting');
  });

  it("connection: compilation/YAMLErrorReporting → graph/NodeTypeSchema", () => {
    const from = result.index.nodes['compilation/YAMLErrorReporting'];
    expect(from.followed_by).toContain('graph/NodeTypeSchema');
  });

  it("step 6: compilation/CompilationResult reports validation errors from the tampered content", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('graph/NodeTypeSchema');
  });

  it("connection: graph/NodeTypeSchema → compilation/CompilationResult", () => {
    const from = result.index.nodes['graph/NodeTypeSchema'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("corrupted YAML produces parse errors in compilation", () => {
    const corruptModules = new Map<string, ModuleFile>();
    // Simulate a module with a parse error (as loadAllModules would produce)
    corruptModules.set('_actors', {
      nodes: {},
      journeys: {},
      _parseError: 'YAML parse error: unexpected character at line 3',
    } as ModuleFile & { _parseError: string });
    corruptModules.set('actors', {
      nodes: { ActorsFile: { type: 'artifact', description: 'Test' } },
      journeys: {},
    });

    const corruptResult = compileFromModules(corruptModules);
    const parseErrors = corruptResult.issues.filter(i =>
      i.severity === 'error' && i.message.includes('YAML parse error')
    );
    expect(parseErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("invalid node type is caught by schema validation", () => {
    const badModules = new Map<string, ModuleFile>();
    badModules.set('_actors', {
      nodes: {
        BadNode: { type: 'invalid_type' as any, description: 'Bad type' },
      },
      journeys: {},
    });
    badModules.set('filler', {
      nodes: { A: { type: 'process', description: 'test' } },
      journeys: { J: { steps: [{ node: '_actors/BadNode', action: 'test' }, { node: 'A', action: 'test' }] } },
    });

    const badResult = compileFromModules(badModules);
    const typeErrors = badResult.issues.filter(i =>
      i.message.includes('type') || i.message.includes('invalid')
    );
    expect(typeErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("clean scenario compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
