// Auto-generated from journey: DeclareConvergence
// Module: audit
// Modules touched: audit, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
      ZeroErrorConvergence: { type: 'rule', description: 'convergence requires compile.ts to report 0 errors and 0 orphans' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
      TriggerPublish: { type: 'process', description: 'proceeds to publish the converged interface' },
    },
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
      ConfirmAllGapsResolved: { type: 'process', description: 'checks that the re-audit findings list is empty and compilation is clean before allowing convergence declaration to proceed' },
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'checks all convergence invariants after a fix round including zero errors, zero orphans, zero duplicates, and zero isolated modules' },
      DeclareConverged: { type: 'process', description: 'marks the graph as CONVERGED after all 4 auditors report zero gaps and compilation shows zero errors' },
    },
    journeys: {
      DeclareConvergence: {
        steps: [
          { node: 'AuditFindingsList', action: 'provides the gap list from the latest audit round' },
          { node: 'ConfirmAllGapsResolved', action: 'verifies the findings list is empty across all 4 coverage angles' },
          { node: 'compilation/CompilationResult', action: 'confirms 0 errors and 0 orphans in the final compilation' },
          { node: 'compilation/ZeroErrorConvergence', action: 'confirms the zero-error threshold is met' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'performs the final invariant check — zero errors, orphans, duplicates, and isolated modules' },
          { node: 'DeclareConverged', action: 'marks the graph as CONVERGED — all creation, compilation, and audit complete' },
          { node: 'convergence/ConvergenceState', action: 'records CONVERGED status, ready for publish and codegen' },
          { node: 'convergence/TriggerPublish', action: 'proceeds to publish the converged interface' },
        ],
      },
    },
  });

  return modules;
}

describe("DeclareConvergence", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DeclareConvergence'];

  it("step 1: audit/AuditFindingsList provides the gap list from the latest audit round", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('DeclareConvergence'))).toBe(true);
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies the findings list is empty across all 4 coverage angles", () => {
    const node = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/ConfirmAllGapsResolved", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("step 3: compilation/CompilationResult confirms 0 errors and 0 orphans in the final compilation", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("connection: audit/ConfirmAllGapsResolved → compilation/CompilationResult", () => {
    const src = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 4: compilation/ZeroErrorConvergence confirms the zero-error threshold is met", () => {
    const node = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → compilation/ZeroErrorConvergence", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix performs the final invariant check — zero errors, orphans, duplicates, and isolated modules", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ZeroErrorConvergence');
  });

  it("connection: compilation/ZeroErrorConvergence → audit/ValidateGraphInvariantsPostFix", () => {
    const src = result.index.nodes['compilation/ZeroErrorConvergence'];
    expect(src.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 6: audit/DeclareConverged marks the graph as CONVERGED — all creation, compilation, and audit complete", () => {
    const node = result.index.nodes['audit/DeclareConverged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → audit/DeclareConverged", () => {
    const src = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(src.followed_by).toContain('audit/DeclareConverged');
  });

  it("step 7: convergence/ConvergenceState records CONVERGED status, ready for publish and codegen", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DeclareConverged');
  });

  it("connection: audit/DeclareConverged → convergence/ConvergenceState", () => {
    const src = result.index.nodes['audit/DeclareConverged'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("step 8: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState → convergence/TriggerPublish", () => {
    const src = result.index.nodes['convergence/ConvergenceState'];
    expect(src.followed_by).toContain('convergence/TriggerPublish');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
