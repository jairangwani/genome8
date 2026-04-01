// Auto-generated from journey: EndToEndAuditToConvergence
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
      BoundedCreationLoop: { type: 'process', description: 'creates modules bounded by modules times lenses' },
      CompileCheck: { type: 'process', description: 'triggers compile.ts and checks the result for errors and orphans' },
      TargetedAudit: { type: 'process', description: 'dispatches auditors to check coverage from all angles' },
      TriggerPublish: { type: 'process', description: 'proceeds to publish the converged interface' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      AuditAfterZeroErrors: { type: 'rule', description: 'audit only runs after compile.ts reports 0 errors and 0 orphans' },
      GenerateAuditPrompt: { type: 'process', description: 'builds a focused prompt for each auditor' },
      CheckSpecCoverage: { type: 'process', description: 'auditor 1 compares spec sections against the graph' },
      CheckActorCoverage: { type: 'process', description: 'auditor 2 checks that every actor participates in at least one journey' },
      CheckCrossModuleCoverage: { type: 'process', description: 'auditor 3 verifies every module has at least one cross-module connection' },
      CheckGoalCoverage: { type: 'process', description: 'auditor 4 checks goal rule node coverage' },
      MergeAuditReports: { type: 'process', description: 'combines the 4 individual coverage reports into a unified view' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
      PrioritizeGaps: { type: 'process', description: 'ranks the collected gaps by severity' },
      SelectNextGapToFix: { type: 'process', description: 'picks the highest-priority unfixed gap' },
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file' },
      VerifyFixCompiles: { type: 'process', description: 'runs compile.ts after each fix' },
      DetectFixInducedErrors: { type: 'process', description: 'compares pre-fix and post-fix compilation results' },
      VerifyGapClosed: { type: 'process', description: 're-runs the specific auditor that found the gap' },
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'checks all convergence invariants after a fix round' },
      ConfirmAllGapsResolved: { type: 'process', description: 'checks that the re-audit findings list is empty' },
      DeclareConverged: { type: 'process', description: 'marks the graph as CONVERGED' },
    },
    journeys: {
      EndToEndAuditToConvergence: {
        steps: [
          { node: 'convergence/BoundedCreationLoop', action: 'completes all module creation with all perspectives applied' },
          { node: 'convergence/CompileCheck', action: 'triggers final compilation after all modules are created' },
          { node: '_actors/Compiler', action: 'runs full compilation across all modules' },
          { node: 'compilation/CompilationResult', action: 'reports 0 errors and 0 orphans' },
          { node: 'AuditAfterZeroErrors', action: 'confirms the graph is clean enough to audit' },
          { node: 'convergence/TargetedAudit', action: 'dispatches 4 auditors to check coverage' },
          { node: 'GenerateAuditPrompt', action: 'builds prompts for all 4 auditors with excerpt context' },
          { node: 'CheckSpecCoverage', action: 'auditor 1 checks spec section coverage' },
          { node: 'CheckActorCoverage', action: 'auditor 2 checks actor participation coverage' },
          { node: 'CheckCrossModuleCoverage', action: 'auditor 3 checks cross-module connection coverage' },
          { node: 'CheckGoalCoverage', action: 'auditor 4 checks goal rule node coverage' },
          { node: 'MergeAuditReports', action: 'combines the 4 audit reports into unified format' },
          { node: 'CollectAuditFindings', action: 'collects all gaps into the findings list' },
          { node: 'AuditFindingsList', action: 'stores the initial gap list' },
          { node: 'PrioritizeGaps', action: 'ranks gaps for fixing' },
          { node: 'SelectNextGapToFix', action: 'picks each gap in priority order' },
          { node: 'ApplyFix', action: 'fixes each gap with targeted module edits' },
          { node: 'VerifyFixCompiles', action: 'confirms each fix compiles cleanly' },
          { node: 'DetectFixInducedErrors', action: 'checks each fix did not introduce new validation problems' },
          { node: 'VerifyGapClosed', action: 'confirms each gap is closed after fixing' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'confirms all invariants hold after the full fix round' },
          { node: 'ConfirmAllGapsResolved', action: 'verifies no gaps remain after all fixes' },
          { node: 'DeclareConverged', action: 'marks the graph as CONVERGED' },
          { node: 'convergence/TriggerPublish', action: 'proceeds to publish the converged interface' },
        ],
      },
    },
  });

  return modules;
}

