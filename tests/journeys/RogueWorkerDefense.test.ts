// Auto-generated from journey: RogueWorkerDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildRogueModules(opts?: { phantomActor?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  const actorNodes: Record<string, { type: string; description: string }> = {
    RogueWorker: { type: 'actor', description: 'Produces subtly wrong actor content with hallucinated or phantom actors' },
  };
  // A phantom/hallucinated actor that no journey references
  if (opts?.phantomActor) {
    actorNodes.HallucinatedAdmin = { type: 'actor', description: 'A phantom actor injected by rogue worker' };
  }

  modules.set('_actors', { nodes: actorNodes, journeys: {} });

  modules.set('actors', {
    nodes: {
      WriteActorsFile: { type: 'process', description: 'Writes the rogue content to _actors.yaml' },
      ActorsFile: { type: 'artifact', description: 'Contains the hallucinated actors' },
      ValidateActorCoverage: { type: 'process', description: 'Checks that every actor appears in at least one journey' },
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

  modules.set('compilation', {
    nodes: {
      OrphanDetection: { type: 'process', description: 'Flags nodes that no journey references as orphans' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix removes orphan actors' },
    },
    journeys: {},
  });

  return modules;
}

describe("RogueWorkerDefense", () => {
  const modules = buildRogueModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RogueWorkerDefense'];

  it("step 1: _actors/RogueWorker produces subtly wrong actor content with hallucinated or phantom actors", () => {
    const node = result.index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/WriteActorsFile writes the rogue content to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/RogueWorker');
  });

  it("connection: _actors/RogueWorker → actors/WriteActorsFile", () => {
    const from = result.index.nodes['_actors/RogueWorker'];
    const to = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
    expect(to.preceded_by).toContain('_actors/RogueWorker');
  });

  it("step 3: actors/ActorsFile contains the hallucinated actors", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("step 4: actors/ValidateActorCoverage checks that every actor appears in at least one journey", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/ValidateActorCoverage", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("step 5: compilation/OrphanDetection flags hallucinated actors that no journey references as orphans", () => {
    const node = result.index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorCoverage');
  });

  it("connection: actors/ValidateActorCoverage → compilation/OrphanDetection", () => {
    const from = result.index.nodes['actors/ValidateActorCoverage'];
    expect(from.followed_by).toContain('compilation/OrphanDetection');
  });

  it("step 6: convergence/AuditGapFix targeted fix removes orphan actors that cannot be connected to any journey", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/OrphanDetection');
  });

  it("connection: compilation/OrphanDetection → convergence/AuditGapFix", () => {
    const from = result.index.nodes['compilation/OrphanDetection'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("phantom actor with no journey references is detected as orphan", () => {
    const phantomModules = buildRogueModules({ phantomActor: true });
    const phantomResult = compileFromModules(phantomModules);
    // HallucinatedAdmin exists but no journey references it → orphan count > 0
    expect(phantomResult.index.nodes['_actors/HallucinatedAdmin']).toBeDefined();
    expect(phantomResult.index._stats.orphans).toBeGreaterThan(0);
  });

  it("journey actor is RogueWorker", () => {
    expect(journey.actor).toBe('_actors/RogueWorker');
  });

  it("compiles without errors in the clean scenario", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
