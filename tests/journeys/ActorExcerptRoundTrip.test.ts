// Auto-generated from journey: ActorExcerptRoundTrip
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: actors, excerpt, llm, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
    },
  });

  modules.set('excerpt', {
    nodes: {
      CollectReferencedActors: { type: 'process', description: 'gathers actor references needed by the target module domain' },
      CollectTriggeredByActors: { type: 'process', description: 'assembles actor descriptions and their journey participation into excerpt context' },
      AssembleExcerpt: { type: 'process', description: 'assembles the final excerpt including all context sections for the worker' },
      ExcerptOutput: { type: 'artifact', description: 'the assembled excerpt text ready to be sent to the worker as context' },
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
      ValidateActorCoverage: { type: 'process', description: 'checks that every discovered actor appears in at least one journey across all modules' },
    },
    journeys: {
      ActorExcerptRoundTrip: {
        steps: [
          { node: 'ActorsFile', action: 'provides the full validated actor list on disk' },
          { node: 'ProvideActorsForModuleCreation', action: 'extracts actor names and descriptions relevant to the target module' },
          { node: 'excerpt/CollectReferencedActors', action: 'gathers the actor references that the target module journeys use' },
          { node: 'excerpt/CollectTriggeredByActors', action: 'assembles actor descriptions and their journey participation into excerpt context' },
          { node: 'excerpt/AssembleExcerpt', action: 'includes the actor context section in the final module excerpt' },
          { node: 'excerpt/ExcerptOutput', action: 'the assembled excerpt now contains actor names the worker can reference as _actors/ActorName' },
          { node: 'llm/TaskPayload', action: 'packages the excerpt with actor context into the module creation task' },
          { node: '_actors/LLMWorker', action: 'reads the excerpt and writes journey steps referencing _actors/ActorName for discovered actors' },
          { node: 'ValidateActorCoverage', action: 'after all modules are created, checks that every actor appears in at least one journey' },
        ],
      },
    },
  });

  return modules;
}

describe("ActorExcerptRoundTrip", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorExcerptRoundTrip'];

  it("step 1: actors/ActorsFile provides the full validated actor list on disk", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('ActorExcerptRoundTrip'))).toBe(true);
  });

  it("step 2: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ProvideActorsForModuleCreation", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 3: excerpt/CollectReferencedActors gathers the actor references that the target module's journeys use", () => {
    const node = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/CollectReferencedActors", () => {
    const src = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(src.followed_by).toContain('excerpt/CollectReferencedActors');
  });

  it("step 4: excerpt/CollectTriggeredByActors assembles actor descriptions and their journey participation into excerpt context", () => {
    const node = result.index.nodes['excerpt/CollectTriggeredByActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectReferencedActors');
  });

  it("connection: excerpt/CollectReferencedActors → excerpt/CollectTriggeredByActors", () => {
    const src = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(src.followed_by).toContain('excerpt/CollectTriggeredByActors');
  });

  it("step 5: excerpt/AssembleExcerpt includes the actor context section in the final module excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectTriggeredByActors');
  });

  it("connection: excerpt/CollectTriggeredByActors → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['excerpt/CollectTriggeredByActors'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 6: excerpt/ExcerptOutput the assembled excerpt now contains actor names the worker can reference as _actors/ActorName", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/ExcerptOutput", () => {
    const src = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(src.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 7: llm/TaskPayload packages the excerpt with actor context into the module creation task", () => {
    const node = result.index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → llm/TaskPayload", () => {
    const src = result.index.nodes['excerpt/ExcerptOutput'];
    expect(src.followed_by).toContain('llm/TaskPayload');
  });

  it("step 8: _actors/LLMWorker reads the excerpt and writes journey steps referencing _actors/ActorName for discovered actors", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/TaskPayload');
  });

  it("connection: llm/TaskPayload → _actors/LLMWorker", () => {
    const src = result.index.nodes['llm/TaskPayload'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/ValidateActorCoverage after all modules are created, checks that every actor appears in at least one journey", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/ValidateActorCoverage", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
