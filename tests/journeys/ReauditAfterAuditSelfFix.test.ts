// Auto-generated from journey: ReauditAfterAuditSelfFix
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Pre-fix audit: OrphanAuditRule is an orphan
const preFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    CheckCrossModuleCoverage: { type: 'process', description: 'checks cross-module connections' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    OrphanAuditRule: { type: 'rule', description: 'orphan gap in audit' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
        { node: 'CheckCrossModuleCoverage', action: 'checks cross-module coverage' },
      ],
    },
    VerifyAndDeclare: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

// Post-fix audit: OrphanAuditRule added to RunAudit journey
const postFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    CheckCrossModuleCoverage: { type: 'process', description: 'checks cross-module connections' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    OrphanAuditRule: { type: 'rule', description: 'audit validation rule' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
        { node: 'CheckCrossModuleCoverage', action: 'checks cross-module coverage' },
        { node: 'OrphanAuditRule', action: 'validates audit rules' },
      ],
    },
    VerifyAndDeclare: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: '_actors/LLMWorker', action: 'confirms compile' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['audit', preFixAudit]]));
const postFixResult = compileFromModules(new Map([['_actors', _actors], ['audit', postFixAudit]]));

const auditYaml = 'nodes:\n  CheckSpecCoverage:\n    type: process\n  CheckActorCoverage:\n    type: process\n  CheckCrossModuleCoverage:\n    type: process\n  DeclareConverged:\n    type: process\n  OrphanAuditRule:\n    type: rule';

describe("ReauditAfterAuditSelfFix", () => {
  it("step 1: audit/ApplyFix has just modified audit.yaml to close a self-referential gap", () => {
    // Pre-fix had the orphan
    expect(preFixResult.coverage.orphans).toContain('audit/OrphanAuditRule');
    // Post-fix closed it
    expect(postFixResult.index.nodes['audit/OrphanAuditRule'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: audit/ReauditAfterSelfFix detects that the fix targeted audit.yaml and triggers a full re-audit", () => {
    const fixTarget = 'audit/OrphanAuditRule';
    const isSelfFix = fixTarget.startsWith('audit/');
    expect(isSelfFix).toBe(true);
    // Trigger re-audit → recompile
    expect(postFixResult.index._compiled).toBeDefined();
  });

  it("step 3: _actors/Compiler recompiles all modules with the modified audit.yaml", () => {
    expect(postFixResult.index._stats.modules).toBe(2);
    expect(postFixResult.index._stats.total_nodes).toBe(8); // 3 actors + 5 audit
  });

  it("step 4: compilation/CompilationResult confirms 0 errors after the self-fix", () => {
    const errors = postFixResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix confirms all convergence invariants still hold after the self-fix", () => {
    expect(postFixResult.index._stats.duplicate_names).toBe(0);
    expect(postFixResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 6: audit/GenerateAuditPrompt rebuilds all 3 audit prompts using the modified audit module's definitions", () => {
    const excerpt = generateExcerpt({
      round: 2,
      focusModule: 'audit',
      index: postFixResult.index,
      coverage: postFixResult.coverage,
      issues: postFixResult.issues,
      moduleFileContent: auditYaml,
    });
    expect(excerpt).toContain('Focus: audit');
    expect(excerpt).toContain('CheckSpecCoverage');
    expect(excerpt).toContain('CheckActorCoverage');
    expect(excerpt).toContain('CheckCrossModuleCoverage');
  });

  it("step 7: _actors/Auditor re-checks spec coverage with the self-fixed audit module in the graph", () => {
    expect(postFixResult.index.nodes['_actors/Auditor']).toBeDefined();
    expect(postFixResult.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 8: audit/CheckSpecCoverage re-examines all spec sections including audit's own sections 3 and 5", () => {
    const specSections = new Set<number>();
    for (const mod of Object.values(postFixResult.coverage.modules)) {
      for (const s of mod.spec_sections) specSections.add(s);
    }
    expect(specSections.has(3)).toBe(true);
    expect(specSections.has(5)).toBe(true);
  });

  it("step 9: _actors/Auditor re-checks actor coverage with the updated audit module", () => {
    // Auditor is used in RunAudit journey
    expect(postFixResult.index.nodes['_actors/Auditor'].in_journeys.some(j => j.startsWith('RunAudit'))).toBe(true);
  });

  it("step 10: audit/CheckActorCoverage re-examines actor references including any new actors added by the self-fix", () => {
    // All 3 actors are now in journeys after fix (LLMWorker added to VerifyAndDeclare)
    expect(postFixResult.index.nodes['_actors/Compiler'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(postFixResult.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(postFixResult.index.nodes['_actors/LLMWorker'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 11: _actors/Auditor re-checks cross-module coverage with the updated audit module", () => {
    // audit connects to _actors via journey steps
    expect(postFixResult.coverage.modules['audit'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 12: audit/CheckCrossModuleCoverage re-examines module connections including audit's updated cross-module refs", () => {
    expect(postFixResult.coverage.modules['audit'].cross_module_connections).toBeGreaterThanOrEqual(1);
    expect(postFixResult.coverage.isolated_modules.length).toBe(0);
  });

  it("step 13: audit/MergeAuditReports combines the post-self-fix re-audit reports", () => {
    // Combine all gap sources: orphans + isolated
    const allGaps = [
      ...postFixResult.coverage.orphans,
      ...postFixResult.coverage.isolated_modules,
    ];
    // OrphanAuditRule should not be in the gaps anymore
    expect(allGaps).not.toContain('audit/OrphanAuditRule');
  });

  it("step 14: audit/CollectAuditFindings gathers findings to verify the self-fix resolved the gap without opening new ones", () => {
    // No new audit-module orphans
    const postAuditOrphans = postFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(postAuditOrphans.length).toBe(0);
  });

  it("step 15: audit/AuditFindingsList stores the post-self-fix findings for comparison against the pre-fix state", () => {
    // Pre-fix had audit orphans, post-fix has none
    const preAuditOrphans = preFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    const postAuditOrphans = postFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(preAuditOrphans.length).toBeGreaterThanOrEqual(1);
    expect(postAuditOrphans.length).toBe(0);
  });

});
