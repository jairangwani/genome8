// Auto-generated from journey: ProvideActorsForExcerptContext
// Module: actors
// Modules touched: convergence, actors, excerpt, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/excerpt.ts

function buildExcerptModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: actors that trigger journeys
  modules.set('_actors', {
    nodes: {
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec' },
      HumanDeveloper: { type: 'actor', description: 'Developer who builds the system' },
    },
    journeys: {},
  });

  // convergence module
  modules.set('convergence', {
    nodes: {
      ModuleCreation: { type: 'process', description: 'Creates new modules from organization and spec' },
    },
    journeys: {},
  });

  // actors module: provides actors for context
  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'The full actor list as context source' },
      ProvideActorsForModuleCreation: { type: 'process', description: 'Extracts actor names and descriptions relevant to the target module' },
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
      // A journey that uses actors so triggered_by_actors is populated
      SampleJourneyWithActor: {
        steps: [
          { node: '_actors/ProjectOwner', action: 'initiates module creation' },
          { node: 'convergence/ModuleCreation', action: 'creates the module' },
          { node: 'ProvideActorsForModuleCreation', action: 'provides actor context' },
        ],
      },
    },
  });

  // excerpt module
  modules.set('excerpt', {
    nodes: {
      CollectReferencedActors: { type: 'process', description: 'Gathers actor references needed by the target module domain' },
      AssembleExcerpt: { type: 'process', description: 'Assembles the final excerpt including actors, nodes, journeys' },
    },
    journeys: {},
  });

  // llm module
  modules.set('llm', {
    nodes: {
      TaskPayload: { type: 'artifact', description: 'The packaged task sent to the LLM worker' },
    },
    journeys: {},
  });

  return modules;
}

describe("ProvideActorsForExcerptContext", () => {
  const modules = buildExcerptModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsForExcerptContext'];

  it("step 1: convergence/ModuleCreation begins creating a module and requests an excerpt for context", () => {
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: actors/ActorsFile provides the full actor list as context source", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ModuleCreation');
  });

  it("connection: convergence/ModuleCreation → actors/ActorsFile", () => {
    const from = result.index.nodes['convergence/ModuleCreation'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("step 3: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ProvideActorsForModuleCreation", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 4: excerpt/CollectReferencedActors gathers actor references needed by the target module's domain", () => {
    const node = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/CollectReferencedActors", () => {
    const from = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(from.followed_by).toContain('excerpt/CollectReferencedActors');
  });

  it("step 5: excerpt/AssembleExcerpt includes the relevant actors in the excerpt so the worker can reference them", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectReferencedActors');
  });

  it("connection: excerpt/CollectReferencedActors → excerpt/AssembleExcerpt", () => {
    const from = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(from.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 6: llm/TaskPayload packages the excerpt including actor context into the creation task", () => {
    const node = result.index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → llm/TaskPayload", () => {
    const from = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(from.followed_by).toContain('llm/TaskPayload');
  });

  it("excerpt includes triggered_by actors from _actors module", () => {
    // Nodes in a journey triggered by an actor get triggered_by_actors populated
    const node = result.index.nodes['convergence/ModuleCreation'];
    expect(node.triggered_by_actors).toContain('_actors/ProjectOwner');

    // generateExcerpt should include TRIGGERED BY section
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'actors',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: '',
    });
    expect(excerpt).toContain('TRIGGERED BY');
    expect(excerpt).toContain('ProjectOwner');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
