// Auto-generated from journey: InheritActorsToChildren
// Module: actors
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, actors, hierarchy

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ParentEngine: { type: 'actor', description: 'the top-level convergence engine that discovers actors and delegates to children' },
      ChildEngine: { type: 'actor', description: 'a child convergence engine that inherits actors from the parent' },
    },
  });

  modules.set('hierarchy', {
    nodes: {
      DistributeSharedActors: { type: 'process', description: 'places the shared actors in each child engine modules directory' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
      ParentDiscoversChildrenInherit: { type: 'rule', description: 'only the parent engine discovers actors — children inherit them to prevent duplication' },
      InheritActorsFromParent: { type: 'process', description: 'copies the parent _actors.yaml into a child engine directory so children share the same actor set' },
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

  return modules;
}

describe("InheritActorsToChildren", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['InheritActorsToChildren'];

  it("step 1: _actors/ParentEngine has completed actor discovery and is preparing child engines", () => {
    const node = result.index.nodes['_actors/ParentEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('InheritActorsToChildren'))).toBe(true);
  });

  it("step 2: actors/ActorsFile provides the parent's _actors.yaml for distribution", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/ParentEngine');
  });

  it("connection: _actors/ParentEngine → actors/ActorsFile", () => {
    const src = result.index.nodes['_actors/ParentEngine'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 3: actors/ParentDiscoversChildrenInherit enforces that children inherit actors rather than re-discovering", () => {
    const node = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ParentDiscoversChildrenInherit", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("step 4: actors/InheritActorsFromParent copies _actors.yaml into the child engine directory", () => {
    const node = result.index.nodes['actors/InheritActorsFromParent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("connection: actors/ParentDiscoversChildrenInherit → actors/InheritActorsFromParent", () => {
    const src = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(src.followed_by).toContain('actors/InheritActorsFromParent');
  });

  it("step 5: hierarchy/DistributeSharedActors places the shared actors in each child's modules directory", () => {
    const node = result.index.nodes['hierarchy/DistributeSharedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/InheritActorsFromParent');
  });

  it("connection: actors/InheritActorsFromParent → hierarchy/DistributeSharedActors", () => {
    const src = result.index.nodes['actors/InheritActorsFromParent'];
    expect(src.followed_by).toContain('hierarchy/DistributeSharedActors');
  });

  it("step 6: _actors/ChildEngine receives the inherited actors and uses them during its own convergence", () => {
    const node = result.index.nodes['_actors/ChildEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('hierarchy/DistributeSharedActors');
  });

  it("connection: hierarchy/DistributeSharedActors → _actors/ChildEngine", () => {
    const src = result.index.nodes['hierarchy/DistributeSharedActors'];
    expect(src.followed_by).toContain('_actors/ChildEngine');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