describe("EndToEndAuditToConvergence", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EndToEndAuditToConvergence'];

  it("step 1: convergence/BoundedCreationLoop completes all module creation with all perspectives applied", () => {
    const node = result.index.nodes['convergence/BoundedCreationLoop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('EndToEndAuditToConvergence'))).toBe(true);
  });

  it("step 2: convergence/CompileCheck triggers final compilation after all modules are created", () => {
    const node = result.index.nodes['convergence/CompileCheck'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/BoundedCreationLoop');
  });

  it("connection: convergence/BoundedCreationLoop → convergence/CompileCheck", () => {
    const src = result.index.nodes['convergence/BoundedCreationLoop'];
    expect(src.followed_by).toContain('convergence/CompileCheck');
  });

  it("step 3: _actors/Compiler runs full compilation across all modules", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/CompileCheck');
  });

  it("connection: convergence/CompileCheck → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/CompileCheck'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/CompilationResult reports 0 errors and 0 orphans", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: audit/AuditAfterZeroErrors confirms the graph is clean enough to audit", () => {
    const node = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/AuditAfterZeroErrors", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("step 6: convergence/TargetedAudit dispatches 4 auditors to check coverage", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("connection: audit/AuditAfterZeroErrors → convergence/TargetedAudit", () => {
    const src = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(src.followed_by).toContain('convergence/TargetedAudit');
  });

  it("step 7: audit/GenerateAuditPrompt builds prompts for all 4 auditors with excerpt context", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit → audit/GenerateAuditPrompt", () => {
    const src = result.index.nodes['convergence/TargetedAudit'];
    expect(src.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 8: audit/CheckSpecCoverage auditor 1 checks spec section coverage", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → audit/CheckSpecCoverage", () => {
    const src = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(src.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 9: audit/CheckActorCoverage auditor 2 checks actor participation coverage", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/CheckActorCoverage", () => {
    const src = result.index.nodes['audit/CheckSpecCoverage'];
    expect(src.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 10: audit/CheckCrossModuleCoverage auditor 3 checks cross-module connection coverage", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/CheckCrossModuleCoverage", () => {
    const src = result.index.nodes['audit/CheckActorCoverage'];
    expect(src.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 11: audit/CheckGoalCoverage auditor 4 checks goal rule node coverage", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage → audit/CheckGoalCoverage", () => {
    const src = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(src.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 12: audit/MergeAuditReports combines the 4 audit reports into unified format", () => {
    const node = result.index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage → audit/MergeAuditReports", () => {
    const src = result.index.nodes['audit/CheckGoalCoverage'];
    expect(src.followed_by).toContain('audit/MergeAuditReports');
  });

  it("step 13: audit/CollectAuditFindings collects all gaps into the findings list", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/MergeAuditReports');
  });

  it("connection: audit/MergeAuditReports → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/MergeAuditReports'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 14: audit/AuditFindingsList stores the initial gap list", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/CollectAuditFindings'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 15: audit/PrioritizeGaps ranks gaps for fixing", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 16: audit/SelectNextGapToFix picks each gap in priority order", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/SelectNextGapToFix", () => {
    const src = result.index.nodes['audit/PrioritizeGaps'];
    expect(src.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 17: audit/ApplyFix fixes each gap with targeted module edits", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/ApplyFix", () => {
    const src = result.index.nodes['audit/SelectNextGapToFix'];
    expect(src.followed_by).toContain('audit/ApplyFix');
  });

  it("step 18: audit/VerifyFixCompiles confirms each fix compiles cleanly", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 19: audit/DetectFixInducedErrors checks each fix did not introduce new validation problems", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → audit/DetectFixInducedErrors", () => {
    const src = result.index.nodes['audit/VerifyFixCompiles'];
    expect(src.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 20: audit/VerifyGapClosed confirms each gap is closed after fixing", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/VerifyGapClosed", () => {
    const src = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(src.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 21: audit/ValidateGraphInvariantsPostFix confirms all invariants hold after the full fix round", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → audit/ValidateGraphInvariantsPostFix", () => {
    const src = result.index.nodes['audit/VerifyGapClosed'];
    expect(src.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 22: audit/ConfirmAllGapsResolved verifies no gaps remain after all fixes", () => {
    const node = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → audit/ConfirmAllGapsResolved", () => {
    const src = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(src.followed_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("step 23: audit/DeclareConverged marks the graph as CONVERGED", () => {
    const node = result.index.nodes['audit/DeclareConverged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("connection: audit/ConfirmAllGapsResolved → audit/DeclareConverged", () => {
    const src = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(src.followed_by).toContain('audit/DeclareConverged');
  });

  it("step 24: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DeclareConverged');
  });

  it("connection: audit/DeclareConverged → convergence/TriggerPublish", () => {
    const src = result.index.nodes['audit/DeclareConverged'];
    expect(src.followed_by).toContain('convergence/TriggerPublish');
  });

  it("journey has 24 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(24);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
