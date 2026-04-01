// Auto-generated from journey: RogueWorkerDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      RogueWorker: { type: 'actor', description: 'a malfunctioning LLM worker that produces subtly wrong content with hallucinated or phantom entries' },
    },
  });

  modules.set('compilation', {
    nodes: {
      OrphanDetection: { type: 'process', description: 'detects nodes that exist in modules but are never referenced by any journey step' },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'applies targeted fixes to close gaps found during audit' },
    },
  });

  modules.set('actors', {
    nodes: {
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
      ValidateActorCoverage: { type: 'process', description: 'checks that every discovered actor appears in at least one journey across all modules' },
    },
    journeys: {
      RogueWorkerDefense: {
        steps: [
          { node: '_actors/RogueWorker', action: 'produces subtly wrong actor content with hallucinated or phantom actors' },
          { node: 'WriteActorsFile', action: 'writes the rogue content to _actors.yaml' },
          { node: 'ActorsFile', action: 'contains the hallucinated actors' },
          { node: 'ValidateActorCoverage', action: 'checks that every actor appears in at least one journey' },
          { node: 'compilation/OrphanDetection', action: 'flags hallucinated actors that no journey references as orphans' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix removes orphan actors that cannot be connected to any journey' },
        ],
      },
    },
  });

  return modules;
}

describe("RogueWorkerDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RogueWorkerDefense'];

  it("step 1: _actors/RogueWorker produces subtly wrong actor content with hallucinated or phantom actors", () => {
    const node = result.index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('RogueWorkerDefense'))).toBe(true);
  });

  it("step 2: actors/WriteActorsFile writes the rogue content to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/RogueWorker');
  });

  it("connection: _actors/RogueWorker → actors/WriteActorsFile", () => {
    const src = result.index.nodes['_actors/RogueWorker'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 3: actors/ActorsFile contains the hallucinated actors", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("step 4: actors/ValidateActorCoverage checks that every actor appears in at least one journey", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ValidateActorCoverage", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("step 5: compilation/OrphanDetection flags hallucinated actors that no journey references as orphans", () => {
    const node = result.index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorCoverage');
  });

  it("connection: actors/ValidateActorCoverage → compilation/OrphanDetection", () => {
    const src = result.index.nodes['actors/ValidateActorCoverage'];
    expect(src.followed_by).toContain('compilation/OrphanDetection');
  });

  it("step 6: convergence/AuditGapFix targeted fix removes orphan actors that cannot be connected to any journey", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/OrphanDetection');
  });

  it("connection: compilation/OrphanDetection → convergence/AuditGapFix", () => {
    const src = result.index.nodes['compilation/OrphanDetection'];
    expect(src.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
