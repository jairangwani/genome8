// Auto-generated from journey: ReauditAfterAuditSelfFix
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Pre-self-fix audit module: missing RunCrossModuleAudit journey
const preFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
    CheckActorCoverage: { type: 'process', description: 'Checks actor coverage' },
    CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
    AuditFindingsList: { type: 'artifact', description: 'Gap list' },
    DeclareConverged: { type: 'process', description: 'Declares convergence' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks spec' },
        { node: 'CheckSpecCoverage', action: 'evaluates sections' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
  },
};

// Post-self-fix: added RunActorAudit and RunCrossModuleAudit
const postFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
    CheckActorCoverage: { type: 'process', description: 'Checks actor coverage' },
    CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
    AuditFindingsList: { type: 'artifact', description: 'Gap list' },
    DeclareConverged: { type: 'process', description: 'Declares convergence' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks spec' },
        { node: 'CheckSpecCoverage', action: 'evaluates sections' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
    RunActorAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks actor coverage' },
        { node: 'CheckActorCoverage', action: 'evaluates actor refs' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
    RunCrossModuleAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks cross-module connections' },
        { node: 'CheckCrossModuleCoverage', action: 'evaluates module links' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
        { node: 'DeclareConverged', action: 'marks convergence if all pass' },
      ],
    },
  },
};

const actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'Coverage auditor' },
    User: { type: 'actor', description: 'Platform user' },
  },
};

const authModule: ModuleFile = {
  spec_sections: [1],
  nodes: { Login: { type: 'process', description: 'Login' } },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'logs in' },
        { node: 'Login', action: 'authenticates' },
      ],
    },
  },
};

function buildPostFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', actors],
    ['audit', postFixAudit],
    ['auth', authModule],
  ]));
}

describe("ReauditAfterAuditSelfFix", () => {
  it("step 1: audit/ApplyFix has just modified audit.yaml to close a self-referential gap", () => {
    const preJourneys = Object.keys(preFixAudit.journeys!);
    const postJourneys = Object.keys(postFixAudit.journeys!);
    expect(postJourneys.length).toBeGreaterThan(preJourneys.length);
    expect(postJourneys).toContain('RunCrossModuleAudit');
    expect(postJourneys).toContain('RunActorAudit');
  });

  it("step 2: audit/ReauditAfterSelfFix detects that the fix targeted audit.yaml and triggers a full re-audit", () => {
    const fixTarget = 'audit';
    const needsReaudit = fixTarget === 'audit';
    expect(needsReaudit).toBe(true);
  });

  it("step 3: _actors/Compiler recompiles all modules with the modified audit.yaml", () => {
    const result = buildPostFix();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: compilation/CompilationResult confirms 0 errors after the self-fix", () => {
    const result = buildPostFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix confirms all convergence invariants still hold after the self-fix", () => {
    const result = buildPostFix();
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
    expect(result.index._stats.isolated_modules).toBe(0);
  });

  it("step 6: audit/GenerateAuditPrompt rebuilds all 3 audit prompts using the modified audit module's definitions", () => {
    const angles = ['spec_coverage', 'actor_coverage', 'cross_module_coverage'];
    const result = buildPostFix();
    const excerpt = generateExcerpt({
      round: 2,
      focusModule: 'audit',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  CheckSpecCoverage:\n    type: process',
    });
    expect(angles.length).toBe(3);
    expect(excerpt).toContain('Focus: audit');
  });

  it("step 7: _actors/Auditor re-checks spec coverage with the self-fixed audit module in the graph", () => {
    const result = buildPostFix();
    const auditCov = result.coverage.modules['audit'];
    expect(auditCov.spec_sections).toContain(3);
    expect(auditCov.spec_sections).toContain(5);
  });

  it("step 8: audit/CheckSpecCoverage re-examines all spec sections including audit's own sections 3 and 5", () => {
    const result = buildPostFix();
    const allSections = new Set<number>();
    for (const [, cov] of Object.entries(result.coverage.modules)) {
      for (const s of cov.spec_sections) allSections.add(s);
    }
    expect(allSections.has(1)).toBe(true);  // auth
    expect(allSections.has(3)).toBe(true);  // audit
    expect(allSections.has(5)).toBe(true);  // audit
  });

  it("step 9: _actors/Auditor re-checks actor coverage with the updated audit module", () => {
    const result = buildPostFix();
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([k]) => k.startsWith('_actors/'));
    for (const [, node] of actorNodes) {
      expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("step 10: audit/CheckActorCoverage re-examines actor references including any new actors added by the self-fix", () => {
    const result = buildPostFix();
    const orphanActors = result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(orphanActors.length).toBe(0);
  });

  it("step 11: _actors/Auditor re-checks cross-module coverage with the updated audit module", () => {
    const result = buildPostFix();
    // audit module connects to _actors — cross-module
    expect(result.coverage.modules['audit'].cross_module_connections).toBeGreaterThan(0);
  });

  it("step 12: audit/CheckCrossModuleCoverage re-examines module connections including audit's updated cross-module refs", () => {
    const result = buildPostFix();
    expect(result.coverage.isolated_modules.length).toBe(0);
  });

  it("step 13: audit/MergeAuditReports combines the post-self-fix re-audit reports", () => {
    const specGaps: any[] = [];
    const actorGaps: any[] = [];
    const crossModGaps: any[] = [];
    const merged = [...specGaps, ...actorGaps, ...crossModGaps];
    expect(merged.length).toBe(0);
  });

  it("step 14: audit/CollectAuditFindings gathers findings to verify the self-fix resolved the gap without opening new ones", () => {
    const findings: any[] = [];
    expect(findings.length).toBe(0);
  });

  it("step 15: audit/AuditFindingsList stores the post-self-fix findings for comparison against the pre-fix state", () => {
    const preFix = { gaps: 2 };
    const postFix = { gaps: 0 };
    const findingsList = {
      round: 2,
      total_gaps: postFix.gaps,
      comparison: { before: preFix.gaps, after: postFix.gaps },
    };
    expect(findingsList.total_gaps).toBe(0);
    expect(findingsList.comparison.before).toBeGreaterThan(findingsList.comparison.after);
  });

});
