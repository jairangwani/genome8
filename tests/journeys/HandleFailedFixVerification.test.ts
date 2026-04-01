// Auto-generated from journey: HandleFailedFixVerification
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: audit, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
    },
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'a single module YAML file on disk in the genome/modules directory' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file' },
      VerifyGapClosed: { type: 'process', description: 're-runs the specific auditor that found the gap' },
      RejectAndRevertFix: { type: 'process', description: 'restores the target module to its pre-fix state' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
      BuildGapFixPrompt: { type: 'process', description: 'builds a targeted fix prompt for each gap' },
      ProvideFixContext: { type: 'process', description: 'assembles the target module excerpt and gap details into a fix payload' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed' },
    },
    journeys: {
      HandleFailedFixVerification: {
        steps: [
          { node: 'ApplyFix', action: 'has edited a module to close a gap' },
          { node: 'VerifyGapClosed', action: 're-runs the auditor and finds the gap is still present' },
          { node: '_actors/Auditor', action: 'reports that the specific gap was not resolved by the fix' },
          { node: 'RejectAndRevertFix', action: 'restores the module to its pre-fix state since the fix did not achieve its goal' },
          { node: 'graph/ModuleFile', action: 'stores the reverted module content' },
          { node: '_actors/Compiler', action: 'recompiles to confirm the revert is clean' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors after revert' },
          { node: 'AuditFindingsList', action: 'retains the gap and marks it with a failed-fix-attempt annotation' },
          { node: 'BuildGapFixPrompt', action: 'rebuilds the fix prompt with additional context about why the previous attempt failed' },
          { node: 'ProvideFixContext', action: 'includes the failed attempt details so the next worker can try a different approach' },
          { node: 'TrackAuditRound', action: 'records the failed verification for progress tracking' },
        ],
      },
    },
  });

  return modules;
}

describe("HandleFailedFixVerification", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFailedFixVerification'];

  it("step 1: audit/ApplyFix has edited a module to close a gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('HandleFailedFixVerification'))).toBe(true);
  });

  it("step 2: audit/VerifyGapClosed re-runs the auditor and finds the gap is still present", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyGapClosed", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 3: _actors/Auditor reports that the specific gap was not resolved by the fix", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → _actors/Auditor", () => {
    const src = result.index.nodes['audit/VerifyGapClosed'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 4: audit/RejectAndRevertFix restores the module to its pre-fix state since the fix did not achieve its goal", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/RejectAndRevertFix", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 5: graph/ModuleFile stores the reverted module content", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix → graph/ModuleFile", () => {
    const src = result.index.nodes['audit/RejectAndRevertFix'];
    expect(src.followed_by).toContain('graph/ModuleFile');
  });

  it("step 6: _actors/Compiler recompiles to confirm the revert is clean", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → _actors/Compiler", () => {
    const src = result.index.nodes['graph/ModuleFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 7: compilation/CompilationResult confirms zero errors after revert", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 8: audit/AuditFindingsList retains the gap and marks it with a failed-fix-attempt annotation", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/AuditFindingsList", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 9: audit/BuildGapFixPrompt rebuilds the fix prompt with additional context about why the previous attempt failed", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/BuildGapFixPrompt", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 10: audit/ProvideFixContext includes the failed attempt details so the next worker can try a different approach", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const src = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(src.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 11: audit/TrackAuditRound records the failed verification for progress tracking", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/ProvideFixContext'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey has 11 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(11);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
