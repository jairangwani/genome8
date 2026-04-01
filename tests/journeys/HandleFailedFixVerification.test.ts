// Auto-generated from journey: HandleFailedFixVerification
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: audit, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildHandleFailedFixVerificationModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Auditor: { type: 'actor', description: 'Reports gap was not resolved' },
      Compiler: { type: 'actor', description: 'Recompiles to confirm revert is clean' },
    },
    journeys: {},
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'Stores reverted module content' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Confirms zero errors after revert' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'Has edited a module to close a gap' },
      VerifyGapClosed: { type: 'process', description: 'Re-runs auditor, finds gap still present' },
      RejectAndRevertFix: { type: 'process', description: 'Restores module to pre-fix state' },
      AuditFindingsList: { type: 'artifact', description: 'Retains gap with failed-fix annotation' },
      BuildGapFixPrompt: { type: 'process', description: 'Rebuilds fix prompt with failure context' },
      ProvideFixContext: { type: 'process', description: 'Includes failed attempt details' },
      TrackAuditRound: { type: 'artifact', description: 'Records failed verification' },
    },
    journeys: {
      HandleFailedFixVerification: {
        steps: [
          { node: 'ApplyFix', action: 'has edited a module to close a gap' },
          { node: 'VerifyGapClosed', action: 're-runs auditor, finds gap still present' },
          { node: '_actors/Auditor', action: 'reports gap was not resolved' },
          { node: 'RejectAndRevertFix', action: 'restores module to pre-fix state' },
          { node: 'graph/ModuleFile', action: 'stores reverted module content' },
          { node: '_actors/Compiler', action: 'recompiles to confirm revert is clean' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors after revert' },
          { node: 'AuditFindingsList', action: 'retains gap with failed-fix annotation' },
          { node: 'BuildGapFixPrompt', action: 'rebuilds fix prompt with failure context' },
          { node: 'ProvideFixContext', action: 'includes failed attempt details' },
          { node: 'TrackAuditRound', action: 'records failed verification' },
        ],
      },
    },
  });

  return modules;
}

describe("HandleFailedFixVerification", () => {
  const modules = buildHandleFailedFixVerificationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFailedFixVerification'];

  it("step 1: audit/ApplyFix has edited a module to close a gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: audit/VerifyGapClosed re-runs auditor, finds gap still present", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyGapClosed", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 3: _actors/Auditor reports gap was not resolved", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → _actors/Auditor", () => {
    const from = result.index.nodes['audit/VerifyGapClosed'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 4: audit/RejectAndRevertFix restores module to pre-fix state", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/RejectAndRevertFix", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 5: graph/ModuleFile stores reverted module content", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix → graph/ModuleFile", () => {
    const from = result.index.nodes['audit/RejectAndRevertFix'];
    expect(from.followed_by).toContain('graph/ModuleFile');
  });

  it("step 6: _actors/Compiler recompiles to confirm revert is clean", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → _actors/Compiler", () => {
    const from = result.index.nodes['graph/ModuleFile'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 7: compilation/CompilationResult confirms zero errors after revert", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 8: audit/AuditFindingsList retains gap with failed-fix annotation", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/AuditFindingsList", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 9: audit/BuildGapFixPrompt rebuilds fix prompt with failure context", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/BuildGapFixPrompt", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 10: audit/ProvideFixContext includes failed attempt details", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → audit/ProvideFixContext", () => {
    const from = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(from.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 11: audit/TrackAuditRound records failed verification", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/ProvideFixContext'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey covers full pipeline (11 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(11);
    expect(journey.steps[0].node).toBe('audit/ApplyFix');
    expect(journey.steps[10].node).toBe('audit/TrackAuditRound');
  });

  it("journey actor is Auditor (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Auditor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
