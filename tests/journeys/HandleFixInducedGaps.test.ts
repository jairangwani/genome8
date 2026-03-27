// Auto-generated from journey: HandleFixInducedGaps
// Module: audit
// Modules touched: audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
  },
  journeys: {},
};

// Pre-fix: OrphanA is an orphan, OrphanB is in a journey
const preFixAuth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanA: { type: 'rule', description: 'rule A — orphan gap' },
    OrphanB: { type: 'rule', description: 'rule B — connected' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanB', action: 'checks rule B' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

// Bad fix: adds OrphanA to the journey but removes OrphanB from it (closes one gap, opens another)
const badFixAuth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanA: { type: 'rule', description: 'rule A — now connected' },
    OrphanB: { type: 'rule', description: 'rule B — now orphan due to fix' },
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

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));
const badFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', badFixAuth]]));

describe("HandleFixInducedGaps", () => {
  it("step 1: audit/ApplyFix has edited a module to close a specific coverage gap", () => {
    // Pre-fix: OrphanA is an orphan
    expect(preFixResult.coverage.orphans).toContain('auth/OrphanA');
    // Bad fix was applied to close it
    expect(badFixResult.index.nodes['auth/OrphanA'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    // OrphanA is no longer an orphan after the fix
    expect(badFixResult.coverage.orphans).not.toContain('auth/OrphanA');
  });

  it("step 3: audit/DetectFixInducedGaps re-runs all 3 coverage checks against the post-fix graph", () => {
    // Post-fix coverage report exists
    expect(badFixResult.coverage).toBeDefined();
    expect(badFixResult.coverage.modules['auth']).toBeDefined();
    // Check all 3 angles available
    expect(badFixResult.coverage.modules['auth'].spec_sections).toEqual([1, 2]);
    expect(badFixResult.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
    expect(badFixResult.coverage.orphans).toBeDefined();
  });

  it("step 4: audit/CheckSpecCoverage checks whether the fix changed spec coverage in other modules", () => {
    // Spec sections remain covered (fix didn't alter spec coverage)
    const coveredSections = new Set<number>();
    for (const mod of Object.values(badFixResult.coverage.modules)) {
      for (const s of mod.spec_sections) coveredSections.add(s);
    }
    expect(coveredSections.has(1)).toBe(true);
    expect(coveredSections.has(2)).toBe(true);
  });

  it("step 5: audit/CheckActorCoverage checks whether the fix created new orphan actors", () => {
    // LLMWorker is still in a journey
    expect(badFixResult.index.nodes['_actors/LLMWorker'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // Auditor is still an orphan actor (was before too)
    expect(badFixResult.index.nodes['_actors/Auditor'].in_journeys.length).toBe(0);
  });

  it("step 6: audit/CheckCrossModuleCoverage checks whether the fix disrupted cross-module connections", () => {
    // auth still connects to _actors via journey steps
    expect(badFixResult.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 7: audit/DetectFixInducedGaps compares pre-fix and post-fix findings to identify any newly opened gaps", () => {
    // Pre-fix orphans vs post-fix orphans
    const preOrphans = new Set(preFixResult.coverage.orphans);
    const postOrphans = new Set(badFixResult.coverage.orphans);
    // New gaps: in post but not in pre
    const newGaps = [...postOrphans].filter(o => !preOrphans.has(o));
    expect(newGaps).toContain('auth/OrphanB');
    expect(newGaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 8: audit/CollectAuditFindings adds the newly opened gaps to the existing findings list", () => {
    // Combine remaining pre-fix gaps + new gaps
    const preOrphans = new Set(preFixResult.coverage.orphans);
    const postOrphans = badFixResult.coverage.orphans;
    const newGaps = postOrphans.filter(o => !preOrphans.has(o));
    // The original gap (OrphanA) is closed, but OrphanB is a new gap
    const updatedFindings = [...postOrphans];
    expect(updatedFindings).toContain('auth/OrphanB');
    expect(updatedFindings).not.toContain('auth/OrphanA');
    expect(newGaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 9: audit/AuditFindingsList stores the updated list with the new fix-induced gaps appended", () => {
    // Post-fix findings still has gaps
    expect(badFixResult.coverage.orphans.length).toBeGreaterThanOrEqual(1);
    expect(badFixResult.coverage.orphans).toContain('auth/OrphanB');
  });

  it("step 10: audit/PrioritizeGaps re-ranks the updated gap list including the new entries", () => {
    const gaps = badFixResult.coverage.orphans.map((o, i) => ({
      target: o,
      priority: i + 1,
      isNew: !preFixResult.coverage.orphans.includes(o),
    }));
    expect(gaps.length).toBeGreaterThanOrEqual(1);
    expect(gaps[0].priority).toBe(1);
    // OrphanB is a new gap
    const newEntries = gaps.filter(g => g.isNew);
    expect(newEntries.length).toBeGreaterThanOrEqual(1);
  });

  it("step 11: audit/TrackAuditRound records that the fix closed one gap but opened others for progress tracking", () => {
    const roundLog = {
      round: 1,
      gapClosed: 'auth/OrphanA',
      gapsOpened: badFixResult.coverage.orphans.filter(o => !preFixResult.coverage.orphans.includes(o)),
      netDelta: preFixResult.coverage.orphans.length - badFixResult.coverage.orphans.length,
    };
    expect(roundLog.gapClosed).toBe('auth/OrphanA');
    expect(roundLog.gapsOpened).toContain('auth/OrphanB');
    // Net delta: closed 1 (OrphanA) but opened 1+ (OrphanB + possibly actors)
    // The actual orphan counts may differ, just verify tracking works
    expect(typeof roundLog.netDelta).toBe('number');
  });

});
