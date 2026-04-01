// Auto-generated from journey: SpecInjectionDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, convergence, actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts

function buildInjectionModules(opts?: { duplicateActor?: boolean; danglingRef?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  const actorNodes: Record<string, { type: string; description: string }> = {
    MaliciousSpecAuthor: { type: 'actor', description: 'Submits adversarial spec content' },
    LLMWorker: { type: 'actor', description: 'Processes spec content' },
    Compiler: { type: 'actor', description: 'Validates and compiles the graph' },
    ProjectOwner: { type: 'actor', description: 'Legitimate project owner' },
  };

  modules.set('_actors', { nodes: actorNodes, journeys: {} });

  // convergence module
  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'Reads the potentially malicious spec from disk' },
    },
    journeys: {},
  });

  // actors module
  const actorsNodes: Record<string, { type: string; description: string }> = {
    DiscoverFromActivities: { type: 'process', description: 'Processes the spec through LLM' },
    WriteActorsFile: { type: 'process', description: 'Writes whatever actors the LLM discovered' },
  };

  const journeySteps = [
    { node: '_actors/MaliciousSpecAuthor', action: 'submits a spec.md containing prompt injection or adversarial content' },
    { node: 'convergence/ReadSpec', action: 'reads the potentially malicious spec from disk' },
    { node: 'DiscoverFromActivities', action: 'processes the spec through LLM which may encounter injected prompts' },
    { node: '_actors/LLMWorker', action: 'receives the spec content including any adversarial payloads' },
    { node: 'WriteActorsFile', action: 'writes whatever actors the LLM discovered including any injected entries' },
    { node: '_actors/Compiler', action: 'validates the resulting _actors.yaml for structural correctness' },
    { node: 'compilation/DuplicateDetection', action: 'catches any duplicate actor names injected by the adversarial content' },
    { node: 'compilation/DanglingRefDetection', action: 'catches any phantom references injected through the adversarial spec' },
  ];

  if (opts?.danglingRef) {
    // Add a journey step that references a non-existent node
    journeySteps.push({ node: 'InjectedPhantomNode', action: 'this reference should not resolve' });
  }

  modules.set('actors', {
    nodes: actorsNodes,
    journeys: {
      SpecInjectionDefense: { steps: journeySteps },
    },
  });

  // compilation module
  const compilationNodes: Record<string, { type: string; description: string }> = {
    DuplicateDetection: { type: 'process', description: 'Catches any duplicate node names across modules' },
    DanglingRefDetection: { type: 'process', description: 'Catches any references to non-existent nodes' },
  };

  // If testing duplicate detection, add a duplicate node name that conflicts
  if (opts?.duplicateActor) {
    compilationNodes.ProjectOwner = { type: 'process', description: 'Duplicate of _actors/ProjectOwner — should be caught' };
  }

  modules.set('compilation', {
    nodes: compilationNodes,
    journeys: {},
  });

  return modules;
}

describe("SpecInjectionDefense", () => {
  const modules = buildInjectionModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['SpecInjectionDefense'];

  it("step 1: _actors/MaliciousSpecAuthor submits a spec.md containing prompt injection or adversarial content", () => {
    const node = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: convergence/ReadSpec reads the potentially malicious spec from disk", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/MaliciousSpecAuthor');
  });

  it("connection: _actors/MaliciousSpecAuthor → convergence/ReadSpec", () => {
    const from = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(from.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: actors/DiscoverFromActivities processes the spec through LLM which may encounter injected prompts", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['convergence/ReadSpec'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 4: _actors/LLMWorker receives the spec content including any adversarial payloads", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("connection: actors/DiscoverFromActivities → _actors/LLMWorker", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 5: actors/WriteActorsFile writes whatever actors the LLM discovered including any injected entries", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/WriteActorsFile", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 6: _actors/Compiler validates the resulting _actors.yaml for structural correctness", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → _actors/Compiler", () => {
    const from = result.index.nodes['actors/WriteActorsFile'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 7: compilation/DuplicateDetection catches any duplicate actor names injected by the adversarial content", () => {
    const node = result.index.nodes['compilation/DuplicateDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/DuplicateDetection", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/DuplicateDetection');
  });

  it("step 8: compilation/DanglingRefDetection catches any phantom references injected through the adversarial spec", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/DuplicateDetection');
  });

  it("connection: compilation/DuplicateDetection → compilation/DanglingRefDetection", () => {
    const from = result.index.nodes['compilation/DuplicateDetection'];
    expect(from.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("duplicate actor names across modules are detected as errors", () => {
    const dupModules = buildInjectionModules({ duplicateActor: true });
    const dupResult = compileFromModules(dupModules);
    const dupErrors = dupResult.issues.filter(i =>
      i.severity === 'error' && i.message.includes('Duplicate')
    );
    expect(dupErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("dangling refs from injected phantom nodes are detected", () => {
    const refModules = buildInjectionModules({ danglingRef: true });
    const refResult = compileFromModules(refModules);
    // The dangling ref 'InjectedPhantomNode' should produce a warning or error
    const danglingIssues = refResult.issues.filter(i =>
      i.message.includes('InjectedPhantomNode') || i.message.includes('dangling') || i.message.includes('not found')
    );
    expect(danglingIssues.length).toBeGreaterThanOrEqual(1);
  });

  it("journey actor is MaliciousSpecAuthor (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
  });

  it("compiles without errors in the clean scenario", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
