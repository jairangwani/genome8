// Auto-generated from journey: ActorExcerptRoundTrip
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: actors, excerpt, llm, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/excerpt.ts

function buildExcerptRoundTripModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'Reads the excerpt and writes journey steps referencing _actors/ActorName for discovered actors' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'Provides the full validated actor list on disk' },
      ProvideActorsForModuleCreation: { type: 'process', description: 'Extracts actor names and descriptions relevant to the target module' },
      ValidateActorCoverage: { type: 'process', description: 'After all modules are created, checks that every actor appears in at least one journey' },
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

  modules.set('excerpt', {
    nodes: {
      CollectReferencedActors: { type: 'process', description: 'Gathers the actor references that the target module journeys use' },
      CollectTriggeredByActors: { type: 'process', description: 'Assembles actor descriptions and their journey participation into excerpt context' },
      AssembleExcerpt: { type: 'process', description: 'Includes the actor context section in the final module excerpt' },
      ExcerptOutput: { type: 'artifact', description: 'The assembled excerpt now contains actor names the worker can reference as _actors/ActorName' },
    },
    journeys: {},
  });

  modules.set('llm', {
    nodes: {
      TaskPayload: { type: 'artifact', description: 'Packages the excerpt with actor context into the module creation task' },
    },
    journeys: {},
  });

  return modules;
}

describe("ActorExcerptRoundTrip", () => {
  const modules = buildExcerptRoundTripModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorExcerptRoundTrip'];

  it("step 1: actors/ActorsFile provides the full validated actor list on disk", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    const node = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ProvideActorsForModuleCreation", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("step 3: excerpt/CollectReferencedActors gathers the actor references that the target module's journeys use", () => {
    const node = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ProvideActorsForModuleCreation');
  });

  it("connection: actors/ProvideActorsForModuleCreation → excerpt/CollectReferencedActors", () => {
    const from = result.index.nodes['actors/ProvideActorsForModuleCreation'];
    expect(from.followed_by).toContain('excerpt/CollectReferencedActors');
  });

  it("step 4: excerpt/CollectTriggeredByActors assembles actor descriptions and their journey participation into excerpt context", () => {
    const node = result.index.nodes['excerpt/CollectTriggeredByActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectReferencedActors');
  });

  it("connection: excerpt/CollectReferencedActors → excerpt/CollectTriggeredByActors", () => {
    const from = result.index.nodes['excerpt/CollectReferencedActors'];
    expect(from.followed_by).toContain('excerpt/CollectTriggeredByActors');
  });

  it("step 5: excerpt/AssembleExcerpt includes the actor context section in the final module excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectTriggeredByActors');
  });

  it("connection: excerpt/CollectTriggeredByActors → excerpt/AssembleExcerpt", () => {
    const from = result.index.nodes['excerpt/CollectTriggeredByActors'];
    expect(from.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 6: excerpt/ExcerptOutput the assembled excerpt now contains actor names the worker can reference as _actors/ActorName", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/ExcerptOutput", () => {
    const from = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(from.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 7: llm/TaskPayload packages the excerpt with actor context into the module creation task", () => {
    const node = result.index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → llm/TaskPayload", () => {
    const from = result.index.nodes['excerpt/ExcerptOutput'];
    expect(from.followed_by).toContain('llm/TaskPayload');
  });

  it("step 8: _actors/LLMWorker reads the excerpt and writes journey steps referencing _actors/ActorName for discovered actors", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/TaskPayload');
  });

  it("connection: llm/TaskPayload → _actors/LLMWorker", () => {
    const from = result.index.nodes['llm/TaskPayload'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/ValidateActorCoverage after all modules are created, checks that every actor appears in at least one journey", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/ValidateActorCoverage", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("excerpt includes TRIGGERED BY section with actor names", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'actors',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: '',
    });
    expect(excerpt).toContain('TRIGGERED BY');
    expect(excerpt).toContain('LLMWorker');
  });

  it("journey covers full round-trip pipeline (9 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(9);
    expect(journey.steps[0].node).toBe('actors/ActorsFile');
    expect(journey.steps[8].node).toBe('actors/ValidateActorCoverage');
  });

  it("journey actor is LLMWorker (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
