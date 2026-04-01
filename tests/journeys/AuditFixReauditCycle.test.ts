// Auto-generated from journey: AuditFixReauditCycle
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
      RecompileAfterFix: { type: 'process', description: 'runs full compilation after all fixes in this round' },
      ReauditAfterFix: { type: 'process', description: 'triggers a re-audit to check for remaining gaps' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed for progress tracking and termination decisions' },
      AuditRoundLimit: { type: 'rule', description: 'audit-fix-reaudit cycles are capped at a maximum number of rounds to prevent infinite loops when gaps cannot be resolved' },
      ValidateGraphInvariantsPostFix: { type: 'process', description: 'checks all convergence invariants after a fix round including zero errors, zero orphans, zero duplicates, and zero isolated modules' },
      GenerateAuditPrompt: { type: 'process', description: 'builds a focused prompt for each auditor containing the compiled graph excerpt and the specific coverage angle to check' },
      CheckSpecCoverage: { type: 'process', description: 'auditor 1 compares spec sections against the graph to find sections not represented by any node or journey' },
      CheckActorCoverage: { type: 'process', description: 'auditor 2 checks that every actor in _actors.yaml participates in at least one journey across all modules' },
      CheckCrossModuleCoverage: { type: 'process', description: 'auditor 3 verifies that every module has at least one cross-module connection and no module is an island' },
      CheckGoalCoverage: { type: 'process', description: 'auditor 4 checks that each goal rule node is connected to at least one journey that exercises the goals achievement path' },
      MergeAuditReports: { type: 'process', description: 'combines the 4 individual coverage reports into a unified view with normalized gap format before feeding into findings collection' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list of coverage gaps with locations and descriptions' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
    },
    journeys: {
      AuditFixReauditCycle: {
        steps: [
          { node: 'convergence/ConvergenceState', action: 'indicates gaps remain after a fix round' },
          { node: 'TrackAuditRound', action: 'increments the round counter for the next audit-fix cycle' },
          { node: 'AuditRoundLimit', action: 'checks whether the round counter has exceeded the maximum allowed cycles' },
          { node: 'convergence/RecompileAfterFix', action: 'runs full compilation after all fixes in this round' },
          { node: '_actors/Compiler', action: 'validates the full graph after fixes' },
          { node: 'compilation/CompilationResult', action: 'confirms 0 errors after the fix round' },
          { node: 'ValidateGraphInvariantsPostFix', action: 'checks zero orphans, zero duplicates, and zero isolated modules in the post-fix graph' },
          { node: 'convergence/ReauditAfterFix', action: 'triggers a re-audit to check for remaining gaps' },
          { node: 'GenerateAuditPrompt', action: 'rebuilds audit prompts for all 4 angles' },
          { node: '_actors/Auditor', action: 're-checks spec coverage after fixes' },
          { node: 'CheckSpecCoverage', action: 're-examines spec sections against the updated graph' },
          { node: '_actors/Auditor', action: 're-checks actor coverage after fixes' },
          { node: 'CheckActorCoverage', action: 're-examines actor references in the updated graph' },
          { node: '_actors/Auditor', action: 're-checks cross-module coverage after fixes' },
          { node: 'CheckCrossModuleCoverage', action: 're-examines module connections in the updated graph' },
          { node: '_actors/Auditor', action: 're-checks goal coverage after fixes' },
          { node: 'CheckGoalCoverage', action: 're-examines goal rule nodes against journeys in the updated graph' },
          { node: 'MergeAuditReports', action: 'combines the 4 re-audit reports into unified format' },
          { node: 'CollectAuditFindings', action: 'gathers findings from the re-audit' },
          { node: 'AuditFindingsList', action: 'stores the updated gap list — may be empty' },
        ],
      },
    },
  });

  return modules;
}

describe("AuditFixReauditCycle", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['AuditFixReauditCycle'];

  it("step 1: convergence/ConvergenceState indicates gaps remain after a fix round", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('AuditFixReauditCycle'))).toBe(true);
  });

  it("step 2: audit/TrackAuditRound increments the round counter for the next audit-fix cycle", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState → audit/TrackAuditRound", () => {
    const src = result.index.nodes['convergence/ConvergenceState'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 3: audit/AuditRoundLimit checks whether the round counter has exceeded the maximum allowed cycles", () => {
    const node = result.index.nodes['audit/AuditRoundLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → audit/AuditRoundLimit", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('audit/AuditRoundLimit');
  });

  it("step 4: convergence/RecompileAfterFix runs full compilation after all fixes in this round", () => {
    const node = result.index.nodes['convergence/RecompileAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditRoundLimit');
  });

  it("connection: audit/AuditRoundLimit → convergence/RecompileAfterFix", () => {
    const src = result.index.nodes['audit/AuditRoundLimit'];
    expect(src.followed_by).toContain('convergence/RecompileAfterFix');
  });

  it("step 5: _actors/Compiler validates the full graph after fixes", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/RecompileAfterFix');
  });

  it("connection: convergence/RecompileAfterFix → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/RecompileAfterFix'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 6: compilation/CompilationResult confirms 0 errors after the fix round", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 7: audit/ValidateGraphInvariantsPostFix checks zero orphans, zero duplicates, and zero isolated modules in the post-fix graph", () => {
    const node = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/ValidateGraphInvariantsPostFix", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("step 8: convergence/ReauditAfterFix triggers a re-audit to check for remaining gaps", () => {
    const node = result.index.nodes['convergence/ReauditAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ValidateGraphInvariantsPostFix');
  });

  it("connection: audit/ValidateGraphInvariantsPostFix → convergence/ReauditAfterFix", () => {
    const src = result.index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(src.followed_by).toContain('convergence/ReauditAfterFix');
  });

  it("step 9: audit/GenerateAuditPrompt rebuilds audit prompts for all 4 angles", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReauditAfterFix');
  });

  it("connection: convergence/ReauditAfterFix → audit/GenerateAuditPrompt", () => {
    const src = result.index.nodes['convergence/ReauditAfterFix'];
    expect(src.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 10: _actors/Auditor re-checks spec coverage after fixes", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → _actors/Auditor", () => {
    const src = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 11: audit/CheckSpecCoverage re-examines spec sections against the updated graph", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 12: _actors/Auditor re-checks actor coverage after fixes", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → _actors/Auditor", () => {
    const src = result.index.nodes['audit/CheckSpecCoverage'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 13: audit/CheckActorCoverage re-examines actor references in the updated graph", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckActorCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 14: _actors/Auditor re-checks cross-module coverage after fixes", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → _actors/Auditor", () => {
    const src = result.index.nodes['audit/CheckActorCoverage'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 15: audit/CheckCrossModuleCoverage re-examines module connections in the updated graph", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckCrossModuleCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 16: _actors/Auditor re-checks goal coverage after fixes", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage → _actors/Auditor", () => {
    const src = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 17: audit/CheckGoalCoverage re-examines goal rule nodes against journeys in the updated graph", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckGoalCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 18: audit/MergeAuditReports combines the 4 re-audit reports into unified format", () => {
    const node = result.index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage → audit/MergeAuditReports", () => {
    const src = result.index.nodes['audit/CheckGoalCoverage'];
    expect(src.followed_by).toContain('audit/MergeAuditReports');
  });

  it("step 19: audit/CollectAuditFindings gathers findings from the re-audit", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/MergeAuditReports');
  });

  it("connection: audit/MergeAuditReports → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/MergeAuditReports'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 20: audit/AuditFindingsList stores the updated gap list — may be empty", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/CollectAuditFindings'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("journey has 20 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(20);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
