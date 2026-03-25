// Auto-generated from journey: FixAuditGaps
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['FixAuditGaps'];
const steps = journey.steps;

describe("FixAuditGaps", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(17);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', '_actors', 'compilation', 'convergence'])
    );
  });

  it("step 1: audit/AuditFindingsList provides the list of coverage gaps to fix", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: provides the list of coverage gaps to fix
    const step = steps[0];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Followed by PrioritizeGaps in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
  });

  it("step 2: audit/PrioritizeGaps ranks gaps by severity to fix the most critical first", () => {
    // Node: audit/PrioritizeGaps (process)
    // Action: ranks gaps by severity to fix the most critical first
    const step = steps[1];
    expect(step.node).toBe('audit/PrioritizeGaps');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('severity');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by TargetedFixesOnly in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TargetedFixesOnly'])
    );
  });

  it("step 3: audit/TargetedFixesOnly enforces that fixes are targeted edits, not full re-creation", () => {
    // Node: audit/TargetedFixesOnly (rule)
    // Action: enforces that fixes are targeted edits, not full re-creation
    const step = steps[2];
    expect(step.node).toBe('audit/TargetedFixesOnly');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/TargetedFixesOnly'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('targeted edits');
    expect(node.module).toBe('audit');
    // Preceded by PrioritizeGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
    // Followed by SelectNextGapToFix in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
  });

  it("step 4: audit/SelectNextGapToFix picks the highest-priority unfixed gap from the list", () => {
    // Node: audit/SelectNextGapToFix (process)
    // Action: picks the highest-priority unfixed gap from the list
    const step = steps[3];
    expect(step.node).toBe('audit/SelectNextGapToFix');
    expect(step.step_number).toBe(4);

    const node = index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('highest-priority');
    expect(node.module).toBe('audit');
    // Preceded by TargetedFixesOnly in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TargetedFixesOnly'])
    );
    // Followed by DetectSelfAuditTarget in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectSelfAuditTarget'])
    );
  });

  it("step 5: audit/DetectSelfAuditTarget checks whether the selected gap targets audit.yaml itself", () => {
    // Node: audit/DetectSelfAuditTarget (process)
    // Action: checks whether the selected gap targets audit.yaml itself
    const step = steps[4];
    expect(step.node).toBe('audit/DetectSelfAuditTarget');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('audit.yaml');
    expect(node.module).toBe('audit');
    // Preceded by SelectNextGapToFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
    // Followed by BuildGapFixPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/BuildGapFixPrompt'])
    );
  });

  it("step 6: audit/BuildGapFixPrompt builds a specific fix prompt for the selected gap", () => {
    // Node: audit/BuildGapFixPrompt (process)
    // Action: builds a specific fix prompt for the selected gap
    const step = steps[5];
    expect(step.node).toBe('audit/BuildGapFixPrompt');
    expect(step.step_number).toBe(6);

    const node = index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted fix prompt');
    expect(node.module).toBe('audit');
    // Preceded by DetectSelfAuditTarget in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectSelfAuditTarget'])
    );
    // Followed by ProvideFixContext in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
  });

  it("step 7: audit/ProvideFixContext assembles the target module excerpt and gap details into a fix payload", () => {
    // Node: audit/ProvideFixContext (process)
    // Action: assembles the target module excerpt and gap details into a fix payload
    const step = steps[6];
    expect(step.node).toBe('audit/ProvideFixContext');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fix payload');
    expect(node.module).toBe('audit');
    // Preceded by BuildGapFixPrompt in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/BuildGapFixPrompt'])
    );
    // Followed by LLMWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
  });

  it("step 8: _actors/LLMWorker receives the fix payload with the exact module and gap to address", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: receives the fix payload with the exact module and gap to address
    const step = steps[7];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(8);

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('Claude Code');
    // LLMWorker is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/LLMWorker');
    // Preceded by ProvideFixContext in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
    // Followed by ApplyFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
  });

  it("step 9: audit/ApplyFix edits the target module YAML to close the coverage gap", () => {
    // Node: audit/ApplyFix (process)
    // Action: edits the target module YAML to close the coverage gap
    const step = steps[8];
    expect(step.node).toBe('audit/ApplyFix');
    expect(step.step_number).toBe(9);

    const node = index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('module YAML');
    expect(node.module).toBe('audit');
    // Preceded by LLMWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by VerifyFixCompiles in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 10: audit/VerifyFixCompiles runs compile.ts on the edited module", () => {
    // Node: audit/VerifyFixCompiles (process)
    // Action: runs compile.ts on the edited module
    const step = steps[9];
    expect(step.node).toBe('audit/VerifyFixCompiles');
    expect(step.step_number).toBe(10);

    const node = index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('audit');
    // Preceded by ApplyFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 11: _actors/Compiler validates the edited module has 0 errors", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates the edited module has 0 errors
    const step = steps[10];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(11);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    // Preceded by VerifyFixCompiles in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 12: compilation/CompilationResult confirms the fix did not break compilation", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: confirms the fix did not break compilation
    const step = steps[11];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(12);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by DetectFixInducedErrors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 13: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation to check for new orphans or duplicates", () => {
    // Node: audit/DetectFixInducedErrors (process)
    // Action: compares pre-fix and post-fix compilation to check for new orphans or duplicates
    const step = steps[12];
    expect(step.node).toBe('audit/DetectFixInducedErrors');
    expect(step.step_number).toBe(13);

    const node = index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by VerifyGapClosed in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the specific auditor on the fixed area", () => {
    // Node: audit/VerifyGapClosed (process)
    // Action: re-runs the specific auditor on the fixed area
    const step = steps[13];
    expect(step.node).toBe('audit/VerifyGapClosed');
    expect(step.step_number).toBe(14);

    const node = index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('re-runs');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedErrors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
  });

  it("step 15: _actors/Auditor confirms the specific gap is now closed", () => {
    // Node: _actors/Auditor (actor)
    // Action: confirms the specific gap is now closed
    const step = steps[14];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(15);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Preceded by VerifyGapClosed in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    // Followed by TrackAuditRound in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
  });

  it("step 16: audit/TrackAuditRound increments the cumulative gaps-fixed counter", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: increments the cumulative gaps-fixed counter
    const step = steps[15];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(16);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 17: convergence/ConvergenceState updates with the fix result — either more gaps remain or all are closed", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: updates with the fix result — either more gaps remain or all are closed
    const step = steps[16];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(17);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Preceded by TrackAuditRound in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full fix-audit-gaps sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/AuditFindingsList',
      'audit/PrioritizeGaps',
      'audit/TargetedFixesOnly',
      'audit/SelectNextGapToFix',
      'audit/DetectSelfAuditTarget',
      'audit/BuildGapFixPrompt',
      'audit/ProvideFixContext',
      '_actors/LLMWorker',
      'audit/ApplyFix',
      'audit/VerifyFixCompiles',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
      '_actors/Auditor',
      'audit/TrackAuditRound',
      'convergence/ConvergenceState',
    ]);
  });

  it("preparation phase selects and builds fix (steps 1-7), execution phase applies and verifies (steps 8-15), tracking phase records result (steps 16-17)", () => {
    // Preparation: prioritize, select gap, build prompt, assemble context
    const prepSteps = steps.slice(0, 7);
    expect(prepSteps.every(s => s.node.startsWith('audit/'))).toBe(true);
    // Execution: LLM applies fix, compiler verifies, auditor confirms
    const execSteps = steps.slice(7, 15);
    expect(execSteps.some(s => s.node.startsWith('_actors/'))).toBe(true);
    expect(execSteps.some(s => s.node.startsWith('audit/'))).toBe(true);
    // Tracking: round counter and convergence state
    expect(steps[15].node).toBe('audit/TrackAuditRound');
    expect(steps[16].node).toBe('convergence/ConvergenceState');
  });

  it("verify-after-fix sequence: compile check → induced error check → gap closed check (steps 10-14)", () => {
    const verifySteps = steps.slice(9, 14).map(s => s.node);
    expect(verifySteps).toEqual([
      'audit/VerifyFixCompiles',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
    ]);
  });

  it("audit module handles 12 of 17 steps", () => {
    const auditSteps = steps.filter(s => s.node.startsWith('audit/'));
    expect(auditSteps).toHaveLength(12);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', '_actors', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("LLMWorker is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
    const node = index.nodes['_actors/LLMWorker'];
    expect(node.type).toBe('actor');
  });
});
