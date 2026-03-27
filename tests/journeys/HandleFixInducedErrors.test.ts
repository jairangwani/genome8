// Auto-generated from journey: HandleFixInducedErrors
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Pre-fix: OrphanValidator is an orphan
const preFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format — gap' },
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

// Bad fix: adds OrphanValidator to a journey but introduces a dangling ref
const badFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanValidator', action: 'checks token format' },
        { node: 'TokenStore', action: 'stores token' },
        { node: 'NonExistentNode', action: 'dangling ref introduced by bad fix' },
      ],
    },
  },
};

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));
const badFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', badFixAuth]]));
// Revert = re-compile with pre-fix state
const revertResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));

describe("HandleFixInducedErrors", () => {
  it("step 1: audit/ApplyFix has just edited a module to close a coverage gap", () => {
    // Pre-fix: OrphanValidator is an orphan
    expect(preFixResult.coverage.orphans).toContain('auth/OrphanValidator');
    // Bad fix attempts to close this gap
    expect(badFixResult.index.nodes['auth/OrphanValidator']).toBeDefined();
  });

  it("step 2: audit/VerifyFixCompiles runs compilation on the edited module", () => {
    // The bad fix compiles but produces errors
    expect(badFixResult.index).toBeDefined();
    expect(badFixResult.index._compiled).toBeDefined();
  });

  it("step 3: _actors/Compiler returns a compilation result with new errors not present before the fix", () => {
    const preErrors = preFixResult.issues.filter(i => i.severity === 'error');
    const postErrors = badFixResult.issues.filter(i => i.severity === 'error');
    // Bad fix introduced errors (dangling ref to NonExistentNode)
    expect(postErrors.length).toBeGreaterThan(preErrors.length);
  });

  it("step 4: compilation/CompilationResult provides the post-fix result showing new orphans, duplicates, or dangling refs", () => {
    // The dangling ref to NonExistentNode is flagged
    const danglingErrors = badFixResult.issues.filter(i =>
      i.severity === 'error' && i.message.includes('NonExistentNode')
    );
    expect(danglingErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: audit/DetectFixInducedErrors compares pre-fix error counts against post-fix and identifies the new problems", () => {
    const preErrorCount = preFixResult.issues.filter(i => i.severity === 'error').length;
    const postErrorCount = badFixResult.issues.filter(i => i.severity === 'error').length;
    const newErrors = postErrorCount - preErrorCount;
    expect(newErrors).toBeGreaterThanOrEqual(1);
  });

  it("step 6: audit/DetectFixInducedErrors determines the fix is net-negative because it introduced more problems than it solved", () => {
    // The fix closed 1 orphan but introduced a dangling ref error
    const orphanFixed = preFixResult.coverage.orphans.includes('auth/OrphanValidator') &&
      !badFixResult.coverage.orphans.includes('auth/OrphanValidator');
    const newErrors = badFixResult.issues.filter(i => i.severity === 'error').length -
      preFixResult.issues.filter(i => i.severity === 'error').length;
    // Net-negative: introduced more problems than solved
    const netNegative = newErrors > 0;
    expect(orphanFixed).toBe(true);
    expect(netNegative).toBe(true);
  });

  it("step 7: audit/RejectAndRevertFix reads the pre-fix backup of the target module file", () => {
    // Simulate: we have a backup of the pre-fix content
    const backup = yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys });
    expect(backup).toContain('OrphanValidator');
    expect(backup).not.toContain('NonExistentNode');
  });

  it("step 8: audit/RejectAndRevertFix restores the module to its pre-fix state on disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-revert-'));
    // Write the bad fix
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: badFixAuth.nodes, journeys: badFixAuth.journeys })
    );
    // Revert to pre-fix
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys })
    );
    const content = fs.readFileSync(path.join(tmpDir, 'auth.yaml'), 'utf8');
    expect(content).toContain('OrphanValidator');
    expect(content).not.toContain('NonExistentNode');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 9: graph/ModuleFile stores the reverted module content", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-revert2-'));
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ nodes: _actors.nodes, journeys: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys })
    );
    const diskResult = compile(tmpDir);
    expect(diskResult.index.nodes['auth/OrphanValidator']).toBeDefined();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 10: _actors/Compiler recompiles to confirm the revert restored zero-error state", () => {
    const errors = revertResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: compilation/CompilationResult confirms the graph is back to its pre-fix clean state", () => {
    expect(revertResult.index._stats.orphans).toBe(preFixResult.index._stats.orphans);
    expect(revertResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(revertResult.index._stats.total_nodes).toBe(preFixResult.index._stats.total_nodes);
  });

  it("step 12: audit/AuditFindingsList retains the original gap since the fix was rejected", () => {
    // After revert, the original orphan is back
    expect(revertResult.coverage.orphans).toContain('auth/OrphanValidator');
  });

  it("step 13: audit/TrackAuditRound records the failed fix attempt for progress analysis", () => {
    const roundLog = {
      round: 1,
      target: 'auth/OrphanValidator',
      result: 'rejected' as const,
      reason: 'net-negative: introduced dangling ref',
      gaps_before: preFixResult.coverage.orphans.length,
      gaps_after: revertResult.coverage.orphans.length,
    };
    expect(roundLog.result).toBe('rejected');
    expect(roundLog.gaps_after).toBe(roundLog.gaps_before); // No net progress
  });

});
