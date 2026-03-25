// Auto-generated from journey: HashCollisionDefense
// Module: actors
// Triggered by: _actors/HashCollisionExploiter
// Modules touched: _actors, publish, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['HashCollisionDefense'];
const steps = journey.steps;

describe("HashCollisionDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'publish', 'convergence'])
    );
  });

  it("step 1: _actors/HashCollisionExploiter manipulates content to produce identical SHA256 hashes", () => {
    // Node: _actors/HashCollisionExploiter (actor)
    // Action: manipulates content to produce identical SHA256 hashes
    const step = steps[0];
    expect(step.node).toBe('_actors/HashCollisionExploiter');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/HashCollisionExploiter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('SHA256');
    // HashCollisionExploiter is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/HashCollisionExploiter');
    // Followed by ComputeInterfaceHash in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['publish/ComputeInterfaceHash'])
    );
  });

  it("step 2: publish/ComputeInterfaceHash computes hash on the manipulated content", () => {
    // Node: publish/ComputeInterfaceHash (process)
    // Action: computes hash on the manipulated content
    const step = steps[1];
    expect(step.node).toBe('publish/ComputeInterfaceHash');
    expect(step.step_number).toBe(2);

    const node = index.nodes['publish/ComputeInterfaceHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('SHA256');
    expect(node.module).toBe('publish');
    // Preceded by HashCollisionExploiter in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/HashCollisionExploiter'])
    );
    // Followed by ComparePreviousHash in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['publish/ComparePreviousHash'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: publish/ComparePreviousHash compares and incorrectly finds no change due to collision", () => {
    // Node: publish/ComparePreviousHash (process)
    // Action: compares and incorrectly finds no change due to collision
    const step = steps[2];
    expect(step.node).toBe('publish/ComparePreviousHash');
    expect(step.step_number).toBe(3);

    const node = index.nodes['publish/ComparePreviousHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('hash');
    expect(node.module).toBe('publish');
    // Preceded by ComputeInterfaceHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['publish/ComputeInterfaceHash'])
    );
    // Followed by SkipPublishIfUnchanged in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['publish/SkipPublishIfUnchanged'])
    );
  });

  it("step 4: publish/SkipPublishIfUnchanged incorrectly skips publish, missing the real change", () => {
    // Node: publish/SkipPublishIfUnchanged (process)
    // Action: incorrectly skips publish, missing the real change
    const step = steps[3];
    expect(step.node).toBe('publish/SkipPublishIfUnchanged');
    expect(step.step_number).toBe(4);

    const node = index.nodes['publish/SkipPublishIfUnchanged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('aborts');
    expect(node.module).toBe('publish');
    // Preceded by ComparePreviousHash in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['publish/ComparePreviousHash'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
  });

  it("step 5: _actors/Auditor detects the coverage gap during depth audit because spec content diverges from graph", () => {
    // Node: _actors/Auditor (actor)
    // Action: detects the coverage gap during depth audit because spec content diverges from graph
    const step = steps[4];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(5);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    // Preceded by SkipPublishIfUnchanged in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['publish/SkipPublishIfUnchanged'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
  });

  it("step 6: convergence/AuditGapFix targeted fix forces a re-publish of the affected interface", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix forces a re-publish of the affected interface
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

  it("journey forms the full exploit-then-recovery sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/HashCollisionExploiter',
      'publish/ComputeInterfaceHash',
      'publish/ComparePreviousHash',
      'publish/SkipPublishIfUnchanged',
      '_actors/Auditor',
      'convergence/AuditGapFix',
    ]);
  });

  it("exploit bypasses publish (steps 1-4), audit detects and fixes (steps 5-6)", () => {
    // Exploit: hash collision causes publish to be skipped
    const exploitSteps = steps.slice(0, 4);
    expect(exploitSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('publish/')
    )).toBe(true);
    // Recovery: auditor catches the gap and triggers a fix
    const recoverySteps = steps.slice(4);
    expect(recoverySteps.map(s => s.node)).toEqual([
      '_actors/Auditor',
      'convergence/AuditGapFix',
    ]);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'publish', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("HashCollisionExploiter is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/HashCollisionExploiter');
    const node = index.nodes['_actors/HashCollisionExploiter'];
    expect(node.type).toBe('actor');
  });
});
