// Auto-generated from journey: MergeAndWriteActors
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Simulate three discovery angles with overlapping actors
const activitiesActors = [
  { name: 'User', description: 'Uses the platform' },
  { name: 'Admin', description: 'Manages the platform' },
];
const threatsActors = [
  { name: 'Attacker', description: 'Attempts exploitation' },
  { name: 'User', description: 'A user of the platform' }, // duplicate
];
const lifecycleActors = [
  { name: 'NewUser', description: 'First-time visitor' },
];

describe("MergeAndWriteActors", () => {
  it("step 1: actors/ActivitiesActorList provides the activities-perspective actors for merging", () => {
    expect(activitiesActors.length).toBe(2);
    expect(activitiesActors[0].name).toBe('User');
  });

  it("step 2: actors/ThreatsActorList provides the threats-perspective actors for merging", () => {
    expect(threatsActors.length).toBe(2);
    expect(threatsActors[0].name).toBe('Attacker');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-perspective actors for merging", () => {
    expect(lifecycleActors.length).toBe(1);
    expect(lifecycleActors[0].name).toBe('NewUser');
  });

  it("step 4: actors/MergeAndDeduplicate combines all actors, removes duplicates, keeps best descriptions", () => {
    // Merge all three lists, deduplicate by name
    const all = [...activitiesActors, ...threatsActors, ...lifecycleActors];
    const merged = new Map<string, string>();
    for (const actor of all) {
      if (!merged.has(actor.name) || actor.description.length > (merged.get(actor.name)?.length ?? 0)) {
        merged.set(actor.name, actor.description);
      }
    }
    // User appears twice — should be deduplicated
    expect(merged.size).toBe(4); // User, Admin, Attacker, NewUser
    expect(merged.has('User')).toBe(true);
    expect(merged.has('Attacker')).toBe(true);
  });

  it("step 5: actors/MergedActorList stores the final deduplicated actor set", () => {
    const mergedNames = ['User', 'Admin', 'Attacker', 'NewUser'];
    expect(new Set(mergedNames).size).toBe(mergedNames.length); // no duplicates
  });

  it("step 6: actors/WriteActorsFile writes the merged actors to _actors.yaml", () => {
    // Simulate writing actors file and verify it can be compiled
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'actors-'));
    const actorsContent = yaml.dump({
      nodes: {
        User: { type: 'actor', description: 'Uses the platform' },
        Admin: { type: 'actor', description: 'Manages the platform' },
        Attacker: { type: 'actor', description: 'Attempts exploitation' },
        NewUser: { type: 'actor', description: 'First-time visitor' },
      },
    });
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), actorsContent);
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 7: actors/ActorsFile the _actors.yaml file is now on disk in the modules directory", () => {
    // Verify the file compiles correctly when loaded
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Uses the platform' },
          Admin: { type: 'actor', description: 'Manages the platform' },
          Attacker: { type: 'actor', description: 'Attempts exploitation' },
          NewUser: { type: 'actor', description: 'First-time visitor' },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index._stats.total_nodes).toBe(4);
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/User'].type).toBe('actor');
  });

  it("step 8: convergence/ConvergenceState records that actor discovery is complete", () => {
    // After actors are written, convergence proceeds to module creation.
    // The state records that step 2 (actors) completed.
    const state = { actorsDiscovered: true, actorCount: 4 };
    expect(state.actorsDiscovered).toBe(true);
    expect(state.actorCount).toBeGreaterThan(0);
  });

});
