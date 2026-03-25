// Auto-generated from journey: ReturningOwnerReconvergence
// Module: actors
// Triggered by: _actors/ReturningOwner
// Modules touched: _actors, convergence, sync

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ReturningOwnerReconvergence'];
const steps = journey.steps;

describe("ReturningOwnerReconvergence", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(9);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'convergence', 'sync'])
    );
  });

  it("step 1: _actors/ReturningOwner re-triggers convergence after a long period of inactivity", () => {
    // Node: _actors/ReturningOwner (actor)
    // Action: re-triggers convergence after a long period of inactivity
    const step = steps[0];
    expect(step.node).toBe('_actors/ReturningOwner');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ReturningOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('inactivity');
    // ReturningOwner is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/ReturningOwner');
    // Followed by ReadSpec in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
  });

  it("step 2: convergence/ReadSpec reads the possibly unchanged spec.md", () => {
    // Node: convergence/ReadSpec (process)
    // Action: reads the possibly unchanged spec.md
    const step = steps[1];
    expect(step.node).toBe('convergence/ReadSpec');
    expect(step.step_number).toBe(2);

    const node = index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec.md');
    expect(node.module).toBe('convergence');
    // Preceded by ReturningOwner in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ReturningOwner'])
    );
    // Followed by FetchDependencyHash in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/FetchDependencyHash'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: sync/FetchDependencyHash fetches current hashes from all dependencies", () => {
    // Node: sync/FetchDependencyHash (process)
    // Action: fetches current hashes from all dependencies
    const step = steps[2];
    expect(step.node).toBe('sync/FetchDependencyHash');
    expect(step.step_number).toBe(3);

    const node = index.nodes['sync/FetchDependencyHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('SHA256');
    expect(node.module).toBe('sync');
    // Preceded by ReadSpec in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    // Followed by CompareStoredHash in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: sync/CompareStoredHash finds many hashes have changed during the absence", () => {
    // Node: sync/CompareStoredHash (process)
    // Action: finds many hashes have changed during the absence
    const step = steps[3];
    expect(step.node).toBe('sync/CompareStoredHash');
    expect(step.step_number).toBe(4);

    const node = index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('hash');
    expect(node.module).toBe('sync');
    // Preceded by FetchDependencyHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/FetchDependencyHash'])
    );
    // Followed by FindAffectedModules in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/FindAffectedModules'])
    );
  });

  it("step 5: sync/FindAffectedModules identifies all stale modules", () => {
    // Node: sync/FindAffectedModules (process)
    // Action: identifies all stale modules
    const step = steps[4];
    expect(step.node).toBe('sync/FindAffectedModules');
    expect(step.step_number).toBe(5);

    const node = index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stale');
    expect(node.module).toBe('sync');
    // Preceded by CompareStoredHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
    // Followed by TargetedReconvergence in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/TargetedReconvergence'])
    );
  });

  it("step 6: convergence/TargetedReconvergence reconverges all stale modules", () => {
    // Node: convergence/TargetedReconvergence (process)
    // Action: reconverges all stale modules
    const step = steps[5];
    expect(step.node).toBe('convergence/TargetedReconvergence');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stale modules');
    expect(node.module).toBe('convergence');
    // Preceded by FindAffectedModules in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/FindAffectedModules'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: _actors/Compiler validates the reconverged graph", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates the reconverged graph
    const step = steps[6];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(7);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    // Preceded by TargetedReconvergence in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/TargetedReconvergence'])
    );
    // Followed by Auditor in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
  });

  it("step 8: _actors/Auditor audits coverage after reconvergence", () => {
    // Node: _actors/Auditor (actor)
    // Action: audits coverage after reconvergence
    const step = steps[7];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(8);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Preceded by Compiler in this journey (same module)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by ConvergenceState in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ConvergenceState'])
    );
  });

  it("step 9: convergence/ConvergenceState records the system is back in sync after the returning owner's trigger", () => {
    // Node: convergence/ConvergenceState (artifact)
    // Action: records the system is back in sync after the returning owner's trigger
    const step = steps[8];
    expect(step.node).toBe('convergence/ConvergenceState');
    expect(step.step_number).toBe(9);

    const node = index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('pipeline step');
    expect(node.module).toBe('convergence');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full returning-owner reconvergence sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ReturningOwner',
      'convergence/ReadSpec',
      'sync/FetchDependencyHash',
      'sync/CompareStoredHash',
      'sync/FindAffectedModules',
      'convergence/TargetedReconvergence',
      '_actors/Compiler',
      '_actors/Auditor',
      'convergence/ConvergenceState',
    ]);
  });

  it("sync pipeline handles staleness detection (steps 3-5), convergence handles recovery (steps 2,6,9)", () => {
    // Sync module detects what changed during absence
    const syncSteps = steps.filter(s => s.node.startsWith('sync/'));
    expect(syncSteps).toHaveLength(3);
    expect(syncSteps.map(s => s.node)).toEqual([
      'sync/FetchDependencyHash',
      'sync/CompareStoredHash',
      'sync/FindAffectedModules',
    ]);
    // Convergence module bookends the recovery
    const convergenceSteps = steps.filter(s => s.node.startsWith('convergence/'));
    expect(convergenceSteps).toHaveLength(3);
    expect(convergenceSteps.map(s => s.node)).toEqual([
      'convergence/ReadSpec',
      'convergence/TargetedReconvergence',
      'convergence/ConvergenceState',
    ]);
  });

  it("validation pair: Compiler then Auditor run sequentially (steps 7-8)", () => {
    const validationSteps = steps.slice(6, 8);
    expect(validationSteps.map(s => s.node)).toEqual([
      '_actors/Compiler',
      '_actors/Auditor',
    ]);
    expect(validationSteps.every(s => s.node.startsWith('_actors/'))).toBe(true);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'convergence', 'sync']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ReturningOwner is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ReturningOwner');
    const node = index.nodes['_actors/ReturningOwner'];
    expect(node.type).toBe('actor');
  });
});
