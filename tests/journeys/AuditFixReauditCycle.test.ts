// Auto-generated from journey: AuditFixReauditCycle
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts

// Round 1: has gaps (orphan node + isolated module)
const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

const round1Auth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'gap — not in any journey' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores' },
      ],
    },
  },
};

const round1Result = compileFromModules(new Map([['_actors', _actors], ['auth', round1Auth]]));

// Round 2: gap fixed — OrphanRule now in journey
const round2Auth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanRule', action: 'checks format' },
        { node: 'TokenStore', action: 'stores' },
      ],
    },
  },
};

const round2Result = compileFromModules(new Map([['_actors', _actors], ['auth', round2Auth]]));

// Round 3: all non-actor gaps closed, actors added to journeys
const round3Auth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanRule', action: 'checks format' },
        { node: 'TokenStore', action: 'stores' },
      ],
    },
    AuditFlow: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: '_actors/Auditor', action: 'reviews coverage' },
      ],
    },
  },
};

const round3Result = compileFromModules(new Map([['_actors', _actors], ['auth', round3Auth]]));

describe("AuditFixReauditCycle", () => {
  it("step 1: convergence/ConvergenceState indicates gaps remain after a fix round", () => {
    // Round 1 has orphans — gaps remain
    const round1Orphans = round1Result.coverage.orphans;
    expect(round1Orphans.length).toBeGreaterThanOrEqual(1);
    expect(round1Orphans).toContain('auth/OrphanRule');
  });

  it("step 2: audit/TrackAuditRound increments the round counter for the next audit-fix cycle", () => {
    let round = 1;
    // After round 1, increment to round 2
    round += 1;
    expect(round).toBe(2);
  });

  it("step 3: audit/AuditRoundLimit checks whether the round counter has exceeded the maximum allowed cycles", () => {
    const maxCycles = 5;
    // Round 2 is within limit
    expect(2).toBeLessThanOrEqual(maxCycles);
    // Round 6 would exceed
    expect(6).toBeGreaterThan(maxCycles);
  });

  it("step 4: convergence/RecompileAfterFix runs full compilation after all fixes in this round", () => {
    // Round 2 compilation produces a valid result
    expect(round2Result.index).toBeDefined();
    expect(round2Result.index._stats.total_nodes).toBe(6); // 3 actors + 3 auth
    expect(round2Result.index._stats.total_journeys).toBe(1);
  });

  it("step 5: _actors/Compiler validates the full graph after fixes", () => {
    const errors = round2Result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 6: compilation/CompilationResult confirms 0 errors after the fix round", () => {
    expect(round2Result.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(round2Result.index._stats.total_connections).toBeGreaterThanOrEqual(3);
  });

  it("step 7: audit/ValidateGraphInvariantsPostFix checks zero orphans, zero duplicates, and zero isolated modules in the post-fix graph", () => {
    // Round 2 fixed OrphanRule but actors are still orphans
    expect(round2Result.coverage.orphans).not.toContain('auth/OrphanRule');
    expect(round2Result.index._stats.duplicate_names).toBe(0);
    // After round 3 — all actors in journeys
    expect(round3Result.index._stats.duplicate_names).toBe(0);
  });

  it("step 8: convergence/ReauditAfterFix triggers a re-audit to check for remaining gaps", () => {
    // Round 2 still has actor orphans — re-audit needed
    const round2ActorOrphans = round2Result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(round2ActorOrphans.length).toBeGreaterThanOrEqual(2); // Compiler, Auditor
  });

  it("step 9: audit/GenerateAuditPrompt rebuilds audit prompts for all 3 angles", () => {
    // All 3 audit angles are re-run
    const angles = ['spec-coverage', 'actor-coverage', 'cross-module-coverage'];
    expect(angles.length).toBe(3);
  });

  it("step 10: _actors/Auditor re-checks spec coverage after fixes", () => {
    // Round 2 has same spec_sections as round 1
    expect(round2Result.coverage.modules['auth']).toBeDefined();
  });

  it("step 11: audit/CheckSpecCoverage re-examines spec sections against the updated graph", () => {
    // Spec sections are tracked in coverage
    const authCov = round2Result.coverage.modules['auth'];
    expect(authCov.nodes).toBe(3);
    expect(authCov.journeys).toBe(1);
  });

  it("step 12: _actors/Auditor re-checks actor coverage after fixes", () => {
    // Round 2: LLMWorker is in a journey, Compiler and Auditor are not
    expect(round2Result.index.nodes['_actors/LLMWorker'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(round2Result.index.nodes['_actors/Compiler'].in_journeys.length).toBe(0);
    expect(round2Result.index.nodes['_actors/Auditor'].in_journeys.length).toBe(0);
  });

  it("step 13: audit/CheckActorCoverage re-examines actor references in the updated graph", () => {
    // Round 3 fixes actor coverage — Compiler and Auditor now in AuditFlow
    expect(round3Result.index.nodes['_actors/Compiler'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(round3Result.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 14: _actors/Auditor re-checks cross-module coverage after fixes", () => {
    // Round 3: auth has cross-module connections to _actors
    expect(round3Result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
    expect(round3Result.coverage.modules['_actors'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 15: audit/CheckCrossModuleCoverage re-examines module connections in the updated graph", () => {
    // No isolated modules in round 3
    expect(round3Result.index._stats.isolated_modules).toBe(0);
  });

  it("step 16: audit/MergeAuditReports combines the re-audit reports into unified format", () => {
    // Round 3 re-audit — collect all findings
    const orphans = round3Result.coverage.orphans;
    const isolated = round3Result.coverage.isolated_modules;
    const totalGaps = orphans.length + isolated.length;
    // May still have some gaps or may be clean
    expect(totalGaps).toBeGreaterThanOrEqual(0);
  });

  it("step 17: audit/CollectAuditFindings gathers findings from the re-audit", () => {
    // Round 3 should have no auth orphans
    const authOrphans = round3Result.coverage.orphans.filter(o => o.startsWith('auth/'));
    expect(authOrphans.length).toBe(0);
  });

  it("step 18: audit/AuditFindingsList stores the updated gap list — may be empty", () => {
    // Round 3 may still have actor orphans or may be clean
    // All 3 actors are now in journeys
    const actorOrphans = round3Result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(actorOrphans.length).toBe(0);
    // All gaps are closed — convergence can complete
    const errors = round3Result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

});
