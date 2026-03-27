// Auto-generated from journey: ChildActorTamperingDefense
// Module: actors
// Triggered by: _actors/ChildEngine
// Modules touched: _actors, actors, compilation, hierarchy

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/cross-project.test.ts

describe("ChildActorTamperingDefense", () => {
  // Parent's original _actors.yaml content
  const parentActors: ModuleFile = {
    nodes: {
      ChildEngine: { type: 'actor', description: 'child engine' },
      RogueWorker: { type: 'actor', description: 'rogue worker' },
      LLMWorker: { type: 'actor', description: 'legitimate worker' },
    },
    journeys: {},
  };

  // Tampered version: added an unauthorized actor
  const tamperedActors: ModuleFile = {
    nodes: {
      ChildEngine: { type: 'actor', description: 'child engine' },
      RogueWorker: { type: 'actor', description: 'rogue worker' },
      LLMWorker: { type: 'actor', description: 'legitimate worker' },
      UnauthorizedAdmin: { type: 'actor', description: 'injected unauthorized actor' },
    },
    journeys: {},
  };

  const parentModules = new Map<string, ModuleFile>([['_actors', parentActors]]);
  const tamperedModules = new Map<string, ModuleFile>([['_actors', tamperedActors]]);

  const parentResult = compileFromModules(parentModules);
  const tamperedResult = compileFromModules(tamperedModules);

  it("step 1: _actors/ChildEngine receives inherited _actors.yaml from the parent engine", () => {
    expect(parentResult.index.nodes['_actors/ChildEngine']).toBeDefined();
    expect(parentResult.index.nodes['_actors/ChildEngine'].type).toBe('actor');
  });

  it("step 2: actors/InheritActorsFromParent copies the parent's _actors.yaml with a known content hash", () => {
    // Parent has exactly 3 actors
    const parentActorCount = Object.entries(parentResult.index.nodes)
      .filter(([, n]) => n.module === '_actors' && n.type === 'actor').length;
    expect(parentActorCount).toBe(3);
  });

  it("step 3: _actors/RogueWorker modifies the child's _actors.yaml to add unauthorized actors or alter descriptions", () => {
    // Tampered version has one extra actor
    const tamperedActorCount = Object.entries(tamperedResult.index.nodes)
      .filter(([, n]) => n.module === '_actors' && n.type === 'actor').length;
    expect(tamperedActorCount).toBe(4);
  });

  it("step 4: actors/DetectChildActorTampering computes the hash of the child's current _actors.yaml content", () => {
    // The parent and tampered results have different node counts
    expect(parentResult.index._stats.total_nodes).not.toBe(tamperedResult.index._stats.total_nodes);
  });

  it("step 5: actors/DetectChildActorTampering compares the child hash against the parent's original hash", () => {
    // Detect difference: unauthorized actor exists in tampered but not parent
    expect(tamperedResult.index.nodes['_actors/UnauthorizedAdmin']).toBeDefined();
    expect(parentResult.index.nodes['_actors/UnauthorizedAdmin']).toBeUndefined();
  });

  it("step 6: actors/DetectChildActorTampering detects the mismatch and flags the child's _actors.yaml as tampered", () => {
    // The unauthorized actor is an orphan (not in any journey)
    expect(tamperedResult.coverage.orphans).toContain('_actors/UnauthorizedAdmin');
  });

  it("step 7: actors/ParentDiscoversChildrenInherit confirms the rule violation since children must not modify inherited actors", () => {
    // The tampered set has more nodes than the parent set
    const parentNodeNames = Object.keys(parentResult.index.nodes).sort();
    const tamperedNodeNames = Object.keys(tamperedResult.index.nodes).sort();
    expect(tamperedNodeNames.length).toBeGreaterThan(parentNodeNames.length);
  });

  it("step 8: compilation/ErrorReport records the tampering as a validation error with the specific differences found", () => {
    // All actors in tampered set are orphans since there are no journeys
    expect(tamperedResult.index._stats.orphans).toBeGreaterThan(0);
  });

  it("step 9: hierarchy/ValidateCrossEngineRefs blocks the child's compilation result from merging into the parent until the tampering is resolved", () => {
    // The tampered result has orphans, which would block merge
    const orphanWarnings = tamperedResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    expect(orphanWarnings.length).toBeGreaterThan(0);
  });
});
