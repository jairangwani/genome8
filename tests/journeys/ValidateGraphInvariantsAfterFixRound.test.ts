// Auto-generated from journey: ValidateGraphInvariantsAfterFixRound
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
    },
  });

  modules.set('convergence', {
    nodes: {
      RecompileAfterFix: { type: 'process', description: 'runs full compilation after all fixes in this round' },
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
      IsolatedModuleDetection: { type: 'process', description: 'detects modules with zero cross-module connections' },
      ZeroErrorConvergence: { type: 'rule', description: 'convergence requires compile.ts to report 0 errors and 0 orphans' },
    },
  });

  modules.set('audit', {
    nodes: {
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'checks all convergence invariants after a fix round including zero errors, zero orphans, zero duplicates, and zero isolated modules' },
    },
    journeys: {
      ValidateGraphInvariantsAfterFixRound: {
        steps: [
          { node: 'convergence/RecompileAfterFix', action: 'triggers full compilation after all fixes in this round are applied' },
          { node: '_actors/Compiler', action: 'runs the full compilation pipeline' },
          { node: 'compilation/CompilationResult', action: 'provides the complete post-round compilation result' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads the error count and confirms it is zero' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads the orphan count and confirms it is zero' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads the duplicate count and confirms it is zero' },
          { node: 'compilation/IsolatedModuleDetection', action: 'checks that no module became isolated as a side effect of fixes' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'reads the isolated module count and confirms it is zero' },
          { node: 'compilation/ZeroErrorConvergence', action: 'confirms the zero-error threshold still holds after the fix round' },
          { node: 'convergence/ConvergenceState', action: 'records that all graph invariants are satisfied after this fix round' },
        ],
      },
    },
  });

  return modules;
}

describe("ValidateGraphInvariantsAfterFixRound", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ValidateGraphInvariantsAfterFixRound'];

  it("step 1: convergence/RecompileAfterFix triggers full compilation after all fixes in this round are applied", () => {
    const node = result.index.nodes['convergence/RecompileAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('ValidateGraphInvariantsAfterFixRound'))).toBe(true);
  });

  it("step 2: _actors/Compiler runs the full compilation pipeline", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/RecompileAfterFix');
  });

  it("connection: convergence/RecompileAfterFix → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/RecompileAfterFix'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 3: compilation/CompilationResult provides the complete post-round compilation result", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 4: audit/ValidateGraphInvariantsPostFix reads the error count and confirms it is zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/ValidateGraphInvariantsPostFix", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix reads the orphan count and confirms it is zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → audit/ValidateGraphInvariantsPostFix", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
    expect(node.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 6: audit/ValidateGraphInvariantsPostFix reads the duplicate count and confirms it is zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 7: compilation/IsolatedModuleDetection checks that no module became isolated as a side effect of fixes", () => {
    const node = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → compilation/IsolatedModuleDetection", () => {
    const src = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(src.followed_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("step 8: audit/ValidateGraphInvariantsPostFix reads the isolated module count and confirms it is zero", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node.preceded_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("connection: compilation/IsolatedModuleDetection → audit/ValidateGraphInvariantsPostFix", () => {
    const src = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(src.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 9: compilation/ZeroErrorConvergence confirms the zero-error threshold still holds after the fix round", () => {
    const node = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → compilation/ZeroErrorConvergence", () => {
    const src = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(src.followed_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("step 10: convergence/ConvergenceState records that all graph invariants are satisfied after this fix round", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("connection: compilation/ZeroErrorConvergence → convergence/ConvergenceState", () => {
    const src = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 10 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(10);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
