// Auto-generated from journey: FixAuditGaps
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
      PrioritizeGaps: { type: 'process', description: 'ranks the collected gaps by severity so the most critical coverage issues are fixed first' },
      TargetedFixesOnly: { type: 'rule', description: 'audit gaps are fixed with targeted edits to specific modules, never by re-running the full creation pipeline' },
      SelectNextGapToFix: { type: 'process', description: 'picks the highest-priority unfixed gap from the prioritized list and advances the pointer to the next gap' },
      DetectSelfAuditTarget: { type: 'process', description: 'detects when a coverage gap targets audit.yaml itself' },
      BuildGapFixPrompt: { type: 'process', description: 'builds a targeted fix prompt for each gap specifying exactly which module to edit and what coverage to add' },
      ProvideFixContext: { type: 'process', description: 'assembles the target module excerpt, the specific gap description, and surrounding graph context into a complete fix payload for the LLM worker' },
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file to close the identified coverage gap' },
      VerifyFixCompiles: { type: 'process', description: 'runs compile.ts after each fix to ensure the edit did not introduce new errors' },
      DetectFixInducedErrors: { type: 'process', description: 'compares pre-fix and post-fix compilation results to detect new orphans, duplicates, or dangling refs' },
      VerifyGapClosed: { type: 'process', description: 're-runs the specific auditor that found the gap to confirm the fix actually closed it' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed for progress tracking and termination decisions' },
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
          { node: 'convergence/ConvergenceState', action: 'updates with the fix result — either more gaps remain or all are closed' },
        ],
      },
    },
  });

  return modules;
}

describe("FixAuditGaps", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['FixAuditGaps'];

  it("step 1: audit/AuditFindingsList provides the list of coverage gaps to fix", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('FixAuditGaps'))).toBe(true);
  });

  it("step 2: audit/PrioritizeGaps ranks gaps by severity to fix the most critical first", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 3: audit/TargetedFixesOnly enforces that fixes are targeted edits, not full re-creation", () => {
    const node = result.index.nodes['audit/TargetedFixesOnly'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/TargetedFixesOnly", () => {
    const src = result.index.nodes['audit/PrioritizeGaps'];
    expect(src.followed_by).toContain('audit/TargetedFixesOnly');
  });

  it("step 4: audit/SelectNextGapToFix picks the highest-priority unfixed gap from the list", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/TargetedFixesOnly');
  });

  it("connection: audit/TargetedFixesOnly → audit/SelectNextGapToFix", () => {
    const src = result.index.nodes['audit/TargetedFixesOnly'];
    expect(src.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 5: audit/DetectSelfAuditTarget checks whether the selected gap targets audit.yaml itself", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/DetectSelfAuditTarget", () => {
    const src = result.index.nodes['audit/SelectNextGapToFix'];
    expect(src.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 6: audit/BuildGapFixPrompt builds a specific fix prompt for the selected gap", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → audit/BuildGapFixPrompt", () => {
    const src = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(src.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 7: audit/ProvideFixContext assembles the target module excerpt and gap details into a fix payload", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const src = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(src.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 8: _actors/LLMWorker receives the fix payload with the exact module and gap to address", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → _actors/LLMWorker", () => {
    const src = result.index.nodes['audit/ProvideFixContext'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: audit/ApplyFix edits the target module YAML to close the coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → audit/ApplyFix", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('audit/ApplyFix');
  });

  it("step 10: audit/VerifyFixCompiles runs compile.ts on the edited module", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 11: _actors/Compiler validates the edited module has 0 errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const src = result.index.nodes['audit/VerifyFixCompiles'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: compilation/CompilationResult confirms the fix did not break compilation", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 13: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation to check for new orphans or duplicates", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/DetectFixInducedErrors", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 14: audit/VerifyGapClosed re-runs the specific auditor on the fixed area", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/VerifyGapClosed", () => {
    const src = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(src.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 15: _actors/Auditor confirms the specific gap is now closed", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → _actors/Auditor", () => {
    const src = result.index.nodes['audit/VerifyGapClosed'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 16: audit/TrackAuditRound increments the cumulative gaps-fixed counter", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/TrackAuditRound", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 17: convergence/ConvergenceState updates with the fix result — either more gaps remain or all are closed", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → convergence/ConvergenceState", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 17 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(17);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
