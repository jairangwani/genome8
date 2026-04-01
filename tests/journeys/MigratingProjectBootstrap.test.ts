// Auto-generated from journey: MigratingProjectBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, organization, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts

function buildMigrationModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'Has existing documentation and code that needs to be captured in the graph' },
      ProjectOwner: { type: 'actor', description: 'Writes a spec.md summarizing the existing system' },
      LLMWorker: { type: 'actor', description: 'Analyzes existing artifacts to inform module creation' },
      Compiler: { type: 'actor', description: 'Validates that the bootstrapped graph is consistent' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'Reads the migration spec' },
      ModuleCreation: { type: 'process', description: 'Creates modules that capture the existing system structure' },
    },
    journeys: {},
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'Discovers modules that map to the existing system components' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Reports any gaps between the spec and the bootstrapped modules' },
    },
    journeys: {
      MigratingProjectBootstrap: {
        steps: [
          { node: '_actors/MigratingProject', action: 'has existing documentation and code that needs to be captured in the graph' },
          { node: '_actors/ProjectOwner', action: 'writes a spec.md summarizing the existing system' },
          { node: 'convergence/ReadSpec', action: 'reads the migration spec' },
          { node: 'organization/IdentifyModules', action: 'discovers modules that map to the existing system components' },
          { node: '_actors/LLMWorker', action: 'analyzes existing artifacts to inform module creation with pre-existing context' },
          { node: 'convergence/ModuleCreation', action: 'creates modules that capture the existing system structure' },
          { node: '_actors/Compiler', action: 'validates that the bootstrapped graph is consistent' },
          { node: 'CompilationResult', action: 'reports any gaps between the spec and the bootstrapped modules' },
        ],
      },
    },
  });

  return modules;
}

describe("MigratingProjectBootstrap", () => {
  const modules = buildMigrationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectBootstrap'];

  it("step 1: _actors/MigratingProject has existing documentation and code that needs to be captured in the graph", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: _actors/ProjectOwner writes a spec.md summarizing the existing system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/ProjectOwner", () => {
    const from = result.index.nodes['_actors/MigratingProject'];
    expect(from.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ReadSpec reads the migration spec", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const from = result.index.nodes['_actors/ProjectOwner'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 4: organization/IdentifyModules discovers modules that map to the existing system's components", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → organization/IdentifyModules", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 5: _actors/LLMWorker analyzes existing artifacts to inform module creation with pre-existing context", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → _actors/LLMWorker", () => {
    const from = result.index.nodes['organization/IdentifyModules'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 6: convergence/ModuleCreation creates modules that capture the existing system's structure", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → convergence/ModuleCreation", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 7: _actors/Compiler validates that the bootstrapped graph is consistent", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → _actors/Compiler", () => {
    const from = result.index.nodes['convergence/ModuleCreation'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 8: compilation/CompilationResult reports any gaps between the spec and the bootstrapped modules", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey covers full migration pipeline (8 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(8);
    expect(journey.steps[0].node).toBe('_actors/MigratingProject');
    expect(journey.steps[7].node).toBe('compilation/CompilationResult');
  });

  it("journey actor is MigratingProject (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/MigratingProject');
  });

  it("triggered_by_actors propagates through the migration pipeline", () => {
    const readSpec = result.index.nodes['convergence/ReadSpec'];
    expect(readSpec.triggered_by_actors).toContain('_actors/MigratingProject');
  });

  it("compilation produces zero errors for clean migration modules", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("all actor nodes have correct type", () => {
    for (const name of ['MigratingProject', 'ProjectOwner', 'LLMWorker', 'Compiler']) {
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
  });
});
