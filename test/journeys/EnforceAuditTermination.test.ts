// Auto-generated from journey: EnforceAuditTermination
// Module: audit
// Modules touched: audit, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['EnforceAuditTermination'];
const steps = journey.steps;

describe("EnforceAuditTermination", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(7);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', 'convergence', 'compilation'])
    );
  });

  it("step 1: audit/TrackAuditRound provides the current round number and gap count history across rounds", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: provides the current round number and gap count history across rounds
    const step = steps[0];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Followed by AuditRoundLimit in this journey (step 1→2)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditRoundLimit'])
    );
  });

  it("step 2: audit/AuditRoundLimit checks whether the current round exceeds the maximum allowed cycles", () => {
    // Node: audit/AuditRoundLimit (rule)
    // Action: checks whether the current round exceeds the maximum allowed cycles
    const step = steps[1];
    expect(step.node).toBe('audit/AuditRoundLimit');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/AuditRoundLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('capped');
    expect(node.module).toBe('audit');
    // Preceded by TrackAuditRound in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    // Followed by TrackAuditRound in this journey (step 2→3)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
  });

  it("step 3: audit/TrackAuditRound compares the gap count from this round against the previous round", () => {
    // Node: audit/TrackAuditRound (artifact) — second occurrence
    // Action: compares the gap count from this round against the previous round
    const step = steps[2];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('audit');
    // Preceded by AuditRoundLimit in this journey (step 2→3)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditRoundLimit'])
    );
    // Followed by DataDecidesWhenToStop in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/DataDecidesWhenToStop'])
    );
  });

  it("step 4: convergence/DataDecidesWhenToStop detects that gap count has not decreased for consecutive rounds indicating a stall", () => {
    // Node: convergence/DataDecidesWhenToStop (rule)
    // Action: detects that gap count has not decreased for consecutive rounds indicating a stall
    const step = steps[3];
    expect(step.node).toBe('convergence/DataDecidesWhenToStop');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('no hardcoded limits');
    expect(node.module).toBe('convergence');
    // Preceded by TrackAuditRound in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    // Followed by AuditFindingsList in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: audit/AuditFindingsList provides the remaining unresolvable gaps", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: provides the remaining unresolvable gaps
    const step = steps[4];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by DataDecidesWhenToStop in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/DataDecidesWhenToStop'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
  });

  it("step 6: convergence/ConvergenceState records that audit has stalled or hit the round limit with gaps still remaining", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: records that audit has stalled or hit the round limit with gaps still remaining
    const step = steps[5];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Preceded by AuditFindingsList in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: compilation/CompilationResult provides the final compilation state at the point of termination", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: provides the final compilation state at the point of termination
    const step = steps[6];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(7);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by ConvergenceState in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full audit termination enforcement sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/TrackAuditRound',
      'audit/AuditRoundLimit',
      'audit/TrackAuditRound',
      'convergence/DataDecidesWhenToStop',
      'audit/AuditFindingsList',
      'convergence/ConvergenceState',
      'compilation/CompilationResult',
    ]);
  });

  it("TrackAuditRound appears twice — first to provide history, then to compare gap counts", () => {
    const trackSteps = steps.filter(s => s.node === 'audit/TrackAuditRound');
    expect(trackSteps).toHaveLength(2);
    expect(trackSteps[0].step_number).toBe(1);
    expect(trackSteps[1].step_number).toBe(3);
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', 'convergence', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
