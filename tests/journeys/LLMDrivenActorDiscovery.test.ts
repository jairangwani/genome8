// Auto-generated from journey: LLMDrivenActorDiscovery
// Module: actors
// Modules touched: convergence, llm, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildLLMDiscoveryModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      DiscoverActors: { type: 'process', description: 'Triggers actor discovery and prepares the discovery task payload' },
    },
    journeys: {},
  });

  modules.set('llm', {
    nodes: {
      BuildTaskContext: { type: 'process', description: 'Assembles the spec text and discovery-angle prompt into a task context' },
      SendTask: { type: 'process', description: 'Sends the discovery task to the LLM worker' },
      ValidateWorkerOutput: { type: 'process', description: 'Checks the worker output is valid YAML with actor entries before accepting' },
      ReceiveResult: { type: 'process', description: 'Receives the raw actor list from the worker' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Stores the validated activities-angle actors' },
      DiscoverFromThreats: { type: 'process', description: 'Stores the validated threats-angle actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'Stores the validated lifecycle-angle actors' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges all three angle results into the final actor set' },
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
  const modules = buildLLMDiscoveryModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['LLMDrivenActorDiscovery'];

  it("step 1: convergence/DiscoverActors triggers actor discovery and prepares the discovery task payload", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: llm/BuildTaskContext assembles the spec text and discovery-angle prompt into a task context", () => {
    const node = result.index.nodes['llm/BuildTaskContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → llm/BuildTaskContext", () => {
    const from = result.index.nodes['convergence/DiscoverActors'];
    expect(from.followed_by).toContain('llm/BuildTaskContext');
  });

  it("step 3: llm/SendTask sends the activities-angle discovery task to the LLM worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/BuildTaskContext');
  });

  it("connection: llm/BuildTaskContext → llm/SendTask", () => {
    const from = result.index.nodes['llm/BuildTaskContext'];
    expect(from.followed_by).toContain('llm/SendTask');
  });

  it("step 4: llm/ValidateWorkerOutput the worker reads the spec and produces actor entries using native Read tool", () => {
    const node = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ValidateWorkerOutput", () => {
    const from = result.index.nodes['llm/SendTask'];
    expect(from.followed_by).toContain('llm/ValidateWorkerOutput');
  });

  it("step 5: llm/ReceiveResult receives the raw activities-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ValidateWorkerOutput');
  });

  it("connection: llm/ValidateWorkerOutput → llm/ReceiveResult", () => {
    const from = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(from.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 6: llm/ValidateWorkerOutput checks the worker output is valid YAML with actor entries before accepting", () => {
    const node = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/ReceiveResult → llm/ValidateWorkerOutput", () => {
    const from = result.index.nodes['llm/ReceiveResult'];
    expect(from.followed_by).toContain('llm/ValidateWorkerOutput');
  });

  it("step 7: actors/DiscoverFromActivities stores the validated activities-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ValidateWorkerOutput');
  });

  it("connection: llm/ValidateWorkerOutput → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['llm/ValidateWorkerOutput'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 8: llm/SendTask sends the threats-angle discovery task to the same worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → llm/SendTask", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('llm/SendTask');
  });

  it("step 9: llm/ReceiveResult receives the raw threats-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ReceiveResult", () => {
    const from = result.index.nodes['llm/SendTask'];
    expect(from.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 10: actors/DiscoverFromThreats stores the validated threats-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['llm/ReceiveResult'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 11: llm/SendTask sends the lifecycle-angle discovery task to the same worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → llm/SendTask", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('llm/SendTask');
  });

  it("step 12: llm/ReceiveResult receives the raw lifecycle-angle actor list from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → llm/ReceiveResult", () => {
    const from = result.index.nodes['llm/SendTask'];
    expect(from.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 13: actors/DiscoverFromLifecycle stores the validated lifecycle-angle actors", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['llm/ReceiveResult'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 14: actors/MergeAndDeduplicate merges all three angle results into the final actor set", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("journey covers full LLM-driven discovery pipeline (14 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(14);
    expect(journey.steps[0].node).toBe('convergence/DiscoverActors');
    expect(journey.steps[13].node).toBe('actors/MergeAndDeduplicate');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
