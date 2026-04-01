// Auto-generated from journey: MigratingProjectReconcileCode
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'an existing project with source code that predates the genome8 graph' },
      ProjectOwner: { type: 'actor', description: 'the human who owns the project and triggers convergence' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'reads spec.md from disk and parses its content for the pipeline' },
      ModuleCreation: { type: 'process', description: 'creates module YAML files from the spec using LLM workers' },
      ReconcileCodeWithGraph: { type: 'process', description: 'detects existing source files not yet represented in the graph' },
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('actors', {
    nodes: {},
    journeys: {
      MigratingProjectReconcileCode: {
        steps: [
          { node: '_actors/MigratingProject', action: 'has existing source code that predates the genome8 graph' },
          { node: '_actors/ProjectOwner', action: 'triggers convergence on the project with existing code in src/' },
          { node: 'convergence/ReadSpec', action: 'reads the spec describing the migrating system' },
          { node: 'convergence/ModuleCreation', action: 'creates modules from the spec without knowledge of existing code' },
          { node: '_actors/Compiler', action: 'compiles the new graph to validate structure' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors in the bootstrapped graph' },
          { node: 'convergence/ReconcileCodeWithGraph', action: 'detects existing source files not yet represented in the graph' },
          { node: '_actors/LLMWorker', action: 'analyzes each existing file and maps it to graph nodes' },
          { node: 'convergence/ConvergenceState', action: 'records that code-to-graph reconciliation completed for the migrating project' },
        ],
      },
    },
  });

  return modules;
}

describe("MigratingProjectReconcileCode", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectReconcileCode'];

  it("step 1: _actors/MigratingProject has existing source code that predates the genome8 graph", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('MigratingProjectReconcileCode'))).toBe(true);
  });

  it("step 2: _actors/ProjectOwner triggers convergence on the project with existing code in src/", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/ProjectOwner", () => {
    const src = result.index.nodes['_actors/MigratingProject'];
    expect(src.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ReadSpec reads the spec describing the migrating system", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const src = result.index.nodes['_actors/ProjectOwner'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 4: convergence/ModuleCreation creates modules from the spec without knowledge of existing code", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → convergence/ModuleCreation", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 5: _actors/Compiler compiles the new graph to validate structure", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/ModuleCreation'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 6: compilation/CompilationResult confirms zero errors in the bootstrapped graph", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 7: convergence/ReconcileCodeWithGraph detects existing source files not yet represented in the graph", () => {
    const node = result.index.nodes['convergence/ReconcileCodeWithGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → convergence/ReconcileCodeWithGraph", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('convergence/ReconcileCodeWithGraph');
  });

  it("step 8: _actors/LLMWorker analyzes each existing file and maps it to graph nodes", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ReconcileCodeWithGraph');
  });

  it("connection: convergence/ReconcileCodeWithGraph → _actors/LLMWorker", () => {
    const src = result.index.nodes['convergence/ReconcileCodeWithGraph'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: convergence/ConvergenceState records that code-to-graph reconciliation completed for the migrating project", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → convergence/ConvergenceState", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
