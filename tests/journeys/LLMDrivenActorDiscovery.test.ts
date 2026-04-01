// Auto-generated from journey: LLMDrivenActorDiscovery
// Module: actors
// Modules touched: convergence, llm, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      DiscoverActors: { type: 'process', description: 'delegates to LLM to discover actors from 3 angles and write _actors.yaml' },
    },
  });

  modules.set('llm', {
    nodes: {
      BuildTaskContext: { type: 'process', description: 'assembles the spec text and task-specific prompt into a context payload for the worker' },
      SendTask: { type: 'process', description: 'sends a task to the LLM worker via stream-JSON protocol' },
      ValidateWorkerOutput: { type: 'process', description: 'validates that the worker output matches the expected format before accepting' },
      ReceiveResult: { type: 'process', description: 'receives and parses the result from the LLM worker via stream-JSON protocol' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
    },
    journeys: {
      LLMDrivenActorDiscovery: {
        steps: [
          { node: 'convergence/DiscoverActors', action: 'triggers actor discovery and prepares the discovery task payload' },
          { node: 'llm/BuildTaskContext', action: 'assembles the spec text and discovery-angle prompt into a task context' },
          { node: 'llm/SendTask', action: 'sends the activities-angle discovery task to the LLM worker' },
          { node: 'llm/ValidateWorkerOutput', action: 'the worker reads the spec and produces actor entries using native Read tool' },
          { node: 'llm/ReceiveResult', action: 'receives the raw activities-angle actor list from the worker' },
          { node: 'llm/ValidateWorkerOutput', action: 'checks the worker output is valid YAML with actor entries before accepting' },
          { node: 'DiscoverFromActivities', action: 'stores the validated activities-angle actors' },
          { node: 'llm/SendTask', action: 'sends the threats-angle discovery task to the same worker' },
          { node: 'llm/ReceiveResult', action: 'receives the raw threats-angle actor list from the worker' },
          { node: 'DiscoverFromThreats', action: 'stores the validated threats-angle actors' },
          { node: 'llm/SendTask', action: 'sends the lifecycle-angle discovery task to the same worker' },
          { node: 'llm/ReceiveResult', action: 'receives the raw lifecycle-angle actor list from the worker' },
          { node: 'DiscoverFromLifecycle', action: 'stores the validated lifecycle-angle actors' },
          { node: 'MergeAndDeduplicate', action: 'merges all three angle results into the final actor set' },
        ],
      },
    },
  });

  return modules;
}

describe("LLMDrivenActorDiscovery", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['LLMDrivenActorDiscovery'];

  it("step 1: convergence/DiscoverActors triggers actor discovery and prepares the discovery task payload", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('LLMDrivenActorDiscovery'))).toBe(true);
  });

  it("step 2: llm/BuildTaskContext assembles the spec text and discovery-angle prompt into a task context", () => {
    const node = result.index.nodes['llm/BuildTaskContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → llm/BuildTaskContext", () => {
    const src = result.index.nodes['convergence/DiscoverActors'];
    expect(src.followed_by).toContain('llm/BuildTaskContext');
  });

  it("step 3: llm/SendTask sends the activities-angle discovery task to the LLM worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/BuildTaskContext');
  });

  it("connection: llm/BuildTaskContext → llm/SendTask", () => {
    const src = result.index.nodes['llm/BuildTaskContext'];
    expect(src.followed_by).toContain('llm/SendTask');
  });

  it("step 4: llm/ValidateWorkerOutput the worker reads the spec and produces actor entries using native Read tool", () => {
    const node = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ValidateWorkerOutput", () => {
    const src = result.index.nodes['llm/SendTask'];
    expect(src.followed_by).toContain('llm/ValidateWorkerOutput');
  });

  it("step 5: llm/ReceiveResult receives the raw activities-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ValidateWorkerOutput');
  });

  it("connection: llm/ValidateWorkerOutput → llm/ReceiveResult", () => {
    const src = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(src.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 6: llm/ValidateWorkerOutput checks the worker output is valid YAML with actor entries before accepting", () => {
    const node = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → llm/ValidateWorkerOutput", () => {
    const src = result.index.nodes['llm/ReceiveResult'];
    expect(src.followed_by).toContain('llm/ValidateWorkerOutput');
  });

  it("step 7: actors/DiscoverFromActivities stores the validated activities-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ValidateWorkerOutput');
  });

  it("connection: llm/ValidateWorkerOutput → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 8: llm/SendTask sends the threats-angle discovery task to the same worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → llm/SendTask", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('llm/SendTask');
  });

  it("step 9: llm/ReceiveResult receives the raw threats-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ReceiveResult", () => {
    const src = result.index.nodes['llm/SendTask'];
    expect(src.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 10: actors/DiscoverFromThreats stores the validated threats-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['llm/ReceiveResult'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 11: llm/SendTask sends the lifecycle-angle discovery task to the same worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → llm/SendTask", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('llm/SendTask');
  });

  it("step 12: llm/ReceiveResult receives the raw lifecycle-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ReceiveResult", () => {
    const src = result.index.nodes['llm/SendTask'];
    expect(src.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 13: actors/DiscoverFromLifecycle stores the validated lifecycle-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['llm/ReceiveResult'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 14: actors/MergeAndDeduplicate merges all three angle results into the final actor set", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("journey has 14 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(14);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
