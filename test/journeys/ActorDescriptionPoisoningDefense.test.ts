// Auto-generated from journey: ActorDescriptionPoisoningDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ActorDescriptionPoisoningDefense'];
const steps = journey.steps;

describe("ActorDescriptionPoisoningDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(9);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation', 'convergence'])
    );
  });

  it("step 1: _actors/MaliciousSpecAuthor crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments", () => {
    // Node: _actors/MaliciousSpecAuthor (actor)
    // Action: crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments
    const step = steps[0];
    expect(step.node).toBe('_actors/MaliciousSpecAuthor');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('adversarial');
    // MaliciousSpecAuthor is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 2: actors/DiscoverFromActivities extracts actors whose descriptions carry the embedded adversarial payload", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: extracts actors whose descriptions carry the embedded adversarial payload
    const step = steps[1];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    expect(node.module).toBe('actors');
    // Preceded by MaliciousSpecAuthor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/MaliciousSpecAuthor'])
    );
    // Followed by MergeAndDeduplicate in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/MergeAndDeduplicate merges the poisoned actors into the final set without content filtering", () => {
    // Node: actors/MergeAndDeduplicate (process)
    // Action: merges the poisoned actors into the final set without content filtering
    const step = steps[2];
    expect(step.node).toBe('actors/MergeAndDeduplicate');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicates');
    expect(node.module).toBe('actors');
    // Preceded by DiscoverFromActivities in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    // Followed by WriteActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 4: actors/WriteActorsFile writes the poisoned descriptions to _actors.yaml", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes the poisoned descriptions to _actors.yaml
    const step = steps[3];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    expect(node.module).toBe('actors');
    // Preceded by MergeAndDeduplicate in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
    // Followed by DetectActorDescriptionPoisoning in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DetectActorDescriptionPoisoning'])
    );
  });

  it("step 5: actors/DetectActorDescriptionPoisoning scans each actor description for known adversarial patterns such as instruction overrides or encoded payloads", () => {
    // Node: actors/DetectActorDescriptionPoisoning (process)
    // Action: scans each actor description for known adversarial patterns such as instruction overrides or encoded payloads
    const step = steps[4];
    expect(step.node).toBe('actors/DetectActorDescriptionPoisoning');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('adversarial');
    expect(node.module).toBe('actors');
    // Preceded by WriteActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
    // Followed by ValidateActorYAMLStructure in this journey
    // (steps 5→6 are same node, edge is from step 6→7)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
  });

  it("step 6: actors/DetectActorDescriptionPoisoning flags descriptions exceeding the maximum length threshold as potential payload carriers", () => {
    // Node: actors/DetectActorDescriptionPoisoning (process)
    // Action: flags descriptions exceeding the maximum length threshold as potential payload carriers
    const step = steps[5];
    expect(step.node).toBe('actors/DetectActorDescriptionPoisoning');
    expect(step.step_number).toBe(6);

    // Same node as step 5, appearing twice to model two-phase scanning
    const node = index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node.description).toContain('prompt injection');
  });

  it("step 7: actors/ValidateActorYAMLStructure rejects actors whose descriptions fail the poisoning check", () => {
    // Node: actors/ValidateActorYAMLStructure (process)
    // Action: rejects actors whose descriptions fail the poisoning check
    const step = steps[6];
    expect(step.node).toBe('actors/ValidateActorYAMLStructure');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    expect(node.module).toBe('actors');
    // Preceded by DetectActorDescriptionPoisoning in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DetectActorDescriptionPoisoning'])
    );
    // Followed by ErrorReport in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
  });

  it("step 8: compilation/ErrorReport records each flagged description with the specific adversarial pattern detected", () => {
    // Node: compilation/ErrorReport (artifact)
    // Action: records each flagged description with the specific adversarial pattern detected
    const step = steps[7];
    expect(step.node).toBe('compilation/ErrorReport');
    expect(step.step_number).toBe(8);

    const node = index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('validation errors');
    expect(node.module).toBe('compilation');
    // Preceded by ValidateActorYAMLStructure in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: convergence/AuditGapFix targeted fix sanitizes or removes the poisoned actor descriptions", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix sanitizes or removes the poisoned actor descriptions
    const step = steps[8];
    expect(step.node).toBe('convergence/AuditGapFix');
    expect(step.step_number).toBe(9);

    const node = index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted');
    expect(node.module).toBe('convergence');
    // Preceded by ErrorReport in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full poisoning-then-detection sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/MaliciousSpecAuthor',
      'actors/DiscoverFromActivities',
      'actors/MergeAndDeduplicate',
      'actors/WriteActorsFile',
      'actors/DetectActorDescriptionPoisoning',
      'actors/DetectActorDescriptionPoisoning',
      'actors/ValidateActorYAMLStructure',
      'compilation/ErrorReport',
      'convergence/AuditGapFix',
    ]);
  });

  it("attack propagates through actor pipeline (steps 1-4), defense detects and reports (steps 5-8), fix resolves (step 9)", () => {
    // Attack: poisoned spec flows through discovery, merge, and write
    const attackSteps = steps.slice(0, 4);
    expect(attackSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('actors/')
    )).toBe(true);
    // Defense: poisoning detection, structure validation, error report
    const defenseSteps = steps.slice(4, 8);
    expect(defenseSteps.every(s =>
      s.node.startsWith('actors/') || s.node.startsWith('compilation/')
    )).toBe(true);
    // Fix: audit gap fix
    expect(steps[8].node).toBe('convergence/AuditGapFix');
  });

  it("DetectActorDescriptionPoisoning appears twice for two-phase scanning (pattern scan then length check)", () => {
    const poisoningSteps = steps.filter(s => s.node === 'actors/DetectActorDescriptionPoisoning');
    expect(poisoningSteps).toHaveLength(2);
    expect(poisoningSteps[0].step_number).toBe(5);
    expect(poisoningSteps[1].step_number).toBe(6);
  });

  it("actors module dominates the journey with 6 of 9 steps", () => {
    const actorsSteps = steps.filter(s => s.node.startsWith('actors/'));
    expect(actorsSteps).toHaveLength(6);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("MaliciousSpecAuthor is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node.type).toBe('actor');
  });
});
