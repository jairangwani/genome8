// Auto-generated from journey: ActorDescriptionPoisoningDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MaliciousSpecAuthor: { type: 'actor', description: 'an adversary who submits a spec.md containing prompt injection or adversarial content' },
    },
  });

  modules.set('compilation', {
    nodes: {
      ErrorReport: { type: 'artifact', description: 'the list of compilation errors with location and severity' },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'applies targeted fixes to close gaps found during audit' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
      DetectActorDescriptionPoisoning: { type: 'process', description: 'scans actor descriptions for adversarial content patterns such as prompt injection fragments or encoded instructions' },
      ValidateActorYAMLStructure: { type: 'process', description: 'checks that each entry in _actors.yaml has type actor and a non-empty description' },
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

  return modules;
}

describe("ActorDescriptionPoisoningDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorDescriptionPoisoningDefense'];

  it("step 1: _actors/MaliciousSpecAuthor crafts a spec where actor descriptions contain hidden instructions or prompt injection fragments", () => {
    const node = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('ActorDescriptionPoisoningDefense'))).toBe(true);
  });

  it("step 2: actors/DiscoverFromActivities extracts actors whose descriptions carry the embedded adversarial payload", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/MaliciousSpecAuthor');
  });

  it("connection: _actors/MaliciousSpecAuthor → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 3: actors/MergeAndDeduplicate merges the poisoned actors into the final set without content filtering", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 4: actors/WriteActorsFile writes the poisoned descriptions to _actors.yaml", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/WriteActorsFile", () => {
    const src = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 5: actors/DetectActorDescriptionPoisoning scans each actor description for known adversarial patterns such as instruction overrides or encoded payloads", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/DetectActorDescriptionPoisoning", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("step 6: actors/DetectActorDescriptionPoisoning flags descriptions exceeding the maximum length threshold as potential payload carriers", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node.preceded_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("connection: actors/DetectActorDescriptionPoisoning → actors/DetectActorDescriptionPoisoning", () => {
    const node = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(node.preceded_by).toContain('actors/DetectActorDescriptionPoisoning');
    expect(node.followed_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("step 7: actors/ValidateActorYAMLStructure rejects actors whose descriptions fail the poisoning check", () => {
    const node = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DetectActorDescriptionPoisoning');
  });

  it("connection: actors/DetectActorDescriptionPoisoning → actors/ValidateActorYAMLStructure", () => {
    const src = result.index.nodes['actors/DetectActorDescriptionPoisoning'];
    expect(src.followed_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("step 8: compilation/ErrorReport records each flagged description with the specific adversarial pattern detected", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ValidateActorYAMLStructure');
  });

  it("connection: actors/ValidateActorYAMLStructure → compilation/ErrorReport", () => {
    const src = result.index.nodes['actors/ValidateActorYAMLStructure'];
    expect(src.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 9: convergence/AuditGapFix targeted fix sanitizes or removes the poisoned actor descriptions", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → convergence/AuditGapFix", () => {
    const src = result.index.nodes['compilation/ErrorReport'];
    expect(src.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
