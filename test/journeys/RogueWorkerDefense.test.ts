// Auto-generated from journey: RogueWorkerDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['RogueWorkerDefense'];
const steps = journey.steps;

describe("RogueWorkerDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'compilation', 'convergence'])
    );
  });

  it("step 1: _actors/RogueWorker produces subtly wrong actor content with hallucinated or phantom actors", () => {
    // Node: _actors/RogueWorker (actor)
    // Action: produces subtly wrong actor content with hallucinated or phantom actors
    const step = steps[0];
    expect(step.node).toBe('_actors/RogueWorker');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('subtly wrong');
    // RogueWorker is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/RogueWorker');
    // Followed by WriteActorsFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 2: actors/WriteActorsFile writes the rogue content to _actors.yaml", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes the rogue content to _actors.yaml
    const step = steps[1];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by RogueWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/RogueWorker'])
    );
    // Followed by ActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 3: actors/ActorsFile contains the hallucinated actors", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: contains the hallucinated actors
    const step = steps[2];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by WriteActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
    // Followed by ValidateActorCoverage in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorCoverage'])
    );
  });

  it("step 4: actors/ValidateActorCoverage checks that every actor appears in at least one journey", () => {
    // Node: actors/ValidateActorCoverage (process)
    // Action: checks that every actor appears in at least one journey
    const step = steps[3];
    expect(step.node).toBe('actors/ValidateActorCoverage');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('at least one journey');
    // Preceded by ActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
    // Followed by OrphanDetection in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/OrphanDetection'])
    );
  });

  it("step 5: compilation/OrphanDetection flags hallucinated actors that no journey references as orphans", () => {
    // Node: compilation/OrphanDetection (process)
    // Action: flags hallucinated actors that no journey references as orphans
    const step = steps[4];
    expect(step.node).toBe('compilation/OrphanDetection');
    expect(step.step_number).toBe(5);

    const node = index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('never referenced');
    expect(node.module).toBe('compilation');
    // Preceded by ValidateActorCoverage in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorCoverage'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: convergence/AuditGapFix targeted fix removes orphan actors that cannot be connected to any journey", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix removes orphan actors that cannot be connected to any journey
    const step = steps[5];
    expect(step.node).toBe('convergence/AuditGapFix');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted');
    expect(node.module).toBe('convergence');
    // Preceded by OrphanDetection in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/OrphanDetection'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full attack-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/RogueWorker',
      'actors/WriteActorsFile',
      'actors/ActorsFile',
      'actors/ValidateActorCoverage',
      'compilation/OrphanDetection',
      'convergence/AuditGapFix',
    ]);
  });

  it("attack path (steps 1-3) leads into defense path (steps 4-6)", () => {
    // Attack: rogue content flows through the write pipeline
    const attackNodes = steps.slice(0, 3).map(s => s.node);
    expect(attackNodes).toEqual([
      '_actors/RogueWorker',
      'actors/WriteActorsFile',
      'actors/ActorsFile',
    ]);
    // Defense: validation detects orphans and fix removes them
    const defenseNodes = steps.slice(3).map(s => s.node);
    expect(defenseNodes).toEqual([
      'actors/ValidateActorCoverage',
      'compilation/OrphanDetection',
      'convergence/AuditGapFix',
    ]);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'compilation', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("RogueWorker is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/RogueWorker');
    const node = index.nodes['_actors/RogueWorker'];
    expect(node.type).toBe('actor');
  });
});
