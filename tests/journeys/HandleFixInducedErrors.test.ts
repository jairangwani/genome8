// Auto-generated from journey: HandleFixInducedErrors
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'a single module YAML file on disk in the genome/modules directory' },
    },
  });

  modules.set('audit', {
    nodes: {
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file to close the identified coverage gap' },
      VerifyFixCompiles: { type: 'process', description: 'runs compile.ts after each fix to ensure the edit did not introduce new errors' },
      DetectFixInducedErrors: { type: 'process', description: 'compares pre-fix and post-fix compilation results to detect new orphans, duplicates, or dangling refs' },
      RejectAndRevertFix: { type: 'process', description: 'restores the target module to its pre-fix state when a fix introduced new errors' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed' },
    },
    journeys: {
      HandleFixInducedErrors: {
        steps: [
          { node: 'ApplyFix', action: 'has just edited a module to close a coverage gap' },
          { node: 'VerifyFixCompiles', action: 'runs compilation on the edited module' },
          { node: '_actors/Compiler', action: 'returns a compilation result with new errors not present before the fix' },
          { node: 'compilation/CompilationResult', action: 'provides the post-fix result showing new orphans, duplicates, or dangling refs' },
          { node: 'DetectFixInducedErrors', action: 'compares pre-fix error counts against post-fix and identifies the new problems' },
          { node: 'DetectFixInducedErrors', action: 'determines the fix is net-negative because it introduced more problems than it solved' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HandleFixInducedErrors'];

  it("step 1: audit/ApplyFix has just edited a module to close a coverage gap", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('HandleFixInducedErrors'))).toBe(true);
  });

  it("step 2: audit/VerifyFixCompiles runs compilation on the edited module", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → audit/VerifyFixCompiles", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 3: _actors/Compiler returns a compilation result with new errors not present before the fix", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const src = result.index.nodes['audit/VerifyFixCompiles'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 4: compilation/CompilationResult provides the post-fix result showing new orphans, duplicates, or dangling refs", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: audit/DetectFixInducedErrors compares pre-fix error counts against post-fix and identifies the new problems", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/DetectFixInducedErrors", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 6: audit/DetectFixInducedErrors determines the fix is net-negative because it introduced more problems than it solved", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/DetectFixInducedErrors", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
    expect(node.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 7: audit/RejectAndRevertFix reads the pre-fix backup of the target module file", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/RejectAndRevertFix", () => {
    const src = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(src.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 8: audit/RejectAndRevertFix restores the module to its pre-fix state on disk", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix → audit/RejectAndRevertFix", () => {
    const node = result.index.nodes['audit/RejectAndRevertFix'];
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
    expect(node.followed_by).toContain('audit/RejectAndRevertFix');
  });

  it("step 9: graph/ModuleFile stores the reverted module content", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/RejectAndRevertFix');
  });

  it("connection: audit/RejectAndRevertFix → graph/ModuleFile", () => {
    const src = result.index.nodes['audit/RejectAndRevertFix'];
    expect(src.followed_by).toContain('graph/ModuleFile');
  });

  it("step 10: _actors/Compiler recompiles to confirm the revert restored zero-error state", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → _actors/Compiler", () => {
    const src = result.index.nodes['graph/ModuleFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 11: compilation/CompilationResult confirms the graph is back to its pre-fix clean state", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 12: audit/AuditFindingsList retains the original gap since the fix was rejected", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/AuditFindingsList", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 13: audit/TrackAuditRound records the failed fix attempt for progress analysis", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey has 13 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(13);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
