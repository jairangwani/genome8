// Auto-generated from journey: RediscoverActorsAfterSpecChange
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, actors, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildRediscoveryModules() {
  const modules = new Map<string, ModuleFile>();

  // _actors module: existing + new actors after spec change
  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'LLM that analyzes the spec to discover actors' },
      ProjectOwner: { type: 'actor', description: 'Person who wrote the spec' },
      APIConsumer: { type: 'actor', description: 'External service consuming the API (newly discovered)' },
    },
    journeys: {},
  });

  // convergence module
  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'Signals that the spec has changed and actors may need updating' },
      SpecFile: { type: 'artifact', description: 'The spec.md file on disk' },
    },
    journeys: {},
  });

  // actors module: rediscovery + update processes
  modules.set('actors', {
    nodes: {
      RediscoverActorsOnSpecChange: { type: 'process', description: 'Reads the current _actors.yaml to know the existing actor set' },
      DiscoverFromActivities: { type: 'process', description: 'Identifies who uses, creates, operates, governs, and visits the system' },
      DiscoverFromThreats: { type: 'process', description: 'Identifies attackers, abusers, failure scenarios, and exploitation vectors' },
      DiscoverFromLifecycle: { type: 'process', description: 'Identifies first visit, onboarding, power use, decline, exit, and return actors' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges rediscovered actors and removes duplicates' },
      UpdateActorsFileAfterRediscovery: { type: 'process', description: 'Diffs rediscovered set against existing actors to find additions and removals' },
      WriteActorsFile: { type: 'process', description: 'Writes the updated _actors.yaml to disk' },
      ActorsFile: { type: 'artifact', description: 'The updated actor file ready for recompilation' },
    },
    journeys: {
      RediscoverActorsAfterSpecChange: {
        steps: [
          { node: 'convergence/TargetedReconvergence', action: 'signals that the spec has changed and actors may need updating' },
          { node: 'convergence/SpecFile', action: 'provides the changed spec content' },
          { node: 'RediscoverActorsOnSpecChange', action: 'reads the current _actors.yaml to know the existing actor set' },
          { node: '_actors/LLMWorker', action: 're-analyzes the changed spec from the activities perspective' },
          { node: 'DiscoverFromActivities', action: 're-identifies activity actors from the updated spec' },
          { node: '_actors/LLMWorker', action: 're-analyzes the changed spec from the threats perspective' },
          { node: 'DiscoverFromThreats', action: 're-identifies threat actors from the updated spec' },
          { node: '_actors/LLMWorker', action: 're-analyzes the changed spec from the lifecycle perspective' },
          { node: 'DiscoverFromLifecycle', action: 're-identifies lifecycle actors from the updated spec' },
          { node: 'MergeAndDeduplicate', action: 'merges the rediscovered actors and removes duplicates' },
          { node: 'UpdateActorsFileAfterRediscovery', action: 'diffs the rediscovered set against the existing actors to find additions and removals' },
          { node: 'UpdateActorsFileAfterRediscovery', action: 'adds new actors to _actors.yaml and flags removed actors for orphan detection' },
          { node: 'WriteActorsFile', action: 'writes the updated _actors.yaml to disk' },
          { node: 'ActorsFile', action: 'the updated actor file is ready for recompilation' },
        ],
      },
    },
  });

  return modules;
}

describe("RediscoverActorsAfterSpecChange", () => {
  const modules = buildRediscoveryModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RediscoverActorsAfterSpecChange'];

  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and actors may need updating", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → convergence/SpecFile", () => {
    const from = result.index.nodes['convergence/TargetedReconvergence'];
    expect(from.followed_by).toContain('convergence/SpecFile');
  });

  it("step 3: actors/RediscoverActorsOnSpecChange reads the current _actors.yaml to know the existing actor set", () => {
    const node = result.index.nodes['actors/RediscoverActorsOnSpecChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/SpecFile');
  });

  it("connection: convergence/SpecFile → actors/RediscoverActorsOnSpecChange", () => {
    const from = result.index.nodes['convergence/SpecFile'];
    expect(from.followed_by).toContain('actors/RediscoverActorsOnSpecChange');
  });

  it("step 4: _actors/LLMWorker re-analyzes the changed spec from the activities perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/RediscoverActorsOnSpecChange');
  });

  it("connection: actors/RediscoverActorsOnSpecChange → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/RediscoverActorsOnSpecChange'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 5: actors/DiscoverFromActivities re-identifies activity actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 6: _actors/LLMWorker re-analyzes the changed spec from the threats perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 7: actors/DiscoverFromThreats re-identifies threat actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromThreats", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 8: _actors/LLMWorker re-analyzes the changed spec from the lifecycle perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/DiscoverFromLifecycle re-identifies lifecycle actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromLifecycle", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 10: actors/MergeAndDeduplicate merges the rediscovered actors and removes duplicates", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 11: actors/UpdateActorsFileAfterRediscovery diffs the rediscovered set against the existing actors to find additions and removals", () => {
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/UpdateActorsFileAfterRediscovery", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("step 12: actors/UpdateActorsFileAfterRediscovery adds new actors to _actors.yaml and flags removed actors for orphan detection", () => {
    // Self-connection: same node appears in consecutive steps
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
    expect(node.followed_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("connection: actors/UpdateActorsFileAfterRediscovery → actors/UpdateActorsFileAfterRediscovery", () => {
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("step 13: actors/WriteActorsFile writes the updated _actors.yaml to disk", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("connection: actors/UpdateActorsFileAfterRediscovery → actors/WriteActorsFile", () => {
    const from = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 14: actors/ActorsFile the updated actor file is ready for recompilation", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('actors/ActorsFile');
  });

  it("newly discovered actor (APIConsumer) exists in compiled index", () => {
    expect(result.index.nodes['_actors/APIConsumer']).toBeDefined();
    expect(result.index.nodes['_actors/APIConsumer'].type).toBe('actor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
