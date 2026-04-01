// Auto-generated from journey: ChildActorTamperingDefense
// Module: actors
// Triggered by: _actors/ChildEngine
// Modules touched: _actors, actors, compilation, hierarchy

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ChildEngine: { type: 'actor', description: 'a child convergence engine that inherits actors from the parent' },
      RogueWorker: { type: 'actor', description: 'a malfunctioning LLM worker that produces subtly wrong content with hallucinated or phantom entries' },
    },
  });

  modules.set('compilation', {
    nodes: {
      ErrorReport: { type: 'artifact', description: 'the list of compilation errors with location and severity' },
    },
  });

  modules.set('hierarchy', {
    nodes: {
      ValidateCrossEngineRefs: { type: 'process', description: 'validates cross-engine references between parent and child compilation results' },
    },
  });

  modules.set('actors', {
    nodes: {
      InheritActorsFromParent: { type: 'process', description: 'copies the parent _actors.yaml into a child engine directory so children share the same actor set' },
      DetectChildActorTampering: { type: 'process', description: 'compares a child engine _actors.yaml content against the parent original hash to detect unauthorized modifications' },
      ParentDiscoversChildrenInherit: { type: 'rule', description: 'only the parent engine discovers actors — children inherit them to prevent duplication' },
    },
    journeys: {
      ChildActorTamperingDefense: {
        steps: [
          { node: '_actors/ChildEngine', action: 'receives inherited _actors.yaml from the parent engine' },
          { node: 'InheritActorsFromParent', action: 'copies the parent _actors.yaml with a known content hash' },
          { node: '_actors/RogueWorker', action: 'modifies the child _actors.yaml to add unauthorized actors or alter descriptions' },
          { node: 'DetectChildActorTampering', action: 'computes the hash of the child current _actors.yaml content' },
          { node: 'DetectChildActorTampering', action: 'compares the child hash against the parent original hash' },
          { node: 'DetectChildActorTampering', action: 'detects the mismatch and flags the child _actors.yaml as tampered' },
          { node: 'ParentDiscoversChildrenInherit', action: 'confirms the rule violation since children must not modify inherited actors' },
          { node: 'compilation/ErrorReport', action: 'records the tampering as a validation error with the specific differences found' },
          { node: 'hierarchy/ValidateCrossEngineRefs', action: 'blocks the child compilation result from merging into the parent until the tampering is resolved' },
        ],
      },
    },
  });

  return modules;
}

describe("ChildActorTamperingDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ChildActorTamperingDefense'];

  it("step 1: _actors/ChildEngine receives inherited _actors.yaml from the parent engine", () => {
    const node = result.index.nodes['_actors/ChildEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('ChildActorTamperingDefense'))).toBe(true);
  });

  it("step 2: actors/InheritActorsFromParent copies the parent's _actors.yaml with a known content hash", () => {
    const node = result.index.nodes['actors/InheritActorsFromParent'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ChildEngine');
  });

  it("connection: _actors/ChildEngine → actors/InheritActorsFromParent", () => {
    const src = result.index.nodes['_actors/ChildEngine'];
    expect(src.followed_by).toContain('actors/InheritActorsFromParent');
  });

  it("step 3: _actors/RogueWorker modifies the child's _actors.yaml to add unauthorized actors or alter descriptions", () => {
    const node = result.index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/InheritActorsFromParent');
  });

  it("connection: actors/InheritActorsFromParent → _actors/RogueWorker", () => {
    const src = result.index.nodes['actors/InheritActorsFromParent'];
    expect(src.followed_by).toContain('_actors/RogueWorker');
  });

  it("step 4: actors/DetectChildActorTampering computes the hash of the child's current _actors.yaml content", () => {
    const node = result.index.nodes['actors/DetectChildActorTampering'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/RogueWorker');
  });

  it("connection: _actors/RogueWorker → actors/DetectChildActorTampering", () => {
    const src = result.index.nodes['_actors/RogueWorker'];
    expect(src.followed_by).toContain('actors/DetectChildActorTampering');
  });

  it("step 5: actors/DetectChildActorTampering compares the child hash against the parent's original hash", () => {
    const node = result.index.nodes['actors/DetectChildActorTampering'];
    expect(node.preceded_by).toContain('actors/DetectChildActorTampering');
  });

  it("connection: actors/DetectChildActorTampering → actors/DetectChildActorTampering", () => {
    const node = result.index.nodes['actors/DetectChildActorTampering'];
    expect(node.preceded_by).toContain('actors/DetectChildActorTampering');
    expect(node.followed_by).toContain('actors/DetectChildActorTampering');
  });

  it("step 6: actors/DetectChildActorTampering detects the mismatch and flags the child's _actors.yaml as tampered", () => {
    const node = result.index.nodes['actors/DetectChildActorTampering'];
    expect(node.followed_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("connection: actors/DetectChildActorTampering → actors/DetectChildActorTampering", () => {
    const node = result.index.nodes['actors/DetectChildActorTampering'];
    expect(node.preceded_by).toContain('actors/DetectChildActorTampering');
  });

  it("step 7: actors/ParentDiscoversChildrenInherit confirms the rule violation since children must not modify inherited actors", () => {
    const node = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('actors/DetectChildActorTampering');
  });

  it("connection: actors/DetectChildActorTampering → actors/ParentDiscoversChildrenInherit", () => {
    const src = result.index.nodes['actors/DetectChildActorTampering'];
    expect(src.followed_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("step 8: compilation/ErrorReport records the tampering as a validation error with the specific differences found", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/ParentDiscoversChildrenInherit');
  });

  it("connection: actors/ParentDiscoversChildrenInherit → compilation/ErrorReport", () => {
    const src = result.index.nodes['actors/ParentDiscoversChildrenInherit'];
    expect(src.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 9: hierarchy/ValidateCrossEngineRefs blocks the child's compilation result from merging into the parent until the tampering is resolved", () => {
    const node = result.index.nodes['hierarchy/ValidateCrossEngineRefs'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → hierarchy/ValidateCrossEngineRefs", () => {
    const src = result.index.nodes['compilation/ErrorReport'];
    expect(src.followed_by).toContain('hierarchy/ValidateCrossEngineRefs');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
