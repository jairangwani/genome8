// Auto-generated from journey: SpecInjectionDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, convergence, actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MaliciousSpecAuthor: { type: 'actor', description: 'an adversary who submits a spec.md containing prompt injection or adversarial content' },
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('convergence', {
    nodes: {
      ReadSpec: { type: 'process', description: 'reads the spec.md file from disk as the first pipeline step' },
    },
  });

  modules.set('compilation', {
    nodes: {
      DuplicateDetection: { type: 'process', description: 'detects duplicate node names across modules during compilation' },
      DanglingRefDetection: { type: 'process', description: 'detects journey step references to nodes that do not exist in any module' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      WriteActorsFile: { type: 'process', description: 'writes the merged actor list to _actors.yaml in the modules directory' },
    },
    journeys: {
      SpecInjectionDefense: {
        steps: [
          { node: '_actors/MaliciousSpecAuthor', action: 'submits a spec.md containing prompt injection or adversarial content' },
          { node: 'convergence/ReadSpec', action: 'reads the potentially malicious spec from disk' },
          { node: 'DiscoverFromActivities', action: 'processes the spec through LLM which may encounter injected prompts' },
          { node: '_actors/LLMWorker', action: 'receives the spec content including any adversarial payloads' },
          { node: 'WriteActorsFile', action: 'writes whatever actors the LLM discovered including any injected entries' },
          { node: '_actors/Compiler', action: 'validates the resulting _actors.yaml for structural correctness' },
          { node: 'compilation/DuplicateDetection', action: 'catches any duplicate actor names injected by the adversarial content' },
          { node: 'compilation/DanglingRefDetection', action: 'catches any phantom references injected through the adversarial spec' },
        ],
      },
    },
  });

  return modules;
}

describe("SpecInjectionDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['SpecInjectionDefense'];

  it("step 1: _actors/MaliciousSpecAuthor submits a spec.md containing prompt injection or adversarial content", () => {
    const node = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('SpecInjectionDefense'))).toBe(true);
  });

  it("step 2: convergence/ReadSpec reads the potentially malicious spec from disk", () => {
    const node = result.index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/MaliciousSpecAuthor');
  });

  it("connection: _actors/MaliciousSpecAuthor → convergence/ReadSpec", () => {
    const src = result.index.nodes['_actors/MaliciousSpecAuthor'];
    expect(src.followed_by).toContain('convergence/ReadSpec');
  });

  it("step 3: actors/DiscoverFromActivities processes the spec through LLM which may encounter injected prompts", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ReadSpec');
  });

  it("connection: convergence/ReadSpec → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['convergence/ReadSpec'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 4: _actors/LLMWorker receives the spec content including any adversarial payloads", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → _actors/LLMWorker", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 5: actors/WriteActorsFile writes whatever actors the LLM discovered including any injected entries", () => {
    const node = result.index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/WriteActorsFile", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/WriteActorsFile');
  });

  it("step 6: _actors/Compiler validates the resulting _actors.yaml for structural correctness", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('actors/WriteActorsFile');
  });

  it("connection: actors/WriteActorsFile → _actors/Compiler", () => {
    const src = result.index.nodes['actors/WriteActorsFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 7: compilation/DuplicateDetection catches any duplicate actor names injected by the adversarial content", () => {
    const node = result.index.nodes['compilation/DuplicateDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/DuplicateDetection", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/DuplicateDetection');
  });

  it("step 8: compilation/DanglingRefDetection catches any phantom references injected through the adversarial spec", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/DuplicateDetection');
  });

  it("connection: compilation/DuplicateDetection → compilation/DanglingRefDetection", () => {
    const src = result.index.nodes['compilation/DuplicateDetection'];
    expect(src.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
