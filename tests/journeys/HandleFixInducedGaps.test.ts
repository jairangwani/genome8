import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildHandleFixInducedGapsModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'Has edited a module to close a specific coverage gap' },
      VerifyGapClosed: { type: 'process', description: 'Confirms the targeted gap is now closed' },
      DetectFixInducedGaps: { type: 'process', description: 'Re-runs all 4 coverage checks against the post-fix graph' },
      CheckSpecCoverage: { type: 'process', description: 'Checks whether the fix changed spec coverage in other modules' },
      CheckActorCoverage: { type: 'process', description: 'Checks whether the fix created new orphan actors' },
      CheckCrossModuleCoverage: { type: 'process', description: 'Checks whether the fix disrupted cross-module connections' },
      CheckGoalCoverage: { type: 'process', description: 'Checks whether the fix affected goal coverage in other modules' },
      CollectAuditFindings: { type: 'process', description: 'Adds the newly opened gaps to the existing findings list' },
      AuditFindingsList: { type: 'artifact', description: 'Stores the updated list with the new fix-induced gaps appended' },
      PrioritizeGaps: { type: 'process', description: 'Re-ranks the updated gap list including the new entries' },
      TrackAuditRound: { type: 'artifact', description: 'Records that the fix closed one gap but opened others' },
    },
    journeys: {
      HandleFixInducedGaps: {
        steps: [
          { node: 'ApplyFix', action: 'has edited a module to close a specific coverage gap' },
          { node: 'VerifyGapClosed', action: 'confirms the targeted gap is now closed' },
          { node: 'DetectFixInducedGaps', action: 're-runs all 4 coverage checks against the post-fix graph' },
          { node: 'CheckSpecCoverage', action: 'checks whether the fix changed spec coverage in other modules' },
          { node: 'CheckActorCoverage', action: 'checks whether the fix created new orphan actors' },
          { node: 'CheckCrossModuleCoverage', action: 'checks whether the fix disrupted cross-module connections' },
          { node: 'CheckGoalCoverage', action: 'checks whether the fix affected goal coverage in other modules' },
          { node: 'DetectFixInducedGaps', action: 'compares pre-fix and post-fix findings to identify newly opened gaps' },
          { node: 'CollectAuditFindings', action: 'adds the newly opened gaps to the existing findings list' },
          { node: 'AuditFindingsList', action: 'stores the updated list with the new fix-induced gaps appended' },
          { node: 'PrioritizeGaps', action: 're-ranks the updated gap list including the new entries' },
          { node: 'TrackAuditRound', action: 'records that the fix closed one gap but opened others' },
        ],
      },
    },
  });

  return modules;
}

describe("HandleFixInducedGaps", () => {
  const modules = buildHandleFixInducedGapsModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFixInducedGaps'];

  it("step 1: audit/ApplyFix has edited a module to close a specific coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix -> audit/VerifyGapClosed", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 3: audit/DetectFixInducedGaps re-runs all 4 coverage checks against the post-fix graph", () => {
    const node = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed -> audit/DetectFixInducedGaps", () => {
    const from = result.index.nodes['audit/VerifyGapClosed'];
    expect(from.followed_by).toContain('audit/DetectFixInducedGaps');
  });

  it("step 4: audit/CheckSpecCoverage checks whether the fix changed spec coverage in other modules", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedGaps');
  });

  it("connection: audit/DetectFixInducedGaps -> audit/CheckSpecCoverage", () => {
    const from = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(from.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 5: audit/CheckActorCoverage checks whether the fix created new orphan actors", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage -> audit/CheckActorCoverage", () => {
    const from = result.index.nodes['audit/CheckSpecCoverage'];
    expect(from.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 6: audit/CheckCrossModuleCoverage checks whether the fix disrupted cross-module connections", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage -> audit/CheckCrossModuleCoverage", () => {
    const from = result.index.nodes['audit/CheckActorCoverage'];
    expect(from.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 7: audit/CheckGoalCoverage checks whether the fix affected goal coverage in other modules", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage -> audit/CheckGoalCoverage", () => {
    const from = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(from.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 8: audit/DetectFixInducedGaps compares pre-fix and post-fix findings (revisited)", () => {
    const node = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage -> audit/DetectFixInducedGaps", () => {
    const from = result.index.nodes['audit/CheckGoalCoverage'];
    expect(from.followed_by).toContain('audit/DetectFixInducedGaps');
  });

  it("step 9: audit/CollectAuditFindings adds the newly opened gaps to the existing findings list", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedGaps');
  });

  it("connection: audit/DetectFixInducedGaps -> audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 10: audit/AuditFindingsList stores the updated list with the new fix-induced gaps appended", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings -> audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/CollectAuditFindings'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 11: audit/PrioritizeGaps re-ranks the updated gap list including the new entries", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList -> audit/PrioritizeGaps", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 12: audit/TrackAuditRound records that the fix closed one gap but opened others", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps -> audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/PrioritizeGaps'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey covers full pipeline (12 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(12);
    expect(journey.steps[0].node).toBe('audit/ApplyFix');
    expect(journey.steps[11].node).toBe('audit/TrackAuditRound');
  });

  it("journey has no actor (no actor nodes in steps)", () => {
    expect(journey.actor).toBeNull();
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
