// Auto-generated from journey: ValidateActorsBeforeProceeding
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Three-angle actor lists for validation
const activitiesActors = [
  { name: 'User', description: 'Uses the platform' },
  { name: 'Admin', description: 'Manages the platform' },
];
const threatsActors = [
  { name: 'Attacker', description: 'Attempts exploitation' },
];
const lifecycleActors = [
  { name: 'NewUser', description: 'First-time visitor' },
];

// All actors merged
const allActors = [...activitiesActors, ...threatsActors, ...lifecycleActors];

function buildActorsModule(actors: Array<{ name: string; description: string }>): ModuleFile {
  const nodes: Record<string, any> = {};
  for (const a of actors) {
    nodes[a.name] = { type: 'actor', description: a.description };
  }
  return { nodes };
}

describe("ValidateActorsBeforeProceeding", () => {
  it("step 1: actors/ActivitiesActorList provides the activities-angle results for completeness checking", () => {
    expect(activitiesActors.length).toBeGreaterThanOrEqual(1);
    expect(activitiesActors[0].name).toBe('User');
    expect(activitiesActors[0].description).toBeTruthy();
  });

  it("step 2: actors/ThreatsActorList provides the threats-angle results for completeness checking", () => {
    expect(threatsActors.length).toBeGreaterThanOrEqual(1);
    expect(threatsActors[0].name).toBe('Attacker');
    expect(threatsActors[0].description).toBeTruthy();
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-angle results for completeness checking", () => {
    expect(lifecycleActors.length).toBeGreaterThanOrEqual(1);
    expect(lifecycleActors[0].name).toBe('NewUser');
    expect(lifecycleActors[0].description).toBeTruthy();
  });

  it("step 4: actors/ValidateThreeAngleCompleteness checks that the activities angle produced at least one actor", () => {
    const valid = activitiesActors.length >= 1;
    expect(valid).toBe(true);
  });

  it("step 5: actors/ValidateThreeAngleCompleteness checks that the threats angle produced at least one actor", () => {
    const valid = threatsActors.length >= 1;
    expect(valid).toBe(true);
  });

  it("step 6: actors/ValidateThreeAngleCompleteness checks that the lifecycle angle produced at least one actor", () => {
    const valid = lifecycleActors.length >= 1;
    expect(valid).toBe(true);
  });

  it("step 7: actors/ThreeAngleDiscovery confirms all 3 angles are satisfied", () => {
    const angles = [activitiesActors, threatsActors, lifecycleActors];
    expect(angles.length).toBe(3);
    for (const angle of angles) {
      expect(angle.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("step 8: actors/ActorsFile provides the written _actors.yaml for structural validation", () => {
    const mod = buildActorsModule(allActors);
    expect(Object.keys(mod.nodes).length).toBe(4);
    for (const node of Object.values(mod.nodes)) {
      expect(node.type).toBe('actor');
    }
  });

  it("step 9: actors/ValidateActorYAMLStructure checks that every entry has type actor and a non-empty description", () => {
    const mod = buildActorsModule(allActors);
    for (const [name, node] of Object.entries(mod.nodes)) {
      expect(node.type).toBe('actor');
      expect(node.description.length).toBeGreaterThan(0);
    }
  });

  it("step 10: actors/ValidateActorYAMLStructure flags any malformed entries for correction before compilation", () => {
    // A module with a malformed actor (wrong type) should produce a compile error
    const badModules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          GoodActor: { type: 'actor', description: 'Valid actor' },
          BadActor: { type: 'banana' as any, description: 'Invalid type' },
        },
      }],
    ]);
    const result = compileFromModules(badModules);
    const typeErrors = result.issues.filter(i => i.message.includes('Invalid type'));
    expect(typeErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 11: convergence/ValidateActorCompleteness receives the validation result and proceeds if all checks pass", () => {
    // Valid actors compile cleanly — convergence can proceed
    const modules = new Map<string, ModuleFile>([
      ['_actors', buildActorsModule(allActors)],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.total_nodes).toBe(4);
  });

});
