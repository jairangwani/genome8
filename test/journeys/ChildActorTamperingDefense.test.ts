// Auto-generated from journey: ChildActorTamperingDefense
// Module: actors
// Triggered by: _actors/ChildEngine
// Modules touched: _actors, actors, compilation, hierarchy

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ChildActorTamperingDefense'];
const steps = journey.steps;

describe("ChildActorTamperingDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(9);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation', 'hierarchy'])
    );
  });

  it("step 1: _actors/ChildEngine receives inherited _actors.yaml from the parent engine", () => {
    // Node: _actors/ChildEngine (actor)
    // Action: receives inherited _actors.yaml from the parent engine
    const step = steps[0];
    expect(step.node).toBe('_actors/ChildEngine');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ChildEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('inherited');
    // ChildEngine is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/ChildEngine');
    // Followed by InheritActorsFromParent in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/InheritActorsFromParent'])
    );
  });

  it("step 2: actors/InheritActorsFromParent copies the parent's _actors.yaml with a known content hash", () => {
    // Node: actors/InheritActorsFromParent (process)
    // Action: copies the parent's _actors.yaml with a known content hash
    const step = steps[1];
    expect(step.node).toBe('actors/InheritActorsFromParent');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/InheritActorsFromParent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('parent');
    expect(node.module).toBe('actors');
    // Preceded by ChildEngine in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ChildEngine'])
    );
    // Followed by RogueWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/RogueWorker'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: _actors/RogueWorker modifies the child's _actors.yaml to add unauthorized actors or alter descriptions", () => {
    // Node: _actors/RogueWorker (actor)
    // Action: modifies the child's _actors.yaml to add unauthorized actors or alter descriptions
    const step = steps[2];
    expect(step.node).toBe('_actors/RogueWorker');
    expect(step.step_number).toBe(3);

    const node = index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('subtly wrong');
    // Preceded by InheritActorsFromParent in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/InheritActorsFromParent'])
    );
    // Followed by DetectChildActorTampering in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DetectChildActorTampering'])
    );
  });

  it("step 4: actors/DetectChildActorTampering computes the hash of the child's current _actors.yaml content", () => {
    // Node: actors/DetectChildActorTampering (process)
    // Action: computes the hash of the child's current _actors.yaml content
    const step = steps[3];
    expect(step.node).toBe('actors/DetectChildActorTampering');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/DetectChildActorTampering'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('unauthorized');
    expect(node.module).toBe('actors');
    // Preceded by RogueWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/RogueWorker'])
    );
    // Followed by ParentDiscoversChildrenInherit in this journey
    // (steps 4→5→6 are same node, edge is from step 6→7)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ParentDiscoversChildrenInherit'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: actors/DetectChildActorTampering compares the child hash against the parent's original hash", () => {
    // Node: actors/DetectChildActorTampering (process)
    // Action: compares the child hash against the parent's original hash
    const step = steps[4];
    expect(step.node).toBe('actors/DetectChildActorTampering');
    expect(step.step_number).toBe(5);

    // Same node as step 4, appearing three times to model three-phase detection
    const node = index.nodes['actors/DetectChildActorTampering'];
    expect(node.description).toContain('parent');
  });

  it("step 6: actors/DetectChildActorTampering detects the mismatch and flags the child's _actors.yaml as tampered", () => {
    // Node: actors/DetectChildActorTampering (process)
    // Action: detects the mismatch and flags the child's _actors.yaml as tampered
    const step = steps[5];
    expect(step.node).toBe('actors/DetectChildActorTampering');
    expect(step.step_number).toBe(6);

    // Same node as steps 4 and 5
    const node = index.nodes['actors/DetectChildActorTampering'];
    expect(node.description).toContain('detect');
  });

  it("step 7: actors/ParentDiscoversChildrenInherit confirms the rule violation since children must not modify inherited actors", () => {
    // Node: actors/ParentDiscoversChildrenInherit (rule)
    // Action: confirms the rule violation since children must not modify inherited actors
    const step = steps[6];
    expect(step.node).toBe('actors/ParentDiscoversChildrenInherit');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('inherit');
    expect(node.module).toBe('actors');
    // Preceded by DetectChildActorTampering in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DetectChildActorTampering'])
    );
    // Followed by ErrorReport in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
  });

  it("step 8: compilation/ErrorReport records the tampering as a validation error with the specific differences found", () => {
    // Node: compilation/ErrorReport (artifact)
    // Action: records the tampering as a validation error with the specific differences found
    const step = steps[7];
    expect(step.node).toBe('compilation/ErrorReport');
    expect(step.step_number).toBe(8);

    const node = index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('validation errors');
    expect(node.module).toBe('compilation');
    // Preceded by ParentDiscoversChildrenInherit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ParentDiscoversChildrenInherit'])
    );
    // Followed by ValidateCrossEngineRefs in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['hierarchy/ValidateCrossEngineRefs'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: hierarchy/ValidateCrossEngineRefs blocks the child's compilation result from merging into the parent until the tampering is resolved", () => {
    // Node: hierarchy/ValidateCrossEngineRefs (process)
    // Action: blocks the child's compilation result from merging into the parent until the tampering is resolved
    const step = steps[8];
    expect(step.node).toBe('hierarchy/ValidateCrossEngineRefs');
    expect(step.step_number).toBe(9);

    const node = index.nodes['hierarchy/ValidateCrossEngineRefs'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('external refs');
    expect(node.module).toBe('hierarchy');
    // Preceded by ErrorReport in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full tampering-then-detection sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ChildEngine',
      'actors/InheritActorsFromParent',
      '_actors/RogueWorker',
      'actors/DetectChildActorTampering',
      'actors/DetectChildActorTampering',
      'actors/DetectChildActorTampering',
      'actors/ParentDiscoversChildrenInherit',
      'compilation/ErrorReport',
      'hierarchy/ValidateCrossEngineRefs',
    ]);
  });

  it("setup phase establishes inheritance (steps 1-2), attack tampers (step 3), detection catches it (steps 4-7), reporting blocks merge (steps 8-9)", () => {
    // Setup: child engine receives inherited actors
    expect(steps[0].node).toBe('_actors/ChildEngine');
    expect(steps[1].node).toBe('actors/InheritActorsFromParent');
    // Attack: rogue worker tampers
    expect(steps[2].node).toBe('_actors/RogueWorker');
    // Detection: three-phase tampering detection + rule confirmation
    const detectionSteps = steps.slice(3, 7);
    expect(detectionSteps.every(s => s.node.startsWith('actors/'))).toBe(true);
    // Reporting and blocking
    expect(steps[7].node).toBe('compilation/ErrorReport');
    expect(steps[8].node).toBe('hierarchy/ValidateCrossEngineRefs');
  });

  it("DetectChildActorTampering appears three times for three-phase detection (hash, compare, flag)", () => {
    const tamperingSteps = steps.filter(s => s.node === 'actors/DetectChildActorTampering');
    expect(tamperingSteps).toHaveLength(3);
    expect(tamperingSteps[0].step_number).toBe(4);
    expect(tamperingSteps[1].step_number).toBe(5);
    expect(tamperingSteps[2].step_number).toBe(6);
  });

  it("actors module handles both inheritance and detection (5 of 9 steps)", () => {
    const actorsSteps = steps.filter(s => s.node.startsWith('actors/'));
    expect(actorsSteps).toHaveLength(5);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation', 'hierarchy']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ChildEngine is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ChildEngine');
    const node = index.nodes['_actors/ChildEngine'];
    expect(node.type).toBe('actor');
  });
});
