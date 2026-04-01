// Auto-generated from journey: ProvideActorsForAudit
// Module: actors
// Modules touched: actors, graph, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/types.ts

function buildActorsForAuditModules(opts?: { uncoveredActor?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Developer: { type: 'actor', description: 'A developer using the system' },
      ...(opts?.uncoveredActor ? { OrphanActor: { type: 'actor', description: 'An actor with no journey references' } } : {}),
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'Provides the validated _actors.yaml containing all discovered actors' },
      MergedActorList: { type: 'artifact', description: 'Supplies the full list of actor names that must each appear in at least one journey' },
      ValidateActorCoverage: { type: 'process', description: 'Prepares the actor name set as the expected reference list for coverage checking' },
    },
    journeys: {},
  });

  modules.set('graph', {
    nodes: {
      CompiledIndex: { type: 'artifact', description: 'Provides the compiled journey steps containing all _actors/ references across modules' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      CheckActorCoverage: { type: 'process', description: 'Receives the actor list and searches compiled journeys for _actors/ references matching each actor name' },
      CollectAuditFindings: { type: 'process', description: 'Records each uncovered actor as an audit finding' },
    },
    journeys: {
      ProvideActorsForAudit: {
        steps: [
          { node: 'actors/ActorsFile', action: 'provides the validated _actors.yaml containing all discovered actors' },
          { node: 'actors/MergedActorList', action: 'supplies the full list of actor names that must each appear in at least one journey' },
          { node: 'actors/ValidateActorCoverage', action: 'prepares the actor name set as the expected reference list for coverage checking' },
          { node: 'graph/CompiledIndex', action: 'provides the compiled journey steps containing all _actors/ references across modules' },
          { node: 'CheckActorCoverage', action: 'receives the actor list and searches compiled journeys for _actors/ references matching each actor name' },
          { node: 'CheckActorCoverage', action: 'identifies actors with zero journey references as actor coverage gaps' },
          { node: 'CollectAuditFindings', action: 'records each uncovered actor as an audit finding requiring a targeted fix' },
        ],
      },
    },
  });

  return modules;
}

describe("ProvideActorsForAudit", () => {
  const modules = buildActorsForAuditModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsForAudit'];

  it("step 1: actors/ActorsFile provides the validated _actors.yaml containing all discovered actors", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: actors/MergedActorList supplies the full list of actor names that must each appear in at least one journey", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/MergedActorList", () => {
    const from = result.index.nodes['actors/ActorsFile'];
    expect(from.followed_by).toContain('actors/MergedActorList');
  });

  it("step 3: actors/ValidateActorCoverage prepares the actor name set as the expected reference list for coverage checking", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/ValidateActorCoverage", () => {
    const from = result.index.nodes['actors/MergedActorList'];
    expect(from.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("step 4: graph/CompiledIndex provides the compiled journey steps containing all _actors/ references across modules", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ValidateActorCoverage');
  });

  it("connection: actors/ValidateActorCoverage → graph/CompiledIndex", () => {
    const from = result.index.nodes['actors/ValidateActorCoverage'];
    expect(from.followed_by).toContain('graph/CompiledIndex');
  });

  it("step 5: audit/CheckActorCoverage receives the actor list and searches compiled journeys for _actors/ references matching each actor name", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("connection: graph/CompiledIndex → audit/CheckActorCoverage", () => {
    const from = result.index.nodes['graph/CompiledIndex'];
    expect(from.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 6: audit/CheckActorCoverage identifies actors with zero journey references as actor coverage gaps", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    // Self-connection: same node consecutively
    expect(node.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CheckActorCoverage → audit/CheckActorCoverage", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("step 7: audit/CollectAuditFindings records each uncovered actor as an audit finding requiring a targeted fix to add the actor to relevant journeys", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/CheckActorCoverage'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("journey covers full actor audit pipeline (7 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(7);
    expect(journey.steps[0].node).toBe('actors/ActorsFile');
    expect(journey.steps[6].node).toBe('audit/CollectAuditFindings');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
