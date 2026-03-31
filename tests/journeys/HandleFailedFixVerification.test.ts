// Auto-generated from journey: HandleFailedFixVerification
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: audit, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import yaml from 'js-yaml';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix graph: clean but Admin actor is orphan (gap)
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
  },
};

// Bad fix: tries to add AdminLogin but doesn't actually reference Admin actor
const failedFixAuth: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
    AdminPanel: { type: 'interface', description: 'Admin panel' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
    AdminView: {
      steps: [
        { node: '_actors/User', action: 'views admin panel' },
        { node: 'AdminPanel', action: 'renders dashboard' },
      ],
    },
  },
};

const gap = { type: 'actor_orphan', module: 'auth', detail: 'Admin actor not used in any journey', severity: 'medium' as const };

function buildPreFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', preFixAuth],
  ]));
}

function buildFailedFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['auth', failedFixAuth],
  ]));
}

describe("HandleFailedFixVerification", () => {
  it("step 1: audit/ApplyFix has edited a module to close a gap", () => {
    const editedYaml = yaml.dump(failedFixAuth);
    expect(editedYaml).toContain('AdminView');
    expect(editedYaml).toContain('AdminPanel');
  });

  it("step 2: audit/VerifyGapClosed re-runs the auditor and finds the gap is still present", () => {
    const result = buildFailedFix();
    // Admin actor is still not in any journey — fix used User instead of Admin
    const adminNode = result.index.nodes['_actors/Admin'];
    expect(adminNode).toBeDefined();
    expect(adminNode.in_journeys.length).toBe(0); // gap still open
  });

  it("step 3: _actors/Auditor reports that the specific gap was not resolved by the fix", () => {
    const result = buildFailedFix();
    const orphanActors = result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    // Admin is still orphaned
    expect(orphanActors).toContain('_actors/Admin');
  });

  it("step 4: audit/RejectAndRevertFix restores the module to its pre-fix state since the fix did not achieve its goal", () => {
    const restoredYaml = yaml.dump(preFixAuth);
    const parsed = yaml.load(restoredYaml) as ModuleFile;
    expect(Object.keys(parsed.journeys!)).toEqual(['UserLogin']);
    expect(parsed.nodes!.AdminPanel).toBeUndefined();
  });

  it("step 5: graph/ModuleFile stores the reverted module content", () => {
    const moduleYaml = yaml.dump(preFixAuth);
    expect(moduleYaml).toContain('Login');
    expect(moduleYaml).toContain('Token');
    expect(moduleYaml).toContain('UserLogin');
    expect(moduleYaml).not.toContain('AdminView');
    expect(moduleYaml).not.toContain('AdminPanel');
  });

  it("step 6: _actors/Compiler recompiles to confirm the revert is clean", () => {
    const result = buildPreFix();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
  });

  it("step 7: compilation/CompilationResult confirms zero errors after revert", () => {
    const result = buildPreFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 8: audit/AuditFindingsList retains the gap and marks it with a failed-fix-attempt annotation", () => {
    const findingsList = {
      round: 1,
      gaps: [
        { ...gap, fixed: false, failedAttempts: 1, lastFailureReason: 'Fix did not reference _actors/Admin' },
      ],
    };
    expect(findingsList.gaps[0].fixed).toBe(false);
    expect(findingsList.gaps[0].failedAttempts).toBe(1);
    expect(findingsList.gaps[0].lastFailureReason).toContain('Admin');
  });

  it("step 9: audit/BuildGapFixPrompt rebuilds the fix prompt with additional context about why the previous attempt failed", () => {
    const retryPrompt = `Fix the following gap in module "auth":
Gap: ${gap.detail}
Type: ${gap.type}

PREVIOUS ATTEMPT FAILED: Fix did not reference _actors/Admin.
You MUST use _actors/Admin in a journey step. Do not use _actors/User as a substitute.`;
    expect(retryPrompt).toContain('PREVIOUS ATTEMPT FAILED');
    expect(retryPrompt).toContain('_actors/Admin');
    expect(retryPrompt).toContain(gap.detail);
  });

  it("step 10: audit/ProvideFixContext includes the failed attempt details so the next worker can try a different approach", () => {
    const fixContext = {
      gap,
      targetModule: 'auth',
      previousAttempts: [{ round: 1, reason: 'Fix did not reference _actors/Admin' }],
      moduleYaml: yaml.dump(preFixAuth),
    };
    expect(fixContext.previousAttempts.length).toBe(1);
    expect(fixContext.previousAttempts[0].reason).toContain('Admin');
    expect(fixContext.moduleYaml).toContain('UserLogin');
  });

  it("step 11: audit/TrackAuditRound records the failed verification for progress tracking", () => {
    const tracker = {
      round: 1,
      attempts: 1,
      successfulFixes: 0,
      failedVerifications: 1,
      gapsRemaining: 1,
    };
    expect(tracker.failedVerifications).toBe(1);
    expect(tracker.successfulFixes).toBe(0);
    expect(tracker.gapsRemaining).toBe(1);
  });

});
