// Auto-generated from journey: EndToEndAuditToConvergence
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['EndToEndAuditToConvergence'];
const steps = journey.steps;

describe("EndToEndAuditToConvergence", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(23);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', '_actors', 'compilation', 'audit'])
    );
  });

  it("step 1: convergence/BoundedCreationLoop completes all module creation with all perspectives applied", () => {
    // Node: convergence/BoundedCreationLoop (process)
    // Action: completes all module creation with all perspectives applied
    const step = steps[0];
    expect(step.node).toBe('convergence/BoundedCreationLoop');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/BoundedCreationLoop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('build-order');
    expect(node.module).toBe('convergence');
    // Followed by CompileCheck in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/CompileCheck'])
    );
  });

  it("step 2: convergence/CompileCheck triggers final compilation after all modules are created", () => {
    // Node: convergence/CompileCheck (process)
    // Action: triggers final compilation after all modules are created
    const step = steps[1];
    expect(step.node).toBe('convergence/CompileCheck');
    expect(step.step_number).toBe(2);

    const node = index.nodes['convergence/CompileCheck'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('convergence');
    // Preceded by BoundedCreationLoop in this journey (same module)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/BoundedCreationLoop'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 3: _actors/Compiler runs full compilation across all modules", () => {
    // Node: _actors/Compiler (actor)
    // Action: runs full compilation across all modules
    const step = steps[2];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(3);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    expect(node.module).toBe('_actors');
    // Preceded by CompileCheck in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/CompileCheck'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: compilation/CompilationResult reports 0 errors and 0 orphans", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: reports 0 errors and 0 orphans
    const step = steps[3];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(4);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by AuditAfterZeroErrors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditAfterZeroErrors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: audit/AuditAfterZeroErrors confirms the graph is clean enough to audit", () => {
    // Node: audit/AuditAfterZeroErrors (rule)
    // Action: confirms the graph is clean enough to audit
    const step = steps[4];
    expect(step.node).toBe('audit/AuditAfterZeroErrors');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/AuditAfterZeroErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('0 errors');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by TargetedAudit in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/TargetedAudit'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: convergence/TargetedAudit dispatches 3 auditors to check coverage", () => {
    // Node: convergence/TargetedAudit (process)
    // Action: dispatches 3 auditors to check coverage
    const step = steps[5];
    expect(step.node).toBe('convergence/TargetedAudit');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 auditors');
    expect(node.module).toBe('convergence');
    // Preceded by AuditAfterZeroErrors in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditAfterZeroErrors'])
    );
    // Followed by GenerateAuditPrompt in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: audit/GenerateAuditPrompt builds prompts for all 3 auditors with excerpt context", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: builds prompts for all 3 auditors with excerpt context
    const step = steps[6];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('focused prompt');
    expect(node.module).toBe('audit');
    // Preceded by TargetedAudit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/TargetedAudit'])
    );
    // Followed by CheckSpecCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: audit/CheckSpecCoverage auditor 1 checks spec section coverage", () => {
    // Node: audit/CheckSpecCoverage (process)
    // Action: auditor 1 checks spec section coverage
    const step = steps[7];
    expect(step.node).toBe('audit/CheckSpecCoverage');
    expect(step.step_number).toBe(8);

    const node = index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec sections');
    expect(node.module).toBe('audit');
    // Preceded by GenerateAuditPrompt in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
    // Followed by CheckActorCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckActorCoverage'])
    );
  });

  it("step 9: audit/CheckActorCoverage auditor 2 checks actor participation coverage", () => {
    // Node: audit/CheckActorCoverage (process)
    // Action: auditor 2 checks actor participation coverage
    const step = steps[8];
    expect(step.node).toBe('audit/CheckActorCoverage');
    expect(step.step_number).toBe(9);

    const node = index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('actor');
    expect(node.module).toBe('audit');
    // Preceded by CheckSpecCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
    // Followed by CheckCrossModuleCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckCrossModuleCoverage'])
    );
  });

  it("step 10: audit/CheckCrossModuleCoverage auditor 3 checks cross-module connection coverage", () => {
    // Node: audit/CheckCrossModuleCoverage (process)
    // Action: auditor 3 checks cross-module connection coverage
    const step = steps[9];
    expect(step.node).toBe('audit/CheckCrossModuleCoverage');
    expect(step.step_number).toBe(10);

    const node = index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('cross-module');
    expect(node.module).toBe('audit');
    // Preceded by CheckActorCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckActorCoverage'])
    );
    // Followed by MergeAuditReports in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/MergeAuditReports'])
    );
  });

  it("step 11: audit/MergeAuditReports combines the 3 audit reports into unified format", () => {
    // Node: audit/MergeAuditReports (process)
    // Action: combines the 3 audit reports into unified format
    const step = steps[10];
    expect(step.node).toBe('audit/MergeAuditReports');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('combines');
    expect(node.module).toBe('audit');
    // Preceded by CheckCrossModuleCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckCrossModuleCoverage'])
    );
    // Followed by CollectAuditFindings in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
  });

  it("step 12: audit/CollectAuditFindings collects all gaps into the findings list", () => {
    // Node: audit/CollectAuditFindings (process)
    // Action: collects all gaps into the findings list
    const step = steps[11];
    expect(step.node).toBe('audit/CollectAuditFindings');
    expect(step.step_number).toBe(12);

    const node = index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by MergeAuditReports in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/MergeAuditReports'])
    );
    // Followed by AuditFindingsList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
  });

  it("step 13: audit/AuditFindingsList stores the initial gap list", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: stores the initial gap list
    const step = steps[12];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(13);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by CollectAuditFindings in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
    // Followed by PrioritizeGaps in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
  });

  it("step 14: audit/PrioritizeGaps ranks gaps for fixing", () => {
    // Node: audit/PrioritizeGaps (process)
    // Action: ranks gaps for fixing
    const step = steps[13];
    expect(step.node).toBe('audit/PrioritizeGaps');
    expect(step.step_number).toBe(14);

    const node = index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('severity');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by SelectNextGapToFix in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
  });

  it("step 15: audit/SelectNextGapToFix picks each gap in priority order", () => {
    // Node: audit/SelectNextGapToFix (process)
    // Action: picks each gap in priority order
    const step = steps[14];
    expect(step.node).toBe('audit/SelectNextGapToFix');
    expect(step.step_number).toBe(15);

    const node = index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('highest-priority');
    expect(node.module).toBe('audit');
    // Preceded by PrioritizeGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
    // Followed by ApplyFix in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
  });

  it("step 16: audit/ApplyFix fixes each gap with targeted module edits", () => {
    // Node: audit/ApplyFix (process)
    // Action: fixes each gap with targeted module edits
    const step = steps[15];
    expect(step.node).toBe('audit/ApplyFix');
    expect(step.step_number).toBe(16);

    const node = index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('module YAML');
    expect(node.module).toBe('audit');
    // Preceded by SelectNextGapToFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
    // Followed by VerifyFixCompiles in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
  });

  it("step 17: audit/VerifyFixCompiles confirms each fix compiles cleanly", () => {
    // Node: audit/VerifyFixCompiles (process)
    // Action: confirms each fix compiles cleanly
    const step = steps[16];
    expect(step.node).toBe('audit/VerifyFixCompiles');
    expect(step.step_number).toBe(17);

    const node = index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('audit');
    // Preceded by ApplyFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    // Followed by DetectFixInducedErrors in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
  });

  it("step 18: audit/DetectFixInducedErrors checks each fix did not introduce new validation problems", () => {
    // Node: audit/DetectFixInducedErrors (process)
    // Action: checks each fix did not introduce new validation problems
    const step = steps[17];
    expect(step.node).toBe('audit/DetectFixInducedErrors');
    expect(step.step_number).toBe(18);

    const node = index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix');
    expect(node.module).toBe('audit');
    // Preceded by VerifyFixCompiles in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    // Followed by VerifyGapClosed in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
  });

  it("step 19: audit/VerifyGapClosed confirms each gap is closed after fixing", () => {
    // Node: audit/VerifyGapClosed (process)
    // Action: confirms each gap is closed after fixing
    const step = steps[18];
    expect(step.node).toBe('audit/VerifyGapClosed');
    expect(step.step_number).toBe(19);

    const node = index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('re-runs');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedErrors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    // Followed by ValidateGraphInvariantsPostFix in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
  });

  it("step 20: audit/ValidateGraphInvariantsPostFix confirms all invariants hold after the full fix round", () => {
    // Node: audit/ValidateGraphInvariantsPostFix (process)
    // Action: confirms all invariants hold after the full fix round
    const step = steps[19];
    expect(step.node).toBe('audit/ValidateGraphInvariantsPostFix');
    expect(step.step_number).toBe(20);

    const node = index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('invariants');
    expect(node.module).toBe('audit');
    // Preceded by VerifyGapClosed in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    // Followed by ConfirmAllGapsResolved in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ConfirmAllGapsResolved'])
    );
  });

  it("step 21: audit/ConfirmAllGapsResolved verifies no gaps remain after all fixes", () => {
    // Node: audit/ConfirmAllGapsResolved (process)
    // Action: verifies no gaps remain after all fixes
    const step = steps[20];
    expect(step.node).toBe('audit/ConfirmAllGapsResolved');
    expect(step.step_number).toBe(21);

    const node = index.nodes['audit/ConfirmAllGapsResolved'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('findings list is empty');
    expect(node.module).toBe('audit');
    // Preceded by ValidateGraphInvariantsPostFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
    // Followed by DeclareConverged in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DeclareConverged'])
    );
  });

  it("step 22: audit/DeclareConverged marks the graph as CONVERGED", () => {
    // Node: audit/DeclareConverged (process)
    // Action: marks the graph as CONVERGED
    const step = steps[21];
    expect(step.node).toBe('audit/DeclareConverged');
    expect(step.step_number).toBe(22);

    const node = index.nodes['audit/DeclareConverged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('CONVERGED');
    expect(node.module).toBe('audit');
    // Preceded by ConfirmAllGapsResolved in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ConfirmAllGapsResolved'])
    );
    // Followed by TriggerPublish in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/TriggerPublish'])
    );
  });

  it("step 23: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    // Node: convergence/TriggerPublish (process)
    // Action: proceeds to publish the converged interface
    const step = steps[22];
    expect(step.node).toBe('convergence/TriggerPublish');
    expect(step.step_number).toBe(23);

    const node = index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('publish.ts');
    expect(node.module).toBe('convergence');
    // Preceded by DeclareConverged in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DeclareConverged'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full end-to-end audit-to-convergence sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/BoundedCreationLoop',
      'convergence/CompileCheck',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/AuditAfterZeroErrors',
      'convergence/TargetedAudit',
      'audit/GenerateAuditPrompt',
      'audit/CheckSpecCoverage',
      'audit/CheckActorCoverage',
      'audit/CheckCrossModuleCoverage',
      'audit/MergeAuditReports',
      'audit/CollectAuditFindings',
      'audit/AuditFindingsList',
      'audit/PrioritizeGaps',
      'audit/SelectNextGapToFix',
      'audit/ApplyFix',
      'audit/VerifyFixCompiles',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
      'audit/ValidateGraphInvariantsPostFix',
      'audit/ConfirmAllGapsResolved',
      'audit/DeclareConverged',
      'convergence/TriggerPublish',
    ]);
  });

  it("Compiler is the journey actor (first actor-type node)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("setup phase (steps 1-4) compiles, audit phase (steps 5-13) discovers gaps, fix phase (steps 14-19) resolves them, convergence phase (steps 20-23) declares done", () => {
    // Setup: creation → compile → result
    const setupSteps = steps.slice(0, 4).map(s => s.node);
    expect(setupSteps).toEqual([
      'convergence/BoundedCreationLoop',
      'convergence/CompileCheck',
      '_actors/Compiler',
      'compilation/CompilationResult',
    ]);
    // Audit: gate → dispatch → audit checks → merge → collect → store
    const auditSteps = steps.slice(4, 13).map(s => s.node);
    expect(auditSteps).toEqual([
      'audit/AuditAfterZeroErrors',
      'convergence/TargetedAudit',
      'audit/GenerateAuditPrompt',
      'audit/CheckSpecCoverage',
      'audit/CheckActorCoverage',
      'audit/CheckCrossModuleCoverage',
      'audit/MergeAuditReports',
      'audit/CollectAuditFindings',
      'audit/AuditFindingsList',
    ]);
    // Fix: prioritize → select → apply → verify × 2
    const fixSteps = steps.slice(13, 19).map(s => s.node);
    expect(fixSteps).toEqual([
      'audit/PrioritizeGaps',
      'audit/SelectNextGapToFix',
      'audit/ApplyFix',
      'audit/VerifyFixCompiles',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
    ]);
    // Convergence: invariants → confirm → declare → publish
    const convergenceSteps = steps.slice(19).map(s => s.node);
    expect(convergenceSteps).toEqual([
      'audit/ValidateGraphInvariantsPostFix',
      'audit/ConfirmAllGapsResolved',
      'audit/DeclareConverged',
      'convergence/TriggerPublish',
    ]);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', '_actors', 'compilation', 'audit']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
