// Auto-generated from journey: MigratingProjectBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, organization, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'an existing project with documentation and code that needs to be captured in the graph' },
      ProjectOwner: { type: 'actor', description: 'the human who writes spec.md as the sole input to the system' },
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'reads the spec.md file from disk as the first pipeline step' },
      ModuleCreation: { type: 'process', description: 'creates each module by assembling an excerpt and delegating to the LLM worker' },
    },
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'analyzes the spec to identify the set of modules the system should have' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the final compilation output containing the index, issues, and coverage report' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectBootstrap'];

  it("step 1: _actors/MigratingProject has existing documentation and code that needs to be captured in the graph", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('MigratingProjectBootstrap'))).toBe(true);
  });

  it("step 2: _actors/ProjectOwner writes a spec.md summarizing the existing system", () => {
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/ProjectOwner", () => {
    const src = result.index.nodes['_actors/MigratingProject'];
    expect(src.followed_by).toContain('_actors/ProjectOwner');
  });

  it("step 3: convergence/ReadSpec reads the migration spec", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("connection: _actors/ProjectOwner → convergence/ReadSpec", () => {
    const src = result.index.nodes['_actors/ProjectOwner'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 4: organization/IdentifyModules discovers modules that map to the existing system's components", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → organization/IdentifyModules", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 5: _actors/LLMWorker analyzes existing artifacts to inform module creation with pre-existing context", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → _actors/LLMWorker", () => {
    const src = result.index.nodes['organization/IdentifyModules'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 6: convergence/ModuleCreation creates modules that capture the existing system's structure", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → convergence/ModuleCreation", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('convergence/ModuleCreation');
  });

  it("step 7: _actors/Compiler validates that the bootstrapped graph is consistent", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → _actors/Compiler", () => {
    const src = result.index.nodes['convergence/ModuleCreation'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 8: compilation/CompilationResult reports any gaps between the spec and the bootstrapped modules", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
