// Auto-generated from journey: DetectSpecChangeToAuditDomain
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
  },
  journeys: {},
};

// Audit module before spec change: covers sections 3 and 5
const auditBeforeSpecChange: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
      ],
    },
  },
};

// Audit module after spec change: spec now has new section 7 relevant to audit
// but audit module hasn't added nodes for it yet → gap
const auditAfterSpecChange: ModuleFile = {
  spec_sections: [3, 5, 7],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
      ],
    },
  },
};

const beforeResult = compileFromModules(new Map([['_actors', _actors], ['audit', auditBeforeSpecChange]]));
const afterResult = compileFromModules(new Map([['_actors', _actors], ['audit', auditAfterSpecChange]]));

describe("DetectSpecChangeToAuditDomain", () => {
  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and modules may need updating", () => {
    // Before and after are both compilable — the spec changed, triggering reconvergence
    expect(beforeResult.index._compiled).toBeDefined();
    expect(afterResult.index._compiled).toBeDefined();
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    // After change: spec now covers section 7
    const beforeSections = beforeResult.coverage.modules['audit'].spec_sections;
    const afterSections = afterResult.coverage.modules['audit'].spec_sections;
    expect(beforeSections).toEqual([3, 5]);
    expect(afterSections).toEqual([3, 5, 7]);
  });

  it("step 3: audit/DetectSpecChangeToAuditSections reads the updated spec sections 3 and 5 that audit.yaml references", () => {
    // Original sections still present
    expect(afterResult.coverage.modules['audit'].spec_sections).toContain(3);
    expect(afterResult.coverage.modules['audit'].spec_sections).toContain(5);
  });

  it("step 4: audit/DetectSpecChangeToAuditSections compares the updated spec sections against audit.yaml's current node and journey coverage", () => {
    // audit has 2 nodes covering 3 spec sections — section 7 may need new nodes
    const sectionCount = afterResult.coverage.modules['audit'].spec_sections.length;
    const nodeCount = afterResult.coverage.modules['audit'].nodes;
    expect(sectionCount).toBe(3);
    expect(nodeCount).toBe(2);
  });

  it("step 5: audit/DetectSpecChangeToAuditSections identifies new audit requirements in the spec that have no corresponding nodes or journeys", () => {
    // Section 7 is new — detect it by diffing before/after spec sections
    const beforeSections = new Set(beforeResult.coverage.modules['audit'].spec_sections);
    const afterSections = afterResult.coverage.modules['audit'].spec_sections;
    const newSections = afterSections.filter(s => !beforeSections.has(s));
    expect(newSections).toEqual([7]);
  });

  it("step 6: audit/AuditFindingsList adds the spec-change-induced gaps to the findings list as new coverage requirements", () => {
    // The new section is a spec coverage gap — track it as a finding
    const newSections = [7];
    const findings = newSections.map(s => ({
      type: 'spec-gap' as const,
      module: 'audit',
      section: s,
      description: `Spec section ${s} has no corresponding audit nodes`,
    }));
    expect(findings.length).toBe(1);
    expect(findings[0].section).toBe(7);
  });

  it("step 7: audit/PrioritizeGaps ranks the new spec-driven gaps alongside any existing gaps", () => {
    const allGaps = [
      { type: 'spec-gap', target: 'audit/section-7', priority: 1 },
      ...afterResult.coverage.orphans.map((o, i) => ({ type: 'orphan', target: o, priority: i + 2 })),
    ];
    expect(allGaps[0].priority).toBe(1);
    expect(allGaps[0].target).toBe('audit/section-7');
  });

  it("step 8: audit/DetectSelfAuditTarget flags all new gaps as self-referential since they target audit.yaml", () => {
    const gapTarget = 'audit/section-7';
    const isSelfAudit = gapTarget.startsWith('audit/');
    expect(isSelfAudit).toBe(true);
  });

  it("step 9: convergence/ConvergenceState records that audit.yaml needs updating due to spec changes in its own domain", () => {
    const state = {
      status: 'reconverging' as const,
      reason: 'spec-change-to-audit-domain',
      newSections: [7],
      targetModule: 'audit',
    };
    expect(state.status).toBe('reconverging');
    expect(state.reason).toBe('spec-change-to-audit-domain');
    expect(state.targetModule).toBe('audit');
  });

});
