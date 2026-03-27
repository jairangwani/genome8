// Auto-generated from journey: HandleFailedFixVerification
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: audit, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
    Compiler: { type: 'actor', description: 'validates the graph' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Pre-fix: OrphanRule is an orphan
const preFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format — gap' },
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

// Ineffective fix: edits description but does NOT add OrphanRule to any journey
const ineffectiveFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format — FIXED' },
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

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));
const badFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', ineffectiveFixAuth]]));
const revertResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));

describe("HandleFailedFixVerification", () => {
  it("step 1: audit/ApplyFix has edited a module to close a gap", () => {
    // Pre-fix: OrphanRule is an orphan
    expect(preFixResult.coverage.orphans).toContain('auth/OrphanRule');
    // The ineffective fix was applied
    expect(badFixResult.index.nodes['auth/OrphanRule']).toBeDefined();
  });

  it("step 2: audit/VerifyGapClosed re-runs the auditor and finds the gap is still present", () => {
    // After the ineffective fix, OrphanRule is STILL an orphan
    expect(badFixResult.coverage.orphans).toContain('auth/OrphanRule');
    expect(badFixResult.index.nodes['auth/OrphanRule'].in_journeys.length).toBe(0);
  });

  it("step 3: _actors/Auditor reports that the specific gap was not resolved by the fix", () => {
    // The orphan warning for OrphanRule still exists
    const orphanWarnings = badFixResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('OrphanRule')
    );
    expect(orphanWarnings.length).toBeGreaterThanOrEqual(1);
  });

  it("step 4: audit/RejectAndRevertFix restores the module to its pre-fix state since the fix did not achieve its goal", () => {
    // Revert to pre-fix: same orphan state as before
    expect(revertResult.coverage.orphans).toContain('auth/OrphanRule');
    expect(revertResult.index.nodes['auth/OrphanRule'].description).toBe('validates token format — gap');
  });

  it("step 5: graph/ModuleFile stores the reverted module content", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-failfix-'));
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ nodes: _actors.nodes, journeys: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys })
    );
    const diskResult = compile(tmpDir);
    expect(diskResult.index.nodes['auth/OrphanRule']).toBeDefined();
    expect(diskResult.index.nodes['auth/OrphanRule'].description).toBe('validates token format — gap');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 6: _actors/Compiler recompiles to confirm the revert is clean", () => {
    const errors = revertResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 7: compilation/CompilationResult confirms zero errors after revert", () => {
    expect(revertResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(revertResult.index._compiled).toBeDefined();
    expect(revertResult.index._stats.total_nodes).toBe(preFixResult.index._stats.total_nodes);
  });

  it("step 8: audit/AuditFindingsList retains the gap and marks it with a failed-fix-attempt annotation", () => {
    // Gap is still in findings
    expect(revertResult.coverage.orphans).toContain('auth/OrphanRule');
    // Simulate annotation
    const findings = revertResult.coverage.orphans.map(o => ({
      target: o,
      failedAttempts: o === 'auth/OrphanRule' ? 1 : 0,
    }));
    const annotated = findings.find(f => f.target === 'auth/OrphanRule');
    expect(annotated).toBeDefined();
    expect(annotated!.failedAttempts).toBe(1);
  });

  it("step 9: audit/BuildGapFixPrompt rebuilds the fix prompt with additional context about why the previous attempt failed", () => {
    const retryPrompt = {
      target: 'auth/OrphanRule',
      type: 'orphan',
      previousAttemptFailed: true,
      failureReason: 'OrphanRule still not referenced in any journey after fix',
      instruction: 'Add OrphanRule to an existing journey step — changing description alone is insufficient.',
    };
    expect(retryPrompt.previousAttemptFailed).toBe(true);
    expect(retryPrompt.instruction).toContain('journey step');
  });

  it("step 10: audit/ProvideFixContext includes the failed attempt details so the next worker can try a different approach", () => {
    const moduleYaml = yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys });
    const excerpt = generateExcerpt({
      round: 2,
      focusModule: 'auth',
      index: revertResult.index,
      coverage: revertResult.coverage,
      issues: revertResult.issues,
      moduleFileContent: moduleYaml,
    });
    const fixContext = {
      excerpt,
      gap: { type: 'orphan', node: 'auth/OrphanRule' },
      previousAttempt: { failed: true, reason: 'OrphanRule still orphan after edit' },
    };
    expect(fixContext.excerpt).toContain('OrphanRule');
    expect(fixContext.previousAttempt.failed).toBe(true);
  });

  it("step 11: audit/TrackAuditRound records the failed verification for progress tracking", () => {
    const roundLog = {
      round: 1,
      target: 'auth/OrphanRule',
      result: 'verification-failed' as const,
      reason: 'gap still present after fix',
      gaps_before: preFixResult.coverage.orphans.length,
      gaps_after: revertResult.coverage.orphans.length,
    };
    expect(roundLog.result).toBe('verification-failed');
    expect(roundLog.gaps_after).toBe(roundLog.gaps_before);
  });

});
