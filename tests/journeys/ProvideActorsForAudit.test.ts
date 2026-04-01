// Auto-generated from journey: ProvideActorsForAudit
// Module: actors
// Modules touched: actors, graph, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('graph', {
    nodes: {
      CompiledIndex: { type: 'artifact', description: 'the full compiled index containing all nodes, journeys, and connections across all modules' },
    },
  });

  modules.set('audit', {
    nodes: {
      CheckActorCoverage: { type: 'process', description: 'auditor 2 checks that every actor in _actors.yaml participates in at least one journey across all modules' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list of coverage gaps with locations and descriptions' },
    },
  });

  modules.set('actors', {
    nodes: {
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
      MergedActorList: { type: 'artifact', description: 'the deduplicated combined actor list from all 3 discovery angles' },
      ValidateActorCoverage: { type: 'process', description: 'checks that every discovered actor appears in at least one journey across all modules' },
    },
    journeys: {
      ProvideActorsForAudit: {
        steps: [
          { node: 'ActorsFile', action: 'provides the validated _actors.yaml containing all discovered actors' },
          { node: 'MergedActorList', action: 'supplies the full list of actor names that must each appear in at least one journey' },
          { node: 'ValidateActorCoverage', action: 'prepares the actor name set as the expected reference list for coverage checking' },
          { node: 'graph/CompiledIndex', action: 'provides the compiled journey steps containing all _actors/ references across modules' },
          { node: 'audit/CheckActorCoverage', action: 'receives the actor list and searches compiled journeys for _actors/ references matching each actor name' },
          { node: 'audit/CheckActorCoverage', action: 'identifies actors with zero journey references as actor coverage gaps' },
          { node: 'audit/CollectAuditFindings', action: 'records each uncovered actor as an audit finding requiring a targeted fix to add the actor to relevant journeys' },
        ],
      },
    },
  });

  return modules;
}

describe("ProvideActorsForAudit", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ProvideActorsForAudit'];

  it("step 1: actors/ActorsFile provides the validated _actors.yaml containing all discovered actors", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('ProvideActorsForAudit'))).toBe(true);
  });

  it("step 2: actors/MergedActorList supplies the full list of actor names that must each appear in at least one journey", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ActorsFile');
  });

  it("connection: actors/ActorsFile → actors/MergedActorList", () => {
    const src = result.index.nodes['actors/ActorsFile'];
    expect(src.followed_by).toContain('actors/MergedActorList');
  });

  it("step 3: actors/ValidateActorCoverage prepares the actor name set as the expected reference list for coverage checking", () => {
    const node = result.index.nodes['actors/ValidateActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/ValidateActorCoverage", () => {
    const src = result.index.nodes['actors/MergedActorList'];
    expect(src.followed_by).toContain('actors/ValidateActorCoverage');
  });

  it("step 4: graph/CompiledIndex provides the compiled journey steps containing all _actors/ references across modules", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ValidateActorCoverage');
  });

  it("connection: actors/ValidateActorCoverage → graph/CompiledIndex", () => {
    const src = result.index.nodes['actors/ValidateActorCoverage'];
    expect(src.followed_by).toContain('graph/CompiledIndex');
  });

  it("step 5: audit/CheckActorCoverage receives the actor list and searches compiled journeys for _actors/ references matching each actor name", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("connection: graph/CompiledIndex → audit/CheckActorCoverage", () => {
    const src = result.index.nodes['graph/CompiledIndex'];
    expect(src.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 6: audit/CheckActorCoverage identifies actors with zero journey references as actor coverage gaps", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/CheckActorCoverage", () => {
    const node = result.index.nodes['audit/CheckActorCoverage'];
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
    expect(node.followed_by).toContain('audit/CheckActorCoverage');
  });

  it("step 7: audit/CollectAuditFindings records each uncovered actor as an audit finding requiring a targeted fix to add the actor to relevant journeys", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckActorCoverage');
  });

  it("connection: audit/CheckActorCoverage → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/CheckActorCoverage'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("journey has 7 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(7);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
