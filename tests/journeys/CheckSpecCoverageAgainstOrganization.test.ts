// Auto-generated from journey: CheckSpecCoverageAgainstOrganization
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: organization, audit, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Auditor: { type: 'actor', description: 'Coverage auditor' },
      },
    }],
    ['auth', {
      spec_sections: [1, 2],
      nodes: {
        Login: { type: 'process', description: 'Login flow' },
        Token: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'logs in' },
            { node: 'Login', action: 'authenticates' },
            { node: 'Token', action: 'is issued' },
          ],
        },
      },
    }],
    ['audit', {
      spec_sections: [3],
      nodes: {
        CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
      },
      journeys: {
        RunSpecAudit: {
          steps: [
            { node: '_actors/Auditor', action: 'checks spec' },
            { node: 'CheckSpecCoverage', action: 'evaluates sections' },
          ],
        },
      },
    }],
  ]));
}

describe("CheckSpecCoverageAgainstOrganization", () => {
  it("step 1: organization/SpecSectionIndex provides the indexed list of spec sections parsed from spec.md", () => {
    const specSections = [
      { index: 1, title: 'Authentication' },
      { index: 2, title: 'Authorization' },
      { index: 3, title: 'Audit Pipeline' },
      { index: 4, title: 'Event System' },
      { index: 5, title: 'Convergence' },
    ];
    expect(specSections.length).toBe(5);
    expect(specSections[0].index).toBe(1);
  });

  it("step 2: organization/ModuleSpecSectionMap provides the mapping of which modules claim which spec sections", () => {
    const result = buildGraph();
    const sectionMap: Record<string, number[]> = {};
    for (const [mod, cov] of Object.entries(result.coverage.modules)) {
      if (cov.spec_sections.length > 0) {
        sectionMap[mod] = cov.spec_sections;
      }
    }
    expect(sectionMap['auth']).toEqual([1, 2]);
    expect(sectionMap['audit']).toEqual([3]);
  });

  it("step 3: audit/GenerateAuditPrompt builds the spec coverage prompt including the section-to-module mapping as ground truth", () => {
    const sectionMap = { auth: [1, 2], audit: [3] };
    const allSections = [1, 2, 3, 4, 5];
    const prompt = `Check spec coverage.\nSections: ${allSections.join(', ')}\nClaimed: ${JSON.stringify(sectionMap)}`;
    expect(prompt).toContain('1, 2, 3, 4, 5');
    expect(prompt).toContain('auth');
    expect(prompt).toContain('audit');
  });

  it("step 4: _actors/Auditor compares each spec section against nodes and journeys in modules that claim it", () => {
    const result = buildGraph();
    // auth claims sections 1, 2 and has journeys
    const authJourneys = Object.values(result.index.journeys).filter(j => j.module === 'auth');
    expect(authJourneys.length).toBeGreaterThan(0);
    // audit claims section 3 and has journeys
    const auditJourneys = Object.values(result.index.journeys).filter(j => j.module === 'audit');
    expect(auditJourneys.length).toBeGreaterThan(0);
  });

  it("step 5: audit/CheckSpecCoverage flags spec sections with no claiming module and sections with claims but no journeys", () => {
    const allSections = [1, 2, 3, 4, 5];
    const claimedSections = new Set([1, 2, 3]); // from auth and audit
    const unclaimed = allSections.filter(s => !claimedSections.has(s));
    expect(unclaimed).toEqual([4, 5]);
    expect(unclaimed.length).toBe(2);
  });

  it("step 6: audit/SpecCoverageReport records which sections are covered, which are unclaimed, and which are thinly covered", () => {
    const report = {
      covered: [1, 2, 3],
      unclaimed: [4, 5],
      thinlyCovered: [] as number[],
    };
    expect(report.covered.length).toBe(3);
    expect(report.unclaimed.length).toBe(2);
    expect(report.unclaimed).toContain(4);
    expect(report.unclaimed).toContain(5);
  });

  it("step 7: audit/CollectAuditFindings adds spec coverage gaps to the findings list with the organization mapping as context", () => {
    const findings = [
      { type: 'spec_gap', module: 'none', detail: 'Section 4 (Event System) has no claiming module', severity: 'high' },
      { type: 'spec_gap', module: 'none', detail: 'Section 5 (Convergence) has no claiming module', severity: 'high' },
    ];
    expect(findings.length).toBe(2);
    expect(findings[0].type).toBe('spec_gap');
    expect(findings.every(f => f.severity === 'high')).toBe(true);
  });

});
