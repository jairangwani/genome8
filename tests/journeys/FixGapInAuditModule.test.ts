// Auto-generated from journey: FixGapInAuditModule
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
      SelectNextGapToFix: { type: 'process', description: 'picks the highest-priority unfixed gap from the prioritized list' },
      DetectSelfAuditTarget: { type: 'process', description: 'detects when a coverage gap targets audit.yaml itself' },
      ScopeFixToAvoidAuditBreak: { type: 'process', description: 'when a fix targets audit.yaml, validates that the proposed edit does not remove or break existing audit processes' },
      BuildGapFixPrompt: { type: 'process', description: 'builds a targeted fix prompt for each gap' },
      ProvideFixContext: { type: 'process', description: 'assembles the target module excerpt and gap details into a fix payload' },
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file' },
      VerifyFixCompiles: { type: 'process', description: 'runs compile.ts after each fix' },
      ReauditAfterSelfFix: { type: 'process', description: 'after a fix modifies audit.yaml, re-runs the full audit pipeline from scratch' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed' },
    },
    journeys: {
      FixGapInAuditModule: {
        steps: [
          { node: 'AuditFindingsList', action: 'provides a gap that targets audit.yaml itself' },
          { node: 'SelectNextGapToFix', action: 'picks the self-referential gap from the prioritized list' },
          { node: 'DetectSelfAuditTarget', action: 'confirms the gap targets audit.yaml and flags it for extra safeguards' },
          { node: 'ScopeFixToAvoidAuditBreak', action: 'analyzes the proposed fix scope to ensure it will not remove existing audit processes' },
          { node: 'ScopeFixToAvoidAuditBreak', action: 'verifies the fix will not break CheckSpecCoverage, VerifyFixCompiles, DeclareConverged, or other critical audit nodes' },
          { node: 'BuildGapFixPrompt', action: 'builds the fix prompt with explicit instructions to preserve existing audit infrastructure' },
          { node: 'ProvideFixContext', action: 'includes the full audit.yaml source and the safeguard constraints in the fix payload' },
          { node: '_actors/LLMWorker', action: 'receives the self-fix prompt with clear boundaries on what must not be changed' },
          { node: 'ApplyFix', action: 'edits audit.yaml to close the gap while preserving all existing audit processes' },
          { node: 'VerifyFixCompiles', action: 'compiles the modified audit.yaml to check for errors' },
          { node: '_actors/Compiler', action: 'validates the self-modified audit module has 0 errors' },
          { node: 'compilation/CompilationResult', action: 'confirms the self-fix did not break compilation' },
          { node: 'ReauditAfterSelfFix', action: 'triggers a full re-audit to verify the self-fix did not invalidate audit own integrity' },
          { node: 'TrackAuditRound', action: 'records the self-fix attempt for progress tracking' },
        ],
      },
    },
  });

  return modules;
}

describe("FixGapInAuditModule", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['FixGapInAuditModule'];

  it("step 1: audit/AuditFindingsList provides a gap that targets audit.yaml itself", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('FixGapInAuditModule'))).toBe(true);
  });

  it("step 2: audit/SelectNextGapToFix picks the self-referential gap from the prioritized list", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/SelectNextGapToFix", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 3: audit/DetectSelfAuditTarget confirms the gap targets audit.yaml and flags it for extra safeguards", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/DetectSelfAuditTarget", () => {
    const src = result.index.nodes['audit/SelectNextGapToFix'];
    expect(src.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 4: audit/ScopeFixToAvoidAuditBreak analyzes the proposed fix scope to ensure it will not remove existing audit processes", () => {
    const node = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → audit/ScopeFixToAvoidAuditBreak", () => {
    const src = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(src.followed_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("step 5: audit/ScopeFixToAvoidAuditBreak verifies the fix will not break CheckSpecCoverage, VerifyFixCompiles, DeclareConverged, or other critical audit nodes", () => {
    const node = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(node.preceded_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("connection: audit/ScopeFixToAvoidAuditBreak → audit/ScopeFixToAvoidAuditBreak", () => {
    const node = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(node.preceded_by).toContain('audit/ScopeFixToAvoidAuditBreak');
    expect(node.followed_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("step 6: audit/BuildGapFixPrompt builds the fix prompt with explicit instructions to preserve existing audit infrastructure", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("connection: audit/ScopeFixToAvoidAuditBreak → audit/BuildGapFixPrompt", () => {
    const src = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(src.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 7: audit/ProvideFixContext includes the full audit.yaml source and the safeguard constraints in the fix payload", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const src = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(src.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 8: _actors/LLMWorker receives the self-fix prompt with clear boundaries on what must not be changed", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → _actors/LLMWorker", () => {
    const src = result.index.nodes['audit/ProvideFixContext'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: audit/ApplyFix edits audit.yaml to close the gap while preserving all existing audit processes", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → audit/ApplyFix", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('audit/ApplyFix');
  });

  it("step 10: audit/VerifyFixCompiles compiles the modified audit.yaml to check for errors", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 11: _actors/Compiler validates the self-modified audit module has 0 errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const src = result.index.nodes['audit/VerifyFixCompiles'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: compilation/CompilationResult confirms the self-fix did not break compilation", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 13: audit/ReauditAfterSelfFix triggers a full re-audit to verify the self-fix did not invalidate audit's own integrity", () => {
    const node = result.index.nodes['audit/ReauditAfterSelfFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/ReauditAfterSelfFix", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/ReauditAfterSelfFix');
  });

  it("step 14: audit/TrackAuditRound records the self-fix attempt for progress tracking", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ReauditAfterSelfFix');
  });

  it("connection: audit/ReauditAfterSelfFix → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/ReauditAfterSelfFix'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey has 14 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(14);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
