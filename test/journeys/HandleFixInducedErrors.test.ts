// Auto-generated from journey: HandleFixInducedErrors
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: audit, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['HandleFixInducedErrors'];
const steps = journey.steps;

describe("HandleFixInducedErrors", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(13);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', '_actors', 'compilation', 'graph'])
    );
  });

  it("step 1: audit/ApplyFix has just edited a module to close a coverage gap", () => {
    // Node: audit/ApplyFix (process)
    // Action: has just edited a module to close a coverage gap
    const step = steps[0];
    expect(step.node).toBe('audit/ApplyFix');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('module YAML');
    expect(node.module).toBe('audit');
    // Followed by VerifyFixCompiles in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
  });

  it("step 2: audit/VerifyFixCompiles runs compilation on the edited module", () => {
    // Node: audit/VerifyFixCompiles (process)
    // Action: runs compilation on the edited module
    const step = steps[1];
    expect(step.node).toBe('audit/VerifyFixCompiles');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('audit');
    // Preceded by ApplyFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 3: _actors/Compiler returns a compilation result with new errors not present before the fix", () => {
    // Node: _actors/Compiler (actor)
    // Action: returns a compilation result with new errors not present before the fix
    const step = steps[2];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(3);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    expect(node.module).toBe('_actors');
    // Preceded by VerifyFixCompiles in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: compilation/CompilationResult provides the post-fix result showing new orphans, duplicates, or dangling refs", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: provides the post-fix result showing new orphans, duplicates, or dangling refs
    const step = steps[3];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(4);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by DetectFixInducedErrors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: audit/DetectFixInducedErrors compares pre-fix error counts against post-fix and identifies the new problems", () => {
    // Node: audit/DetectFixInducedErrors (process) — first occurrence
    // Action: compares pre-fix error counts against post-fix and identifies the new problems
    const step = steps[4];
    expect(step.node).toBe('audit/DetectFixInducedErrors');
    expect(step.step_number).toBe(5);

    const node = index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: audit/DetectFixInducedErrors determines the fix is net-negative because it introduced more problems than it solved", () => {
    // Node: audit/DetectFixInducedErrors (process) — second occurrence
    // Action: determines the fix is net-negative because it introduced more problems than it solved
    const step = steps[5];
    expect(step.node).toBe('audit/DetectFixInducedErrors');
    expect(step.step_number).toBe(6);

    // Same node as step 5
    const node = index.nodes['audit/DetectFixInducedErrors'];
    expect(node.type).toBe('process');
    expect(node.module).toBe('audit');
    // Followed by RejectAndRevertFix in this journey (step 6→7)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/RejectAndRevertFix'])
    );
  });

  it("step 7: audit/RejectAndRevertFix reads the pre-fix backup of the target module file", () => {
    // Node: audit/RejectAndRevertFix (process) — first occurrence
    // Action: reads the pre-fix backup of the target module file
    const step = steps[6];
    expect(step.node).toBe('audit/RejectAndRevertFix');
    expect(step.step_number).toBe(7);

    const node = index.nodes['audit/RejectAndRevertFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix state');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedErrors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
  });

  it("step 8: audit/RejectAndRevertFix restores the module to its pre-fix state on disk", () => {
    // Node: audit/RejectAndRevertFix (process) — second occurrence
    // Action: restores the module to its pre-fix state on disk
    const step = steps[7];
    expect(step.node).toBe('audit/RejectAndRevertFix');
    expect(step.step_number).toBe(8);

    const node = index.nodes['audit/RejectAndRevertFix'];
    expect(node.type).toBe('process');
    expect(node.module).toBe('audit');
    // Followed by ModuleFile in this journey (cross-module edge, step 8→9)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
  });

  it("step 9: graph/ModuleFile stores the reverted module content", () => {
    // Node: graph/ModuleFile (artifact)
    // Action: stores the reverted module content
    const step = steps[8];
    expect(step.node).toBe('graph/ModuleFile');
    expect(step.step_number).toBe(9);

    const node = index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('YAML file');
    expect(node.module).toBe('graph');
    // Preceded by RejectAndRevertFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/RejectAndRevertFix'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 10: _actors/Compiler recompiles to confirm the revert restored zero-error state", () => {
    // Node: _actors/Compiler (actor) — second occurrence
    // Action: recompiles to confirm the revert restored zero-error state
    const step = steps[9];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(10);

    const node = index.nodes['_actors/Compiler'];
    expect(node.type).toBe('actor');
    expect(node.module).toBe('_actors');
    // Preceded by ModuleFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 11: compilation/CompilationResult confirms the graph is back to its pre-fix clean state", () => {
    // Node: compilation/CompilationResult (artifact) — second occurrence
    // Action: confirms the graph is back to its pre-fix clean state
    const step = steps[10];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(11);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by AuditFindingsList in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 12: audit/AuditFindingsList retains the original gap since the fix was rejected", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: retains the original gap since the fix was rejected
    const step = steps[11];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(12);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by TrackAuditRound in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 13: audit/TrackAuditRound records the failed fix attempt for progress analysis", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: records the failed fix attempt for progress analysis
    const step = steps[12];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(13);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
  });

  it("journey forms the full fix-induced error handling sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/ApplyFix',
      'audit/VerifyFixCompiles',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/DetectFixInducedErrors',
      'audit/DetectFixInducedErrors',
      'audit/RejectAndRevertFix',
      'audit/RejectAndRevertFix',
      'graph/ModuleFile',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/AuditFindingsList',
      'audit/TrackAuditRound',
    ]);
  });

  it("Compiler is the journey actor (first actor-type node)", () => {
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("DetectFixInducedErrors appears twice — first to compare, then to decide", () => {
    const detectSteps = steps.filter(s => s.node === 'audit/DetectFixInducedErrors');
    expect(detectSteps).toHaveLength(2);
    expect(detectSteps[0].step_number).toBe(5);
    expect(detectSteps[1].step_number).toBe(6);
  });

  it("RejectAndRevertFix appears twice — first to read backup, then to restore", () => {
    const revertSteps = steps.filter(s => s.node === 'audit/RejectAndRevertFix');
    expect(revertSteps).toHaveLength(2);
    expect(revertSteps[0].step_number).toBe(7);
    expect(revertSteps[1].step_number).toBe(8);
  });

  it("Compiler and CompilationResult each appear twice — once for post-fix check, once for post-revert confirmation", () => {
    const compilerSteps = steps.filter(s => s.node === '_actors/Compiler');
    expect(compilerSteps).toHaveLength(2);
    expect(compilerSteps[0].step_number).toBe(3);
    expect(compilerSteps[1].step_number).toBe(10);

    const resultSteps = steps.filter(s => s.node === 'compilation/CompilationResult');
    expect(resultSteps).toHaveLength(2);
    expect(resultSteps[0].step_number).toBe(4);
    expect(resultSteps[1].step_number).toBe(11);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', '_actors', 'compilation', 'graph']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
