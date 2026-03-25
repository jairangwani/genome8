// Auto-generated from journey: AuditFixReauditCycle
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['AuditFixReauditCycle'];
const steps = journey.steps;

describe("AuditFixReauditCycle", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(18);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'audit', '_actors', 'compilation'])
    );
  });

  it("step 1: convergence/ConvergenceState indicates gaps remain after a fix round", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: indicates gaps remain after a fix round
    const step = steps[0];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Followed by TrackAuditRound in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
  });

  it("step 2: audit/TrackAuditRound increments the round counter for the next audit-fix cycle", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: increments the round counter for the next audit-fix cycle
    const step = steps[1];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by ConvergenceState in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
    // Followed by AuditRoundLimit in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditRoundLimit'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: audit/AuditRoundLimit checks whether the round counter has exceeded the maximum allowed cycles", () => {
    // Node: audit/AuditRoundLimit (rule)
    // Action: checks whether the round counter has exceeded the maximum allowed cycles
    const step = steps[2];
    expect(step.node).toBe('audit/AuditRoundLimit');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/AuditRoundLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('maximum number');
    expect(node.module).toBe('audit');
    // Preceded by TrackAuditRound in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    // Followed by RecompileAfterFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/RecompileAfterFix'])
    );
  });

  it("step 4: convergence/RecompileAfterFix runs full compilation after all fixes in this round", () => {
    // Node: convergence/RecompileAfterFix (process)
    // Action: runs full compilation after all fixes in this round
    const step = steps[3];
    expect(step.node).toBe('convergence/RecompileAfterFix');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/RecompileAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('convergence');
    // Preceded by AuditRoundLimit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditRoundLimit'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: _actors/Compiler validates the full graph after fixes", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates the full graph after fixes
    const step = steps[4];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(5);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    // Compiler is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/Compiler');
    // Preceded by RecompileAfterFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/RecompileAfterFix'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 6: compilation/CompilationResult confirms 0 errors after the fix round", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: confirms 0 errors after the fix round
    const step = steps[5];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(6);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by ValidateGraphInvariantsPostFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: audit/ValidateGraphInvariantsPostFix checks zero orphans, zero duplicates, and zero isolated modules in the post-fix graph", () => {
    // Node: audit/ValidateGraphInvariantsPostFix (process)
    // Action: checks zero orphans, zero duplicates, and zero isolated modules in the post-fix graph
    const step = steps[6];
    expect(step.node).toBe('audit/ValidateGraphInvariantsPostFix');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/ValidateGraphInvariantsPostFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('invariants');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by ReauditAfterFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReauditAfterFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: convergence/ReauditAfterFix triggers a re-audit to check for remaining gaps", () => {
    // Node: convergence/ReauditAfterFix (process)
    // Action: triggers a re-audit to check for remaining gaps
    const step = steps[7];
    expect(step.node).toBe('convergence/ReauditAfterFix');
    expect(step.step_number).toBe(8);

    const node = index.nodes['convergence/ReauditAfterFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted audit');
    expect(node.module).toBe('convergence');
    // Preceded by ValidateGraphInvariantsPostFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ValidateGraphInvariantsPostFix'])
    );
    // Followed by GenerateAuditPrompt in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: audit/GenerateAuditPrompt rebuilds audit prompts for all 3 angles", () => {
    // Node: audit/GenerateAuditPrompt (process)
    // Action: rebuilds audit prompts for all 3 angles
    const step = steps[8];
    expect(step.node).toBe('audit/GenerateAuditPrompt');
    expect(step.step_number).toBe(9);

    const node = index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('focused prompt');
    expect(node.module).toBe('audit');
    // Preceded by ReauditAfterFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReauditAfterFix'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 10: _actors/Auditor re-checks spec coverage after fixes", () => {
    // Node: _actors/Auditor (actor)
    // Action: re-checks spec coverage after fixes
    const step = steps[9];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(10);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Preceded by GenerateAuditPrompt in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/GenerateAuditPrompt'])
    );
    // Followed by CheckSpecCoverage in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
  });

  it("step 11: audit/CheckSpecCoverage re-examines spec sections against the updated graph", () => {
    // Node: audit/CheckSpecCoverage (process)
    // Action: re-examines spec sections against the updated graph
    const step = steps[10];
    expect(step.node).toBe('audit/CheckSpecCoverage');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec sections');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 12: _actors/Auditor re-checks actor coverage after fixes", () => {
    // Node: _actors/Auditor (actor)
    // Action: re-checks actor coverage after fixes
    const step = steps[11];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(12);

    const node = index.nodes['_actors/Auditor'];
    expect(node.type).toBe('actor');
  });

  it("step 13: audit/CheckActorCoverage re-examines actor references in the updated graph", () => {
    // Node: audit/CheckActorCoverage (process)
    // Action: re-examines actor references in the updated graph
    const step = steps[12];
    expect(step.node).toBe('audit/CheckActorCoverage');
    expect(step.step_number).toBe(13);

    const node = index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 14: _actors/Auditor re-checks cross-module coverage after fixes", () => {
    // Node: _actors/Auditor (actor)
    // Action: re-checks cross-module coverage after fixes
    const step = steps[13];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(14);

    const node = index.nodes['_actors/Auditor'];
    expect(node.type).toBe('actor');
  });

  it("step 15: audit/CheckCrossModuleCoverage re-examines module connections in the updated graph", () => {
    // Node: audit/CheckCrossModuleCoverage (process)
    // Action: re-examines module connections in the updated graph
    const step = steps[14];
    expect(step.node).toBe('audit/CheckCrossModuleCoverage');
    expect(step.step_number).toBe(15);

    const node = index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('cross-module');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by MergeAuditReports in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/MergeAuditReports'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 16: audit/MergeAuditReports combines the re-audit reports into unified format", () => {
    // Node: audit/MergeAuditReports (process)
    // Action: combines the re-audit reports into unified format
    const step = steps[15];
    expect(step.node).toBe('audit/MergeAuditReports');
    expect(step.step_number).toBe(16);

    const node = index.nodes['audit/MergeAuditReports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('unified');
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

  it("step 17: audit/CollectAuditFindings gathers findings from the re-audit", () => {
    // Node: audit/CollectAuditFindings (process)
    // Action: gathers findings from the re-audit
    const step = steps[16];
    expect(step.node).toBe('audit/CollectAuditFindings');
    expect(step.step_number).toBe(17);

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

  it("step 18: audit/AuditFindingsList stores the updated gap list — may be empty", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: stores the updated gap list — may be empty
    const step = steps[17];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(18);

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

  it("journey forms the full audit-fix-reaudit cycle sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/ConvergenceState',
      'audit/TrackAuditRound',
      'audit/AuditRoundLimit',
      'convergence/RecompileAfterFix',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/ValidateGraphInvariantsPostFix',
      'convergence/ReauditAfterFix',
      'audit/GenerateAuditPrompt',
      '_actors/Auditor',
      'audit/CheckSpecCoverage',
      '_actors/Auditor',
      'audit/CheckActorCoverage',
      '_actors/Auditor',
      'audit/CheckCrossModuleCoverage',
      'audit/MergeAuditReports',
      'audit/CollectAuditFindings',
      'audit/AuditFindingsList',
    ]);
  });

  it("guard phase checks round limit (steps 1-3), recompile phase validates fixes (steps 4-7), re-audit phase rechecks coverage (steps 8-18)", () => {
    // Guard: convergence state triggers round increment, limit check
    const guardSteps = steps.slice(0, 3).map(s => s.node);
    expect(guardSteps).toEqual([
      'convergence/ConvergenceState',
      'audit/TrackAuditRound',
      'audit/AuditRoundLimit',
    ]);
    // Recompile: full compilation and invariant validation
    const recompileSteps = steps.slice(3, 7).map(s => s.node);
    expect(recompileSteps).toEqual([
      'convergence/RecompileAfterFix',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/ValidateGraphInvariantsPostFix',
    ]);
    // Re-audit: all 3 angles rechecked and findings collected
    const reauditSteps = steps.slice(7);
    expect(reauditSteps).toHaveLength(11);
  });

  it("Auditor appears 3 times for the three re-audit coverage angles", () => {
    const auditorSteps = steps.filter(s => s.node === '_actors/Auditor');
    expect(auditorSteps).toHaveLength(3);
    expect(auditorSteps.map(s => s.step_number)).toEqual([10, 12, 14]);
  });

  it("re-audit follows the same auditor → check pattern for all 3 angles", () => {
    // spec: Auditor → CheckSpecCoverage
    expect(steps[9].node).toBe('_actors/Auditor');
    expect(steps[10].node).toBe('audit/CheckSpecCoverage');
    // actor: Auditor → CheckActorCoverage
    expect(steps[11].node).toBe('_actors/Auditor');
    expect(steps[12].node).toBe('audit/CheckActorCoverage');
    // cross-module: Auditor → CheckCrossModuleCoverage
    expect(steps[13].node).toBe('_actors/Auditor');
    expect(steps[14].node).toBe('audit/CheckCrossModuleCoverage');
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'audit', '_actors', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("Compiler is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/Compiler');
    const node = index.nodes['_actors/Compiler'];
    expect(node.type).toBe('actor');
  });
});
