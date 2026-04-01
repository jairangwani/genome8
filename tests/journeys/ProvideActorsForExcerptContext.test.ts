// Auto-generated from journey: ProvideActorsForExcerptContext
// Module: actors
// Modules touched: convergence, actors, excerpt, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      ModuleCreation: { type: 'process', description: 'creates each module by assembling an excerpt and delegating to the LLM worker' },
    },
  });

  modules.set('excerpt', {
    nodes: {
      CollectReferencedActors: { type: 'process', description: 'gathers actor references needed by the target module domain' },
      AssembleExcerpt: { type: 'process', description: 'assembles the final excerpt including all context sections for the worker' },
    },
  });

  modules.set('llm', {
    nodes: {
      TaskPayload: { type: 'artifact', description: 'the complete task payload sent to the LLM worker including excerpt and instructions' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
      ProvideActorsForModuleCreation: { type: 'process', description: 'supplies the actor list to the excerpt generator so module workers know which _actors/ references are valid' },
    },
    journeys: {
      ProvideActorsForExcerptContext: {
        steps: [
          { node: 'convergence/ModuleCreation', action: 'begins creating a module and requests an excerpt for context' },
          { node: 'ActorsFile', action: 'provides the full actor list as context source' },
          { node: 'ProvideActorsForModuleCreation', action: 'extracts actor names and descriptions relevant to the target module' },
          { node: 'excerpt/CollectReferencedActors', action: 'gathers actor references needed by the target module domain' },
          { node: 'excerpt/AssembleExcerpt', action: 'includes the relevant actors in the excerpt so the worker can reference them' },
          { node: 'llm/TaskPayload', action: 'packages the excerpt including actor context into the creation task' },
        ],
      },
    },
  });

  return modules;
}

describe("ProvideActorsForExcerptContext", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsForExcerptContext'];

  it("step 1: convergence/ModuleCreation begins creating a module and requests an excerpt for context", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('ProvideActorsForExcerptContext'))).toBe(true);
  });

  it("step 2: actors/ActorsFile provides the full actor list as context source", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → actors/ActorsFile", () => {
    const src = result.index.nodes['convergence/ModuleCreation'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 3: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ProvideActorsForModuleCreation", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 4: excerpt/CollectReferencedActors gathers actor references needed by the target module's domain", () => {
    const node = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/CollectReferencedActors", () => {
    const src = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(src.followed_by).toContain('excerpt/CollectReferencedActors');
  });

  it("step 5: excerpt/AssembleExcerpt includes the relevant actors in the excerpt so the worker can reference them", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectReferencedActors');
  });

  it("connection: excerpt/CollectReferencedActors → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 6: llm/TaskPayload packages the excerpt including actor context into the creation task", () => {
    const node = result.index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → llm/TaskPayload", () => {
    const src = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(src.followed_by).toContain('llm/TaskPayload');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
