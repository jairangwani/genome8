// Auto-generated from journey: StaleBoxRecovery
// Module: actors
// Triggered by: _actors/StaleBox
// Modules touched: _actors, events, sync, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['StaleBoxRecovery'];
const steps = journey.steps;

describe("StaleBoxRecovery", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(7);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'events', 'sync', 'convergence'])
    );
  });

  it("step 1: _actors/StaleBox has stopped watching events and drifted out of sync", () => {
    // Node: _actors/StaleBox (actor)
    // Action: has stopped watching events and drifted out of sync
    const step = steps[0];
    expect(step.node).toBe('_actors/StaleBox');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/StaleBox'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('watcher');
    // StaleBox is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/StaleBox');
    // Followed by RegisterEventWatchers in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['events/RegisterEventWatchers'])
    );
  });

  it("step 2: events/RegisterEventWatchers re-registers fs.watch watchers on dependency event files", () => {
    // Node: events/RegisterEventWatchers (process)
    // Action: re-registers fs.watch watchers on dependency event files
    const step = steps[1];
    expect(step.node).toBe('events/RegisterEventWatchers');
    expect(step.step_number).toBe(2);

    const node = index.nodes['events/RegisterEventWatchers'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fs.watch');
    expect(node.module).toBe('events');
    // Preceded by StaleBox in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/StaleBox'])
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
    // Preceded by RegisterEventWatchers in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['events/RegisterEventWatchers'])
    );
    // Followed by CompareStoredHash in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: sync/CompareStoredHash finds multiple hashes have changed during the stale period", () => {
    // Node: sync/CompareStoredHash (process)
    // Action: finds multiple hashes have changed during the stale period
    const step = steps[3];
    expect(step.node).toBe('sync/CompareStoredHash');
    expect(step.step_number).toBe(4);

    const node = index.nodes['sync/CompareStoredHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('hash');
    // Preceded by FetchDependencyHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/FetchDependencyHash'])
    );
    // Followed by FindAffectedModules in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/FindAffectedModules'])
    );
  });

  it("step 5: sync/FindAffectedModules identifies all modules affected by the accumulated changes", () => {
    // Node: sync/FindAffectedModules (process)
    // Action: identifies all modules affected by the accumulated changes
    const step = steps[4];
    expect(step.node).toBe('sync/FindAffectedModules');
    expect(step.step_number).toBe(5);

    const node = index.nodes['sync/FindAffectedModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stale');
    // Preceded by CompareStoredHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/CompareStoredHash'])
    );
    // Followed by MarkModulesStale in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['sync/MarkModulesStale'])
    );
  });

  it("step 6: sync/MarkModulesStale marks all affected modules for reconvergence", () => {
    // Node: sync/MarkModulesStale (process)
    // Action: marks all affected modules for reconvergence
    const step = steps[5];
    expect(step.node).toBe('sync/MarkModulesStale');
    expect(step.step_number).toBe(6);

    const node = index.nodes['sync/MarkModulesStale'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stale markers');
    expect(node.module).toBe('sync');
    // Preceded by FindAffectedModules in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/FindAffectedModules'])
    );
    // Followed by TargetedReconvergence in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/TargetedReconvergence'])
    );
  });

  it("step 7: convergence/TargetedReconvergence reconverges all stale modules to bring the box back in sync", () => {
    // Node: convergence/TargetedReconvergence (process)
    // Action: reconverges all stale modules to bring the box back in sync
    const step = steps[6];
    expect(step.node).toBe('convergence/TargetedReconvergence');
    expect(step.step_number).toBe(7);

    const node = index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Preceded by MarkModulesStale in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['sync/MarkModulesStale'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full recovery sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/StaleBox',
      'events/RegisterEventWatchers',
      'sync/FetchDependencyHash',
      'sync/CompareStoredHash',
      'sync/FindAffectedModules',
      'sync/MarkModulesStale',
      'convergence/TargetedReconvergence',
    ]);
  });

  it("recovery pipeline: re-watch → fetch → compare → find affected → mark stale → reconverge", () => {
    // Events module re-establishes watchers (step 2)
    const eventsSteps = steps.filter(s => s.node.startsWith('events/'));
    expect(eventsSteps).toHaveLength(1);
    // Sync module handles hash comparison and stale marking (steps 3-6)
    const syncSteps = steps.filter(s => s.node.startsWith('sync/'));
    expect(syncSteps).toHaveLength(4);
    // Convergence module reconverges (step 7)
    const convergenceSteps = steps.filter(s => s.node.startsWith('convergence/'));
    expect(convergenceSteps).toHaveLength(1);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'events', 'sync', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("StaleBox is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/StaleBox');
    const node = index.nodes['_actors/StaleBox'];
    expect(node.type).toBe('actor');
  });
});
