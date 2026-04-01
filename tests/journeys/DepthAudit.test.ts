// Auto-generated from journey: DepthAudit
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, compilation, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildDepthAuditModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Auditor: { type: 'actor', description: 'Checks coverage across all 4 angles' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      CompileCheck: { type: 'process', description: 'Confirms compilation passed with 0 errors and 0 orphans' },
      TargetedAudit: { type: 'process', description: 'Triggers the depth audit with 4 auditors' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Provides the clean compilation result' },
    },
    journeys: {},
  });

  modules.set('excerpt', {
    nodes: {
      ExcerptOutput: { type: 'artifact', description: 'Provides focused context for the auditor to review' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      AuditAfterZeroErrors: { type: 'rule', description: 'Verifies the graph is error-free before starting audit' },
      ExactlyFourAuditors: { type: 'rule', description: 'Enforces that all 4 coverage angles will be checked' },
      TrackAuditRound: { type: 'artifact', description: 'Initializes the round counter to 1 for the first audit pass' },
      GenerateAuditPrompt: { type: 'process', description: 'Builds the coverage prompt for each auditor' },
      CheckSpecCoverage: { type: 'process', description: 'Compares spec sections against nodes and journeys' },
      SpecCoverageReport: { type: 'artifact', description: 'Records which sections are covered and which have gaps' },
      CheckActorCoverage: { type: 'process', description: 'Compares _actors.yaml entries against journey step references' },
      ActorCoverageReport: { type: 'artifact', description: 'Records which actors are connected and which are orphaned' },
      CheckCrossModuleCoverage: { type: 'process', description: 'Checks each module for at least one cross-module connection' },
      CrossModuleCoverageReport: { type: 'artifact', description: 'Records which modules are connected and which are isolated' },
      CheckGoalCoverage: { type: 'process', description: 'Compares goal rule nodes against journeys exercising each goal' },
      GoalCoverageReport: { type: 'artifact', description: 'Records which goals are covered by proving journeys' },
      MergeAuditReports: { type: 'process', description: 'Combines the 4 individual reports into a unified gap format' },
      CollectAuditFindings: { type: 'process', description: 'Gathers all findings from the merged reports into a single gap list' },
      AuditFindingsList: { type: 'artifact', description: 'Stores the complete list of coverage gaps' },
    },
    journeys: {
      DepthAudit: {
        steps: [
          { node: 'convergence/CompileCheck', action: 'confirms compilation passed with 0 errors and 0 orphans' },
          { node: 'compilation/CompilationResult', action: 'provides the clean compilation result' },
          { node: 'AuditAfterZeroErrors', action: 'verifies the graph is error-free before starting audit' },
          { node: 'convergence/TargetedAudit', action: 'triggers the depth audit with 4 auditors' },
          { node: 'ExactlyFourAuditors', action: 'enforces that all 4 coverage angles will be checked' },
          { node: 'TrackAuditRound', action: 'initializes the round counter to 1 for the first audit pass' },
          { node: 'GenerateAuditPrompt', action: 'builds the spec coverage prompt for auditor 1' },
          { node: 'excerpt/ExcerptOutput', action: 'provides focused context for the auditor to review' },
          { node: '_actors/Auditor', action: 'checks spec coverage' },
          { node: 'CheckSpecCoverage', action: 'compares spec sections against nodes and journeys in the compiled graph' },
          { node: 'SpecCoverageReport', action: 'records which sections are covered and which have gaps' },
          { node: 'GenerateAuditPrompt', action: 'builds the actor coverage prompt for auditor 2' },
          { node: '_actors/Auditor', action: 'checks actor coverage' },
          { node: 'CheckActorCoverage', action: 'compares _actors.yaml entries against journey step references' },
          { node: 'ActorCoverageReport', action: 'records which actors are connected and which are orphaned' },
          { node: 'GenerateAuditPrompt', action: 'builds the cross-module coverage prompt for auditor 3' },
          { node: '_actors/Auditor', action: 'checks cross-module coverage' },
          { node: 'CheckCrossModuleCoverage', action: 'checks each module for at least one cross-module connection' },
          { node: 'CrossModuleCoverageReport', action: 'records which modules are connected and which are isolated' },
          { node: 'GenerateAuditPrompt', action: 'builds the goal coverage prompt for auditor 4' },
          { node: '_actors/Auditor', action: 'checks goal coverage' },
          { node: 'CheckGoalCoverage', action: 'compares goal rule nodes against journeys exercising each goal' },
          { node: 'GoalCoverageReport', action: 'records which goals are covered by proving journeys' },
          { node: 'MergeAuditReports', action: 'combines the 4 individual reports into a unified gap format' },
          { node: 'CollectAuditFindings', action: 'gathers all findings from the merged reports into a single gap list' },
          { node: 'AuditFindingsList', action: 'stores the complete list of coverage gaps' },
        ],
      },
    },
  });

  return modules;
}

