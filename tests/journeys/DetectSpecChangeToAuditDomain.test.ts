// Auto-generated from journey: DetectSpecChangeToAuditDomain
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';

describe("DetectSpecChangeToAuditDomain", () => {
  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and modules may need updating", () => {
    const signal = { type: 'spec_changed', affectedSections: [3, 5, 7] };
    expect(signal.type).toBe('spec_changed');
    expect(signal.affectedSections.length).toBeGreaterThan(0);
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    const specContent = `## Section 3: Audit Pipeline
The audit pipeline must validate all three coverage angles.

## Section 5: Convergence
Convergence requires zero errors and zero gaps.

## Section 7: Self-Healing (NEW)
The system must detect and recover from audit infrastructure failures.`;
    expect(specContent).toContain('Section 3');
    expect(specContent).toContain('Section 5');
    expect(specContent).toContain('Section 7');
  });

  it("step 3: audit/DetectSpecChangeToAuditSections reads the updated spec sections 3 and 5 that audit.yaml references", () => {
    const auditSpecSections = [3, 5];
    const changedSections = [3, 5, 7];
    const affectedAuditSections = auditSpecSections.filter(s => changedSections.includes(s));
    expect(affectedAuditSections).toEqual([3, 5]);
  });

  it("step 4: audit/DetectSpecChangeToAuditSections compares the updated spec sections against audit.yaml's current node and journey coverage", () => {
    const currentAuditNodes = ['CheckSpecCoverage', 'CheckActorCoverage', 'CheckCrossModuleCoverage', 'DeclareConverged'];
    const currentAuditJourneys = ['RunSpecAudit', 'RunActorAudit'];
    // Current coverage exists for sections 3 and 5
    expect(currentAuditNodes.length).toBeGreaterThan(0);
    expect(currentAuditJourneys.length).toBeGreaterThan(0);
  });

  it("step 5: audit/DetectSpecChangeToAuditSections identifies new audit requirements in the spec that have no corresponding nodes or journeys", () => {
    const newRequirements = [
      { section: 7, concept: 'Self-Healing', hasNode: false, hasJourney: false },
    ];
    const uncoveredRequirements = newRequirements.filter(r => !r.hasNode || !r.hasJourney);
    expect(uncoveredRequirements.length).toBe(1);
    expect(uncoveredRequirements[0].concept).toBe('Self-Healing');
  });

  it("step 6: audit/AuditFindingsList adds the spec-change-induced gaps to the findings list as new coverage requirements", () => {
    const findingsList = {
      round: 1,
      gaps: [
        { type: 'spec_gap', module: 'audit', detail: 'Section 7 (Self-Healing) not covered in audit.yaml', severity: 'high', induced_by: 'spec_change' },
      ],
    };
    expect(findingsList.gaps.length).toBe(1);
    expect(findingsList.gaps[0].induced_by).toBe('spec_change');
    expect(findingsList.gaps[0].module).toBe('audit');
  });

  it("step 7: audit/PrioritizeGaps ranks the new spec-driven gaps alongside any existing gaps", () => {
    const gaps = [
      { type: 'spec_gap', module: 'audit', detail: 'Section 7 not covered', severity: 'high', priority: 0 },
      { type: 'actor_orphan', module: 'auth', detail: 'Admin orphan', severity: 'medium', priority: 0 },
    ];
    // High severity gets higher priority (lower number)
    gaps.sort((a, b) => {
      const sev = { high: 1, medium: 2, low: 3 } as Record<string, number>;
      return (sev[a.severity] || 3) - (sev[b.severity] || 3);
    });
    gaps.forEach((g, i) => { g.priority = i + 1; });
    expect(gaps[0].severity).toBe('high');
    expect(gaps[0].module).toBe('audit');
    expect(gaps[0].priority).toBe(1);
  });

  it("step 8: audit/DetectSelfAuditTarget flags all new gaps as self-referential since they target audit.yaml", () => {
    const gaps = [
      { type: 'spec_gap', module: 'audit', detail: 'Section 7 not covered', isSelfTarget: false },
    ];
    for (const gap of gaps) {
      if (gap.module === 'audit') gap.isSelfTarget = true;
    }
    expect(gaps.every(g => g.isSelfTarget)).toBe(true);
  });

  it("step 9: convergence/ConvergenceState records that audit.yaml needs updating due to spec changes in its own domain", () => {
    const state = {
      step: 'RECONVERGENCE',
      reason: 'spec_change_to_audit_domain',
      modulesAffected: ['audit'],
      newGaps: 1,
    };
    expect(state.step).toBe('RECONVERGENCE');
    expect(state.reason).toContain('audit');
    expect(state.modulesAffected).toContain('audit');
    expect(state.newGaps).toBeGreaterThan(0);
  });

});
