import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildEndToEndAuditToConvergenceModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'Runs full compilation' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      BoundedCreationLoop: { type: 'process', description: 'Completes all module creation' },
      CompileCheck: { type: 'process', description: 'Triggers final compilation' },
      TargetedAudit: { type: 'process', description: 'Dispatches 4 auditors' },
      TriggerPublish: { type: 'process', description: 'Proceeds to publish' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Reports 0 errors and 0 orphans' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      AuditAfterZeroErrors: { type: 'rule', description: 'Confirms graph is clean enough to audit' },
      GenerateAuditPrompt: { type: 'process', description: 'Builds prompts for all 4 auditors' },
      CheckSpecCoverage: { type: 'process', description: 'Auditor 1 checks spec section coverage' },
      CheckActorCoverage: { type: 'process', description: 'Auditor 2 checks actor participation' },
      CheckCrossModuleCoverage: { type: 'process', description: 'Auditor 3 checks cross-module connections' },
      CheckGoalCoverage: { type: 'process', description: 'Auditor 4 checks goal rule node coverage' },
      MergeAuditReports: { type: 'process', description: 'Combines 4 audit reports' },
      CollectAuditFindings: { type: 'process', description: 'Collects all gaps' },
      AuditFindingsList: { type: 'artifact', description: 'Stores the initial gap list' },
      PrioritizeGaps: { type: 'process', description: 'Ranks gaps for fixing' },
      SelectNextGapToFix: { type: 'process', description: 'Picks each gap in priority order' },
      ApplyFix: { type: 'process', description: 'Fixes each gap' },
      VerifyFixCompiles: { type: 'process', description: 'Confirms each fix compiles' },
      DetectFixInducedErrors: { type: 'process', description: 'Checks fix did not introduce problems' },
      VerifyGapClosed: { type: 'process', description: 'Confirms gap is closed' },
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'Confirms invariants hold' },
      ConfirmAllGapsResolved: { type: 'process', description: 'Verifies no gaps remain' },
      DeclareConverged: { type: 'process', description: 'Marks graph CONVERGED' },
    },
    journeys: {
      EndToEndAuditToConvergence: {
        steps: [
          { node: 'convergence/BoundedCreationLoop', action: 'completes all module creation' },
          { node: 'convergence/CompileCheck', action: 'triggers final compilation' },
          { node: '_actors/Compiler', action: 'runs full compilation' },
          { node: 'compilation/CompilationResult', action: 'reports 0 errors and 0 orphans' },
          { node: 'AuditAfterZeroErrors', action: 'confirms graph is clean enough to audit' },
          { node: 'convergence/TargetedAudit', action: 'dispatches 4 auditors' },
          { node: 'GenerateAuditPrompt', action: 'builds prompts for all 4 auditors' },
          { node: 'CheckSpecCoverage', action: 'auditor 1 checks spec section coverage' },
          { node: 'CheckActorCoverage', action: 'auditor 2 checks actor participation' },
          { node: 'CheckCrossModuleCoverage', action: 'auditor 3 checks cross-module connections' },
          { node: 'CheckGoalCoverage', action: 'auditor 4 checks goal rule node coverage' },
          { node: 'MergeAuditReports', action: 'combines 4 audit reports' },
          { node: 'CollectAuditFindings', action: 'collects all gaps' },
          { node: 'AuditFindingsList', action: 'stores the initial gap list' },
          { node: 'PrioritizeGaps', action: 'ranks gaps for fixing' },
          { node: 'SelectNextGapToFix', action: 'picks each gap in priority order' },
          { node: 'ApplyFix', action: 'fixes each gap' },
          { node: 'VerifyFixCompiles', action: 'confirms each fix compiles' },
          { node: 'DetectFixInducedErrors', action: 'checks fix did not introduce problems' },
          { node: 'VerifyGapClosed', action: 'confirms gap is closed' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'confirms invariants hold' },
          { node: 'ConfirmAllGapsResolved', action: 'verifies no gaps remain' },
          { node: 'DeclareConverged', action: 'marks graph CONVERGED' },
          { node: 'convergence/TriggerPublish', action: 'proceeds to publish' },
        ],
      },
    },
  });

  return modules;
}

