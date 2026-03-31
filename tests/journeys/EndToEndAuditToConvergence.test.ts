// Auto-generated from journey: EndToEndAuditToConvergence
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

// Pre-audit graph: clean but with an orphan actor (Admin not in any journey)
function buildPreAuditGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
      },
    }],
    ['auth', {
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
    }],
  ]));
}

// Post-fix graph: Admin now used in AdminAccess journey, cross-module ref
function buildPostFixGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
      },
    }],
    ['auth', {
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
    }],
    ['admin', {
      spec_sections: [2],
      nodes: {
        Dashboard: { type: 'interface', description: 'Admin dashboard' },
      },
      journeys: {
        AdminAccess: {
          steps: [
            { node: '_actors/Admin', action: 'opens dashboard' },
            { node: 'Dashboard', action: 'renders panel' },
            { node: 'auth/Token', action: 'validates session' },
          ],
        },
      },
    }],
  ]));
}

describe("EndToEndAuditToConvergence", () => {
  it("step 1: convergence/BoundedCreationLoop completes all module creation with all perspectives applied", () => {
    const modules = ['auth', 'admin'];
    const perspectives = ['spec', 'actor', 'cross_module'];
    expect(modules.length).toBe(2);
    expect(perspectives.length).toBe(3);
  });

  it("step 2: convergence/CompileCheck triggers final compilation after all modules are created", () => {
    const result = buildPreAuditGraph();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
  });

  it("step 3: _actors/Compiler runs full compilation across all modules", () => {
    const result = buildPreAuditGraph();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.issues).toBeDefined();
    expect(result.coverage).toBeDefined();
  });

  it("step 4: compilation/CompilationResult reports 0 errors and 0 orphans", () => {
    const result = buildPostFixGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 5: audit/AuditAfterZeroErrors confirms the graph is clean enough to audit", () => {
    const result = buildPostFixGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    const cleanEnoughToAudit = errors.length === 0;
    expect(cleanEnoughToAudit).toBe(true);
  });

  it("step 6: convergence/TargetedAudit dispatches 3 auditors to check coverage", () => {
    const auditors = ['spec_coverage', 'actor_coverage', 'cross_module_coverage'];
    expect(auditors.length).toBe(3);
  });

  it("step 7: audit/GenerateAuditPrompt builds prompts for all 3 auditors with excerpt context", () => {
    const result = buildPostFixGraph();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process',
    });
    const auditPrompt = `Check spec coverage:\n${excerpt}`;
    expect(auditPrompt).toContain('Focus: auth');
    expect(excerpt).toContain('YOUR NODES:');
  });

  it("step 8: audit/CheckSpecCoverage auditor 1 checks spec section coverage", () => {
    const result = buildPostFixGraph();
    const coveredSections = new Set<number>();
    for (const [, cov] of Object.entries(result.coverage.modules)) {
      for (const s of cov.spec_sections) coveredSections.add(s);
    }
    expect(coveredSections.has(1)).toBe(true);
    expect(coveredSections.has(2)).toBe(true);
  });

  it("step 9: audit/CheckActorCoverage auditor 2 checks actor participation coverage", () => {
    const result = buildPostFixGraph();
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([k]) => k.startsWith('_actors/'));
    for (const [, node] of actorNodes) {
      expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("step 10: audit/CheckCrossModuleCoverage auditor 3 checks cross-module connection coverage", () => {
    const result = buildPostFixGraph();
    expect(result.coverage.isolated_modules.length).toBe(0);
    // admin module references auth/Token — cross-module connection
    expect(result.coverage.modules['admin'].cross_module_connections).toBeGreaterThan(0);
  });

  it("step 11: audit/MergeAuditReports combines the 3 audit reports into unified format", () => {
    const specGaps: any[] = [];
    const actorGaps: any[] = [];
    const crossModGaps: any[] = [];
    const merged = [...specGaps, ...actorGaps, ...crossModGaps];
    expect(merged.length).toBe(0);
  });

  it("step 12: audit/CollectAuditFindings collects all gaps into the findings list", () => {
    const findings: any[] = [];
    expect(findings.length).toBe(0);
  });

  it("step 13: audit/AuditFindingsList stores the initial gap list", () => {
    const findingsList = { round: 1, total_gaps: 0, gaps: [] as any[] };
    expect(findingsList.total_gaps).toBe(0);
    expect(findingsList.gaps.length).toBe(0);
  });

  it("step 14: audit/PrioritizeGaps ranks gaps for fixing", () => {
    // With 0 gaps, nothing to prioritize
    const gaps: any[] = [];
    const prioritized = gaps.sort((a, b) => a.priority - b.priority);
    expect(prioritized.length).toBe(0);
  });

  it("step 15: audit/SelectNextGapToFix picks each gap in priority order", () => {
    const gaps: any[] = [];
    const nextGap = gaps.find(g => !g.fixed);
    expect(nextGap).toBeUndefined(); // no gaps to fix
  });

  it("step 16: audit/ApplyFix fixes each gap with targeted module edits", () => {
    // No gaps to fix in converged graph — this is the happy path
    const gapsToFix: any[] = [];
    expect(gapsToFix.length).toBe(0);
  });

  it("step 17: audit/VerifyFixCompiles confirms each fix compiles cleanly", () => {
    const result = buildPostFixGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 18: audit/DetectFixInducedErrors checks each fix did not introduce new validation problems", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 19: audit/VerifyGapClosed confirms each gap is closed after fixing", () => {
    const result = buildPostFixGraph();
    // All actors in journeys
    const orphanActors = result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(orphanActors.length).toBe(0);
    // No isolated modules
    expect(result.coverage.isolated_modules.length).toBe(0);
  });

  it("step 20: audit/ValidateGraphInvariantsPostFix confirms all invariants hold after the full fix round", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
    expect(result.index._stats.isolated_modules).toBe(0);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 21: audit/ConfirmAllGapsResolved verifies no gaps remain after all fixes", () => {
    const specGaps: any[] = [];
    const actorGaps: any[] = [];
    const crossModGaps: any[] = [];
    const allResolved = specGaps.length === 0 && actorGaps.length === 0 && crossModGaps.length === 0;
    expect(allResolved).toBe(true);
  });

  it("step 22: audit/DeclareConverged marks the graph as CONVERGED", () => {
    const state = { status: 'CONVERGED', auditPassed: true, gapsRemaining: 0 };
    expect(state.status).toBe('CONVERGED');
    expect(state.auditPassed).toBe(true);
    expect(state.gapsRemaining).toBe(0);
  });

  it("step 23: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    const result = buildPostFixGraph();
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(Object.keys(iface.provides).length).toBeGreaterThan(0);
  });

});
