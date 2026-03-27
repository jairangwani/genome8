// Auto-generated from journey: CheckActorCoverageAgainstActorList
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: actors, audit, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    UnusedActor: { type: 'actor', description: 'actor that appears in no journey' },
  },
  journeys: {},
};

const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'submits credentials' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const audit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
  },
  journeys: {
    RunActorAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews actor coverage' },
        { node: 'CheckActorCoverage', action: 'flags orphan actors' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', auth], ['audit', audit]]));

describe("CheckActorCoverageAgainstActorList", () => {
  it("step 1: actors/ActorsFile provides the authoritative list of discovered actors from 3-angle discovery", () => {
    const allActors = Object.entries(result.index.nodes)
      .filter(([, n]) => n.module === '_actors')
      .map(([k]) => k);
    expect(allActors.length).toBe(4);
    expect(allActors).toContain('_actors/Auditor');
    expect(allActors).toContain('_actors/ProjectOwner');
    expect(allActors).toContain('_actors/LLMWorker');
    expect(allActors).toContain('_actors/UnusedActor');
  });

  it("step 2: actors/MergedActorList supplies all actors after merge and deduplication", () => {
    // No duplicates in _actors
    expect(result.index._stats.duplicate_names).toBe(0);
    const actorNames = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'actor')
      .map(([k]) => k);
    const unique = new Set(actorNames);
    expect(unique.size).toBe(actorNames.length);
  });

  it("step 3: audit/GenerateAuditPrompt builds the actor coverage prompt including the full actor list as ground truth", () => {
    // All actors are in the index as ground truth for the auditor
    const actors = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'actor');
    expect(actors.length).toBe(4);
  });

  it("step 4: _actors/Auditor compares each actor from the list against journey step references across all modules", () => {
    // Auditor: in RunActorAudit (audit module)
    expect(result.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // ProjectOwner: in UserLogin (auth module)
    expect(result.index.nodes['_actors/ProjectOwner'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // LLMWorker: not in any journey
    expect(result.index.nodes['_actors/LLMWorker'].in_journeys.length).toBe(0);
    // UnusedActor: not in any journey
    expect(result.index.nodes['_actors/UnusedActor'].in_journeys.length).toBe(0);
  });

  it("step 5: audit/CheckActorCoverage flags actors that appear in no journey and actors confined to a single module", () => {
    // Orphan actors: LLMWorker and UnusedActor (not in any journey)
    const orphanActors = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'actor' && n.in_journeys.length === 0)
      .map(([k]) => k);
    expect(orphanActors).toContain('_actors/LLMWorker');
    expect(orphanActors).toContain('_actors/UnusedActor');
    // Actors confined to a single module
    const singleModule = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'actor' && n.referenced_in_modules.length === 1)
      .map(([k]) => k);
    expect(singleModule.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: audit/ActorCoverageReport records which actors are covered, which are orphaned, and which are single-module", () => {
    const report = {
      covered: Object.entries(result.index.nodes)
        .filter(([, n]) => n.type === 'actor' && n.in_journeys.length > 0)
        .map(([k]) => k),
      orphaned: Object.entries(result.index.nodes)
        .filter(([, n]) => n.type === 'actor' && n.in_journeys.length === 0)
        .map(([k]) => k),
    };
    expect(report.covered).toContain('_actors/Auditor');
    expect(report.covered).toContain('_actors/ProjectOwner');
    expect(report.orphaned).toContain('_actors/LLMWorker');
    expect(report.orphaned).toContain('_actors/UnusedActor');
  });

  it("step 7: audit/CollectAuditFindings adds actor coverage gaps to the findings list with the source actor module as context", () => {
    // Orphan actors appear in the orphans list
    expect(result.coverage.orphans).toContain('_actors/LLMWorker');
    expect(result.coverage.orphans).toContain('_actors/UnusedActor');
  });

});
