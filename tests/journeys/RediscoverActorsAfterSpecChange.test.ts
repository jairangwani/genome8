// Auto-generated from journey: RediscoverActorsAfterSpecChange
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, actors, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'reconverges only the modules affected by a change rather than re-running the entire pipeline' },
      SpecFile: { type: 'artifact', description: 'the spec.md file written by the ProjectOwner as the sole human input' },
    },
  });

  modules.set('actors', {
    nodes: {
      RediscoverActorsOnSpecChange: { type: 'process', description: 're-runs 3-angle discovery when the spec changes during reconvergence' },
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
      UpdateActorsFileAfterRediscovery: { type: 'process', description: 'merges newly discovered actors with the existing set, adding new actors and flagging removed ones' },
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
      ActorsFile: { type: 'artifact', description: 'the _actors.yaml file containing all discovered actors with type and description' },
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
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RediscoverActorsAfterSpecChange'];

  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and actors may need updating", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('RediscoverActorsAfterSpecChange'))).toBe(true);
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → convergence/SpecFile", () => {
    const src = result.index.nodes['convergence/TargetedReconvergence'];
    expect(src.followed_by).toContain('convergence/SpecFile');
  });

  it("step 3: actors/RediscoverActorsOnSpecChange reads the current _actors.yaml to know the existing actor set", () => {
    const node = result.index.nodes['actors/RediscoverActorsOnSpecChange'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/SpecFile');
  });

  it("connection: convergence/SpecFile → actors/RediscoverActorsOnSpecChange", () => {
    const src = result.index.nodes['convergence/SpecFile'];
    expect(src.followed_by).toContain('actors/RediscoverActorsOnSpecChange');
  });

  it("step 4: _actors/LLMWorker re-analyzes the changed spec from the activities perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/RediscoverActorsOnSpecChange');
  });

  it("connection: actors/RediscoverActorsOnSpecChange → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/RediscoverActorsOnSpecChange'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 5: actors/DiscoverFromActivities re-identifies activity actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 6: _actors/LLMWorker re-analyzes the changed spec from the threats perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 7: actors/DiscoverFromThreats re-identifies threat actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 8: _actors/LLMWorker re-analyzes the changed spec from the lifecycle perspective", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 9: actors/DiscoverFromLifecycle re-identifies lifecycle actors from the updated spec", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 10: actors/MergeAndDeduplicate merges the rediscovered actors and removes duplicates", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 11: actors/UpdateActorsFileAfterRediscovery diffs the rediscovered set against the existing actors to find additions and removals", () => {
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/UpdateActorsFileAfterRediscovery", () => {
    const src = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(src.followed_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("step 12: actors/UpdateActorsFileAfterRediscovery adds new actors to _actors.yaml and flags removed actors for orphan detection", () => {
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("connection: actors/UpdateActorsFileAfterRediscovery → actors/UpdateActorsFileAfterRediscovery", () => {
    const node = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
    expect(node.followed_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("step 13: actors/WriteActorsFile writes the updated _actors.yaml to disk", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/UpdateActorsFileAfterRediscovery');
  });

  it("connection: actors/UpdateActorsFileAfterRediscovery → actors/WriteActorsFile", () => {
    const src = result.index.nodes['actors/UpdateActorsFileAfterRediscovery'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 14: actors/ActorsFile the updated actor file is ready for recompilation", () => {
    const node = result.index.nodes['actors/ActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → actors/ActorsFile", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('actors/ActorsFile');
  });

  it("journey has 14 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(14);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
