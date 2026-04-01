import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildHandleFixInducedErrorsModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'Returns compilation result' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Provides post-fix compilation result' },
    },
    journeys: {},
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'Stores the reverted module content' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'Has just edited a module to close a coverage gap' },
      VerifyFixCompiles: { type: 'process', description: 'Runs compilation on the edited module' },
      DetectFixInducedErrors: { type: 'process', description: 'Compares pre-fix and post-fix compilation' },
      RejectAndRevertFix: { type: 'process', description: 'Reads the pre-fix backup and restores the module' },
      AuditFindingsList: { type: 'artifact', description: 'Retains the original gap since the fix was rejected' },
      TrackAuditRound: { type: 'artifact', description: 'Records the failed fix attempt for progress analysis' },
    },
    journeys: {
      HandleFixInducedErrors: {
        steps: [
          { node: 'ApplyFix', action: 'has just edited a module to close a coverage gap' },
          { node: 'VerifyFixCompiles', action: 'runs compilation on the edited module' },
          { node: '_actors/Compiler', action: 'returns a compilation result with new errors' },
          { node: 'compilation/CompilationResult', action: 'provides post-fix result showing new problems' },
          { node: 'DetectFixInducedErrors', action: 'compares pre-fix and post-fix compilation' },
          { node: 'DetectFixInducedErrors', action: 'determines the fix is net-negative' },
          { node: 'RejectAndRevertFix', action: 'reads the pre-fix backup of the target module file' },
          { node: 'RejectAndRevertFix', action: 'restores the module to its pre-fix state on disk' },
          { node: 'graph/ModuleFile', action: 'stores the reverted module content' },
          { node: '_actors/Compiler', action: 'recompiles to confirm the revert restored zero-error state' },
          { node: 'compilation/CompilationResult', action: 'confirms the graph is back to its pre-fix clean state' },
          { node: 'AuditFindingsList', action: 'retains the original gap since the fix was rejected' },
          { node: 'TrackAuditRound', action: 'records the failed fix attempt for progress analysis' },
        ],
      },
    },
  });

  return modules;
}

describe("HandleFixInducedErrors", () => {
  const modules = buildHandleFixInducedErrorsModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFixInducedErrors'];

  it("step 1: audit/ApplyFix has just edited a module to close a coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: audit/VerifyFixCompiles runs compilation on the edited module", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix -> audit/VerifyFixCompiles", () => {
    const from = result.index.nodes['audit/ApplyFix'];
    expect(from.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 3: _actors/Compiler returns a compilation result with new errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles -> _actors/Compiler", () => {
    const from = result.index.nodes['audit/VerifyFixCompiles'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/CompilationResult provides post-fix result showing new problems", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler -> compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult -> audit/DetectFixInducedErrors", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 6: audit/DetectFixInducedErrors determines the fix is net-negative (self-loop)", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors -> audit/DetectFixInducedErrors", () => {
    const from = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(from.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 7: audit/RejectAndRevertFix reads the pre-fix backup of the target module file", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors -> audit/RejectAndRevertFix", () => {
    const from = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(from.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 8: audit/RejectAndRevertFix restores the module to its pre-fix state on disk (self-loop)", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix -> audit/RejectAndRevertFix", () => {
    const from = result.index.nodes['audit/RejectAndRevertFix'];
    expect(from.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 9: graph/ModuleFile stores the reverted module content", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix -> graph/ModuleFile", () => {
    const from = result.index.nodes['audit/RejectAndRevertFix'];
    expect(from.followed_by).toContain('graph/ModuleFile');
  });

  it("step 10: _actors/Compiler recompiles to confirm the revert restored zero-error state (revisited)", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile -> _actors/Compiler", () => {
    const from = result.index.nodes['graph/ModuleFile'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 11: compilation/CompilationResult confirms the graph is back to its pre-fix clean state (revisited)", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler -> compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 12: audit/AuditFindingsList retains the original gap since the fix was rejected", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult -> audit/AuditFindingsList", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 13: audit/TrackAuditRound records the failed fix attempt for progress analysis", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList -> audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey covers full pipeline (13 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(13);
    expect(journey.steps[0].node).toBe('audit/ApplyFix');
    expect(journey.steps[12].node).toBe('audit/TrackAuditRound');
  });

  it("journey actor is Compiler (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
