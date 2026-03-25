// Auto-generated from journey: DeclareConvergence
// Module: audit
// Modules touched: audit, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['DeclareConvergence'];
const steps = journey.steps;

describe("DeclareConvergence", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(8);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', 'compilation', 'convergence'])
    );
  });

  it("step 1: audit/AuditFindingsList provides the gap list from the latest audit round", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: provides the gap list from the latest audit round
    const step = steps[0];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Followed by ConfirmAllGapsResolved in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ConfirmAllGapsResolved'])
    );
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies the findings list is empty across all 3 coverage angles", () => {
    // Node: audit/ConfirmAllGapsResolved (process)
    // Action: verifies the findings list is empty across all 3 coverage angles
    const step = steps[1];
    expect(step.node).toBe('audit/ConfirmAllGapsResolved');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/ConfirmAllGapsResolved'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('findings list is empty');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 3: compilation/CompilationResult confirms 0 errors and 0 orphans in the final compilation", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: confirms 0 errors and 0 orphans in the final compilation
    const step = steps[2];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(3);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by ConfirmAllGapsResolved in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ConfirmAllGapsResolved'])
    );
    // Followed by ZeroErrorConvergence in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ZeroErrorConvergence'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: compilation/ZeroErrorConvergence confirms the zero-error threshold is met", () => {
    // Node: compilation/ZeroErrorConvergence (rule)
    // Action: confirms the zero-error threshold is met
    const step = steps[3];
    expect(step.node).toBe('compilation/ZeroErrorConvergence');
    expect(step.step_number).toBe(4);

    const node = index.nodes['compilation/ZeroErrorConvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('0 errors');
    expect(node.module).toBe('compilation');
    // Preceded by CompilationResult in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by ValidateGraphInvariantsPostFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix performs the final invariant check — zero errors, orphans, duplicates, and isolated modules", () => {
    // Node: audit/ValidateGraphInvariantsPostFix (process)
    // Action: performs the final invariant check — zero errors, orphans, duplicates, and isolated modules
    const step = steps[4];
    expect(step.node).toBe('audit/ValidateGraphInvariantsPostFix');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('invariants');
    expect(node.module).toBe('audit');
    // Preceded by ZeroErrorConvergence in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/ZeroErrorConvergence'])
    );
    // Followed by DeclareConverged in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DeclareConverged'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: audit/DeclareConverged marks the graph as CONVERGED — all creation, compilation, and audit complete", () => {
    // Node: audit/DeclareConverged (process)
    // Action: marks the graph as CONVERGED — all creation, compilation, and audit complete
    const step = steps[5];
    expect(step.node).toBe('audit/DeclareConverged');
    expect(step.step_number).toBe(6);

    const node = index.nodes['audit/DeclareConverged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('CONVERGED');
    expect(node.module).toBe('audit');
    // Preceded by ValidateGraphInvariantsPostFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
  });

  it("step 7: convergence/ConvergenceState records CONVERGED status, ready for publish and codegen", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: records CONVERGED status, ready for publish and codegen
    const step = steps[6];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(7);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Preceded by DeclareConverged in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DeclareConverged'])
    );
    // Followed by TriggerPublish in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/TriggerPublish'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    // Node: convergence/TriggerPublish (process)
    // Action: proceeds to publish the converged interface
    const step = steps[7];
    expect(step.node).toBe('convergence/TriggerPublish');
    expect(step.step_number).toBe(8);

    const node = index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('publish.ts');
    expect(node.module).toBe('convergence');
    // Preceded by ConvergenceState in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
  });

  it("journey forms the full convergence declaration sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/AuditFindingsList',
      'audit/ConfirmAllGapsResolved',
      'compilation/CompilationResult',
      'compilation/ZeroErrorConvergence',
      'audit/ValidateGraphInvariantsPostFix',
      'audit/DeclareConverged',
      'convergence/ConvergenceState',
      'convergence/TriggerPublish',
    ]);
  });

  it("verification phase confirms zero gaps and zero errors (steps 1-5), declaration phase marks and publishes (steps 6-8)", () => {
    // Verification: audit findings empty, compilation clean, invariants hold
    const verifySteps = steps.slice(0, 5);
    expect(verifySteps.every(s =>
      s.node.startsWith('audit/') || s.node.startsWith('compilation/')
    )).toBe(true);
    // Declaration: converged → state → publish
    const declareSteps = steps.slice(5);
    expect(declareSteps.map(s => s.node)).toEqual([
      'audit/DeclareConverged',
      'convergence/ConvergenceState',
      'convergence/TriggerPublish',
    ]);
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
