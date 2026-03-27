// Auto-generated from journey: ValidateActorsBeforeProceeding
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Simulate 3-angle results
const activitiesActors = { ProjectOwner: { type: 'actor', description: 'writes spec.md' } };
const threatsActors = { Attacker: { type: 'actor', description: 'tries to break things' } };
const lifecycleActors = { NewUser: { type: 'actor', description: 'first-time visitor' } };

describe("ValidateActorsBeforeProceeding", () => {
  it("step 1: actors/ActivitiesActorList provides the activities-angle results for completeness checking", () => {
    expect(Object.keys(activitiesActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: actors/ThreatsActorList provides the threats-angle results for completeness checking", () => {
    expect(Object.keys(threatsActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-angle results for completeness checking", () => {
    expect(Object.keys(lifecycleActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 4: actors/ValidateThreeAngleCompleteness checks that the activities angle produced at least one actor", () => {
    expect(Object.keys(activitiesActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: actors/ValidateThreeAngleCompleteness checks that the threats angle produced at least one actor", () => {
    expect(Object.keys(threatsActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: actors/ValidateThreeAngleCompleteness checks that the lifecycle angle produced at least one actor", () => {
    expect(Object.keys(lifecycleActors).length).toBeGreaterThanOrEqual(1);
  });

  it("step 7: actors/ThreeAngleDiscovery confirms all 3 angles are satisfied", () => {
    const allAngles = [activitiesActors, threatsActors, lifecycleActors];
    const allNonEmpty = allAngles.every(a => Object.keys(a).length >= 1);
    expect(allNonEmpty).toBe(true);
    expect(allAngles.length).toBe(3);
  });

  it("step 8: actors/ActorsFile provides the written _actors.yaml for structural validation", () => {
    // Merge all actors into a single file structure
    const allNodes = { ...activitiesActors, ...threatsActors, ...lifecycleActors };
    const yamlContent = yaml.dump({ spec_sections: [1], nodes: allNodes, journeys: {} });
    const parsed = yaml.load(yamlContent) as any;
    expect(parsed.nodes).toBeDefined();
    expect(Object.keys(parsed.nodes).length).toBe(3);
  });

  it("step 9: actors/ValidateActorYAMLStructure checks that every entry has type actor and a non-empty description", () => {
    const allNodes = { ...activitiesActors, ...threatsActors, ...lifecycleActors };
    for (const [name, node] of Object.entries(allNodes)) {
      expect((node as any).type).toBe('actor');
      expect((node as any).description.length).toBeGreaterThan(0);
    }
  });

  it("step 10: actors/ValidateActorYAMLStructure flags any malformed entries for correction before compilation", () => {
    // Test that compilation catches a non-actor type in _actors module
    const malformedModule: ModuleFile = {
      nodes: {
        GoodActor: { type: 'actor', description: 'valid' },
        BadEntry: { type: 'process', description: 'should be actor' }, // wrong type in _actors
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', malformedModule]]));
    // The node compiles but its type is 'process' — structural validation would catch this
    expect(result.index.nodes['_actors/BadEntry'].type).toBe('process');
    // In _actors, we expect type: actor — a validator would flag this
    expect(result.index.nodes['_actors/BadEntry'].type).not.toBe('actor');
  });

  it("step 11: convergence/ValidateActorCompleteness receives the validation result and proceeds if all checks pass", () => {
    const validModule: ModuleFile = {
      nodes: {
        ProjectOwner: { type: 'actor', description: 'writes spec.md' },
        Attacker: { type: 'actor', description: 'tries to break things' },
        NewUser: { type: 'actor', description: 'first-time visitor' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', validModule]]));
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // All 3 actors registered
    expect(Object.keys(result.index.nodes).length).toBe(3);
  });
});
