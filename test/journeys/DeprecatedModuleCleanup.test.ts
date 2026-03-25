// Auto-generated from journey: DeprecatedModuleCleanup
// Module: actors
// Triggered by: _actors/DeprecatedModule
// Modules touched: _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['DeprecatedModuleCleanup'];
const steps = journey.steps;

describe("DeprecatedModuleCleanup", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'compilation', 'convergence'])
    );
  });

  it("step 1: _actors/DeprecatedModule exists on disk but is no longer relevant to the current spec", () => {
    // Node: _actors/DeprecatedModule (actor)
    // Action: exists on disk but is no longer relevant to the current spec
    const step = steps[0];
    expect(step.node).toBe('_actors/DeprecatedModule');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/DeprecatedModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('no longer relevant');
    // DeprecatedModule is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/DeprecatedModule');
    // Followed by OrphanDetection in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/OrphanDetection'])
    );
  });

  it("step 2: compilation/OrphanDetection detects that the module's nodes are no longer referenced by any journey", () => {
    // Node: compilation/OrphanDetection (process)
    // Action: detects that the module's nodes are no longer referenced by any journey
    const step = steps[1];
    expect(step.node).toBe('compilation/OrphanDetection');
    expect(step.step_number).toBe(2);

    const node = index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('never referenced');
    expect(node.module).toBe('compilation');
    // Preceded by DeprecatedModule in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/DeprecatedModule'])
    );
    // Followed by IsolatedModuleDetection in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/IsolatedModuleDetection'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: compilation/IsolatedModuleDetection detects that the module has zero cross-module connections", () => {
    // Node: compilation/IsolatedModuleDetection (process)
    // Action: detects that the module has zero cross-module connections
    const step = steps[2];
    expect(step.node).toBe('compilation/IsolatedModuleDetection');
    expect(step.step_number).toBe(3);

    const node = index.nodes['compilation/IsolatedModuleDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('zero connections');
    expect(node.module).toBe('compilation');
    // Preceded by OrphanDetection in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/OrphanDetection'])
    );
    // Followed by CompilationResult in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 4: compilation/CompilationResult reports the module as both orphaned and isolated", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: reports the module as both orphaned and isolated
    const step = steps[3];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(4);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by IsolatedModuleDetection in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/IsolatedModuleDetection'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
  });

  it("step 5: _actors/Auditor flags the deprecated module during coverage audit", () => {
    // Node: _actors/Auditor (actor)
    // Action: flags the deprecated module during coverage audit
    const step = steps[4];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(5);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
  });

  it("step 6: convergence/AuditGapFix targeted fix removes or archives the deprecated module", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix removes or archives the deprecated module
    const step = steps[5];
    expect(step.node).toBe('convergence/AuditGapFix');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted');
    expect(node.module).toBe('convergence');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full detection-then-cleanup sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/DeprecatedModule',
      'compilation/OrphanDetection',
      'compilation/IsolatedModuleDetection',
      'compilation/CompilationResult',
      '_actors/Auditor',
      'convergence/AuditGapFix',
    ]);
  });

  it("detection phase runs in compilation (steps 2-4), cleanup phase uses audit pipeline (steps 5-6)", () => {
    // Detection: compilation detects orphaned and isolated module
    const compilationSteps = steps.filter(s => s.node.startsWith('compilation/'));
    expect(compilationSteps).toHaveLength(3);
    expect(compilationSteps.map(s => s.node)).toEqual([
      'compilation/OrphanDetection',
      'compilation/IsolatedModuleDetection',
      'compilation/CompilationResult',
    ]);
    // Cleanup: auditor flags, gap fix removes
    const cleanupSteps = steps.slice(4);
    expect(cleanupSteps.map(s => s.node)).toEqual([
      '_actors/Auditor',
      'convergence/AuditGapFix',
    ]);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("DeprecatedModule is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/DeprecatedModule');
    const node = index.nodes['_actors/DeprecatedModule'];
    expect(node.type).toBe('actor');
  });
});
