// Auto-generated from journey: RejectInvalidActorName
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, actors, llm

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

  modules.set('llm', {
    nodes: {
      SendTask: { type: 'process', description: 'sends a task to the LLM worker via stream-JSON protocol' },
    },
  });

  modules.set('actors', {
    nodes: {
      MergedActorList: { type: 'artifact', description: 'the deduplicated combined actor list from all 3 discovery angles' },
      ValidateActorNameFormat: { type: 'process', description: 'checks that each discovered actor name uses valid PascalCase identifier format' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
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

  return modules;
}

describe("RejectInvalidActorName", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['RejectInvalidActorName'];

  it("step 1: _actors/LLMWorker produces actor entries from the 3-angle discovery", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('RejectInvalidActorName'))).toBe(true);
  });

  it("step 2: actors/MergedActorList provides the merged actor list with names for format validation", () => {
    const node = result.index.nodes['actors/MergedActorList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/MergedActorList", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/MergedActorList');
  });

  it("step 3: actors/ValidateActorNameFormat checks each actor name against valid PascalCase identifier rules", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/MergedActorList');
  });

  it("connection: actors/MergedActorList → actors/ValidateActorNameFormat", () => {
    const src = result.index.nodes['actors/MergedActorList'];
    expect(src.followed_by).toContain('actors/ValidateActorNameFormat');
  });

  it("step 4: actors/ValidateActorNameFormat detects an actor name containing spaces, hyphens, special characters, or lowercase-start", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node.preceded_by).toContain('actors/ValidateActorNameFormat');
  });

  it("connection: actors/ValidateActorNameFormat → actors/ValidateActorNameFormat", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node.preceded_by).toContain('actors/ValidateActorNameFormat');
    expect(node.followed_by).toContain('actors/ValidateActorNameFormat');
  });

  it("step 5: llm/SendTask sends the invalid name with the PascalCase naming convention as a correction task", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/ValidateActorNameFormat');
  });

  it("connection: actors/ValidateActorNameFormat → llm/SendTask", () => {
    const src = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(src.followed_by).toContain('llm/SendTask');
  });

  it("step 6: _actors/LLMWorker re-formats the actor name to valid PascalCase matching the convention", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → _actors/LLMWorker", () => {
    const src = result.index.nodes['llm/SendTask'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 7: actors/MergeAndDeduplicate re-merges with the corrected name to check for new duplicates against existing actors", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("step 8: actors/ValidateActorNameFormat re-validates and confirms all actor names are now valid identifiers", () => {
    const node = result.index.nodes['actors/ValidateActorNameFormat'];
    expect(node.preceded_by).toContain('actors/MergeAndDeduplicate');
  });

  it("connection: actors/MergeAndDeduplicate → actors/ValidateActorNameFormat", () => {
    const src = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(src.followed_by).toContain('actors/ValidateActorNameFormat');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
