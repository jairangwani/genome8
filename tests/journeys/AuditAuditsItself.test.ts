// Auto-generated from journey: AuditAuditsItself
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/excerpt.ts

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
    Compiler: { type: 'actor', description: 'validates the graph' },
  },
  journeys: {},
};

// The audit module itself — with an orphan gap in its own nodes
const audit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    CheckCrossModuleCoverage: { type: 'process', description: 'checks cross-module connections' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    OrphanAuditRule: { type: 'rule', description: 'orphan rule within audit itself' },
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
    DeclareComplete: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

const auditYaml = 'nodes:\n  CheckSpecCoverage:\n    type: process\n  CheckActorCoverage:\n    type: process\n  CheckCrossModuleCoverage:\n    type: process\n  DeclareConverged:\n    type: process\n  OrphanAuditRule:\n    type: rule\n    description: orphan rule within audit itself';

const result = compileFromModules(new Map([['_actors', _actors], ['audit', audit]]));

describe("AuditAuditsItself", () => {
  it("step 1: convergence/TargetedAudit dispatches auditors to check all modules including audit.yaml", () => {
    // audit module is included in the compiled index
    expect(result.coverage.modules['audit']).toBeDefined();
    expect(result.index._stats.modules).toBe(2); // _actors + audit
  });

  it("step 2: audit/GenerateAuditPrompt builds the spec coverage prompt targeting audit.yaml's own spec sections 3 and 5", () => {
    expect(result.coverage.modules['audit'].spec_sections).toEqual([3, 5]);
  });

  it("step 3: excerpt/SelectTargetModule selects audit as the target module for excerpt generation", () => {
    expect(result.coverage.modules['audit']).toBeDefined();
    expect(result.coverage.modules['audit'].nodes).toBe(5);
  });

  it("step 4: excerpt/CollectLocalNodes extracts audit.yaml's own nodes for the auditor to review", () => {
    const auditNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'audit');
    expect(auditNodes.length).toBe(5);
    expect(auditNodes.map(([k]) => k)).toContain('audit/CheckSpecCoverage');
    expect(auditNodes.map(([k]) => k)).toContain('audit/OrphanAuditRule');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts audit.yaml's own journeys for the auditor to review", () => {
    const auditJourneys = Object.values(result.index.journeys).filter(j => j.module === 'audit');
    expect(auditJourneys.length).toBe(2);
    expect(auditJourneys.map(j => j.name)).toContain('RunAudit');
    expect(auditJourneys.map(j => j.name)).toContain('DeclareComplete');
  });

  it("step 6: excerpt/AssembleExcerpt assembles the self-referential excerpt showing the audit module to the auditor", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'audit',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: auditYaml,
    });
    expect(excerpt).toContain('Focus: audit');
    expect(excerpt).toContain('CheckSpecCoverage');
    expect(excerpt).toContain('OrphanAuditRule');
    expect(excerpt).toContain('YOUR NODES');
  });

  it("step 7: excerpt/ExcerptOutput provides the audit module's excerpt to the auditor", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'audit',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: auditYaml,
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(50);
  });

  it("step 8: _actors/Auditor checks whether audit.yaml covers the audit concepts described in spec sections 3 and 5", () => {
    const coveredSections = result.coverage.modules['audit'].spec_sections;
    expect(coveredSections).toContain(3);
    expect(coveredSections).toContain(5);
  });

  it("step 9: audit/CheckSpecCoverage compares the spec's audit requirements against audit.yaml's own nodes and journeys", () => {
    // audit has spec sections 3 and 5 — both are covered via the module claim
    const specSections = new Set<number>();
    for (const mod of Object.values(result.coverage.modules)) {
      for (const s of mod.spec_sections) specSections.add(s);
    }
    expect(specSections.has(3)).toBe(true);
    expect(specSections.has(5)).toBe(true);
  });

  it("step 10: audit/SpecCoverageReport records any gaps where audit concepts in the spec are not represented in audit.yaml", () => {
    // OrphanAuditRule is an orphan — a gap within the audit module itself
    expect(result.coverage.orphans).toContain('audit/OrphanAuditRule');
  });

  it("step 11: audit/CollectAuditFindings adds any self-audit gaps to the findings list", () => {
    const selfGaps = result.coverage.orphans.filter(o => o.startsWith('audit/'));
    expect(selfGaps.length).toBeGreaterThanOrEqual(1);
    expect(selfGaps).toContain('audit/OrphanAuditRule');
  });

  it("step 12: audit/AuditFindingsList stores the self-referential gaps alongside gaps from other modules", () => {
    // All orphans in one unified list
    const allOrphans = result.coverage.orphans;
    expect(allOrphans).toContain('audit/OrphanAuditRule');
    // Can contain gaps from other modules too (e.g. actor orphans)
    expect(allOrphans.length).toBeGreaterThanOrEqual(1);
  });

});
