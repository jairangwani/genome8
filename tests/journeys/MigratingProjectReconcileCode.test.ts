// Auto-generated from journey: MigratingProjectReconcileCode
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts

function buildReconcileCodeModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'Has existing source code that predates the genome8 graph' },
      ProjectOwner: { type: 'actor', description: 'Triggers convergence on the project with existing code in src/' },
      Compiler: { type: 'actor', description: 'Compiles the new graph to validate structure' },
      LLMWorker: { type: 'actor', description: 'Analyzes each existing file and maps it to graph nodes' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'Reads the spec describing the migrating system' },
      ModuleCreation: { type: 'process', description: 'Creates modules from the spec without knowledge of existing code' },
      ReconcileCodeWithGraph: { type: 'process', description: 'Detects existing source files not yet represented in the graph' },
      ConvergenceState: { type: 'artifact', description: 'Records that code-to-graph reconciliation completed for the migrating project' },
    },
    journeys: {
      MigratingProjectReconcileCode: {
        steps: [
          { node: '_actors/MigratingProject', action: 'has existing source code that predates the genome8 graph' },
          { node: '_actors/ProjectOwner', action: 'triggers convergence on the project with existing code in src/' },
          { node: 'ReadSpec', action: 'reads the spec describing the migrating system' },
          { node: 'ModuleCreation', action: 'creates modules from the spec without knowledge of existing code' },
          { node: '_actors/Compiler', action: 'compiles the new graph to validate structure' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors in the bootstrapped graph' },
          { node: 'ReconcileCodeWithGraph', action: 'detects existing source files not yet represented in the graph' },
          { node: '_actors/LLMWorker', action: 'analyzes each existing file and maps it to graph nodes' },
          { node: 'ConvergenceState', action: 'records that code-to-graph reconciliation completed for the migrating project' },
        ],
      },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Confirms zero errors in the bootstrapped graph' },
    },
    journeys: {},
  });

  return modules;
}

describe("MigratingProjectReconcileCode", () => {
  const modules = buildReconcileCodeModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectReconcileCode'];

  it("step 1: _actors/MigratingProject has existing source code that predates the genome8 graph", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: _actors/ProjectOwner triggers convergence on the project with existing code in src/", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/ProjectOwner", () => {
    const from = result.index.nodes['_actors/MigratingProject'];
    expect(from.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ReadSpec reads the spec describing the migrating system", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const from = result.index.nodes['_actors/ProjectOwner'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 4: convergence/ModuleCreation creates modules from the spec without knowledge of existing code", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → convergence/ModuleCreation", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 5: _actors/Compiler compiles the new graph to validate structure", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → _actors/Compiler", () => {
    const from = result.index.nodes['convergence/ModuleCreation'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 6: compilation/CompilationResult confirms zero errors in the bootstrapped graph", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 7: convergence/ReconcileCodeWithGraph detects existing source files not yet represented in the graph", () => {
    const node = result.index.nodes['convergence/ReconcileCodeWithGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → convergence/ReconcileCodeWithGraph", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('convergence/ReconcileCodeWithGraph');
  });

  it("step 8: _actors/LLMWorker analyzes each existing file and maps it to graph nodes", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ReconcileCodeWithGraph');
  });

  it("connection: convergence/ReconcileCodeWithGraph → _actors/LLMWorker", () => {
    const from = result.index.nodes['convergence/ReconcileCodeWithGraph'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: convergence/ConvergenceState records that code-to-graph reconciliation completed for the migrating project", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → convergence/ConvergenceState", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full reconciliation pipeline (9 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(9);
    expect(journey.steps[0].node).toBe('_actors/MigratingProject');
    expect(journey.steps[8].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is MigratingProject", () => {
    expect(journey.actor).toBe('_actors/MigratingProject');
  });

  it("triggered_by_actors propagates through the pipeline", () => {
    const readSpec = result.index.nodes['convergence/ReadSpec'];
    expect(readSpec.triggered_by_actors).toContain('_actors/MigratingProject');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
