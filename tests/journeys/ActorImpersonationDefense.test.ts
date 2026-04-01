// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      RogueWorker: { type: 'actor', description: 'a malfunctioning LLM worker that produces subtly wrong content with hallucinated or phantom entries' },
    },
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'a YAML module file on disk containing nodes and journeys' },
    },
  });

  modules.set('compilation', {
    nodes: {
      YAMLParsing: { type: 'process', description: 'parses each YAML module file into structured node and journey definitions' },
      DanglingRefDetection: { type: 'process', description: 'detects journey step references to nodes that do not exist in any module' },
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
      DetectActorImpersonation: { type: 'process', description: 'checks that every _actors/ reference in journey steps resolves to a validated actor in the registry' },
    },
    journeys: {
      ActorImpersonationDefense: {
        steps: [
          { node: '_actors/RogueWorker', action: 'creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry' },
          { node: 'graph/ModuleFile', action: 'stores the module containing the impersonation reference' },
          { node: 'compilation/YAMLParsing', action: 'parses the module and extracts the _actors/ references from journey steps' },
          { node: 'DetectActorImpersonation', action: 'compares each _actors/ reference against the validated actor registry' },
          { node: 'DetectActorImpersonation', action: 'flags the unregistered _actors/FakeAdmin reference as a validation error' },
          { node: 'compilation/DanglingRefDetection', action: 'confirms the reference does not resolve to any known node' },
          { node: 'compilation/ErrorReport', action: 'records the impersonation attempt with the specific step location and fake actor name' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix removes or replaces the fake actor reference with a valid one' },
        ],
      },
    },
  });

  return modules;
}

describe("ActorImpersonationDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorImpersonationDefense'];

  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    const node = result.index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('ActorImpersonationDefense'))).toBe(true);
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/RogueWorker');
  });

  it("connection: _actors/RogueWorker → graph/ModuleFile", () => {
    const src = result.index.nodes['_actors/RogueWorker'];
    expect(src.followed_by).toContain('graph/ModuleFile');
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    const node = result.index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → compilation/YAMLParsing", () => {
    const src = result.index.nodes['graph/ModuleFile'];
    expect(src.followed_by).toContain('compilation/YAMLParsing');
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/YAMLParsing');
  });

  it("connection: compilation/YAMLParsing → actors/DetectActorImpersonation", () => {
    const src = result.index.nodes['compilation/YAMLParsing'];
    expect(src.followed_by).toContain('actors/DetectActorImpersonation');
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node.preceded_by).toContain('actors/DetectActorImpersonation');
  });

  it("connection: actors/DetectActorImpersonation → actors/DetectActorImpersonation", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node.preceded_by).toContain('actors/DetectActorImpersonation');
    expect(node.followed_by).toContain('actors/DetectActorImpersonation');
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DetectActorImpersonation');
  });

  it("connection: actors/DetectActorImpersonation → compilation/DanglingRefDetection", () => {
    const src = result.index.nodes['actors/DetectActorImpersonation'];
    expect(src.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/DanglingRefDetection');
  });

  it("connection: compilation/DanglingRefDetection → compilation/ErrorReport", () => {
    const src = result.index.nodes['compilation/DanglingRefDetection'];
    expect(src.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → convergence/AuditGapFix", () => {
    const src = result.index.nodes['compilation/ErrorReport'];
    expect(src.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
