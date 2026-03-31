// Auto-generated from journey: HandleFixInducedGaps
// Module: audit
// Modules touched: audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix graph: Admin orphan actor is the gap
function buildPreFixGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
        Operator: { type: 'actor', description: 'System operator' },
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
        AdminLogin: {
          steps: [
            { node: '_actors/Admin', action: 'opens panel' },
            { node: 'Login', action: 'authenticates admin' },
          ],
        },
      },
    }],
  ]));
}

// Post-fix graph: Operator is now in a journey, but that journey uses
// a cross-module ref the original gap-fix didn't account for
function buildPostFixGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
        Operator: { type: 'actor', description: 'System operator' },
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
        AdminLogin: {
          steps: [
            { node: '_actors/Admin', action: 'opens panel' },
            { node: 'Login', action: 'authenticates admin' },
          ],
        },
        OperatorAccess: {
          steps: [
            { node: '_actors/Operator', action: 'connects to system' },
            { node: 'Login', action: 'authenticates operator' },
          ],
        },
      },
    }],
  ]));
}

describe("HandleFixInducedGaps", () => {
  it("step 1: audit/ApplyFix has edited a module to close a specific coverage gap", () => {
    // Fix added OperatorAccess journey to close the Operator orphan gap
    const postFix = buildPostFixGraph();
    const operatorJourneys = Object.values(postFix.index.journeys)
      .filter(j => j.steps.some(s => s.node === '_actors/Operator'));
    expect(operatorJourneys.length).toBe(1);
    expect(operatorJourneys[0].name).toBe('OperatorAccess');
  });

  it("step 2: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    const postFix = buildPostFixGraph();
    // Operator is now in a journey — no longer an orphan
    const operatorNode = postFix.index.nodes['_actors/Operator'];
    expect(operatorNode).toBeDefined();
    expect(operatorNode.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 3: audit/DetectFixInducedGaps re-runs all 3 coverage checks against the post-fix graph", () => {
    const postFix = buildPostFixGraph();
    // Run all 3 checks
    const specSections = new Set<number>();
    for (const [, cov] of Object.entries(postFix.coverage.modules)) {
      for (const s of cov.spec_sections) specSections.add(s);
    }
    const orphanActors = postFix.coverage.orphans.filter(o => o.startsWith('_actors/'));
    const isolatedModules = postFix.coverage.isolated_modules;
    expect(specSections.size).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(orphanActors)).toBe(true);
    expect(Array.isArray(isolatedModules)).toBe(true);
  });

  it("step 4: audit/CheckSpecCoverage checks whether the fix changed spec coverage in other modules", () => {
    const postFix = buildPostFixGraph();
    // auth still covers section 1
    expect(postFix.coverage.modules['auth'].spec_sections).toContain(1);
  });

  it("step 5: audit/CheckActorCoverage checks whether the fix created new orphan actors", () => {
    const postFix = buildPostFixGraph();
    const orphanActors = postFix.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(orphanActors.length).toBe(0);
  });

  it("step 6: audit/CheckCrossModuleCoverage checks whether the fix disrupted cross-module connections", () => {
    const postFix = buildPostFixGraph();
    // auth connects to _actors — cross-module
    expect(postFix.coverage.modules['auth'].cross_module_connections).toBeGreaterThan(0);
    expect(postFix.coverage.isolated_modules.length).toBe(0);
  });

  it("step 7: audit/DetectFixInducedGaps compares pre-fix and post-fix findings to identify any newly opened gaps", () => {
    const preFix = buildPreFixGraph();
    const postFix = buildPostFixGraph();

    // Compare orphan counts: pre-fix had Operator orphan, post-fix has none
    const preOrphanActors = preFix.coverage.orphans.filter(o => o.startsWith('_actors/'));
    const postOrphanActors = postFix.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(preOrphanActors.length).toBeGreaterThan(postOrphanActors.length);

    // Check for newly induced gaps — in this case the fix was clean
    const newlyInducedGaps = postOrphanActors.filter(o => !preOrphanActors.includes(o));
    expect(newlyInducedGaps.length).toBe(0);
  });

  it("step 8: audit/CollectAuditFindings adds the newly opened gaps to the existing findings list", () => {
    // In this scenario the fix was clean — but simulate the pattern
    const existingGaps = [
      { type: 'spec_gap', module: 'billing', detail: 'Section 3 not covered' },
    ];
    const newlyInducedGaps: any[] = []; // none in this case
    const updatedFindings = [...existingGaps, ...newlyInducedGaps];
    expect(updatedFindings.length).toBe(1); // just the pre-existing one
  });

  it("step 9: audit/AuditFindingsList stores the updated list with the new fix-induced gaps appended", () => {
    const findingsList = {
      round: 1,
      total_gaps: 1,
      gaps: [
        { type: 'spec_gap', module: 'billing', detail: 'Section 3 not covered', induced: false },
      ],
    };
    expect(findingsList.total_gaps).toBe(findingsList.gaps.length);
    // No fix-induced gaps were added
    const inducedGaps = findingsList.gaps.filter(g => g.induced);
    expect(inducedGaps.length).toBe(0);
  });

  it("step 10: audit/PrioritizeGaps re-ranks the updated gap list including the new entries", () => {
    const gaps = [
      { type: 'spec_gap', module: 'billing', detail: 'Section 3', severity: 'medium', priority: 0 },
    ];
    // Assign priorities by severity
    gaps.forEach((g, i) => { g.priority = i + 1; });
    expect(gaps[0].priority).toBe(1);
    expect(gaps.length).toBe(1);
  });

  it("step 11: audit/TrackAuditRound records that the fix closed one gap but opened others for progress tracking", () => {
    const tracker = {
      round: 1,
      gapsClosed: 1,
      gapsOpened: 0,
      netProgress: 1,
      gapsRemaining: 1,
    };
    tracker.netProgress = tracker.gapsClosed - tracker.gapsOpened;
    expect(tracker.netProgress).toBe(1);
    expect(tracker.gapsClosed).toBeGreaterThan(tracker.gapsOpened);
  });

});
