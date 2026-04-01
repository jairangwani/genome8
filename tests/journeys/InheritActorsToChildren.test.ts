// Auto-generated from journey: InheritActorsToChildren
// Module: actors
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, actors, hierarchy

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildInheritModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: includes ParentEngine + ChildEngine actors plus inherited actors
  modules.set('_actors', {
    nodes: {
      ParentEngine: { type: 'actor', description: 'The parent engine that discovered actors' },
      ChildEngine: { type: 'actor', description: 'A child engine that receives inherited actors' },
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec' },
      HumanDeveloper: { type: 'actor', description: 'Developer who builds the system' },
    },
    journeys: {},
  });

  // actors module: inheritance processes
  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'The _actors.yaml file on disk' },
      ParentDiscoversChildrenInherit: { type: 'rule', description: 'Enforces that children inherit actors rather than re-discovering' },
      InheritActorsFromParent: { type: 'process', description: 'Copies _actors.yaml into the child engine directory' },
    },
    journeys: {
      InheritActorsToChildren: {
        steps: [
          { node: '_actors/ParentEngine', action: 'has completed actor discovery and is preparing child engines' },
          { node: 'ActorsFile', action: 'provides the parent _actors.yaml for distribution' },
          { node: 'ParentDiscoversChildrenInherit', action: 'enforces that children inherit actors rather than re-discovering' },
          { node: 'InheritActorsFromParent', action: 'copies _actors.yaml into the child engine directory' },
          { node: 'hierarchy/DistributeSharedActors', action: 'places the shared actors in each child modules directory' },
          { node: '_actors/ChildEngine', action: 'receives the inherited actors and uses them during its own convergence' },
        ],
      },
    },
  });

  // hierarchy module: distribution process
  modules.set('hierarchy', {
    nodes: {
      DistributeSharedActors: { type: 'process', description: 'Places the shared actors in each child modules directory' },
    },
    journeys: {},
  });

  return modules;
}

describe("InheritActorsToChildren", () => {
  const modules = buildInheritModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['InheritActorsToChildren'];

  it("step 1: _actors/ParentEngine has completed actor discovery and is preparing child engines", () => {
    const node = result.index.nodes['_actors/ParentEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: actors/ActorsFile provides the parent's _actors.yaml for distribution", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/ParentEngine');
  });

  it("connection: _actors/ParentEngine → actors/ActorsFile", () => {
    const from = result.index.nodes['_actors/ParentEngine'];
    const to = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ActorsFile');
    expect(to.preceded_by).toContain('_actors/ParentEngine');
  });

  it("step 3: actors/ParentDiscoversChildrenInherit enforces that children inherit actors rather than re-discovering", () => {
    const node = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ParentDiscoversChildrenInherit", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("step 4: actors/InheritActorsFromParent copies _actors.yaml into the child engine directory", () => {
    const node = result.index.nodes['actors/InheritActorsFromParent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("connection: actors/ParentDiscoversChildrenInherit → actors/InheritActorsFromParent", () => {
    const from = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(from.followed_by).toContain('actors/InheritActorsFromParent');
  });

  it("step 5: hierarchy/DistributeSharedActors places the shared actors in each child's modules directory", () => {
    const node = result.index.nodes['hierarchy/DistributeSharedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/InheritActorsFromParent');
  });

  it("connection: actors/InheritActorsFromParent → hierarchy/DistributeSharedActors", () => {
    const from = result.index.nodes['actors/InheritActorsFromParent'];
    expect(from.followed_by).toContain('hierarchy/DistributeSharedActors');
  });

  it("step 6: _actors/ChildEngine receives the inherited actors and uses them during its own convergence", () => {
    const node = result.index.nodes['_actors/ChildEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('hierarchy/DistributeSharedActors');
  });

  it("connection: hierarchy/DistributeSharedActors → _actors/ChildEngine", () => {
    const from = result.index.nodes['hierarchy/DistributeSharedActors'];
    expect(from.followed_by).toContain('_actors/ChildEngine');
  });

  it("journey actor is ParentEngine (first actor in steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.actor).toBe('_actors/ParentEngine');
  });

  it("inherited actor nodes exist alongside parent/child actors", () => {
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/HumanDeveloper']).toBeDefined();
    expect(result.index.nodes['_actors/ProjectOwner'].type).toBe('actor');
    expect(result.index.nodes['_actors/HumanDeveloper'].type).toBe('actor');
  });

  it("triggered_by_actors is populated for nodes in the journey", () => {
    const node = result.index.nodes['actors/InheritActorsFromParent'];
    expect(node.triggered_by_actors).toContain('_actors/ParentEngine');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
