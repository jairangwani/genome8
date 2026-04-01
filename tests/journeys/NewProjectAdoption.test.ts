// Auto-generated from journey: NewProjectAdoption
// Module: actors
// Triggered by: _actors/NewProjectAdopter
// Modules touched: _actors, convergence, organization, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/cli.ts
// Implementation: src/convergence.ts

function buildAdoptionModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      NewProjectAdopter: { type: 'actor', description: 'Encounters genome8 and wants to try it on their project' },
      ProjectOwner: { type: 'actor', description: 'Writes their first spec.md describing their system' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceCLI: { type: 'interface', description: 'Receives the command to start convergence' },
      ReadSpec: { type: 'process', description: 'Reads the new project spec.md' },
      ConvergenceState: { type: 'artifact', description: 'Tracks convergence through all pipeline steps' },
    },
    journeys: {},
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'Discovers the project modules from the spec' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Discovers the project actors from the activities angle' },
      DiscoverFromThreats: { type: 'process', description: 'Discovers threat actors relevant to the new project' },
      DiscoverFromLifecycle: { type: 'process', description: 'Discovers lifecycle actors for the new project' },
    },
    journeys: {
      NewProjectAdoption: {
        steps: [
          { node: '_actors/NewProjectAdopter', action: 'encounters genome8 and wants to try it on their project' },
          { node: '_actors/ProjectOwner', action: 'writes their first spec.md describing their system' },
          { node: 'convergence/ConvergenceCLI', action: 'receives the command to start convergence for the first time' },
          { node: 'convergence/ReadSpec', action: 'reads the new project spec.md' },
          { node: 'organization/IdentifyModules', action: 'discovers the project modules from the spec' },
          { node: 'DiscoverFromActivities', action: 'discovers the project actors from the activities angle' },
          { node: 'DiscoverFromThreats', action: 'discovers threat actors relevant to the new project' },
          { node: 'DiscoverFromLifecycle', action: 'discovers lifecycle actors for the new project' },
          { node: 'convergence/ConvergenceState', action: 'tracks the first-time convergence through all pipeline steps' },
        ],
      },
    },
  });

  return modules;
}

describe("NewProjectAdoption", () => {
  const modules = buildAdoptionModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['NewProjectAdoption'];

  it("step 1: _actors/NewProjectAdopter encounters genome8 and wants to try it on their project", () => {
    const node = result.index.nodes['_actors/NewProjectAdopter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: _actors/ProjectOwner writes their first spec.md describing their system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/NewProjectAdopter');
  });

  it("connection: _actors/NewProjectAdopter → _actors/ProjectOwner", () => {
    const from = result.index.nodes['_actors/NewProjectAdopter'];
    expect(from.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence for the first time", () => {
    const node = result.index.nodes['convergence/ConvergenceCLI'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ConvergenceCLI", () => {
    const from = result.index.nodes['_actors/ProjectOwner'];
    expect(from.followed_by).toContain('convergence/ConvergenceCLI');
  });

  it("step 4: convergence/ReadSpec reads the new project's spec.md", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ConvergenceCLI');
  });

  it("connection: convergence/ConvergenceCLI → convergence/ReadSpec", () => {
    const from = result.index.nodes['convergence/ConvergenceCLI'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 5: organization/IdentifyModules discovers the project's modules from the spec", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → organization/IdentifyModules", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 6: actors/DiscoverFromActivities discovers the project's actors from the activities angle", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['organization/IdentifyModules'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 7: actors/DiscoverFromThreats discovers threat actors relevant to the new project", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 8: actors/DiscoverFromLifecycle discovers lifecycle actors for the new project", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 9: convergence/ConvergenceState tracks the first-time convergence through all pipeline steps", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → convergence/ConvergenceState", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers the full adoption pipeline (9 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(9);
    expect(journey.steps[0].node).toBe('_actors/NewProjectAdopter');
    expect(journey.steps[8].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is NewProjectAdopter (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/NewProjectAdopter');
  });

  it("triggered_by_actors propagates from NewProjectAdopter through the pipeline", () => {
    const readSpec = result.index.nodes['convergence/ReadSpec'];
    expect(readSpec.triggered_by_actors).toContain('_actors/NewProjectAdopter');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
