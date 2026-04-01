// Auto-generated from journey: NewProjectAdoption
// Module: actors
// Triggered by: _actors/NewProjectAdopter
// Modules touched: _actors, convergence, organization, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      NewProjectAdopter: { type: 'actor', description: 'a user who encounters genome8 and wants to try it on their project' },
      ProjectOwner: { type: 'actor', description: 'the human who writes spec.md as the sole input to the system' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ConvergenceCLI: { type: 'interface', description: 'the CLI entry point that receives commands to start or resume convergence' },
      ReadSpec: { type: 'process', description: 'reads the spec.md file from disk as the first pipeline step' },
      ConvergenceState: { type: 'artifact', description: 'JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'analyzes the spec to identify the set of modules the system should have' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['NewProjectAdoption'];

  it("step 1: _actors/NewProjectAdopter encounters genome8 and wants to try it on their project", () => {
    const node = result.index.nodes['_actors/NewProjectAdopter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('NewProjectAdoption'))).toBe(true);
  });

  it("step 2: _actors/ProjectOwner writes their first spec.md describing their system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/NewProjectAdopter');
  });

  it("connection: _actors/NewProjectAdopter → _actors/ProjectOwner", () => {
    const src = result.index.nodes['_actors/NewProjectAdopter'];
    expect(src.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence for the first time", () => {
    const node = result.index.nodes['convergence/ConvergenceCLI'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ConvergenceCLI", () => {
    const src = result.index.nodes['_actors/ProjectOwner'];
    expect(src.followed_by).toContain('convergence/ConvergenceCLI');
  });

  it("step 4: convergence/ReadSpec reads the new project's spec.md", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ConvergenceCLI');
  });

  it("connection: convergence/ConvergenceCLI → convergence/ReadSpec", () => {
    const src = result.index.nodes['convergence/ConvergenceCLI'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 5: organization/IdentifyModules discovers the project's modules from the spec", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → organization/IdentifyModules", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 6: actors/DiscoverFromActivities discovers the project's actors from the activities angle", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['organization/IdentifyModules'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 7: actors/DiscoverFromThreats discovers threat actors relevant to the new project", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 8: actors/DiscoverFromLifecycle discovers lifecycle actors for the new project", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 9: convergence/ConvergenceState tracks the first-time convergence through all pipeline steps", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → convergence/ConvergenceState", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
