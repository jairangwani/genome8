// Auto-generated from journey: ProvideActorsForExcerptContext
// Module: actors
// Modules touched: convergence, actors, excerpt, llm

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ProvideActorsForExcerptContext'];
const steps = journey.steps;

describe("ProvideActorsForExcerptContext", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['convergence', 'actors', 'excerpt', 'llm'])
    );
  });

  it("step 1: convergence/ModuleCreation begins creating a module and requests an excerpt for context", () => {
    // Node: convergence/ModuleCreation (process)
    // Action: begins creating a module and requests an excerpt for context
    const step = steps[0];
    expect(step.node).toBe('convergence/ModuleCreation');
    expect(step.step_number).toBe(1);

    const node = index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Followed by ActorsFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
  });

  it("step 2: actors/ActorsFile provides the full actor list as context source", () => {
    // Node: actors/ActorsFile (artifact)
    // Action: provides the full actor list as context source
    const step = steps[1];
    expect(step.node).toBe('actors/ActorsFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by ModuleCreation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ModuleCreation'])
    );
    // Followed by ProvideActorsForModuleCreation in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ProvideActorsForModuleCreation'])
    );
    // Cross-module artifact referenced from convergence
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    // Node: actors/ProvideActorsForModuleCreation (process)
    // Action: extracts actor names and descriptions relevant to the target module
    const step = steps[2];
    expect(step.node).toBe('actors/ProvideActorsForModuleCreation');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('actors');
    // Preceded by ActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ActorsFile'])
    );
    // Followed by CollectReferencedActors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/CollectReferencedActors'])
    );
  });

  it("step 4: excerpt/CollectReferencedActors gathers actor references needed by the target module's domain", () => {
    // Node: excerpt/CollectReferencedActors (process)
    // Action: gathers actor references needed by the target module's domain
    const step = steps[3];
    expect(step.node).toBe('excerpt/CollectReferencedActors');
    expect(step.step_number).toBe(4);

    const node = index.nodes['excerpt/CollectReferencedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('excerpt');
    // Preceded by ProvideActorsForModuleCreation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ProvideActorsForModuleCreation'])
    );
    // Followed by AssembleExcerpt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/AssembleExcerpt'])
    );
    // Cross-module connection from actors → excerpt
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: excerpt/AssembleExcerpt includes the relevant actors in the excerpt so the worker can reference them", () => {
    // Node: excerpt/AssembleExcerpt (process)
    // Action: includes the relevant actors in the excerpt so the worker can reference them
    const step = steps[4];
    expect(step.node).toBe('excerpt/AssembleExcerpt');
    expect(step.step_number).toBe(5);

    const node = index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('excerpt');
    // Preceded by CollectReferencedActors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/CollectReferencedActors'])
    );
    // Followed by TaskPayload in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['llm/TaskPayload'])
    );
  });

  it("step 6: llm/TaskPayload packages the excerpt including actor context into the creation task", () => {
    // Node: llm/TaskPayload (artifact)
    // Action: packages the excerpt including actor context into the creation task
    const step = steps[5];
    expect(step.node).toBe('llm/TaskPayload');
    expect(step.step_number).toBe(6);

    const node = index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('llm');
    // Preceded by AssembleExcerpt in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['excerpt/AssembleExcerpt'])
    );
    // TaskPayload is a cross-module artifact referenced from excerpt
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms a linear pipeline: trigger → file → extract → collect → assemble → package", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'convergence/ModuleCreation',
      'actors/ActorsFile',
      'actors/ProvideActorsForModuleCreation',
      'excerpt/CollectReferencedActors',
      'excerpt/AssembleExcerpt',
      'llm/TaskPayload',
    ]);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['convergence', 'actors', 'excerpt', 'llm']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("no actor triggers this journey — it is a data pipeline, not actor-initiated", () => {
    // No actor-type node appears in the steps
    expect(journey.actor).toBeNull();
  });
});
