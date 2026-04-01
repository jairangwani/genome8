// Auto-generated from journey: ActorDescriptionPoisoningDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildPoisoningModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MaliciousSpecAuthor: { type: 'actor', description: 'Crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Extracts actors whose descriptions carry the embedded adversarial payload' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges the poisoned actors into the final set without content filtering' },
      WriteActorsFile: { type: 'process', description: 'Writes the poisoned descriptions to _actors.yaml' },
      DetectActorDescriptionPoisoning: { type: 'process', description: 'Scans each actor description for known adversarial patterns' },
      ValidateActorYAMLStructure: { type: 'process', description: 'Rejects actors whose descriptions fail the poisoning check' },
    },
    journeys: {
      ActorDescriptionPoisoningDefense: {
        steps: [
          { node: '_actors/MaliciousSpecAuthor', action: 'crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments' },
          { node: 'DiscoverFromActivities', action: 'extracts actors whose descriptions carry the embedded adversarial payload' },
          { node: 'MergeAndDeduplicate', action: 'merges the poisoned actors into the final set without content filtering' },
          { node: 'WriteActorsFile', action: 'writes the poisoned descriptions to _actors.yaml' },
          { node: 'DetectActorDescriptionPoisoning', action: 'scans each actor description for known adversarial patterns such as instruction overrides or encoded payloads' },
          { node: 'DetectActorDescriptionPoisoning', action: 'flags descriptions exceeding the maximum length threshold as potential payload carriers' },
          { node: 'ValidateActorYAMLStructure', action: 'rejects actors whose descriptions fail the poisoning check' },
          { node: 'compilation/ErrorReport', action: 'records each flagged description with the specific adversarial pattern detected' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix sanitizes or removes the poisoned actor descriptions' },
        ],
      },
    },
  });

  modules.set('compilation', {
    nodes: {
      ErrorReport: { type: 'artifact', description: 'Records each flagged description with the specific adversarial pattern detected' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix sanitizes or removes the poisoned actor descriptions' },
    },
    journeys: {},
  });

  return modules;
}

describe("ActorDescriptionPoisoningDefense", () => {
  const modules = buildPoisoningModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorDescriptionPoisoningDefense'];

  it("step 1: _actors/MaliciousSpecAuthor crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments", () => {
    const node = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/DiscoverFromActivities extracts actors whose descriptions carry the embedded adversarial payload", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/MaliciousSpecAuthor');
  });

  it("connection: _actors/MaliciousSpecAuthor → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 3: actors/MergeAndDeduplicate merges the poisoned actors into the final set without content filtering", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 4: actors/WriteActorsFile writes the poisoned descriptions to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/WriteActorsFile", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 5: actors/DetectActorDescriptionPoisoning scans each actor description for known adversarial patterns such as instruction overrides or encoded payloads", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/DetectActorDescriptionPoisoning", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("step 6: actors/DetectActorDescriptionPoisoning flags descriptions exceeding the maximum length threshold as potential payload carriers", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node).toBeDefined();
    // Self-connection: same node consecutively
    expect(node.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/DetectActorDescriptionPoisoning → actors/DetectActorDescriptionPoisoning", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("step 7: actors/ValidateActorYAMLStructure rejects actors whose descriptions fail the poisoning check", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("connection: actors/DetectActorDescriptionPoisoning → actors/ValidateActorYAMLStructure", () => {
    const from = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(from.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 8: compilation/ErrorReport records each flagged description with the specific adversarial pattern detected", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → compilation/ErrorReport", () => {
    const from = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(from.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 9: convergence/AuditGapFix targeted fix sanitizes or removes the poisoned actor descriptions", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → convergence/AuditGapFix", () => {
    const from = result.index.nodes['compilation/ErrorReport'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey actor is MaliciousSpecAuthor", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
