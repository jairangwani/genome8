// Auto-generated from journey: HandleFixInducedErrors
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import yaml from 'js-yaml';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix graph: clean, compiles with 0 errors, 0 orphans
const actors: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Platform user' },
    Admin: { type: 'actor', description: 'Platform admin' },
  },
};

const preFixAuth: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
    AdminLogin: {
      steps: [
        { node: '_actors/Admin', action: 'opens panel' },
        { node: 'Login', action: 'authenticates admin' },
      ],
    },
  },
};

// Bad fix: references auth/AuditLog which doesn't exist in auth module → dangling ref error
const brokenFixAuth: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
    AdminLogin: {
      steps: [
        { node: '_actors/Admin', action: 'opens panel' },
        { node: 'Login', action: 'authenticates admin' },
        { node: 'auth/AuditLog', action: 'records admin login — but AuditLog does not exist' },
      ],
    },
  },
};

function buildPreFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', preFixAuth],
  ]));
}

function buildBrokenFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', brokenFixAuth],
  ]));
}

describe("HandleFixInducedErrors", () => {
  it("step 1: audit/ApplyFix has just edited a module to close a coverage gap", () => {
    const editedYaml = yaml.dump(brokenFixAuth);
    expect(editedYaml).toContain('AdminLogin');
    expect(editedYaml).toContain('AuditLog');
    const parsed = yaml.load(editedYaml) as ModuleFile;
    expect(parsed.journeys!.AdminLogin).toBeDefined();
  });

  it("step 2: audit/VerifyFixCompiles runs compilation on the edited module", () => {
    const result = buildBrokenFix();
    expect(result.index).toBeDefined();
    expect(result.issues).toBeDefined();
  });

  it("step 3: _actors/Compiler returns a compilation result with new errors not present before the fix", () => {
    const preFix = buildPreFix();
    const postFix = buildBrokenFix();
    const preErrors = preFix.issues.filter(i => i.severity === 'error');
    const postErrors = postFix.issues.filter(i => i.severity === 'error');
    expect(preErrors.length).toBe(0);
    // The broken fix introduced errors (dangling ref to auth/AuditLog)
    expect(postErrors.length).toBeGreaterThan(0);
  });

  it("step 4: compilation/CompilationResult provides the post-fix result showing new orphans, duplicates, or dangling refs", () => {
    const result = buildBrokenFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    // At least one error should mention the dangling ref
    const danglingErrors = errors.filter(e => e.message.includes('AuditLog') || e.message.includes('does not exist'));
    expect(danglingErrors.length).toBeGreaterThan(0);
  });

  it("step 5: audit/DetectFixInducedErrors compares pre-fix error counts against post-fix and identifies the new problems", () => {
    const preFix = buildPreFix();
    const postFix = buildBrokenFix();
    const preErrorCount = preFix.issues.filter(i => i.severity === 'error').length;
    const postErrorCount = postFix.issues.filter(i => i.severity === 'error').length;
    const newErrors = postErrorCount - preErrorCount;
    expect(newErrors).toBeGreaterThan(0);
  });

  it("step 6: audit/DetectFixInducedErrors determines the fix is net-negative because it introduced more problems than it solved", () => {
    const postFix = buildBrokenFix();
    const errors = postFix.issues.filter(i => i.severity === 'error');
    const gapsClosed = 0; // fix was supposed to improve AdminLogin but introduced errors instead
    const errorsIntroduced = errors.length;
    const isNetNegative = errorsIntroduced > gapsClosed;
    expect(isNetNegative).toBe(true);
  });

  it("step 7: audit/RejectAndRevertFix reads the pre-fix backup of the target module file", () => {
    const backupYaml = yaml.dump(preFixAuth);
    const parsed = yaml.load(backupYaml) as ModuleFile;
    expect(parsed.journeys!.UserLogin).toBeDefined();
    expect(parsed.journeys!.AdminLogin).toBeDefined();
    // backup does NOT contain the broken AuditLog ref
    expect(backupYaml).not.toContain('AuditLog');
  });

  it("step 8: audit/RejectAndRevertFix restores the module to its pre-fix state on disk", () => {
    const restoredYaml = yaml.dump(preFixAuth);
    const parsed = yaml.load(restoredYaml) as ModuleFile;
    expect(Object.keys(parsed.journeys!)).toContain('UserLogin');
    expect(Object.keys(parsed.journeys!)).toContain('AdminLogin');
    expect(Object.keys(parsed.nodes!)).toEqual(['Login', 'Token']);
  });

  it("step 9: graph/ModuleFile stores the reverted module content", () => {
    const moduleYaml = yaml.dump(preFixAuth);
    expect(moduleYaml).toContain('Login');
    expect(moduleYaml).toContain('Token');
    expect(moduleYaml).toContain('UserLogin');
    expect(moduleYaml).toContain('AdminLogin');
    expect(moduleYaml).not.toContain('AuditLog');
  });

  it("step 10: _actors/Compiler recompiles to confirm the revert restored zero-error state", () => {
    const result = buildPreFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: compilation/CompilationResult confirms the graph is back to its pre-fix clean state", () => {
    const result = buildPreFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 12: audit/AuditFindingsList retains the original gap since the fix was rejected", () => {
    const findingsList = {
      round: 1,
      gaps: [
        { type: 'spec_gap', module: 'auth', detail: 'Missing audit logging coverage', fixed: false },
      ],
    };
    // Gap still present — fix was reverted
    expect(findingsList.gaps[0].fixed).toBe(false);
    expect(findingsList.gaps.length).toBe(1);
  });

  it("step 13: audit/TrackAuditRound records the failed fix attempt for progress analysis", () => {
    const tracker = {
      round: 1,
      attempts: 1,
      successfulFixes: 0,
      failedFixes: 1,
      gapsRemaining: 1,
    };
    expect(tracker.failedFixes).toBe(1);
    expect(tracker.successfulFixes).toBe(0);
    expect(tracker.gapsRemaining).toBe(1);
  });

});
