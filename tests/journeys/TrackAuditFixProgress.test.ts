// Auto-generated from journey: TrackAuditFixProgress
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Round 1: 2 orphans (OrphanA, OrphanB)
const authRound1: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanA: { type: 'rule', description: 'validation rule A — gap' },
    OrphanB: { type: 'rule', description: 'validation rule B — gap' },
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

// Round 2: 1 orphan fixed (OrphanA connected), OrphanB remains
const authRound2: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanA: { type: 'rule', description: 'validation rule A' },
    OrphanB: { type: 'rule', description: 'validation rule B — gap' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanA', action: 'checks rule A' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

// Round 3: all orphans fixed
const authRound3: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanA: { type: 'rule', description: 'validation rule A' },
    OrphanB: { type: 'rule', description: 'validation rule B' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanA', action: 'checks rule A' },
        { node: 'OrphanB', action: 'checks rule B' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
    AuditRun: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews auth coverage' },
        { node: 'Login', action: 'confirms login is tested' },
      ],
    },
  },
};

const result1 = compileFromModules(new Map([['_actors', _actors], ['auth', authRound1]]));
const result2 = compileFromModules(new Map([['_actors', _actors], ['auth', authRound2]]));
const result3 = compileFromModules(new Map([['_actors', _actors], ['auth', authRound3]]));

describe("TrackAuditFixProgress", () => {
  it("step 1: convergence/ConvergenceState provides the current pipeline step showing audit is in progress", () => {
    // Audit is in progress when there are orphans remaining
    expect(result1.coverage.orphans.length).toBeGreaterThanOrEqual(1);
    const auditInProgress = result1.coverage.orphans.length > 0;
    expect(auditInProgress).toBe(true);
  });

  it("step 2: audit/TrackAuditRound provides the current round number and cumulative gaps fixed", () => {
    const rounds = [
      { round: 1, gaps: result1.coverage.orphans.length },
      { round: 2, gaps: result2.coverage.orphans.length },
      { round: 3, gaps: result3.coverage.orphans.length },
    ];
    expect(rounds[0].round).toBe(1);
    expect(rounds[0].gaps).toBe(3); // OrphanA + OrphanB + _actors/Auditor
    const cumulativeFixed = rounds[0].gaps - rounds[2].gaps;
    expect(cumulativeFixed).toBe(3);
  });

  it("step 3: audit/AuditFindingsList provides the current gap count remaining", () => {
    expect(result1.coverage.orphans.length).toBe(3); // OrphanA + OrphanB + Auditor
    expect(result2.coverage.orphans.length).toBe(2); // OrphanB + Auditor
    expect(result3.coverage.orphans.length).toBe(0);
  });

  it("step 4: convergence/DataDecidesWhenToStop evaluates whether progress is being made based on gap count trending toward zero", () => {
    const gapHistory = [
      result1.coverage.orphans.length,
      result2.coverage.orphans.length,
      result3.coverage.orphans.length,
    ];
    // Gap count is strictly decreasing — progress is being made
    for (let i = 1; i < gapHistory.length; i++) {
      expect(gapHistory[i]).toBeLessThan(gapHistory[i - 1]);
    }
    // Final round reaches zero
    expect(gapHistory[gapHistory.length - 1]).toBe(0);
  });

  it("step 5: audit/TrackAuditRound records the gap count delta between this round and the previous round", () => {
    const round1Gaps = result1.coverage.orphans.length; // 2
    const round2Gaps = result2.coverage.orphans.length; // 1
    const round3Gaps = result3.coverage.orphans.length; // 0
    const delta1to2 = round1Gaps - round2Gaps;
    const delta2to3 = round2Gaps - round3Gaps;
    expect(delta1to2).toBe(1); // Fixed 1 gap in round 2 (OrphanA)
    expect(delta2to3).toBe(2); // Fixed 2 gaps in round 3 (OrphanB + Auditor via AuditRun)
  });

  it("step 6: convergence/ConvergenceState updates with the audit progress metrics for the current round", () => {
    // After round 3: fully converged
    const state = {
      status: result3.coverage.orphans.length === 0 ? 'converged' as const : 'audit-in-progress' as const,
      round: 3,
      total_nodes: result3.index._stats.total_nodes,
      errors: result3.issues.filter(i => i.severity === 'error').length,
      orphans: result3.index._stats.orphans,
      gaps_remaining: result3.coverage.orphans.length,
    };
    expect(state.status).toBe('converged');
    expect(state.errors).toBe(0);
    expect(state.orphans).toBe(0);
    expect(state.gaps_remaining).toBe(0);
  });

});
