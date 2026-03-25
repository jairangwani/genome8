// Auto-generated from journey: EndToEndActorDiscoveryToModuleCreation
// Module: actors
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence, actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['EndToEndActorDiscoveryToModuleCreation'];
const steps = journey.steps;

describe("EndToEndActorDiscoveryToModuleCreation", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(15);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'convergence', 'actors', 'graph', 'excerpt'])
    );
  });

  it("step 1: _actors/ProjectOwner has written spec.md describing their system", () => {
    // Node: _actors/ProjectOwner (actor)
    // Action: has written spec.md describing their system
    const step = steps[0];
    expect(step.node).toBe('_actors/ProjectOwner');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // ProjectOwner is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/ProjectOwner');
    // Followed by ReadSpec in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
  });

  it("step 2: convergence/ReadSpec reads the spec from disk", () => {
    // Node: convergence/ReadSpec (process)
    // Action: reads the spec from disk
    const step = steps[1];
    expect(step.node).toBe('convergence/ReadSpec');
    expect(step.step_number).toBe(2);

    const node = index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Preceded by ProjectOwner in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ProjectOwner'])
    );
    // Followed by WriteOrganization in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/WriteOrganization'])
    );
  });

  it("step 3: convergence/WriteOrganization organization step produces the module list", () => {
    // Node: convergence/WriteOrganization (process)
    // Action: organization step produces the module list
    const step = steps[2];
    expect(step.node).toBe('convergence/WriteOrganization');
    expect(step.step_number).toBe(3);

    const node = index.nodes['convergence/WriteOrganization'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Preceded by ReadSpec in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    // Followed by DiscoverActors in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/DiscoverActors'])
    );
  });

  it("step 4: convergence/DiscoverActors triggers actor discovery after organization is complete", () => {
    // Node: convergence/DiscoverActors (process)
    // Action: triggers actor discovery after organization is complete
    const step = steps[3];
    expect(step.node).toBe('convergence/DiscoverActors');
    expect(step.step_number).toBe(4);

    const node = index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Preceded by WriteOrganization in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/WriteOrganization'])
    );
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 5: actors/DiscoverFromActivities discovers activity actors from the spec", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: discovers activity actors from the spec
    const step = steps[4];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    // Preceded by DiscoverActors in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/DiscoverActors'])
    );
    // Followed by DiscoverFromThreats in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
  });

  it("step 6: actors/DiscoverFromThreats discovers threat actors from the spec", () => {
    // Node: actors/DiscoverFromThreats (process)
    // Action: discovers threat actors from the spec
    const step = steps[5];
    expect(step.node).toBe('actors/DiscoverFromThreats');
    expect(step.step_number).toBe(6);

    const node = index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('threat');
    // Preceded by DiscoverFromActivities in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    // Followed by DiscoverFromLifecycle in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
  });

  it("step 7: actors/DiscoverFromLifecycle discovers lifecycle actors from the spec", () => {
    // Node: actors/DiscoverFromLifecycle (process)
    // Action: discovers lifecycle actors from the spec
    const step = steps[6];
    expect(step.node).toBe('actors/DiscoverFromLifecycle');
    expect(step.step_number).toBe(7);

    const node = index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('lifecycle');
    // Preceded by DiscoverFromThreats in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromThreats'])
    );
    // Followed by MergeAndDeduplicate in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
  });

  it("step 8: actors/MergeAndDeduplicate merges and deduplicates actors from all 3 angles", () => {
    // Node: actors/MergeAndDeduplicate (process)
    // Action: merges and deduplicates actors from all 3 angles
    const step = steps[7];
    expect(step.node).toBe('actors/MergeAndDeduplicate');
    expect(step.step_number).toBe(8);

    const node = index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicates');
    // Preceded by DiscoverFromLifecycle in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromLifecycle'])
    );
    // Followed by WriteActorsFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 9: actors/WriteActorsFile writes _actors.yaml to disk", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes _actors.yaml to disk
    const step = steps[8];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(9);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by MergeAndDeduplicate in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/MergeAndDeduplicate'])
    );
    // Followed by ValidateActorYAMLStructure in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
  });

  it("step 10: actors/ValidateActorYAMLStructure validates the written file has correct structure", () => {
    // Node: actors/ValidateActorYAMLStructure (process)
    // Action: validates the written file has correct structure
    const step = steps[9];
    expect(step.node).toBe('actors/ValidateActorYAMLStructure');
    expect(step.step_number).toBe(10);

    const node = index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('type actor');
    // Preceded by WriteActorsFile in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 11: _actors/Compiler compiles _actors.yaml into the graph alongside module files", () => {
    // Node: _actors/Compiler (actor)
    // Action: compiles _actors.yaml into the graph alongside module files
    const step = steps[10];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(11);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Preceded by ValidateActorYAMLStructure in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ValidateActorYAMLStructure'])
    );
    // Followed by NodeRegistry in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/NodeRegistry'])
    );
  });

  it("step 12: graph/NodeRegistry registers actor nodes so journey steps can reference _actors/ActorName", () => {
    // Node: graph/NodeRegistry (artifact)
    // Action: registers actor nodes so journey steps can reference _actors/ActorName
    const step = steps[11];
    expect(step.node).toBe('graph/NodeRegistry');
    expect(step.step_number).toBe(12);

    const node = index.nodes['graph/NodeRegistry'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.module).toBe('graph');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by ModuleCreation in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ModuleCreation'])
    );
    // Cross-module connections from _actors and convergence
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 13: convergence/ModuleCreation begins creating modules with actors available as valid references", () => {
    // Node: convergence/ModuleCreation (process)
    // Action: begins creating modules with actors available as valid references
    const step = steps[12];
    expect(step.node).toBe('convergence/ModuleCreation');
    expect(step.step_number).toBe(13);

    const node = index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Preceded by NodeRegistry in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/NodeRegistry'])
    );
    // Followed by ProvideActorsForModuleCreation in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/ProvideActorsForModuleCreation'])
    );
  });

  it("step 14: actors/ProvideActorsForModuleCreation supplies the actor list to each module's excerpt context", () => {
    // Node: actors/ProvideActorsForModuleCreation (process)
    // Action: supplies the actor list to each module's excerpt context
    const step = steps[13];
    expect(step.node).toBe('actors/ProvideActorsForModuleCreation');
    expect(step.step_number).toBe(14);

    const node = index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('actors');
    // Preceded by ModuleCreation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ModuleCreation'])
    );
    // Followed by AssembleExcerpt in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['excerpt/AssembleExcerpt'])
    );
  });

  it("step 15: excerpt/AssembleExcerpt includes relevant actors in the module creation excerpt", () => {
    // Node: excerpt/AssembleExcerpt (process)
    // Action: includes relevant actors in the module creation excerpt
    const step = steps[14];
    expect(step.node).toBe('excerpt/AssembleExcerpt');
    expect(step.step_number).toBe(15);

    const node = index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('excerpt');
    // Preceded by ProvideActorsForModuleCreation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/ProvideActorsForModuleCreation'])
    );
    // Cross-module connection from actors
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full end-to-end node sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ProjectOwner',
      'convergence/ReadSpec',
      'convergence/WriteOrganization',
      'convergence/DiscoverActors',
      'actors/DiscoverFromActivities',
      'actors/DiscoverFromThreats',
      'actors/DiscoverFromLifecycle',
      'actors/MergeAndDeduplicate',
      'actors/WriteActorsFile',
      'actors/ValidateActorYAMLStructure',
      '_actors/Compiler',
      'graph/NodeRegistry',
      'convergence/ModuleCreation',
      'actors/ProvideActorsForModuleCreation',
      'excerpt/AssembleExcerpt',
    ]);
  });

  it("three discovery angles run sequentially: activities → threats → lifecycle", () => {
    const activitiesIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromActivities');
    const threatsIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromThreats');
    const lifecycleIdx = steps.findIndex(s => s.node === 'actors/DiscoverFromLifecycle');

    expect(activitiesIdx).toBeLessThan(threatsIdx);
    expect(threatsIdx).toBeLessThan(lifecycleIdx);
  });

  it("has three phases: convergence setup, actor discovery, compilation and module creation", () => {
    // Phase 1: convergence setup (steps 1-4)
    const phase1Modules = steps.slice(0, 4).map(s => s.node.split('/')[0]);
    expect(phase1Modules).toEqual(['_actors', 'convergence', 'convergence', 'convergence']);

    // Phase 2: actor discovery pipeline (steps 5-10) — all in actors module
    const phase2Steps = steps.slice(4, 10);
    expect(phase2Steps.every(s => s.node.startsWith('actors/'))).toBe(true);

    // Phase 3: compilation and module creation (steps 11-15) — crosses multiple modules
    const phase3Modules = new Set(steps.slice(10).map(s => s.node.split('/')[0]));
    expect(phase3Modules).toEqual(new Set(['_actors', 'graph', 'convergence', 'actors', 'excerpt']));
  });

  it("crosses 5 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'convergence', 'actors', 'graph', 'excerpt']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ProjectOwner is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ProjectOwner');
    const node = index.nodes['_actors/ProjectOwner'];
    expect(node.type).toBe('actor');
  });
});
