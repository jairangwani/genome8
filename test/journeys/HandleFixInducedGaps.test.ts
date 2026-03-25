// Auto-generated from journey: HandleFixInducedGaps
// Module: audit
// Modules touched: audit

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['HandleFixInducedGaps'];
const steps = journey.steps;

describe("HandleFixInducedGaps", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(11);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit'])
    );
  });

  it("step 1: audit/ApplyFix has edited a module to close a specific coverage gap", () => {
    // Node: audit/ApplyFix (process)
    // Action: has edited a module to close a specific coverage gap
    const step = steps[0];
    expect(step.node).toBe('audit/ApplyFix');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('module YAML');
    expect(node.module).toBe('audit');
    // Followed by VerifyGapClosed in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
  });

  it("step 2: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    // Node: audit/VerifyGapClosed (process)
    // Action: confirms the targeted gap is now closed
    const step = steps[1];
    expect(step.node).toBe('audit/VerifyGapClosed');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('re-runs');
    expect(node.module).toBe('audit');
    // Preceded by ApplyFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    // Followed by DetectFixInducedGaps in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
  });

  it("step 3: audit/DetectFixInducedGaps re-runs all 3 coverage checks against the post-fix graph", () => {
    // Node: audit/DetectFixInducedGaps (process) — first occurrence
    // Action: re-runs all 3 coverage checks against the post-fix graph
    const step = steps[2];
    expect(step.node).toBe('audit/DetectFixInducedGaps');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix and post-fix audit findings');
    expect(node.module).toBe('audit');
    // Preceded by VerifyGapClosed in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    // Followed by CheckSpecCoverage in this journey (step 3→4)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
  });

  it("step 4: audit/CheckSpecCoverage checks whether the fix changed spec coverage in other modules", () => {
    // Node: audit/CheckSpecCoverage (process)
    // Action: checks whether the fix changed spec coverage in other modules
    const step = steps[3];
    expect(step.node).toBe('audit/CheckSpecCoverage');
    expect(step.step_number).toBe(4);

    const node = index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec sections');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
    // Followed by CheckActorCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckActorCoverage'])
    );
  });

  it("step 5: audit/CheckActorCoverage checks whether the fix created new orphan actors", () => {
    // Node: audit/CheckActorCoverage (process)
    // Action: checks whether the fix created new orphan actors
    const step = steps[4];
    expect(step.node).toBe('audit/CheckActorCoverage');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('actor');
    expect(node.module).toBe('audit');
    // Preceded by CheckSpecCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckSpecCoverage'])
    );
    // Followed by CheckCrossModuleCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CheckCrossModuleCoverage'])
    );
  });

  it("step 6: audit/CheckCrossModuleCoverage checks whether the fix disrupted cross-module connections", () => {
    // Node: audit/CheckCrossModuleCoverage (process)
    // Action: checks whether the fix disrupted cross-module connections
    const step = steps[5];
    expect(step.node).toBe('audit/CheckCrossModuleCoverage');
    expect(step.step_number).toBe(6);

    const node = index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('cross-module');
    expect(node.module).toBe('audit');
    // Preceded by CheckActorCoverage in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckActorCoverage'])
    );
    // Followed by DetectFixInducedGaps in this journey (step 6→7)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
  });

  it("step 7: audit/DetectFixInducedGaps compares pre-fix and post-fix findings to identify any newly opened gaps", () => {
    // Node: audit/DetectFixInducedGaps (process) — second occurrence
    // Action: compares pre-fix and post-fix findings to identify any newly opened gaps
    const step = steps[6];
    expect(step.node).toBe('audit/DetectFixInducedGaps');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/DetectFixInducedGaps'];
    expect(node.type).toBe('process');
    expect(node.module).toBe('audit');
    // Preceded by CheckCrossModuleCoverage in this journey (step 6→7)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CheckCrossModuleCoverage'])
    );
    // Followed by CollectAuditFindings in this journey (step 7→8)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
  });

  it("step 8: audit/CollectAuditFindings adds the newly opened gaps to the existing findings list", () => {
    // Node: audit/CollectAuditFindings (process)
    // Action: adds the newly opened gaps to the existing findings list
    const step = steps[7];
    expect(step.node).toBe('audit/CollectAuditFindings');
    expect(step.step_number).toBe(8);

    const node = index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
    // Followed by AuditFindingsList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
  });

  it("step 9: audit/AuditFindingsList stores the updated list with the new fix-induced gaps appended", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: stores the updated list with the new fix-induced gaps appended
    const step = steps[8];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(9);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by CollectAuditFindings in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/CollectAuditFindings'])
    );
    // Followed by PrioritizeGaps in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
  });

  it("step 10: audit/PrioritizeGaps re-ranks the updated gap list including the new entries", () => {
    // Node: audit/PrioritizeGaps (process)
    // Action: re-ranks the updated gap list including the new entries
    const step = steps[9];
    expect(step.node).toBe('audit/PrioritizeGaps');
    expect(step.step_number).toBe(10);

    const node = index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('severity');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by TrackAuditRound in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
  });

  it("step 11: audit/TrackAuditRound records that the fix closed one gap but opened others for progress tracking", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: records that the fix closed one gap but opened others for progress tracking
    const step = steps[10];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(11);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by PrioritizeGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/PrioritizeGaps'])
    );
  });

  it("journey forms the full fix-induced gap handling sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/ApplyFix',
      'audit/VerifyGapClosed',
      'audit/DetectFixInducedGaps',
      'audit/CheckSpecCoverage',
      'audit/CheckActorCoverage',
      'audit/CheckCrossModuleCoverage',
      'audit/DetectFixInducedGaps',
      'audit/CollectAuditFindings',
      'audit/AuditFindingsList',
      'audit/PrioritizeGaps',
      'audit/TrackAuditRound',
    ]);
  });

  it("DetectFixInducedGaps appears twice — first to dispatch checks, then to compare results", () => {
    const detectSteps = steps.filter(s => s.node === 'audit/DetectFixInducedGaps');
    expect(detectSteps).toHaveLength(2);
    expect(detectSteps[0].step_number).toBe(3);
    expect(detectSteps[1].step_number).toBe(7);
  });

  it("three coverage checks run sequentially between the two DetectFixInducedGaps occurrences", () => {
    const checkSteps = steps.slice(3, 6).map(s => s.node);
    expect(checkSteps).toEqual([
      'audit/CheckSpecCoverage',
      'audit/CheckActorCoverage',
      'audit/CheckCrossModuleCoverage',
    ]);
  });

  it("no actor nodes in this journey — it is a system-driven process", () => {
    expect(journey.actor).toBeNull();
  });

  it("entirely within the audit module — modules_touched has only audit", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
