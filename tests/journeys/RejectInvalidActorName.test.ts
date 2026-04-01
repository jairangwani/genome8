// Auto-generated from journey: RejectInvalidActorName
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, actors, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildInvalidNameModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'Produces actor entries from the 3-angle discovery' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      MergedActorList: { type: 'artifact', description: 'Provides the merged actor list with names for format validation' },
      ValidateActorNameFormat: { type: 'process', description: 'Checks each actor name against valid PascalCase identifier rules' },
      MergeAndDeduplicate: { type: 'process', description: 'Re-merges with the corrected name to check for new duplicates against existing actors' },
    },
    journeys: {
      RejectInvalidActorName: {
        steps: [
          { node: '_actors/LLMWorker', action: 'produces actor entries from the 3-angle discovery' },
          { node: 'MergedActorList', action: 'provides the merged actor list with names for format validation' },
          { node: 'ValidateActorNameFormat', action: 'checks each actor name against valid PascalCase identifier rules' },
          { node: 'ValidateActorNameFormat', action: 'detects an actor name containing spaces, hyphens, special characters, or lowercase-start' },
          { node: 'llm/SendTask', action: 'sends the invalid name with the PascalCase naming convention as a correction task' },
          { node: '_actors/LLMWorker', action: 're-formats the actor name to valid PascalCase matching the convention' },
          { node: 'MergeAndDeduplicate', action: 're-merges with the corrected name to check for new duplicates against existing actors' },
          { node: 'ValidateActorNameFormat', action: 're-validates and confirms all actor names are now valid identifiers' },
        ],
      },
    },
  });

  modules.set('llm', {
    nodes: {
      SendTask: { type: 'process', description: 'Sends the invalid name with the PascalCase naming convention as a correction task' },
    },
    journeys: {},
  });

  return modules;
}

describe("RejectInvalidActorName", () => {
  const modules = buildInvalidNameModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RejectInvalidActorName'];

  it("step 1: _actors/LLMWorker produces actor entries from the 3-angle discovery", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: actors/MergedActorList provides the merged actor list with names for format validation", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/MergedActorList", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/MergedActorList');
  });

  it("step 3: actors/ValidateActorNameFormat checks each actor name against valid PascalCase identifier rules", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/ValidateActorNameFormat", () => {
    const from = result.index.nodes['actors/MergedActorList'];
    expect(from.followed_by).toContain('actors/ValidateActorNameFormat');
  });

  it("step 4: actors/ValidateActorNameFormat detects an actor name containing spaces, hyphens, special characters, or lowercase-start", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node).toBeDefined();
    // Self-connection: same node consecutively
    expect(node.followed_by).toContain('llm/SendTask');
  });

  it("connection: actors/ValidateActorNameFormat → actors/ValidateActorNameFormat", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("step 5: llm/SendTask sends the invalid name with the PascalCase naming convention as a correction task", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorNameFormat');
  });

  it("connection: actors/ValidateActorNameFormat → llm/SendTask", () => {
    const from = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(from.followed_by).toContain('llm/SendTask');
  });

  it("step 6: _actors/LLMWorker re-formats the actor name to valid PascalCase matching the convention", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → _actors/LLMWorker", () => {
    const from = result.index.nodes['llm/SendTask'];
    expect(from.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 7: actors/MergeAndDeduplicate re-merges with the corrected name to check for new duplicates against existing actors", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['_actors/LLMWorker'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 8: actors/ValidateActorNameFormat re-validates and confirms all actor names are now valid identifiers", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/ValidateActorNameFormat", () => {
    const from = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(from.followed_by).toContain('actors/ValidateActorNameFormat');
  });

  it("journey covers full name validation cycle (8 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(8);
    expect(journey.steps[0].node).toBe('_actors/LLMWorker');
    expect(journey.steps[7].node).toBe('actors/ValidateActorNameFormat');
  });

  it("journey actor is LLMWorker", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