describe("EndToEndAuditToConvergence", () => {
  const modules = buildEndToEndAuditToConvergenceModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EndToEndAuditToConvergence'];

  it("step 1: convergence/BoundedCreationLoop completes all module creation", () => {
    const node = result.index.nodes['convergence/BoundedCreationLoop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: convergence/CompileCheck triggers final compilation", () => {
    const node = result.index.nodes['convergence/CompileCheck'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/BoundedCreationLoop');
  });

  it("connection: convergence/BoundedCreationLoop -> convergence/CompileCheck", () => {
    const from = result.index.nodes['convergence/BoundedCreationLoop'];
    expect(from.followed_by).toContain('convergence/CompileCheck');
  });

  it("step 3: _actors/Compiler runs full compilation", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/CompileCheck');
  });

  it("connection: convergence/CompileCheck -> _actors/Compiler", () => {
    const from = result.index.nodes['convergence/CompileCheck'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/CompilationResult reports 0 errors and 0 orphans", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler -> compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: audit/AuditAfterZeroErrors confirms graph is clean enough to audit", () => {
    const node = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult -> audit/AuditAfterZeroErrors", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("step 6: convergence/TargetedAudit dispatches 4 auditors", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("connection: audit/AuditAfterZeroErrors -> convergence/TargetedAudit", () => {
    const from = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(from.followed_by).toContain('convergence/TargetedAudit');
  });

  it("step 7: audit/GenerateAuditPrompt builds prompts for all 4 auditors", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit -> audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['convergence/TargetedAudit'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 8: audit/CheckSpecCoverage auditor 1 checks spec section coverage", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt -> audit/CheckSpecCoverage", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 9: audit/CheckActorCoverage auditor 2 checks actor participation", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage -> audit/CheckActorCoverage", () => {
    const from = result.index.nodes['audit/CheckSpecCoverage'];
    expect(from.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 10: audit/CheckCrossModuleCoverage auditor 3 checks cross-module connections", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage -> audit/CheckCrossModuleCoverage", () => {
    const from = result.index.nodes['audit/CheckActorCoverage'];
    expect(from.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 11: audit/CheckGoalCoverage auditor 4 checks goal rule node coverage", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage -> audit/CheckGoalCoverage", () => {
    const from = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(from.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 12: audit/MergeAuditReports combines 4 audit reports", () => {
    const node = result.index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage -> audit/MergeAuditReports", () => {
    const from = result.index.nodes['audit/CheckGoalCoverage'];
    expect(from.followed_by).toContain('audit/MergeAuditReports');
  });

  it("step 13: audit/CollectAuditFindings collects all gaps", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/MergeAuditReports');
  });

  it("connection: audit/MergeAuditReports -> audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/MergeAuditReports'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 14: audit/AuditFindingsList stores the initial gap list", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings -> audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/CollectAuditFindings'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 15: audit/PrioritizeGaps ranks gaps for fixing", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList -> audit/PrioritizeGaps", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 16: audit/SelectNextGapToFix picks each gap in priority order", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps -> audit/SelectNextGapToFix", () => {
    const from = result.index.nodes['audit/PrioritizeGaps'];
    expect(from.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 17: audit/ApplyFix fixes each gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix -> audit/ApplyFix", () => {
    const from = result.index.nodes['audit/SelectNextGapToFix'];
    expect(from.followed_by).toContain('audit/ApplyFix');
  });

  it("step 18: audit/VerifyFixCompiles confirms each fix compiles", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix -> audit/VerifyFixCompiles", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 19: audit/DetectFixInducedErrors checks fix did not introduce problems", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles -> audit/DetectFixInducedErrors", () => {
    const from = result.index.nodes['audit/VerifyFixCompiles'];
    expect(from.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 20: audit/VerifyGapClosed confirms gap is closed", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors -> audit/VerifyGapClosed", () => {
    const from = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(from.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 21: audit/ValidateGraphInvariantsPostFix confirms invariants hold", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed -> audit/ValidateGraphInvariantsPostFix", () => {
    const from = result.index.nodes['audit/VerifyGapClosed'];
    expect(from.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 22: audit/ConfirmAllGapsResolved verifies no gaps remain", () => {
    const node = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix -> audit/ConfirmAllGapsResolved", () => {
    const from = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(from.followed_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("step 23: audit/DeclareConverged marks graph CONVERGED", () => {
    const node = result.index.nodes['audit/DeclareConverged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ConfirmAllGapsResolved');
  });

  it("connection: audit/ConfirmAllGapsResolved -> audit/DeclareConverged", () => {
    const from = result.index.nodes['audit/ConfirmAllGapsResolved'];
    expect(from.followed_by).toContain('audit/DeclareConverged');
  });

  it("step 24: convergence/TriggerPublish proceeds to publish", () => {
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DeclareConverged');
  });

  it("connection: audit/DeclareConverged -> convergence/TriggerPublish", () => {
    const from = result.index.nodes['audit/DeclareConverged'];
    expect(from.followed_by).toContain('convergence/TriggerPublish');
  });

  it("journey covers full pipeline (24 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(24);
    expect(journey.steps[0].node).toBe('convergence/BoundedCreationLoop');
    expect(journey.steps[23].node).toBe('convergence/TriggerPublish');
  });

  it("journey actor is Compiler (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
