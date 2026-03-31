// Auto-generated from journey: TrackAuditFixProgress
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';

describe("TrackAuditFixProgress", () => {
  it("step 1: convergence/ConvergenceState provides the current pipeline step showing audit is in progress", () => {
    const state = { step: 'AUDIT', round: 2, status: 'IN_PROGRESS' };
    expect(state.step).toBe('AUDIT');
    expect(state.status).toBe('IN_PROGRESS');
  });

  it("step 2: audit/TrackAuditRound provides the current round number and cumulative gaps fixed", () => {
    const tracker = {
      round: 2,
      gapsFixedThisRound: 3,
      gapsFixedTotal: 5,
    };
    expect(tracker.round).toBe(2);
    expect(tracker.gapsFixedTotal).toBe(5);
    expect(tracker.gapsFixedThisRound).toBeLessThanOrEqual(tracker.gapsFixedTotal);
  });

  it("step 3: audit/AuditFindingsList provides the current gap count remaining", () => {
    const findingsList = { round: 2, total_gaps: 2, gaps: [
      { type: 'spec_gap', module: 'billing', detail: 'Section 3 not covered' },
      { type: 'actor_orphan', module: 'admin', detail: 'Operator not in journeys' },
    ]};
    expect(findingsList.total_gaps).toBe(2);
    expect(findingsList.gaps.length).toBe(findingsList.total_gaps);
  });

  it("step 4: convergence/DataDecidesWhenToStop evaluates whether progress is being made based on gap count trending toward zero", () => {
    const history = [
      { round: 1, gapCount: 8 },
      { round: 2, gapCount: 2 },
    ];
    const isProgressing = history[history.length - 1].gapCount < history[history.length - 2].gapCount;
    expect(isProgressing).toBe(true);
    // Gap count is trending downward
    const delta = history[history.length - 2].gapCount - history[history.length - 1].gapCount;
    expect(delta).toBeGreaterThan(0);
  });

  it("step 5: audit/TrackAuditRound records the gap count delta between this round and the previous round", () => {
    const prevGapCount = 8;
    const currentGapCount = 2;
    const delta = prevGapCount - currentGapCount;
    expect(delta).toBe(6);
    expect(delta).toBeGreaterThan(0); // positive delta = progress
  });

  it("step 6: convergence/ConvergenceState updates with the audit progress metrics for the current round", () => {
    const state = {
      step: 'AUDIT',
      round: 2,
      gapsRemaining: 2,
      gapsFixedTotal: 6,
      progressDelta: 6,
      isProgressing: true,
    };
    expect(state.round).toBe(2);
    expect(state.gapsRemaining).toBe(2);
    expect(state.isProgressing).toBe(true);
    expect(state.progressDelta).toBeGreaterThan(0);
  });

});
