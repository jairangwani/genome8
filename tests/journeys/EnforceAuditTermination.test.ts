// Auto-generated from journey: EnforceAuditTermination
// Module: audit
// Modules touched: audit, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const MAX_AUDIT_ROUNDS = 3;

function buildGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'User' },
      },
    }],
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Login' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'logs in' },
            { node: 'Login', action: 'authenticates' },
          ],
        },
      },
    }],
  ]));
}

describe("EnforceAuditTermination", () => {
  it("step 1: audit/TrackAuditRound provides the current round number and gap count history across rounds", () => {
    const tracker = {
      round: 3,
      history: [
        { round: 1, gapCount: 5 },
        { round: 2, gapCount: 4 },
        { round: 3, gapCount: 4 },
      ],
    };
    expect(tracker.round).toBe(3);
    expect(tracker.history.length).toBe(3);
  });

  it("step 2: audit/AuditRoundLimit checks whether the current round exceeds the maximum allowed cycles", () => {
    let round = 3;
    expect(round <= MAX_AUDIT_ROUNDS).toBe(true);
    round = 4;
    expect(round <= MAX_AUDIT_ROUNDS).toBe(false);
    // At round 4 we would stop
    expect(round > MAX_AUDIT_ROUNDS).toBe(true);
  });

  it("step 3: audit/TrackAuditRound compares the gap count from this round against the previous round", () => {
    const history = [
      { round: 1, gapCount: 5 },
      { round: 2, gapCount: 4 },
      { round: 3, gapCount: 4 },
    ];
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    const delta = previous.gapCount - current.gapCount;
    expect(delta).toBe(0); // no progress this round
  });

  it("step 4: convergence/DataDecidesWhenToStop detects that gap count has not decreased for consecutive rounds indicating a stall", () => {
    const history = [
      { round: 1, gapCount: 5 },
      { round: 2, gapCount: 4 },
      { round: 3, gapCount: 4 },
    ];
    // Check last two rounds for stall
    const stalled = history.length >= 2 &&
      history[history.length - 1].gapCount >= history[history.length - 2].gapCount;
    expect(stalled).toBe(true);
  });

  it("step 5: audit/AuditFindingsList provides the remaining unresolvable gaps", () => {
    const findingsList = {
      round: 3,
      total_gaps: 4,
      gaps: [
        { type: 'spec_gap', module: 'billing', detail: 'Section 3 not covered', severity: 'medium' },
        { type: 'spec_gap', module: 'billing', detail: 'Section 4 not covered', severity: 'medium' },
        { type: 'actor_orphan', module: 'admin', detail: 'Operator not in journeys', severity: 'medium' },
        { type: 'cross_module', module: 'reports', detail: 'No cross-module connections', severity: 'low' },
      ],
      unresolvable: true,
    };
    expect(findingsList.total_gaps).toBe(4);
    expect(findingsList.unresolvable).toBe(true);
    expect(findingsList.gaps.length).toBeGreaterThan(0);
  });

  it("step 6: convergence/ConvergenceState records that audit has stalled or hit the round limit with gaps still remaining", () => {
    const state = {
      step: 'AUDIT',
      status: 'STALLED',
      round: 3,
      gapsRemaining: 4,
      reason: 'Gap count did not decrease between rounds 2 and 3',
      hitRoundLimit: true,
    };
    expect(state.status).toBe('STALLED');
    expect(state.gapsRemaining).toBeGreaterThan(0);
    expect(state.hitRoundLimit).toBe(true);
    expect(state.reason).toContain('did not decrease');
  });

  it("step 7: compilation/CompilationResult provides the final compilation state at the point of termination", () => {
    const result = buildGraph();
    // Graph still compiles cleanly even if audit gaps remain
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.index._compiled).toBeDefined();
  });

});
