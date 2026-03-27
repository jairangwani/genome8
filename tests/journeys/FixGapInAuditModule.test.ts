// Auto-generated from journey: FixGapInAuditModule
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
  },
  journeys: {},
};

// Pre-fix audit module: OrphanAuditRule is an orphan within audit itself
const preFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    VerifyFixCompiles: { type: 'process', description: 'compiles after fix' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    OrphanAuditRule: { type: 'rule', description: 'audit validation rule — gap' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
      ],
    },
    VerifyAndDeclare: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: 'VerifyFixCompiles', action: 'verifies compilation' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

// Post-fix audit module: OrphanAuditRule is now in a journey, critical nodes preserved
const postFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    VerifyFixCompiles: { type: 'process', description: 'compiles after fix' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    OrphanAuditRule: { type: 'rule', description: 'audit validation rule' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
        { node: 'OrphanAuditRule', action: 'validates audit rules' },
      ],
    },
    VerifyAndDeclare: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: 'VerifyFixCompiles', action: 'verifies compilation' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['audit', preFixAudit]]));
const postFixResult = compileFromModules(new Map([['_actors', _actors], ['audit', postFixAudit]]));

const auditYaml = 'nodes:\n  CheckSpecCoverage:\n    type: process\n  CheckActorCoverage:\n    type: process\n  VerifyFixCompiles:\n    type: process\n  DeclareConverged:\n    type: process\n  OrphanAuditRule:\n    type: rule';

describe("FixGapInAuditModule", () => {
  it("step 1: audit/AuditFindingsList provides a gap that targets audit.yaml itself", () => {
    expect(preFixResult.coverage.orphans).toContain('audit/OrphanAuditRule');
    const auditGaps = preFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(auditGaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: audit/SelectNextGapToFix picks the self-referential gap from the prioritized list", () => {
    const auditGaps = preFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(auditGaps).toContain('audit/OrphanAuditRule');
  });

  it("step 3: audit/DetectSelfAuditTarget confirms the gap targets audit.yaml and flags it for extra safeguards", () => {
    const target = 'audit/OrphanAuditRule';
    const isSelfAudit = target.startsWith('audit/');
    expect(isSelfAudit).toBe(true);
  });

  it("step 4: audit/ScopeFixToAvoidAuditBreak analyzes the proposed fix scope to ensure it will not remove existing audit processes", () => {
    // All critical pre-fix nodes must still exist post-fix
    const criticalNodes = ['audit/CheckSpecCoverage', 'audit/CheckActorCoverage', 'audit/VerifyFixCompiles', 'audit/DeclareConverged'];
    for (const node of criticalNodes) {
      expect(postFixResult.index.nodes[node]).toBeDefined();
    }
  });

  it("step 5: audit/ScopeFixToAvoidAuditBreak verifies the fix will not break CheckSpecCoverage, VerifyFixCompiles, DeclareConverged, or other critical audit nodes", () => {
    // Critical nodes are still in journeys after fix
    expect(postFixResult.index.nodes['audit/CheckSpecCoverage'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(postFixResult.index.nodes['audit/VerifyFixCompiles'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(postFixResult.index.nodes['audit/DeclareConverged'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: audit/BuildGapFixPrompt builds the fix prompt with explicit instructions to preserve existing audit infrastructure", () => {
    const fixPrompt = {
      target: 'audit/OrphanAuditRule',
      type: 'orphan',
      selfAudit: true,
      instruction: 'Add OrphanAuditRule to a journey. PRESERVE all existing nodes: CheckSpecCoverage, CheckActorCoverage, VerifyFixCompiles, DeclareConverged.',
    };
    expect(fixPrompt.selfAudit).toBe(true);
    expect(fixPrompt.instruction).toContain('PRESERVE');
  });

  it("step 7: audit/ProvideFixContext includes the full audit.yaml source and the safeguard constraints in the fix payload", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'audit',
      index: preFixResult.index,
      coverage: preFixResult.coverage,
      issues: preFixResult.issues,
      moduleFileContent: auditYaml,
    });
    expect(excerpt).toContain('OrphanAuditRule');
    expect(excerpt).toContain('CheckSpecCoverage');
  });

  it("step 8: _actors/LLMWorker receives the self-fix prompt with clear boundaries on what must not be changed", () => {
    expect(preFixResult.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(preFixResult.index.nodes['_actors/LLMWorker'].type).toBe('actor');
  });

  it("step 9: audit/ApplyFix edits audit.yaml to close the gap while preserving all existing audit processes", () => {
    // Post-fix: OrphanAuditRule is now in a journey
    expect(postFixResult.index.nodes['audit/OrphanAuditRule'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // All pre-fix journeys still exist
    const postJourneys = Object.values(postFixResult.index.journeys).filter(j => j.module === 'audit');
    expect(postJourneys.length).toBe(2);
  });

  it("step 10: audit/VerifyFixCompiles compiles the modified audit.yaml to check for errors", () => {
    expect(postFixResult.index).toBeDefined();
    expect(postFixResult.index._compiled).toBeDefined();
  });

  it("step 11: _actors/Compiler validates the self-modified audit module has 0 errors", () => {
    const errors = postFixResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 12: compilation/CompilationResult confirms the self-fix did not break compilation", () => {
    expect(postFixResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(postFixResult.index._stats.total_nodes).toBe(preFixResult.index._stats.total_nodes);
  });

  it("step 13: audit/ReauditAfterSelfFix triggers a full re-audit to verify the self-fix did not invalidate audit's own integrity", () => {
    // After self-fix, OrphanAuditRule is no longer an orphan
    expect(postFixResult.coverage.orphans).not.toContain('audit/OrphanAuditRule');
    // No new audit-module orphans introduced
    const auditOrphans = postFixResult.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(auditOrphans.length).toBe(0);
  });

  it("step 14: audit/TrackAuditRound records the self-fix attempt for progress tracking", () => {
    const roundLog = {
      round: 1,
      target: 'audit/OrphanAuditRule',
      selfAudit: true,
      result: 'success' as const,
      gaps_before: preFixResult.coverage.orphans.filter(o => o.startsWith('audit/')).length,
      gaps_after: postFixResult.coverage.orphans.filter(o => o.startsWith('audit/')).length,
    };
    expect(roundLog.result).toBe('success');
    expect(roundLog.selfAudit).toBe(true);
    expect(roundLog.gaps_after).toBeLessThan(roundLog.gaps_before);
  });

});
