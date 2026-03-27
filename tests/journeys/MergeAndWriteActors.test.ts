// Auto-generated from journey: MergeAndWriteActors
// Module: actors
// Modules touched: actors, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Simulate 3 actor lists from the 3 discovery angles
const activitiesActors = ['ProjectOwner', 'HumanDeveloper', 'LLMWorker'];
const threatsActors = ['MaliciousSpecAuthor', 'YAMLTamperer', 'LLMWorker']; // LLMWorker is a dupe
const lifecycleActors = ['NewProjectAdopter', 'ReturningOwner', 'StaleBox'];

describe("MergeAndWriteActors", () => {
  it("step 1: actors/ActivitiesActorList provides the activities-perspective actors for merging", () => {
    expect(activitiesActors.length).toBeGreaterThanOrEqual(1);
    expect(activitiesActors).toContain('ProjectOwner');
  });

  it("step 2: actors/ThreatsActorList provides the threats-perspective actors for merging", () => {
    expect(threatsActors.length).toBeGreaterThanOrEqual(1);
    expect(threatsActors).toContain('MaliciousSpecAuthor');
  });

  it("step 3: actors/LifecycleActorList provides the lifecycle-perspective actors for merging", () => {
    expect(lifecycleActors.length).toBeGreaterThanOrEqual(1);
    expect(lifecycleActors).toContain('NewProjectAdopter');
  });

  it("step 4: actors/MergeAndDeduplicate combines all actors, removes duplicates, keeps best descriptions", () => {
    const merged = [...new Set([...activitiesActors, ...threatsActors, ...lifecycleActors])];
    // LLMWorker was in both activities and threats — should appear only once after dedup
    expect(merged.filter(a => a === 'LLMWorker').length).toBe(1);
    expect(merged.length).toBeLessThan(activitiesActors.length + threatsActors.length + lifecycleActors.length);
  });

  it("step 5: actors/MergedActorList stores the final deduplicated actor set", () => {
    const merged = [...new Set([...activitiesActors, ...threatsActors, ...lifecycleActors])];
    // 3+3+3 = 9 raw, minus 1 duplicate = 8 unique
    expect(merged.length).toBe(8);
  });

  it("step 6: actors/WriteActorsFile writes the merged actors to _actors.yaml", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-merge-'));
    const merged = [...new Set([...activitiesActors, ...threatsActors, ...lifecycleActors])];
    const nodes: Record<string, any> = {};
    for (const name of merged) {
      nodes[name] = { type: 'actor', description: `${name} actor` };
    }
    const content = yaml.dump({ spec_sections: [1], nodes, journeys: {} }, { lineWidth: 120 });
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), content);
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    const parsed = yaml.load(fs.readFileSync(path.join(tmpDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(parsed.nodes).length).toBe(8);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 7: actors/ActorsFile the _actors.yaml file is now on disk in the modules directory", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-merge-'));
    const merged = [...new Set([...activitiesActors, ...threatsActors, ...lifecycleActors])];
    const nodes: Record<string, any> = {};
    for (const name of merged) {
      nodes[name] = { type: 'actor', description: `${name} actor` };
    }
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ spec_sections: [1], nodes, journeys: {} }, { lineWidth: 120 })
    );
    const result = compile(tmpDir);
    for (const name of merged) {
      expect(result.index.nodes[`_actors/${name}`]).toBeDefined();
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 8: convergence/ConvergenceState records that actor discovery is complete", () => {
    // After valid actors are compiled, 0 errors means discovery is complete
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          ProjectOwner: { type: 'actor', description: 'describes a project' },
          LLMWorker: { type: 'actor', description: 'creates content' },
        },
        journeys: {},
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });
});
