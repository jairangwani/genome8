// Auto-generated from journey: HandleFixInducedGaps
// Module: audit
// Modules touched: audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file to close the identified coverage gap' },
      VerifyGapClosed: { type: 'process', description: 're-runs the specific auditor that found the gap to confirm the fix actually closed it' },
      DetectFixInducedGaps: { type: 'process', description: 'compares pre-fix and post-fix audit findings to detect new coverage gaps opened by a fix' },
      CheckSpecCoverage: { type: 'process', description: 'auditor 1 compares spec sections against the graph' },
      CheckActorCoverage: { type: 'process', description: 'auditor 2 checks that every actor participates in at least one journey' },
      CheckCrossModuleCoverage: { type: 'process', description: 'auditor 3 verifies every module has at least one cross-module connection' },
      CheckGoalCoverage: { type: 'process', description: 'auditor 4 checks goal rule node coverage' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
      PrioritizeGaps: { type: 'process', description: 'ranks the collected gaps by severity' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed' },
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
          { node: 'DetectFixInducedGaps', action: 'compares pre-fix and post-fix findings to identify any newly opened gaps' },
          { node: 'CollectAuditFindings', action: 'adds the newly opened gaps to the existing findings list' },
          { node: 'AuditFindingsList', action: 'stores the updated list with the new fix-induced gaps appended' },
          { node: 'PrioritizeGaps', action: 're-ranks the updated gap list including the new entries' },
          { node: 'TrackAuditRound', action: 'records that the fix closed one gap but opened others for progress tracking' },
        ],
      },
    },
  });

  return modules;
}

describe("HandleFixInducedGaps", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFixInducedGaps'];

  it("step 1: audit/ApplyFix has edited a module to close a specific coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('HandleFixInducedGaps'))).toBe(true);
  });

  it("step 2: audit/VerifyGapClosed confirms the targeted gap is now closed", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyGapClosed", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 3: audit/DetectFixInducedGaps re-runs all 4 coverage checks against the post-fix graph", () => {
    const node = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → audit/DetectFixInducedGaps", () => {
    const src = result.index.nodes['audit/VerifyGapClosed'];
    expect(src.followed_by).toContain('audit/DetectFixInducedGaps');
  });

  it("step 4: audit/CheckSpecCoverage checks whether the fix changed spec coverage in other modules", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedGaps');
  });

  it("connection: audit/DetectFixInducedGaps → audit/CheckSpecCoverage", () => {
    const src = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(src.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 5: audit/CheckActorCoverage checks whether the fix created new orphan actors", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/CheckActorCoverage", () => {
    const src = result.index.nodes['audit/CheckSpecCoverage'];
    expect(src.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 6: audit/CheckCrossModuleCoverage checks whether the fix disrupted cross-module connections", () => {
    const node = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/CheckCrossModuleCoverage", () => {
    const src = result.index.nodes['audit/CheckActorCoverage'];
    expect(src.followed_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("step 7: audit/CheckGoalCoverage checks whether the fix affected goal coverage in other modules", () => {
    const node = result.index.nodes['audit/CheckGoalCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckCrossModuleCoverage');
  });

  it("connection: audit/CheckCrossModuleCoverage → audit/CheckGoalCoverage", () => {
    const src = result.index.nodes['audit/CheckCrossModuleCoverage'];
    expect(src.followed_by).toContain('audit/CheckGoalCoverage');
  });

  it("step 8: audit/DetectFixInducedGaps compares pre-fix and post-fix findings to identify any newly opened gaps", () => {
    const node = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(node.preceded_by).toContain('audit/CheckGoalCoverage');
  });

  it("connection: audit/CheckGoalCoverage → audit/DetectFixInducedGaps", () => {
    const src = result.index.nodes['audit/CheckGoalCoverage'];
    expect(src.followed_by).toContain('audit/DetectFixInducedGaps');
  });

  it("step 9: audit/CollectAuditFindings adds the newly opened gaps to the existing findings list", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedGaps');
  });

  it("connection: audit/DetectFixInducedGaps → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 10: audit/AuditFindingsList stores the updated list with the new fix-induced gaps appended", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/CollectAuditFindings'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 11: audit/PrioritizeGaps re-ranks the updated gap list including the new entries", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 12: audit/TrackAuditRound records that the fix closed one gap but opened others for progress tracking", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/PrioritizeGaps'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey has 12 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(12);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
