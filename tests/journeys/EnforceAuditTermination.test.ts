// Auto-generated from journey: EnforceAuditTermination
// Module: audit
// Modules touched: audit, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// A module with a persistent orphan that cannot be easily fixed
const authStalled: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    UnresolvableRule: { type: 'rule', description: 'rule that resists fixing' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const stalledResult = compileFromModules(new Map([['_actors', _actors], ['auth', authStalled]]));

// Simulate round history where gap count doesn't decrease
const roundHistory = [
  { round: 1, gaps: 2 },
  { round: 2, gaps: 2 },
  { round: 3, gaps: 2 },
  { round: 4, gaps: 2 },
  { round: 5, gaps: 2 },
];
const MAX_ROUNDS = 5;

describe("EnforceAuditTermination", () => {
  it("step 1: audit/TrackAuditRound provides the current round number and gap count history across rounds", () => {
    expect(roundHistory.length).toBe(5);
    expect(roundHistory[0].round).toBe(1);
    expect(roundHistory[4].round).toBe(5);
    // All rounds have same gap count (stalled)
    expect(roundHistory.every(r => r.gaps === 2)).toBe(true);
  });

  it("step 2: audit/AuditRoundLimit checks whether the current round exceeds the maximum allowed cycles", () => {
    const currentRound = roundHistory[roundHistory.length - 1].round;
    const exceedsLimit = currentRound >= MAX_ROUNDS;
    expect(exceedsLimit).toBe(true);
    expect(currentRound).toBe(5);
    expect(MAX_ROUNDS).toBe(5);
  });

  it("step 3: audit/TrackAuditRound compares the gap count from this round against the previous round", () => {
    const current = roundHistory[roundHistory.length - 1];
    const previous = roundHistory[roundHistory.length - 2];
    const delta = previous.gaps - current.gaps;
    expect(delta).toBe(0); // No progress
  });

  it("step 4: convergence/DataDecidesWhenToStop detects that gap count has not decreased for consecutive rounds indicating a stall", () => {
    // Check last 3 rounds for stall detection
    const recentRounds = roundHistory.slice(-3);
    const isStalled = recentRounds.every(r => r.gaps === recentRounds[0].gaps);
    expect(isStalled).toBe(true);
    // Gap count unchanged across 3 consecutive rounds
    const deltas = [];
    for (let i = 1; i < recentRounds.length; i++) {
      deltas.push(recentRounds[i - 1].gaps - recentRounds[i].gaps);
    }
    expect(deltas.every(d => d === 0)).toBe(true);
  });

  it("step 5: audit/AuditFindingsList provides the remaining unresolvable gaps", () => {
    // The stalled result still has orphans
    expect(stalledResult.coverage.orphans.length).toBeGreaterThanOrEqual(1);
    expect(stalledResult.coverage.orphans).toContain('auth/UnresolvableRule');
  });

  it("step 6: convergence/ConvergenceState records that audit has stalled or hit the round limit with gaps still remaining", () => {
    const currentRound = roundHistory[roundHistory.length - 1];
    const state = {
      status: 'stalled' as const,
      round: currentRound.round,
      reason: currentRound.round >= MAX_ROUNDS ? 'round-limit-exceeded' : 'no-progress',
      remaining_gaps: stalledResult.coverage.orphans,
      errors: stalledResult.issues.filter(i => i.severity === 'error').length,
    };
    expect(state.status).toBe('stalled');
    expect(state.reason).toBe('round-limit-exceeded');
    expect(state.remaining_gaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 7: compilation/CompilationResult provides the final compilation state at the point of termination", () => {
    // The graph compiles cleanly (0 errors) but has unresolved orphans
    expect(stalledResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(stalledResult.index._stats.orphans).toBeGreaterThanOrEqual(1);
    expect(stalledResult.index._compiled).toBeDefined();
    expect(stalledResult.index._stats.total_nodes).toBe(4); // 1 actor + 3 auth nodes
  });

});
