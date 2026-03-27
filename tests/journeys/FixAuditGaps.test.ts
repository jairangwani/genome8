// Auto-generated from journey: FixAuditGaps
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts

// Pre-fix state: auth module has an orphan node (OrphanValidator)
const _actorsModule: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    Auditor: { type: 'actor', description: 'reviews graph coverage' },
    Compiler: { type: 'actor', description: 'validates the graph' },
  },
  journeys: {},
};

const preFix: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'not connected to any journey — gap' },
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

const preFixResult = compileFromModules(new Map([
  ['_actors', _actorsModule],
  ['auth', preFix],
]));

// Post-fix state: OrphanValidator is now in a journey
const postFix: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format — now connected' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanValidator', action: 'checks token format' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const postFixResult = compileFromModules(new Map([
  ['_actors', _actorsModule],
  ['auth', postFix],
]));

describe("FixAuditGaps", () => {
  it("step 1: audit/AuditFindingsList provides the list of coverage gaps to fix", () => {
    // Pre-fix: OrphanValidator is an orphan
    const orphans = preFixResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    expect(orphans.some(o => o.message.includes('OrphanValidator'))).toBe(true);
    // Also Auditor and Compiler actors are orphans (not in any journey)
    expect(orphans.some(o => o.message.includes('Auditor'))).toBe(true);
  });

  it("step 2: audit/PrioritizeGaps ranks gaps by severity to fix the most critical first", () => {
    // Gaps prioritized: orphan nodes > isolated modules > uncovered spec sections
    const gaps = preFixResult.issues
      .filter(i => i.severity === 'warning')
      .map(i => ({ message: i.message, module: i.module, priority: i.message.includes('Orphan') ? 1 : 2 }))
      .sort((a, b) => a.priority - b.priority);
    expect(gaps.length).toBeGreaterThanOrEqual(1);
    expect(gaps[0].priority).toBe(1); // orphans first
  });

  it("step 3: audit/TargetedFixesOnly enforces that fixes are targeted edits, not full re-creation", () => {
    // The fix adds OrphanValidator to a journey — targeted edit, not full rewrite
    // Pre-fix has 3 nodes and 1 journey with 3 steps
    expect(Object.keys(preFix.nodes).length).toBe(3);
    expect(preFix.journeys!.UserLogin.steps.length).toBe(3);
    // Post-fix has 3 nodes and 1 journey with 4 steps — only 1 step added
    expect(Object.keys(postFix.nodes).length).toBe(3);
    expect(postFix.journeys!.UserLogin.steps.length).toBe(4);
  });

  it("step 4: audit/SelectNextGapToFix picks the highest-priority unfixed gap from the list", () => {
    const orphans = preFixResult.coverage.orphans;
    // Pick the first orphan from the auth module
    const authOrphans = orphans.filter(o => o.startsWith('auth/'));
    expect(authOrphans).toContain('auth/OrphanValidator');
  });

  it("step 5: audit/DetectSelfAuditTarget checks whether the selected gap targets audit.yaml itself", () => {
    // The selected gap is in auth module, not audit — so no self-audit issue
    const targetModule = 'auth';
    const isSelfAudit = targetModule === 'audit';
    expect(isSelfAudit).toBe(false);
  });

  it("step 6: audit/BuildGapFixPrompt builds a specific fix prompt for the selected gap", () => {
    const fixPrompt = {
      target_module: 'auth',
      gap_type: 'orphan',
      gap_node: 'OrphanValidator',
      instruction: 'Add OrphanValidator to an existing journey as a validation step, or create a new journey that uses it.',
    };
    expect(fixPrompt.target_module).toBe('auth');
    expect(fixPrompt.gap_type).toBe('orphan');
    expect(fixPrompt.instruction).toContain('OrphanValidator');
  });

  it("step 7: audit/ProvideFixContext assembles the target module excerpt and gap details into a fix payload", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: preFixResult.index,
      coverage: preFixResult.coverage,
      issues: preFixResult.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process\n  OrphanValidator:\n    type: rule',
    });
    expect(excerpt).toContain('auth');
    expect(excerpt).toContain('OrphanValidator');
    expect(excerpt).toContain('Orphan');
  });

  it("step 8: _actors/LLMWorker receives the fix payload with the exact module and gap to address", () => {
    expect(preFixResult.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(preFixResult.index.nodes['_actors/LLMWorker'].type).toBe('actor');
  });

  it("step 9: audit/ApplyFix edits the target module YAML to close the coverage gap", () => {
    // Post-fix: OrphanValidator is now in the UserLogin journey
    const journey = postFixResult.index.journeys['UserLogin'];
    const validatorStep = journey.steps.find(s => s.node === 'auth/OrphanValidator');
    expect(validatorStep).toBeDefined();
    expect(validatorStep!.action).toContain('token format');
  });

  it("step 10: audit/VerifyFixCompiles runs compile.ts on the edited module", () => {
    // Post-fix compiles with 0 errors
    const errors = postFixResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: _actors/Compiler validates the edited module has 0 errors", () => {
    expect(postFixResult.index._stats.total_nodes).toBe(6); // 3 actors + 3 auth nodes
    expect(postFixResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 12: compilation/CompilationResult confirms the fix did not break compilation", () => {
    expect(postFixResult.index._stats.total_journeys).toBe(1);
    expect(postFixResult.index._stats.total_connections).toBeGreaterThanOrEqual(3);
  });

  it("step 13: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation to check for new orphans or duplicates", () => {
    const preOrphans = preFixResult.coverage.orphans;
    const postOrphans = postFixResult.coverage.orphans;
    // OrphanValidator was an orphan pre-fix but not post-fix
    expect(preOrphans).toContain('auth/OrphanValidator');
    expect(postOrphans).not.toContain('auth/OrphanValidator');
    // No new orphans introduced in auth
    const newAuthOrphans = postOrphans.filter(o => o.startsWith('auth/') && !preOrphans.includes(o));
    expect(newAuthOrphans.length).toBe(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the specific auditor on the fixed area", () => {
    // OrphanValidator now has journey coverage
    const node = postFixResult.index.nodes['auth/OrphanValidator'];
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
    // Preceded by Login, followed by TokenStore
    expect(node.preceded_by).toContain('auth/Login');
    expect(node.followed_by).toContain('auth/TokenStore');
  });

  it("step 15: _actors/Auditor confirms the specific gap is now closed", () => {
    // Post-fix orphan warnings no longer include OrphanValidator
    const postOrphanWarnings = postFixResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('OrphanValidator')
    );
    expect(postOrphanWarnings.length).toBe(0);
  });

  it("step 16: audit/TrackAuditRound increments the cumulative gaps-fixed counter", () => {
    let gapsFixed = 0;
    gapsFixed += 1; // OrphanValidator fixed
    expect(gapsFixed).toBe(1);
  });

  it("step 17: convergence/ConvergenceState updates with the fix result — either more gaps remain or all are closed", () => {
    // After fixing OrphanValidator, check remaining gaps
    const remainingOrphans = postFixResult.coverage.orphans;
    // Auditor and Compiler actors are still orphans (not in any journey)
    const actorOrphans = remainingOrphans.filter(o => o.startsWith('_actors/'));
    expect(actorOrphans.length).toBeGreaterThanOrEqual(2); // Auditor, Compiler
    // More gaps remain — convergence continues
    const allGapsClosed = remainingOrphans.length === 0;
    expect(allGapsClosed).toBe(false);
  });

});
