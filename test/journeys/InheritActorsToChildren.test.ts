// Auto-generated from journey: InheritActorsToChildren
// Module: actors
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, actors, hierarchy

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['InheritActorsToChildren'];
const steps = journey.steps;

describe("InheritActorsToChildren", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'actors', 'hierarchy'])
    );
  });

  it("step 1: _actors/ParentEngine has completed actor discovery and is preparing child engines", () => {
    // Node: _actors/ParentEngine (actor)
    // Action: has completed actor discovery and is preparing child engines
    const step = steps[0];
    expect(step.node).toBe('_actors/ParentEngine');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ParentEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // ParentEngine is the journey trigger (first actor node encountered)
    expect(journey.actor).toBe('_actors/ParentEngine');
    // Followed by ActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 2: actors/ActorsFile provides the parent's _actors.yaml for distribution", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: provides the parent's _actors.yaml for distribution
    const step = steps[1];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by ParentEngine in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ParentEngine'])
    );
    // Followed by ParentDiscoversChildrenInherit in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ParentDiscoversChildrenInherit'])
    );
    // ActorsFile is referenced across multiple modules
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/ParentDiscoversChildrenInherit enforces that children inherit actors rather than re-discovering", () => {
    // Node: actors/ParentDiscoversChildrenInherit (rule)
    // Action: enforces that children inherit actors rather than re-discovering
    const step = steps[2];
    expect(step.node).toBe('actors/ParentDiscoversChildrenInherit');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('inherit');
    // Preceded by ActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
    // Followed by InheritActorsFromParent in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/InheritActorsFromParent'])
    );
  });

  it("step 4: actors/InheritActorsFromParent copies _actors.yaml into the child engine directory", () => {
    // Node: actors/InheritActorsFromParent (process)
    // Action: copies _actors.yaml into the child engine directory
    const step = steps[3];
    expect(step.node).toBe('actors/InheritActorsFromParent');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/InheritActorsFromParent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('child');
    // Preceded by ParentDiscoversChildrenInherit in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ParentDiscoversChildrenInherit'])
    );
    // Followed by hierarchy/DistributeSharedActors (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['hierarchy/DistributeSharedActors'])
    );
  });

  it("step 5: hierarchy/DistributeSharedActors places the shared actors in each child's modules directory", () => {
    // Node: hierarchy/DistributeSharedActors (process)
    // Action: places the shared actors in each child's modules directory
    const step = steps[4];
    expect(step.node).toBe('hierarchy/DistributeSharedActors');
    expect(step.step_number).toBe(5);

    const node = index.nodes['hierarchy/DistributeSharedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    expect(node.module).toBe('hierarchy');
    // Preceded by InheritActorsFromParent in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/InheritActorsFromParent'])
    );
    // Followed by ChildEngine in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/ChildEngine'])
    );
    // Cross-module connections from actors→hierarchy and hierarchy→_actors edges
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: _actors/ChildEngine receives the inherited actors and uses them during its own convergence", () => {
    // Node: _actors/ChildEngine (actor)
    // Action: receives the inherited actors and uses them during its own convergence
    const step = steps[5];
    expect(step.node).toBe('_actors/ChildEngine');
    expect(step.step_number).toBe(6);

    const node = index.nodes['_actors/ChildEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.module).toBe('_actors');
    // Preceded by DistributeSharedActors in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['hierarchy/DistributeSharedActors'])
    );
    // ChildEngine has cross-module connections
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms a linear pipeline: parent → file → rule → copy → distribute → child", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ParentEngine',
      'actors/ActorsFile',
      'actors/ParentDiscoversChildrenInherit',
      'actors/InheritActorsFromParent',
      'hierarchy/DistributeSharedActors',
      '_actors/ChildEngine',
    ]);
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'actors', 'hierarchy']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ParentEngine is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ParentEngine');
    const node = index.nodes['_actors/ParentEngine'];
    expect(node.type).toBe('actor');
  });
});
