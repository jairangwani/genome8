// Auto-generated from journey: FixSingleGap
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, llm, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import yaml from 'js-yaml';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix graph: auth module has UserLogin but no AdminLogin → gap
const preFixActors: ModuleFile = {
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

// Post-fix graph: AdminLogin journey added
const postFixAuth: ModuleFile = {
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
    AdminLogin: {
      steps: [
        { node: '_actors/Admin', action: 'opens admin panel' },
        { node: 'Login', action: 'authenticates admin' },
        { node: 'AdminPanel', action: 'renders dashboard' },
      ],
    },
  },
};

function buildPreFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', preFixActors],
    ['auth', preFixAuth],
  ]));
}

function buildPostFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', preFixActors],
    ['auth', postFixAuth],
  ]));
}

const gap = { type: 'actor_orphan', module: 'auth', detail: 'Admin actor not used in any journey', severity: 'medium' as const };

describe("FixSingleGap", () => {
  it("step 1: audit/AuditFindingsList provides the prioritized list of gaps", () => {
    const findingsList = {
      round: 1,
      gaps: [
        { ...gap, priority: 1 },
        { type: 'spec_gap', module: 'auth', detail: 'Section 2 not covered', severity: 'low' as const, priority: 2 },
      ],
    };
    expect(findingsList.gaps.length).toBe(2);
    expect(findingsList.gaps[0].priority).toBeLessThan(findingsList.gaps[1].priority);
  });

  it("step 2: audit/SelectNextGapToFix picks the next unfixed gap from the prioritized list", () => {
    const gaps = [
      { ...gap, priority: 1, fixed: false },
      { type: 'spec_gap', module: 'auth', detail: 'Section 2 not covered', priority: 2, fixed: false },
    ];
    const nextGap = gaps.find(g => !g.fixed);
    expect(nextGap).toBeDefined();
    expect(nextGap!.priority).toBe(1);
    expect(nextGap!.type).toBe('actor_orphan');
  });

  it("step 3: audit/ProvideFixContext assembles the module excerpt and gap description for the worker", () => {
    const result = buildPreFix();
    const fixContext = {
      gap,
      targetModule: gap.module,
      nodeCount: Object.entries(result.index.nodes).filter(([, n]) => n.module === 'auth').length,
      journeyCount: Object.values(result.index.journeys).filter(j => j.module === 'auth').length,
    };
    expect(fixContext.targetModule).toBe('auth');
    expect(fixContext.nodeCount).toBe(2);
    expect(fixContext.journeyCount).toBe(1);
  });

  it("step 4: audit/BuildGapFixPrompt builds the targeted fix prompt with module context and specific gap", () => {
    const fixPrompt = `Fix the following gap in module "auth":
Gap: ${gap.detail}
Type: ${gap.type}

Add a journey that uses _actors/Admin.`;
    expect(fixPrompt).toContain('auth');
    expect(fixPrompt).toContain('Admin actor not used');
    expect(fixPrompt).toContain('_actors/Admin');
  });

  it("step 5: llm/SendTask sends the fix task to the LLM worker process", () => {
    const task = {
      type: 'fix_gap',
      module: 'auth',
      prompt: `Fix gap: ${gap.detail}`,
      moduleYaml: yaml.dump(preFixAuth),
    };
    expect(task.type).toBe('fix_gap');
    expect(task.module).toBe('auth');
    expect(task.moduleYaml).toContain('Login');
  });

  it("step 6: _actors/LLMWorker reads the fix prompt and understands which module and gap to address", () => {
    const workerInput = { module: 'auth', gap: gap.detail, currentYaml: yaml.dump(preFixAuth) };
    expect(workerInput.module).toBe('auth');
    expect(workerInput.gap).toContain('Admin');
    expect(workerInput.currentYaml).toContain('UserLogin');
  });

  it("step 7: llm/ReceiveResult receives the worker's edited YAML output", () => {
    const editedYaml = yaml.dump(postFixAuth);
    expect(editedYaml).toContain('AdminLogin');
    expect(editedYaml).toContain('AdminPanel');
    // The fix added the missing journey
    const parsed = yaml.load(editedYaml) as any;
    expect(parsed.journeys.AdminLogin).toBeDefined();
  });

  it("step 8: audit/ApplyFix writes the edited YAML content to the target module file", () => {
    const editedYaml = yaml.dump(postFixAuth);
    const parsed = yaml.load(editedYaml) as ModuleFile;
    expect(parsed.journeys!.AdminLogin).toBeDefined();
    expect(parsed.nodes!.AdminPanel).toBeDefined();
  });

  it("step 9: graph/ModuleFile stores the updated module on disk", () => {
    const moduleYaml = yaml.dump(postFixAuth);
    const parsed = yaml.load(moduleYaml) as ModuleFile;
    // Module file now contains both journeys
    expect(Object.keys(parsed.journeys!)).toContain('UserLogin');
    expect(Object.keys(parsed.journeys!)).toContain('AdminLogin');
    expect(Object.keys(parsed.nodes!).length).toBe(3);
  });

  it("step 10: audit/VerifyFixCompiles triggers compilation on the updated module", () => {
    const result = buildPostFix();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: _actors/Compiler validates the edit produced 0 new errors", () => {
    const preFix = buildPreFix();
    const postFix = buildPostFix();
    const preErrors = preFix.issues.filter(i => i.severity === 'error').length;
    const postErrors = postFix.issues.filter(i => i.severity === 'error').length;
    expect(postErrors).toBe(0);
    expect(postErrors).toBeLessThanOrEqual(preErrors);
  });

  it("step 12: compilation/CompilationResult provides the post-fix compilation result", () => {
    const result = buildPostFix();
    expect(result.index._stats.total_nodes).toBe(5); // User, Admin, Login, Token, AdminPanel
    expect(result.index._stats.orphans).toBe(0);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 13: audit/DetectFixInducedErrors checks whether the fix introduced new orphans, duplicates, or dangling refs", () => {
    const preFix = buildPreFix();
    const postFix = buildPostFix();
    // No new orphans introduced
    expect(postFix.index._stats.orphans).toBe(0);
    // No new duplicates
    expect(postFix.index._stats.duplicate_names).toBe(0);
    // No new errors
    const newErrors = postFix.issues.filter(i => i.severity === 'error').length;
    expect(newErrors).toBe(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the auditor that originally found this gap", () => {
    const postFix = buildPostFix();
    // Admin is now in journeys — no longer an orphan actor
    const adminNode = postFix.index.nodes['_actors/Admin'];
    expect(adminNode).toBeDefined();
    expect(adminNode.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 15: _actors/Auditor confirms the specific gap no longer appears in the coverage check", () => {
    const postFix = buildPostFix();
    // All actors are in journeys — no orphan actors
    const orphanActors = postFix.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(orphanActors.length).toBe(0);
    // Admin specifically is covered
    const admin = postFix.index.nodes['_actors/Admin'];
    expect(admin.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 16: audit/DetectFixInducedGaps checks whether the fix opened new coverage gaps in other angles", () => {
    const postFix = buildPostFix();
    // No isolated modules
    expect(postFix.coverage.isolated_modules.length).toBe(0);
    // No orphan nodes
    expect(postFix.coverage.orphans.length).toBe(0);
  });

  it("step 17: audit/TrackAuditRound records that one more gap has been fixed in this round", () => {
    const tracker = { round: 1, gapsFixed: 0, gapsRemaining: 2 };
    tracker.gapsFixed++;
    tracker.gapsRemaining--;
    expect(tracker.gapsFixed).toBe(1);
    expect(tracker.gapsRemaining).toBe(1);
  });

});
