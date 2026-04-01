// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts

function buildImpersonationModules(opts?: { withFakeActor?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      RogueWorker: { type: 'actor', description: 'Creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry' },
    },
    journeys: {},
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'Stores the module containing the impersonation reference' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      YAMLParsing: { type: 'process', description: 'Parses the module and extracts the _actors/ references from journey steps' },
      DanglingRefDetection: { type: 'process', description: 'Confirms the reference does not resolve to any known node' },
      ErrorReport: { type: 'artifact', description: 'Records the impersonation attempt with the specific step location and fake actor name' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DetectActorImpersonation: { type: 'process', description: 'Compares each _actors/ reference against the validated actor registry' },
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

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix removes or replaces the fake actor reference with a valid one' },
    },
    journeys: {},
  });

  // Variant: a module that references a non-existent _actors/FakeAdmin
  if (opts?.withFakeActor) {
    modules.set('rogue', {
      nodes: {
        SomeProcess: { type: 'process', description: 'A process in the rogue module' },
      },
      journeys: {
        RogueJourney: {
          steps: [
            { node: '_actors/FakeAdmin', action: 'impersonates an admin actor' },
            { node: 'SomeProcess', action: 'does something unauthorized' },
          ],
        },
      },
    });
  }

  return modules;
}

describe("ActorImpersonationDefense", () => {
  const modules = buildImpersonationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ActorImpersonationDefense'];

  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    const node = result.index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/RogueWorker');
  });

  it("connection: _actors/RogueWorker → graph/ModuleFile", () => {
    const from = result.index.nodes['_actors/RogueWorker'];
    expect(from.followed_by).toContain('graph/ModuleFile');
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    const node = result.index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → compilation/YAMLParsing", () => {
    const from = result.index.nodes['graph/ModuleFile'];
    expect(from.followed_by).toContain('compilation/YAMLParsing');
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/YAMLParsing');
  });

  it("connection: compilation/YAMLParsing → actors/DetectActorImpersonation", () => {
    const from = result.index.nodes['compilation/YAMLParsing'];
    expect(from.followed_by).toContain('actors/DetectActorImpersonation');
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node).toBeDefined();
    // Self-connection: same node appears consecutively
    expect(node.preceded_by).toContain('compilation/YAMLParsing');
  });

  it("connection: actors/DetectActorImpersonation → actors/DetectActorImpersonation", () => {
    const node = result.index.nodes['actors/DetectActorImpersonation'];
    expect(node.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DetectActorImpersonation');
  });

  it("connection: actors/DetectActorImpersonation → compilation/DanglingRefDetection", () => {
    const from = result.index.nodes['actors/DetectActorImpersonation'];
    expect(from.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    const node = result.index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/DanglingRefDetection');
  });

  it("connection: compilation/DanglingRefDetection → compilation/ErrorReport", () => {
    const from = result.index.nodes['compilation/DanglingRefDetection'];
    expect(from.followed_by).toContain('compilation/ErrorReport');
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/ErrorReport');
  });

  it("connection: compilation/ErrorReport → convergence/AuditGapFix", () => {
    const from = result.index.nodes['compilation/ErrorReport'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("dangling _actors/FakeAdmin reference produces issues", () => {
    const fakeModules = buildImpersonationModules({ withFakeActor: true });
    const fakeResult = compileFromModules(fakeModules);
    // _actors/FakeAdmin is referenced in a journey but not defined — should produce dangling ref
    const danglingIssues = fakeResult.issues.filter(i =>
      i.message.includes('FakeAdmin') || i.message.includes('dangling')
    );
    expect(danglingIssues.length).toBeGreaterThan(0);
  });

  it("journey actor is RogueWorker", () => {
    expect(journey.actor).toBe('_actors/RogueWorker');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