describe("DepthAudit", () => {
  const modules = buildDepthAuditModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DepthAudit'];

  it("step 1: convergence/CompileCheck confirms compilation passed with 0 errors and 0 orphans", () => {
    const node = result.index.nodes['convergence/CompileCheck'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: compilation/CompilationResult provides the clean compilation result", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/CompileCheck');
  });

  it("connection: convergence/CompileCheck → compilation/CompilationResult", () => {
    const from = result.index.nodes['convergence/CompileCheck'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 3: audit/AuditAfterZeroErrors verifies the graph is error-free before starting audit", () => {
    const node = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/AuditAfterZeroErrors", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("step 4: convergence/TargetedAudit triggers the depth audit with 4 auditors", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditAfterZeroErrors');
  });

  it("connection: audit/AuditAfterZeroErrors → convergence/TargetedAudit", () => {
    const from = result.index.nodes['audit/AuditAfterZeroErrors'];
    expect(from.followed_by).toContain('convergence/TargetedAudit');
  });

  it("step 5: audit/ExactlyFourAuditors enforces that all 4 coverage angles will be checked", () => {
    const node = result.index.nodes['audit/ExactlyFourAuditors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit → audit/ExactlyFourAuditors", () => {
    const from = result.index.nodes['convergence/TargetedAudit'];
    expect(from.followed_by).toContain('audit/ExactlyFourAuditors');
  });

  it("step 6: audit/TrackAuditRound initializes the round counter to 1 for the first audit pass", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ExactlyFourAuditors');
  });

  it("connection: audit/ExactlyFourAuditors → audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/ExactlyFourAuditors'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 7: audit/GenerateAuditPrompt builds the spec coverage prompt for auditor 1", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 8: excerpt/ExcerptOutput provides focused context for the auditor to review", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → excerpt/ExcerptOutput", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 9: _actors/Auditor checks spec coverage — which spec sections are represented in the graph", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → _actors/Auditor", () => {
    const from = result.index.nodes['excerpt/ExcerptOutput'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 10: audit/CheckSpecCoverage compares spec sections against nodes and journeys in the compiled graph", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 11: audit/SpecCoverageReport records which sections are covered and which have gaps", () => {
    const node = result.index.nodes['audit/SpecCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/SpecCoverageReport", () => {
    const from = result.index.nodes['audit/CheckSpecCoverage'];
    expect(from.followed_by).toContain('audit/SpecCoverageReport');
  });

  it("step 12: audit/GenerateAuditPrompt builds the actor coverage prompt for auditor 2", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/SpecCoverageReport');
  });

  it("connection: audit/SpecCoverageReport → audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['audit/SpecCoverageReport'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 13: _actors/Auditor checks actor coverage — which actors participate in journeys", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → _actors/Auditor", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 14: audit/CheckActorCoverage compares _actors.yaml entries against journey step references", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckActorCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 15: audit/ActorCoverageReport records which actors are connected and which are orphaned", () => {
    const node = result.index.nodes['audit/ActorCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/ActorCoverageReport", () => {
    const from = result.index.nodes['audit/CheckActorCoverage'];
    expect(from.followed_by).toContain('audit/ActorCoverageReport');
  });

  it("step 16: audit/GenerateAuditPrompt builds the cross-module coverage prompt for auditor 3", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/ActorCoverageReport');
  });

  it("connection: audit/ActorCoverageReport → audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['audit/ActorCoverageReport'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 17: _actors/Auditor checks cross-module coverage — which modules connect to others", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → _actors/Auditor", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 18: audit/CheckCrossModuleCoverage checks each module for at least one cross-module connection", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckCrossModuleCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 19: audit/CrossModuleCoverageReport records which modules are connected and which are isolated", () => {
    const node = result.index.nodes['audit/CrossModuleCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage → audit/CrossModuleCoverageReport", () => {
    const from = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(from.followed_by).toContain('audit/CrossModuleCoverageReport');
  });

  it("step 20: audit/GenerateAuditPrompt builds the goal coverage prompt for auditor 4", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/CrossModuleCoverageReport');
  });

  it("connection: audit/CrossModuleCoverageReport → audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['audit/CrossModuleCoverageReport'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 21: _actors/Auditor checks goal coverage — which goals have journeys proving achievement", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → _actors/Auditor", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 22: audit/CheckGoalCoverage compares goal rule nodes against journeys exercising each goal's achievement path", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckGoalCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 23: audit/GoalCoverageReport records which goals are covered by proving journeys and which are orphaned", () => {
    const node = result.index.nodes['audit/GoalCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage → audit/GoalCoverageReport", () => {
    const from = result.index.nodes['audit/CheckGoalCoverage'];
    expect(from.followed_by).toContain('audit/GoalCoverageReport');
  });

  it("step 24: audit/MergeAuditReports combines the 4 individual reports into a unified gap format", () => {
    const node = result.index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/GoalCoverageReport');
  });

  it("connection: audit/GoalCoverageReport → audit/MergeAuditReports", () => {
    const from = result.index.nodes['audit/GoalCoverageReport'];
    expect(from.followed_by).toContain('audit/MergeAuditReports');
  });

  it("step 25: audit/CollectAuditFindings gathers all findings from the merged reports into a single gap list", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/MergeAuditReports');
  });

  it("connection: audit/MergeAuditReports → audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/MergeAuditReports'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 26: audit/AuditFindingsList stores the complete list of coverage gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/CollectAuditFindings'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("journey covers full depth audit pipeline (26 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(26);
    expect(journey.steps[0].node).toBe('convergence/CompileCheck');
    expect(journey.steps[25].node).toBe('audit/AuditFindingsList');
  });

  it("journey actor is Auditor (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Auditor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
