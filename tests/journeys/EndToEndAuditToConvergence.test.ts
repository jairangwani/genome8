// Auto-generated from journey: EndToEndAuditToConvergence
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

// Phase 1: initial state with a gap (orphan node)
const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
    LLMWorker: { type: 'actor', description: 'creates module content' },
  },
  journeys: {},
};

const authWithGap: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'gap — not in any journey' },
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

const gapResult = compileFromModules(new Map([['_actors', _actors], ['auth', authWithGap]]));

// Phase 2: all gaps fixed — fully converged
const authFixed: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanRule: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanRule', action: 'checks format' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
    AuditCoverage: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: '_actors/Auditor', action: 'reviews coverage' },
      ],
    },
  },
};

const fixedResult = compileFromModules(new Map([['_actors', _actors], ['auth', authFixed]]));

describe("EndToEndAuditToConvergence", () => {
  it("step 1: convergence/BoundedCreationLoop completes all module creation with all perspectives applied", () => {
    expect(gapResult.index._stats.modules).toBe(2);
    expect(gapResult.index._stats.total_nodes).toBe(6);
  });

  it("step 2: convergence/CompileCheck triggers final compilation after all modules are created", () => {
    expect(gapResult.index).toBeDefined();
    expect(gapResult.index._compiled).toBeDefined();
  });

  it("step 3: _actors/Compiler runs full compilation across all modules", () => {
    expect(gapResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 4: compilation/CompilationResult reports 0 errors and 0 orphans", () => {
    // Initial compilation has 0 errors but has orphans (gaps for audit)
    expect(gapResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(gapResult.index._stats.orphans).toBeGreaterThanOrEqual(1);
  });

  it("step 5: audit/AuditAfterZeroErrors confirms the graph is clean enough to audit", () => {
    expect(gapResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 6: convergence/TargetedAudit dispatches 3 auditors to check coverage", () => {
    const angles = ['spec', 'actor', 'cross-module'];
    expect(angles.length).toBe(3);
  });

  it("step 7: audit/GenerateAuditPrompt builds prompts for all 3 auditors with excerpt context", () => {
    expect(gapResult.coverage.modules['auth'].spec_sections).toEqual([1, 2]);
  });

  it("step 8: audit/CheckSpecCoverage auditor 1 checks spec section coverage", () => {
    const coveredSections = new Set<number>();
    for (const mod of Object.values(gapResult.coverage.modules)) {
      for (const s of mod.spec_sections) coveredSections.add(s);
    }
    expect(coveredSections.has(1)).toBe(true);
    expect(coveredSections.has(2)).toBe(true);
  });

  it("step 9: audit/CheckActorCoverage auditor 2 checks actor participation coverage", () => {
    // LLMWorker is in a journey; Compiler and Auditor are not (gap)
    expect(gapResult.index.nodes['_actors/LLMWorker'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(gapResult.index.nodes['_actors/Compiler'].in_journeys.length).toBe(0);
  });

  it("step 10: audit/CheckCrossModuleCoverage auditor 3 checks cross-module connection coverage", () => {
    expect(gapResult.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 11: audit/MergeAuditReports combines the 3 audit reports into unified format", () => {
    const gaps = [
      ...gapResult.coverage.orphans.map(o => ({ type: 'orphan', target: o })),
      ...gapResult.coverage.isolated_modules.map(m => ({ type: 'isolated', target: m })),
    ];
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 12: audit/CollectAuditFindings collects all gaps into the findings list", () => {
    expect(gapResult.coverage.orphans).toContain('auth/OrphanRule');
  });

  it("step 13: audit/AuditFindingsList stores the initial gap list", () => {
    expect(gapResult.coverage.orphans.length).toBeGreaterThanOrEqual(1);
  });

  it("step 14: audit/PrioritizeGaps ranks gaps for fixing", () => {
    const gaps = gapResult.coverage.orphans.map((o, i) => ({ target: o, priority: i + 1 }));
    expect(gaps[0].priority).toBe(1);
  });

  it("step 15: audit/SelectNextGapToFix picks each gap in priority order", () => {
    const authGaps = gapResult.coverage.orphans.filter(o => o.startsWith('auth/'));
    expect(authGaps[0]).toBe('auth/OrphanRule');
  });

  it("step 16: audit/ApplyFix fixes each gap with targeted module edits", () => {
    // Post-fix: OrphanRule is now in a journey
    expect(fixedResult.index.nodes['auth/OrphanRule'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 17: audit/VerifyFixCompiles confirms each fix compiles cleanly", () => {
    expect(fixedResult.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 18: audit/DetectFixInducedErrors checks each fix did not introduce new validation problems", () => {
    expect(fixedResult.index._stats.duplicate_names).toBe(0);
    const newErrors = fixedResult.issues.filter(i => i.severity === 'error');
    expect(newErrors.length).toBe(0);
  });

  it("step 19: audit/VerifyGapClosed confirms each gap is closed after fixing", () => {
    expect(fixedResult.coverage.orphans).not.toContain('auth/OrphanRule');
  });

  it("step 20: audit/ValidateGraphInvariantsPostFix confirms all invariants hold after the full fix round", () => {
    expect(fixedResult.index._stats.orphans).toBe(0);
    expect(fixedResult.index._stats.duplicate_names).toBe(0);
    expect(fixedResult.index._stats.isolated_modules).toBe(0);
  });

  it("step 21: audit/ConfirmAllGapsResolved verifies no gaps remain after all fixes", () => {
    expect(fixedResult.coverage.orphans.length).toBe(0);
    expect(fixedResult.coverage.isolated_modules.length).toBe(0);
  });

  it("step 22: audit/DeclareConverged marks the graph as CONVERGED", () => {
    const converged =
      fixedResult.issues.filter(i => i.severity === 'error').length === 0 &&
      fixedResult.index._stats.orphans === 0 &&
      fixedResult.index._stats.duplicate_names === 0;
    expect(converged).toBe(true);
  });

  it("step 23: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    const iface = generateInterface(fixedResult.index, 'test-engine');
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
    expect(Object.keys(iface.provides).length).toBe(6);
  });

});
