// Auto-generated from journey: ValidateGraphInvariantsAfterFixRound
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildValidateGraphInvariantsAfterFixRoundModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'Runs full compilation pipeline' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      RecompileAfterFix: { type: 'process', description: 'Triggers full compilation after a fix round' },
      ConvergenceState: { type: 'artifact', description: 'Records all invariants satisfied' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Provides post-round compilation result' },
      IsolatedModuleDetection: { type: 'process', description: 'Checks no module became isolated' },
      ZeroErrorConvergence: { type: 'rule', description: 'Confirms zero-error threshold holds' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'Validates graph invariants after a fix round' },
    },
    journeys: {
      ValidateGraphInvariantsAfterFixRound: {
        steps: [
          { node: 'convergence/RecompileAfterFix', action: 'triggers full compilation' },
          { node: '_actors/Compiler', action: 'runs full compilation pipeline' },
          { node: 'compilation/CompilationResult', action: 'provides post-round compilation result' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads error count, confirms zero' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads orphan count, confirms zero' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads duplicate count, confirms zero' },
          { node: 'compilation/IsolatedModuleDetection', action: 'checks no module became isolated' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads isolated module count, confirms zero' },
          { node: 'compilation/ZeroErrorConvergence', action: 'confirms zero-error threshold holds' },
          { node: 'convergence/ConvergenceState', action: 'records all invariants satisfied' },
        ],
      },
    },
  });

  return modules;
}

describe("ValidateGraphInvariantsAfterFixRound", () => {
  const modules = buildValidateGraphInvariantsAfterFixRoundModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ValidateGraphInvariantsAfterFixRound'];

  it("step 1: convergence/RecompileAfterFix triggers full compilation", () => {
    const node = result.index.nodes['convergence/RecompileAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: _actors/Compiler runs full compilation pipeline", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/RecompileAfterFix');
  });

  it("connection: convergence/RecompileAfterFix → _actors/Compiler", () => {
    const from = result.index.nodes['convergence/RecompileAfterFix'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 3: compilation/CompilationResult provides post-round compilation result", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 4: audit/ValidateGraphInvariantsPostFix reads error count, confirms zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/ValidateGraphInvariantsPostFix", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix reads orphan count, confirms zero (self-loop)", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → audit/ValidateGraphInvariantsPostFix", () => {
    const from = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(from.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 6: audit/ValidateGraphInvariantsPostFix reads duplicate count, confirms zero (self-loop)", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 7: compilation/IsolatedModuleDetection checks no module became isolated", () => {
    const node = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → compilation/IsolatedModuleDetection", () => {
    const from = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(from.followed_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("step 8: audit/ValidateGraphInvariantsPostFix reads isolated module count, confirms zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("connection: compilation/IsolatedModuleDetection → audit/ValidateGraphInvariantsPostFix", () => {
    const from = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(from.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 9: compilation/ZeroErrorConvergence confirms zero-error threshold holds", () => {
    const node = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → compilation/ZeroErrorConvergence", () => {
    const from = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(from.followed_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("step 10: convergence/ConvergenceState records all invariants satisfied", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("connection: compilation/ZeroErrorConvergence → convergence/ConvergenceState", () => {
    const from = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full pipeline (10 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(10);
    expect(journey.steps[0].node).toBe('convergence/RecompileAfterFix');
    expect(journey.steps[9].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is Compiler (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
