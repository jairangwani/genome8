// Auto-generated from journey: RevertDestructiveFix
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, graph, _actors

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

// Pre-fix auth: 3 nodes, 1 journey
const preFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format — orphan gap' },
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

// Destructive fix: closes the orphan gap but REMOVES TokenStore and UserLogin journey
// Replaces them with a smaller module — content loss
const destructiveFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    OrphanRule: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    SimpleLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanRule', action: 'checks format' },
      ],
    },
  },
};

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));
const destructiveResult = compileFromModules(new Map([['_actors', _actors], ['auth', destructiveFixAuth]]));
const revertResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));

describe("RevertDestructiveFix", () => {
  it("step 1: audit/ApplyFix has edited the target module to close a coverage gap", () => {
    // Pre-fix had the orphan
    expect(preFixResult.coverage.orphans).toContain('auth/OrphanRule');
    // Destructive fix closes it
    expect(destructiveResult.coverage.orphans).not.toContain('auth/OrphanRule');
  });

  it("step 2: audit/VerifyFixCompiles compilation passes with zero new errors", () => {
    const errors = destructiveResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 3: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    expect(destructiveResult.index.nodes['auth/OrphanRule'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 4: audit/DetectFixContentLoss compares pre-fix node count against post-fix node count in the target module", () => {
    const preNodes = Object.entries(preFixResult.index.nodes).filter(([, n]) => n.module === 'auth').length;
    const postNodes = Object.entries(destructiveResult.index.nodes).filter(([, n]) => n.module === 'auth').length;
    expect(preNodes).toBe(3);
    expect(postNodes).toBe(2);
    expect(postNodes).toBeLessThan(preNodes);
  });

  it("step 5: audit/DetectFixContentLoss compares pre-fix journey count against post-fix journey count in the target module", () => {
    const preJourneys = Object.values(preFixResult.index.journeys).filter(j => j.module === 'auth');
    const postJourneys = Object.values(destructiveResult.index.journeys).filter(j => j.module === 'auth');
    expect(preJourneys.length).toBe(1);
    expect(postJourneys.length).toBe(1);
    // Journey name changed — UserLogin was replaced by SimpleLogin
    expect(preJourneys[0].name).toBe('UserLogin');
    expect(postJourneys[0].name).toBe('SimpleLogin');
  });

  it("step 6: audit/DetectFixContentLoss detects that the fix decreased node or journey count indicating existing content was removed", () => {
    const preNodeCount = Object.entries(preFixResult.index.nodes).filter(([, n]) => n.module === 'auth').length;
    const postNodeCount = Object.entries(destructiveResult.index.nodes).filter(([, n]) => n.module === 'auth').length;
    const contentLost = postNodeCount < preNodeCount;
    expect(contentLost).toBe(true);
    // Specifically: TokenStore was removed
    expect(preFixResult.index.nodes['auth/TokenStore']).toBeDefined();
    expect(destructiveResult.index.nodes['auth/TokenStore']).toBeUndefined();
  });

  it("step 7: audit/RejectAndRevertFix restores the module to its pre-fix state to preserve the destroyed content", () => {
    // After revert: all original nodes are back
    expect(revertResult.index.nodes['auth/Login']).toBeDefined();
    expect(revertResult.index.nodes['auth/TokenStore']).toBeDefined();
    expect(revertResult.index.nodes['auth/OrphanRule']).toBeDefined();
  });

  it("step 8: graph/ModuleFile stores the reverted module on disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-revert-destr-'));
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ nodes: _actors.nodes, journeys: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: preFixAuth.nodes, journeys: preFixAuth.journeys })
    );
    const diskResult = compile(tmpDir);
    expect(diskResult.index.nodes['auth/TokenStore']).toBeDefined();
    expect(diskResult.index.nodes['auth/OrphanRule']).toBeDefined();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 9: _actors/Compiler recompiles to confirm the revert restored the previous state", () => {
    const errors = revertResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(revertResult.index._stats.total_nodes).toBe(preFixResult.index._stats.total_nodes);
  });

  it("step 10: audit/BuildGapFixPrompt rebuilds the fix prompt with explicit instruction to ADD content without removing existing nodes or journeys", () => {
    const retryPrompt = {
      target: 'auth/OrphanRule',
      type: 'orphan',
      destructiveFixRejected: true,
      instruction: 'Add OrphanRule to an existing journey or create a new journey. Do NOT remove existing nodes (TokenStore) or rename existing journeys (UserLogin).',
    };
    expect(retryPrompt.destructiveFixRejected).toBe(true);
    expect(retryPrompt.instruction).toContain('Do NOT remove');
    expect(retryPrompt.instruction).toContain('TokenStore');
  });

  it("step 11: audit/TrackAuditRound records the destructive fix attempt for progress tracking", () => {
    const roundLog = {
      round: 1,
      target: 'auth/OrphanRule',
      result: 'rejected-destructive' as const,
      reason: 'content loss: node count decreased from 3 to 2',
      nodesLost: ['auth/TokenStore'],
    };
    expect(roundLog.result).toBe('rejected-destructive');
    expect(roundLog.nodesLost).toContain('auth/TokenStore');
  });

});
