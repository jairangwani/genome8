// Auto-generated from journey: FixAuditGaps
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildFixAuditGapsModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'Receives the fix payload with the exact module and gap to address' },
      Compiler: { type: 'actor', description: 'Validates the edited module has 0 errors' },
      Auditor: { type: 'actor', description: 'Confirms the specific gap is now closed' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'Provides the list of coverage gaps to fix' },
      PrioritizeGaps: { type: 'process', description: 'Ranks gaps by severity to fix the most critical first' },
      TargetedFixesOnly: { type: 'rule', description: 'Enforces that fixes are targeted edits, not full re-creation' },
      SelectNextGapToFix: { type: 'process', description: 'Picks the highest-priority unfixed gap from the list' },
      DetectSelfAuditTarget: { type: 'process', description: 'Checks whether the selected gap targets audit.yaml itself' },
      BuildGapFixPrompt: { type: 'process', description: 'Builds a specific fix prompt for the selected gap' },
      ProvideFixContext: { type: 'process', description: 'Assembles the target module excerpt and gap details into a fix payload' },
      ApplyFix: { type: 'process', description: 'Edits the target module YAML to close the coverage gap' },
      VerifyFixCompiles: { type: 'process', description: 'Runs compile.ts on the edited module' },
      DetectFixInducedErrors: { type: 'process', description: 'Compares pre-fix and post-fix compilation to check for new orphans or duplicates' },
      VerifyGapClosed: { type: 'process', description: 'Re-runs the specific auditor on the fixed area' },
      TrackAuditRound: { type: 'artifact', description: 'Increments the cumulative gaps-fixed counter' },
    },
    journeys: {
      FixAuditGaps: {
        steps: [
          { node: 'AuditFindingsList', action: 'provides the list of coverage gaps to fix' },
          { node: 'PrioritizeGaps', action: 'ranks gaps by severity to fix the most critical first' },
          { node: 'TargetedFixesOnly', action: 'enforces that fixes are targeted edits, not full re-creation' },
          { node: 'SelectNextGapToFix', action: 'picks the highest-priority unfixed gap from the list' },
          { node: 'DetectSelfAuditTarget', action: 'checks whether the selected gap targets audit.yaml itself' },
          { node: 'BuildGapFixPrompt', action: 'builds a specific fix prompt for the selected gap' },
          { node: 'ProvideFixContext', action: 'assembles the target module excerpt and gap details into a fix payload' },
          { node: '_actors/LLMWorker', action: 'receives the fix payload with the exact module and gap to address' },
          { node: 'ApplyFix', action: 'edits the target module YAML to close the coverage gap' },
          { node: 'VerifyFixCompiles', action: 'runs compile.ts on the edited module' },
          { node: '_actors/Compiler', action: 'validates the edited module has 0 errors' },
          { node: 'compilation/CompilationResult', action: 'confirms the fix did not break compilation' },
          { node: 'DetectFixInducedErrors', action: 'compares pre-fix and post-fix compilation to check for new orphans or duplicates' },
          { node: 'VerifyGapClosed', action: 're-runs the specific auditor on the fixed area' },
          { node: '_actors/Auditor', action: 'confirms the specific gap is now closed' },
          { node: 'TrackAuditRound', action: 'increments the cumulative gaps-fixed counter' },
          { node: 'convergence/ConvergenceState', action: 'updates with the fix result' },
        ],
      },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Confirms the fix did not break compilation' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'Updates with the fix result — either more gaps remain or all are closed' },
    },
    journeys: {},
  });

  return modules;
}

describe("FixAuditGaps", () => {
  const modules = buildFixAuditGapsModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['FixAuditGaps'];

  it("step 1: audit/AuditFindingsList provides the list of coverage gaps to fix", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: audit/PrioritizeGaps ranks gaps by severity to fix the most critical first", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 3: audit/TargetedFixesOnly enforces that fixes are targeted edits, not full re-creation", () => {
    const node = result.index.nodes['audit/TargetedFixesOnly'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/TargetedFixesOnly", () => {
    const from = result.index.nodes['audit/PrioritizeGaps'];
    expect(from.followed_by).toContain('audit/TargetedFixesOnly');
  });

  it("step 4: audit/SelectNextGapToFix picks the highest-priority unfixed gap from the list", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/TargetedFixesOnly');
  });

  it("connection: audit/TargetedFixesOnly → audit/SelectNextGapToFix", () => {
    const from = result.index.nodes['audit/TargetedFixesOnly'];
    expect(from.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 5: audit/DetectSelfAuditTarget checks whether the selected gap targets audit.yaml itself", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/DetectSelfAuditTarget", () => {
    const from = result.index.nodes['audit/SelectNextGapToFix'];
    expect(from.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 6: audit/BuildGapFixPrompt builds a specific fix prompt for the selected gap", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → audit/BuildGapFixPrompt", () => {
    const from = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(from.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 7: audit/ProvideFixContext assembles the target module excerpt and gap details into a fix payload", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const from = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(from.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 8: _actors/LLMWorker receives the fix payload with the exact module and gap to address", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → _actors/LLMWorker", () => {
    const from = result.index.nodes['audit/ProvideFixContext'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: audit/ApplyFix edits the target module YAML to close the coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → audit/ApplyFix", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('audit/ApplyFix');
  });

  it("step 10: audit/VerifyFixCompiles runs compile.ts on the edited module", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 11: _actors/Compiler validates the edited module has 0 errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const from = result.index.nodes['audit/VerifyFixCompiles'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: compilation/CompilationResult confirms the fix did not break compilation", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 13: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation to check for new orphans or duplicates", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/DetectFixInducedErrors", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 14: audit/VerifyGapClosed re-runs the specific auditor on the fixed area", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/VerifyGapClosed", () => {
    const from = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(from.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 15: _actors/Auditor confirms the specific gap is now closed", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → _actors/Auditor", () => {
    const from = result.index.nodes['audit/VerifyGapClosed'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 16: audit/TrackAuditRound increments the cumulative gaps-fixed counter", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/TrackAuditRound", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 17: convergence/ConvergenceState updates with the fix result — either more gaps remain or all are closed", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → convergence/ConvergenceState", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full fix pipeline (17 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(17);
    expect(journey.steps[0].node).toBe('audit/AuditFindingsList');
    expect(journey.steps[16].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is LLMWorker (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
