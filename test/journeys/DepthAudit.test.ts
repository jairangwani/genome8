// Auto-generated from journey: DepthAudit
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, compilation, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['DepthAudit'];
const steps = journey.steps;

describe("DepthAudit", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(22);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'compilation', 'audit', 'excerpt', '_actors'])
    );
  });

  it("step 1: convergence/CompileCheck confirms compilation passed with 0 errors and 0 orphans", () => {
    // Node: convergence/CompileCheck (process)
    // Action: confirms compilation passed with 0 errors and 0 orphans
    const step = steps[0];
    expect(step.node).toBe('convergence/CompileCheck');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/CompileCheck'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('convergence');
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 2: compilation/CompilationResult provides the clean compilation result", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: provides the clean compilation result
    const step = steps[1];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(2);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by CompileCheck in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/CompileCheck'])
    );
    // Followed by AuditAfterZeroErrors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditAfterZeroErrors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: audit/AuditAfterZeroErrors verifies the graph is error-free before starting audit", () => {
    // Node: audit/AuditAfterZeroErrors (rule)
    // Action: verifies the graph is error-free before starting audit
    const step = steps[2];
    expect(step.node).toBe('audit/AuditAfterZeroErrors');
    expect(step.step_number).toBe(3);

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

  it("step 4: convergence/TargetedAudit triggers the depth audit with 3 auditors", () => {
    // Node: convergence/TargetedAudit (process)
    // Action: triggers the depth audit with 3 auditors
    const step = steps[3];
    expect(step.node).toBe('convergence/TargetedAudit');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 auditors');
    expect(node.module).toBe('convergence');
    // Preceded by AuditAfterZeroErrors in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditAfterZeroErrors'])
    );
    // Followed by ExactlyThreeAuditors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ExactlyThreeAuditors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: audit/ExactlyThreeAuditors enforces that all 3 coverage angles will be checked", () => {
    // Node: audit/ExactlyThreeAuditors (rule)
    // Action: enforces that all 3 coverage angles will be checked
    const step = steps[4];
    expect(step.node).toBe('audit/ExactlyThreeAuditors');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/ExactlyThreeAuditors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('exactly 3');
    expect(node.module).toBe('audit');
    // Preceded by TargetedAudit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/TargetedAudit'])
    );
    // Followed by TrackAuditRound in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: audit/TrackAuditRound initializes the round counter to 1 for the first audit pass", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: initializes the round counter to 1 for the first audit pass
    const step = steps[5];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(6);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by ExactlyThreeAuditors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ExactlyThreeAuditors'])
    );
    // Followed by GenerateAuditPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
  });

  it("step 7: audit/GenerateAuditPrompt builds the spec coverage prompt for auditor 1", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: builds the spec coverage prompt for auditor 1
    const step = steps[6];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('focused prompt');
    expect(node.module).toBe('audit');
    // Preceded by TrackAuditRound in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    // Followed by ExcerptOutput in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/ExcerptOutput'])
    );
  });

  it("step 8: excerpt/ExcerptOutput provides focused context for the auditor to review", () => {
    // Node: excerpt/ExcerptOutput (artifact)
    // Action: provides focused context for the auditor to review
    const step = steps[7];
    expect(step.node).toBe('excerpt/ExcerptOutput');
    expect(step.step_number).toBe(8);

    const node = index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('200 line');
    expect(node.module).toBe('excerpt');
    // Preceded by GenerateAuditPrompt in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: _actors/Auditor checks spec coverage — which spec sections are represented in the graph", () => {
    // Node: _actors/Auditor (actor)
    // Action: checks spec coverage — which spec sections are represented in the graph
    const step = steps[8];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(9);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Auditor is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/Auditor');
    // Preceded by ExcerptOutput in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/ExcerptOutput'])
    );
    // Followed by CheckSpecCoverage in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
  });

  it("step 10: audit/CheckSpecCoverage compares spec sections against nodes and journeys in the compiled graph", () => {
    // Node: audit/CheckSpecCoverage (process)
    // Action: compares spec sections against nodes and journeys in the compiled graph
    const step = steps[9];
    expect(step.node).toBe('audit/CheckSpecCoverage');
    expect(step.step_number).toBe(10);

    const node = index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec sections');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by SpecCoverageReport in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/SpecCoverageReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 11: audit/SpecCoverageReport records which sections are covered and which have gaps", () => {
    // Node: audit/SpecCoverageReport (artifact)
    // Action: records which sections are covered and which have gaps
    const step = steps[10];
    expect(step.node).toBe('audit/SpecCoverageReport');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/SpecCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('spec sections');
    expect(node.module).toBe('audit');
    // Preceded by CheckSpecCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
    // Followed by GenerateAuditPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
  });

  it("step 12: audit/GenerateAuditPrompt builds the actor coverage prompt for auditor 2", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: builds the actor coverage prompt for auditor 2
    const step = steps[11];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(12);

    // Same node as step 7, reused for each auditor
    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node.type).toBe('process');
  });

  it("step 13: _actors/Auditor checks actor coverage — which actors participate in journeys", () => {
    // Node: _actors/Auditor (actor)
    // Action: checks actor coverage — which actors participate in journeys
    const step = steps[12];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(13);

    // Same Auditor node reused for each coverage angle
    const node = index.nodes['_actors/Auditor'];
    expect(node.type).toBe('actor');
  });

  it("step 14: audit/CheckActorCoverage compares _actors.yaml entries against journey step references", () => {
    // Node: audit/CheckActorCoverage (process)
    // Action: compares _actors.yaml entries against journey step references
    const step = steps[13];
    expect(step.node).toBe('audit/CheckActorCoverage');
    expect(step.step_number).toBe(14);

    const node = index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by ActorCoverageReport in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ActorCoverageReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 15: audit/ActorCoverageReport records which actors are connected and which are orphaned", () => {
    // Node: audit/ActorCoverageReport (artifact)
    // Action: records which actors are connected and which are orphaned
    const step = steps[14];
    expect(step.node).toBe('audit/ActorCoverageReport');
    expect(step.step_number).toBe(15);

    const node = index.nodes['audit/ActorCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('orphaned');
    expect(node.module).toBe('audit');
    // Preceded by CheckActorCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckActorCoverage'])
    );
    // Followed by GenerateAuditPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
  });

  it("step 16: audit/GenerateAuditPrompt builds the cross-module coverage prompt for auditor 3", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: builds the cross-module coverage prompt for auditor 3
    const step = steps[15];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(16);

    // Same node reused for the third time
    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node.type).toBe('process');
  });

  it("step 17: _actors/Auditor checks cross-module coverage — which modules connect to others", () => {
    // Node: _actors/Auditor (actor)
    // Action: checks cross-module coverage — which modules connect to others
    const step = steps[16];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(17);

    // Same Auditor node reused for the third coverage angle
    const node = index.nodes['_actors/Auditor'];
    expect(node.type).toBe('actor');
  });

  it("step 18: audit/CheckCrossModuleCoverage checks each module for at least one cross-module connection", () => {
    // Node: audit/CheckCrossModuleCoverage (process)
    // Action: checks each module for at least one cross-module connection
    const step = steps[17];
    expect(step.node).toBe('audit/CheckCrossModuleCoverage');
    expect(step.step_number).toBe(18);

    const node = index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('cross-module');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by CrossModuleCoverageReport in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CrossModuleCoverageReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 19: audit/CrossModuleCoverageReport records which modules are connected and which are isolated", () => {
    // Node: audit/CrossModuleCoverageReport (artifact)
    // Action: records which modules are connected and which are isolated
    const step = steps[18];
    expect(step.node).toBe('audit/CrossModuleCoverageReport');
    expect(step.step_number).toBe(19);

    const node = index.nodes['audit/CrossModuleCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('isolated');
    expect(node.module).toBe('audit');
    // Preceded by CheckCrossModuleCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckCrossModuleCoverage'])
    );
    // Followed by MergeAuditReports in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/MergeAuditReports'])
    );
  });

  it("step 20: audit/MergeAuditReports combines the 3 individual reports into a unified gap format", () => {
    // Node: audit/MergeAuditReports (process)
    // Action: combines the 3 individual reports into a unified gap format
    const step = steps[19];
    expect(step.node).toBe('audit/MergeAuditReports');
    expect(step.step_number).toBe(20);

    const node = index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('unified');
    expect(node.module).toBe('audit');
    // Preceded by CrossModuleCoverageReport in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CrossModuleCoverageReport'])
    );
    // Followed by CollectAuditFindings in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
  });

  it("step 21: audit/CollectAuditFindings gathers all findings from the merged reports into a single gap list", () => {
    // Node: audit/CollectAuditFindings (process)
    // Action: gathers all findings from the merged reports into a single gap list
    const step = steps[20];
    expect(step.node).toBe('audit/CollectAuditFindings');
    expect(step.step_number).toBe(21);

    const node = index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('3 auditors');
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

  it("step 22: audit/AuditFindingsList stores the complete list of coverage gaps", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: stores the complete list of coverage gaps
    const step = steps[21];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(22);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by CollectAuditFindings in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
  });

  it("journey forms the full depth audit sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/CompileCheck',
      'compilation/CompilationResult',
      'audit/AuditAfterZeroErrors',
      'convergence/TargetedAudit',
      'audit/ExactlyThreeAuditors',
      'audit/TrackAuditRound',
      'audit/GenerateAuditPrompt',
      'excerpt/ExcerptOutput',
      '_actors/Auditor',
      'audit/CheckSpecCoverage',
      'audit/SpecCoverageReport',
      'audit/GenerateAuditPrompt',
      '_actors/Auditor',
      'audit/CheckActorCoverage',
      'audit/ActorCoverageReport',
      'audit/GenerateAuditPrompt',
      '_actors/Auditor',
      'audit/CheckCrossModuleCoverage',
      'audit/CrossModuleCoverageReport',
      'audit/MergeAuditReports',
      'audit/CollectAuditFindings',
      'audit/AuditFindingsList',
    ]);
  });

  it("three audit cycles follow the same pattern: prompt → excerpt → auditor → check → report", () => {
    // Cycle 1: spec coverage (steps 7-11)
    expect(steps[6].node).toBe('audit/GenerateAuditPrompt');
    expect(steps[7].node).toBe('excerpt/ExcerptOutput');
    expect(steps[8].node).toBe('_actors/Auditor');
    expect(steps[9].node).toBe('audit/CheckSpecCoverage');
    expect(steps[10].node).toBe('audit/SpecCoverageReport');
    // Cycle 2: actor coverage (steps 12-15)
    expect(steps[11].node).toBe('audit/GenerateAuditPrompt');
    expect(steps[12].node).toBe('_actors/Auditor');
    expect(steps[13].node).toBe('audit/CheckActorCoverage');
    expect(steps[14].node).toBe('audit/ActorCoverageReport');
    // Cycle 3: cross-module coverage (steps 16-19)
    expect(steps[15].node).toBe('audit/GenerateAuditPrompt');
    expect(steps[16].node).toBe('_actors/Auditor');
    expect(steps[17].node).toBe('audit/CheckCrossModuleCoverage');
    expect(steps[18].node).toBe('audit/CrossModuleCoverageReport');
  });

  it("GenerateAuditPrompt appears 3 times, once per auditor", () => {
    const promptSteps = steps.filter(s => s.node === 'audit/GenerateAuditPrompt');
    expect(promptSteps).toHaveLength(3);
    expect(promptSteps.map(s => s.step_number)).toEqual([7, 12, 16]);
  });

  it("Auditor appears 3 times, once per coverage angle", () => {
    const auditorSteps = steps.filter(s => s.node === '_actors/Auditor');
    expect(auditorSteps).toHaveLength(3);
    expect(auditorSteps.map(s => s.step_number)).toEqual([9, 13, 17]);
  });

  it("audit module dominates the journey with 15 of 22 steps", () => {
    const auditSteps = steps.filter(s => s.node.startsWith('audit/'));
    expect(auditSteps).toHaveLength(15);
  });

  it("precondition phase (steps 1-6) before any auditing begins", () => {
    const preconditionNodes = steps.slice(0, 6).map(s => s.node);
    expect(preconditionNodes).toEqual([
      'convergence/CompileCheck',
      'compilation/CompilationResult',
      'audit/AuditAfterZeroErrors',
      'convergence/TargetedAudit',
      'audit/ExactlyThreeAuditors',
      'audit/TrackAuditRound',
    ]);
  });

  it("crosses 5 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'compilation', 'audit', 'excerpt', '_actors']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("Auditor is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/Auditor');
    const node = index.nodes['_actors/Auditor'];
    expect(node.type).toBe('actor');
  });
});
