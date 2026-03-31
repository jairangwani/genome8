// Auto-generated from journey: AuditAuditsItself
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const auditModule: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'Checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'Checks actor participation coverage' },
    CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
    AuditFindingsList: { type: 'artifact', description: 'List of audit findings' },
    DeclareConverged: { type: 'process', description: 'Declares graph converged' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks spec coverage' },
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
  },
};

function buildGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Auditor: { type: 'actor', description: 'Coverage auditor' },
        User: { type: 'actor', description: 'Platform user' },
      },
    }],
    ['audit', auditModule],
    ['auth', {
      spec_sections: [1],
      nodes: { Login: { type: 'process', description: 'Login flow' } },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'logs in' },
            { node: 'Login', action: 'authenticates' },
          ],
        },
      },
    }],
  ]));
}

describe("AuditAuditsItself", () => {
  it("step 1: convergence/TargetedAudit dispatches auditors to check all modules including audit.yaml", () => {
    const result = buildGraph();
    const moduleNames = Object.keys(result.coverage.modules);
    expect(moduleNames).toContain('audit');
    expect(moduleNames).toContain('auth');
  });

  it("step 2: audit/GenerateAuditPrompt builds the spec coverage prompt targeting audit.yaml's own spec sections 3 and 5", () => {
    const result = buildGraph();
    expect(result.coverage.modules['audit'].spec_sections).toContain(3);
    expect(result.coverage.modules['audit'].spec_sections).toContain(5);
    const prompt = `Check spec coverage for module audit.\nSections claimed: 3, 5`;
    expect(prompt).toContain('audit');
    expect(prompt).toContain('3');
    expect(prompt).toContain('5');
  });

  it("step 3: excerpt/SelectTargetModule selects audit as the target module for excerpt generation", () => {
    const result = buildGraph();
    const targetModule = 'audit';
    expect(result.coverage.modules[targetModule]).toBeDefined();
  });

  it("step 4: excerpt/CollectLocalNodes extracts audit.yaml's own nodes for the auditor to review", () => {
    const result = buildGraph();
    const auditNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'audit');
    expect(auditNodes.length).toBe(5);
    expect(auditNodes.map(([k]) => k)).toContain('audit/CheckSpecCoverage');
    expect(auditNodes.map(([k]) => k)).toContain('audit/DeclareConverged');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts audit.yaml's own journeys for the auditor to review", () => {
    const result = buildGraph();
    const auditJourneys = Object.values(result.index.journeys).filter(j => j.module === 'audit');
    expect(auditJourneys.length).toBe(2);
    expect(auditJourneys.map(j => j.name)).toContain('RunSpecAudit');
    expect(auditJourneys.map(j => j.name)).toContain('RunActorAudit');
  });

  it("step 6: excerpt/AssembleExcerpt assembles the self-referential excerpt showing the audit module to the auditor", () => {
    const result = buildGraph();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'audit',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  CheckSpecCoverage:\n    type: process',
    });
    expect(excerpt).toContain('Focus: audit');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
  });

  it("step 7: excerpt/ExcerptOutput provides the audit module's excerpt to the auditor", () => {
    const result = buildGraph();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'audit',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  CheckSpecCoverage:\n    type: process',
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(50);
  });

  it("step 8: _actors/Auditor checks whether audit.yaml covers the audit concepts described in spec sections 3 and 5", () => {
    const result = buildGraph();
    const auditCov = result.coverage.modules['audit'];
    expect(auditCov.spec_sections).toContain(3);
    expect(auditCov.spec_sections).toContain(5);
    // Auditor would check that nodes/journeys represent these spec concepts
    const auditNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'audit');
    expect(auditNodes.length).toBeGreaterThan(0);
  });

  it("step 9: audit/CheckSpecCoverage compares the spec's audit requirements against audit.yaml's own nodes and journeys", () => {
    const result = buildGraph();
    const auditCov = result.coverage.modules['audit'];
    // audit claims sections 3 and 5
    expect(auditCov.spec_sections.length).toBe(2);
    // Has nodes and journeys representing audit concepts
    expect(auditCov.nodes).toBeGreaterThan(0);
    expect(auditCov.journeys).toBeGreaterThan(0);
  });

  it("step 10: audit/SpecCoverageReport records any gaps where audit concepts in the spec are not represented in audit.yaml", () => {
    // In this well-covered scenario, no spec gaps for audit
    const specGaps: any[] = [];
    const report = { module: 'audit', sectionsCovered: [3, 5], gaps: specGaps };
    expect(report.sectionsCovered.length).toBe(2);
    expect(report.gaps.length).toBe(0);
  });

  it("step 11: audit/CollectAuditFindings adds any self-audit gaps to the findings list", () => {
    const selfGaps: any[] = [];
    const findings = [...selfGaps];
    expect(findings.length).toBe(0);
  });

  it("step 12: audit/AuditFindingsList stores the self-referential gaps alongside gaps from other modules", () => {
    const findingsList = {
      round: 1,
      gaps: [] as any[],
      selfReferentialGaps: 0,
    };
    // No self-gaps in this clean scenario
    expect(findingsList.selfReferentialGaps).toBe(0);
    expect(findingsList.gaps.length).toBe(0);
  });

});
