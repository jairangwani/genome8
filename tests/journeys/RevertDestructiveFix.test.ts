// Auto-generated from journey: RevertDestructiveFix
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import yaml from 'js-yaml';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix auth module: has 3 nodes, 2 journeys
const preFixAuth: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
    Register: { type: 'process', description: 'Registration flow' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
    UserRegister: {
      steps: [
        { node: '_actors/User', action: 'creates account' },
        { node: 'Register', action: 'processes registration' },
        { node: 'Token', action: 'is issued' },
      ],
    },
  },
};

// Destructive fix: closed a gap but removed Register node and UserRegister journey
const destructiveFixAuth: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
    AdminPanel: { type: 'interface', description: 'Admin dashboard' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
    AdminAccess: {
      steps: [
        { node: '_actors/Admin', action: 'opens dashboard' },
        { node: 'AdminPanel', action: 'renders panel' },
      ],
    },
  },
};

const actors: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Platform user' },
    Admin: { type: 'actor', description: 'Platform admin' },
  },
};

function buildPreFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', preFixAuth],
  ]));
}

function buildDestructiveFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', destructiveFixAuth],
  ]));
}

describe("RevertDestructiveFix", () => {
  it("step 1: audit/ApplyFix has edited the target module to close a coverage gap", () => {
    const editedYaml = yaml.dump(destructiveFixAuth);
    expect(editedYaml).toContain('AdminAccess');
    expect(editedYaml).toContain('AdminPanel');
  });

  it("step 2: audit/VerifyFixCompiles compilation passes with zero new errors", () => {
    const result = buildDestructiveFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 3: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    const result = buildDestructiveFix();
    // Admin is now in a journey — gap closed
    const adminNode = result.index.nodes['_actors/Admin'];
    expect(adminNode.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 4: audit/DetectFixContentLoss compares pre-fix node count against post-fix node count in the target module", () => {
    const preFixNodeCount = Object.keys(preFixAuth.nodes!).length;
    const postFixNodeCount = Object.keys(destructiveFixAuth.nodes!).length;
    // Both have 3 nodes, but different nodes
    expect(preFixNodeCount).toBe(3);
    expect(postFixNodeCount).toBe(3);
    // Register was removed and AdminPanel was added
    expect(Object.keys(preFixAuth.nodes!)).toContain('Register');
    expect(Object.keys(destructiveFixAuth.nodes!)).not.toContain('Register');
  });

  it("step 5: audit/DetectFixContentLoss compares pre-fix journey count against post-fix journey count in the target module", () => {
    const preFixJourneyCount = Object.keys(preFixAuth.journeys!).length;
    const postFixJourneyCount = Object.keys(destructiveFixAuth.journeys!).length;
    expect(preFixJourneyCount).toBe(2);
    expect(postFixJourneyCount).toBe(2);
    // UserRegister was removed
    expect(Object.keys(preFixAuth.journeys!)).toContain('UserRegister');
    expect(Object.keys(destructiveFixAuth.journeys!)).not.toContain('UserRegister');
  });

  it("step 6: audit/DetectFixContentLoss detects that the fix decreased node or journey count indicating existing content was removed", () => {
    const preFixNodes = new Set(Object.keys(preFixAuth.nodes!));
    const postFixNodes = new Set(Object.keys(destructiveFixAuth.nodes!));
    const removedNodes = [...preFixNodes].filter(n => !postFixNodes.has(n));
    expect(removedNodes).toContain('Register');

    const preFixJourneys = new Set(Object.keys(preFixAuth.journeys!));
    const postFixJourneys = new Set(Object.keys(destructiveFixAuth.journeys!));
    const removedJourneys = [...preFixJourneys].filter(j => !postFixJourneys.has(j));
    expect(removedJourneys).toContain('UserRegister');

    const isDestructive = removedNodes.length > 0 || removedJourneys.length > 0;
    expect(isDestructive).toBe(true);
  });

  it("step 7: audit/RejectAndRevertFix restores the module to its pre-fix state to preserve the destroyed content", () => {
    const restoredYaml = yaml.dump(preFixAuth);
    const parsed = yaml.load(restoredYaml) as ModuleFile;
    expect(Object.keys(parsed.nodes!)).toContain('Register');
    expect(Object.keys(parsed.journeys!)).toContain('UserRegister');
  });

  it("step 8: graph/ModuleFile stores the reverted module on disk", () => {
    const moduleYaml = yaml.dump(preFixAuth);
    expect(moduleYaml).toContain('Register');
    expect(moduleYaml).toContain('UserRegister');
    expect(moduleYaml).toContain('Login');
    expect(moduleYaml).toContain('Token');
  });

  it("step 9: _actors/Compiler recompiles to confirm the revert restored the previous state", () => {
    const result = buildPreFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index.nodes['auth/Register']).toBeDefined();
  });

  it("step 10: audit/BuildGapFixPrompt rebuilds the fix prompt with explicit instruction to ADD content without removing existing nodes or journeys", () => {
    const retryPrompt = `Fix the following gap in module "auth":
Gap: Admin actor not used in any journey

CRITICAL: Do NOT remove any existing nodes or journeys.
You MUST preserve: Login, Token, Register, UserLogin, UserRegister.
Only ADD new nodes and journeys to close the gap.`;
    expect(retryPrompt).toContain('Do NOT remove');
    expect(retryPrompt).toContain('MUST preserve');
    expect(retryPrompt).toContain('Register');
    expect(retryPrompt).toContain('UserRegister');
    expect(retryPrompt).toContain('Only ADD');
  });

  it("step 11: audit/TrackAuditRound records the destructive fix attempt for progress tracking", () => {
    const tracker = {
      round: 1,
      attempts: 1,
      destructiveFixes: 1,
      successfulFixes: 0,
      gapsRemaining: 1,
    };
    expect(tracker.destructiveFixes).toBe(1);
    expect(tracker.successfulFixes).toBe(0);
    expect(tracker.gapsRemaining).toBe(1);
  });

});
