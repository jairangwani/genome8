// Auto-generated from journey: TrackAuditFixProgress
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['TrackAuditFixProgress'];
const steps = journey.steps;

describe("TrackAuditFixProgress", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'audit'])
    );
  });

  it("step 1: convergence/ConvergenceState provides the current pipeline step showing audit is in progress", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: provides the current pipeline step showing audit is in progress
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

  it("step 2: audit/TrackAuditRound provides the current round number and cumulative gaps fixed", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: provides the current round number and cumulative gaps fixed
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
    // Followed by AuditFindingsList in this journey (step 2→3)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: audit/AuditFindingsList provides the current gap count remaining", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: provides the current gap count remaining
    const step = steps[2];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by TrackAuditRound in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    // Followed by DataDecidesWhenToStop in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/DataDecidesWhenToStop'])
    );
  });

  it("step 4: convergence/DataDecidesWhenToStop evaluates whether progress is being made based on gap count trending toward zero", () => {
    // Node: convergence/DataDecidesWhenToStop (rule)
    // Action: evaluates whether progress is being made based on gap count trending toward zero
    const step = steps[3];
    expect(step.node).toBe('convergence/DataDecidesWhenToStop');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('no hardcoded limits');
    expect(node.module).toBe('convergence');
    // Preceded by AuditFindingsList in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by TrackAuditRound in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: audit/TrackAuditRound records the gap count delta between this round and the previous round", () => {
    // Node: audit/TrackAuditRound (artifact) — second occurrence
    // Action: records the gap count delta between this round and the previous round
    const step = steps[4];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cumulative gaps fixed');
    expect(node.module).toBe('audit');
    // Preceded by DataDecidesWhenToStop in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/DataDecidesWhenToStop'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: convergence/ConvergenceState updates with the audit progress metrics for the current round", () => {
    // Node: convergence/ConvergenceState (artifact) — second occurrence
    // Action: updates with the audit progress metrics for the current round
    const step = steps[5];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('convergence status');
    expect(node.module).toBe('convergence');
    // Preceded by TrackAuditRound in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full audit fix progress tracking sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/ConvergenceState',
      'audit/TrackAuditRound',
      'audit/AuditFindingsList',
      'convergence/DataDecidesWhenToStop',
      'audit/TrackAuditRound',
      'convergence/ConvergenceState',
    ]);
  });

  it("TrackAuditRound appears twice — first to read state, then to record delta", () => {
    const trackSteps = steps.filter(s => s.node === 'audit/TrackAuditRound');
    expect(trackSteps).toHaveLength(2);
    expect(trackSteps[0].step_number).toBe(2);
    expect(trackSteps[1].step_number).toBe(5);
  });

  it("ConvergenceState bookends the journey — first to read, last to update", () => {
    const convSteps = steps.filter(s => s.node === 'convergence/ConvergenceState');
    expect(convSteps).toHaveLength(2);
    expect(convSteps[0].step_number).toBe(1);
    expect(convSteps[1].step_number).toBe(6);
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("crosses 2 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'audit']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
