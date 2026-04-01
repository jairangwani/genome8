// Auto-generated from journey: FixGapInAuditModule
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildFixGapInAuditModuleModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'Receives self-fix prompt' },
      Compiler: { type: 'actor', description: 'Validates 0 errors' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Confirms self-fix did not break compilation' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'Provides a gap targeting audit.yaml' },
      SelectNextGapToFix: { type: 'process', description: 'Picks the self-referential gap' },
      DetectSelfAuditTarget: { type: 'process', description: 'Confirms gap targets audit.yaml' },
      ScopeFixToAvoidAuditBreak: { type: 'process', description: 'Analyzes proposed fix scope' },
      BuildGapFixPrompt: { type: 'process', description: 'Builds fix prompt preserving audit infrastructure' },
      ProvideFixContext: { type: 'process', description: 'Includes full audit.yaml source' },
      ApplyFix: { type: 'process', description: 'Edits audit.yaml to close gap' },
      VerifyFixCompiles: { type: 'process', description: 'Compiles modified audit.yaml' },
      ReauditAfterSelfFix: { type: 'process', description: 'Triggers full re-audit' },
      TrackAuditRound: { type: 'artifact', description: 'Records self-fix attempt' },
    },
    journeys: {
      FixGapInAuditModule: {
        steps: [
          { node: 'AuditFindingsList', action: 'provides a gap targeting audit.yaml' },
          { node: 'SelectNextGapToFix', action: 'picks the self-referential gap' },
          { node: 'DetectSelfAuditTarget', action: 'confirms gap targets audit.yaml' },
          { node: 'ScopeFixToAvoidAuditBreak', action: 'analyzes proposed fix scope' },
          { node: 'ScopeFixToAvoidAuditBreak', action: 'verifies fix will not break critical nodes' },
          { node: 'BuildGapFixPrompt', action: 'builds fix prompt preserving audit infrastructure' },
          { node: 'ProvideFixContext', action: 'includes full audit.yaml source' },
          { node: '_actors/LLMWorker', action: 'receives self-fix prompt' },
          { node: 'ApplyFix', action: 'edits audit.yaml to close gap' },
          { node: 'VerifyFixCompiles', action: 'compiles modified audit.yaml' },
          { node: '_actors/Compiler', action: 'validates 0 errors' },
          { node: 'compilation/CompilationResult', action: 'confirms self-fix did not break compilation' },
          { node: 'ReauditAfterSelfFix', action: 'triggers full re-audit' },
          { node: 'TrackAuditRound', action: 'records self-fix attempt' },
        ],
      },
    },
  });

  return modules;
}

describe("FixGapInAuditModule", () => {
  const modules = buildFixGapInAuditModuleModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['FixGapInAuditModule'];

  it("step 1: audit/AuditFindingsList provides a gap targeting audit.yaml", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: audit/SelectNextGapToFix picks the self-referential gap", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/SelectNextGapToFix", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 3: audit/DetectSelfAuditTarget confirms gap targets audit.yaml", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/DetectSelfAuditTarget", () => {
    const from = result.index.nodes['audit/SelectNextGapToFix'];
    expect(from.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 4: audit/ScopeFixToAvoidAuditBreak analyzes proposed fix scope", () => {
    const node = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → audit/ScopeFixToAvoidAuditBreak", () => {
    const from = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(from.followed_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("step 5: audit/ScopeFixToAvoidAuditBreak verifies fix will not break critical nodes (self-loop)", () => {
    const node = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("connection: audit/ScopeFixToAvoidAuditBreak → audit/ScopeFixToAvoidAuditBreak", () => {
    const from = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(from.followed_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("step 6: audit/BuildGapFixPrompt builds fix prompt preserving audit infrastructure", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ScopeFixToAvoidAuditBreak');
  });

  it("connection: audit/ScopeFixToAvoidAuditBreak → audit/BuildGapFixPrompt", () => {
    const from = result.index.nodes['audit/ScopeFixToAvoidAuditBreak'];
    expect(from.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 7: audit/ProvideFixContext includes full audit.yaml source", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const from = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(from.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 8: _actors/LLMWorker receives self-fix prompt", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → _actors/LLMWorker", () => {
    const from = result.index.nodes['audit/ProvideFixContext'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: audit/ApplyFix edits audit.yaml to close gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → audit/ApplyFix", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('audit/ApplyFix');
  });

  it("step 10: audit/VerifyFixCompiles compiles modified audit.yaml", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 11: _actors/Compiler validates 0 errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const from = result.index.nodes['audit/VerifyFixCompiles'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: compilation/CompilationResult confirms self-fix did not break compilation", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 13: audit/ReauditAfterSelfFix triggers full re-audit", () => {
    const node = result.index.nodes['audit/ReauditAfterSelfFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/ReauditAfterSelfFix", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/ReauditAfterSelfFix');
  });

  it("step 14: audit/TrackAuditRound records self-fix attempt", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ReauditAfterSelfFix');
  });

  it("connection: audit/ReauditAfterSelfFix → audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/ReauditAfterSelfFix'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey covers full pipeline (14 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(14);
    expect(journey.steps[0].node).toBe('audit/AuditFindingsList');
    expect(journey.steps[13].node).toBe('audit/TrackAuditRound');
  });

  it("journey actor is LLMWorker (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
