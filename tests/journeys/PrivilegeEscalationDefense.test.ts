// Auto-generated from journey: PrivilegeEscalationDefense
// Module: actors
// Triggered by: _actors/PrivilegeEscalator
// Modules touched: _actors, llm, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildEscalationModules(opts?: { danglingRef?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      PrivilegeEscalator: { type: 'actor', description: 'Attempts to use LLMWorker tools to access files outside box scope' },
      Compiler: { type: 'actor', description: 'Detects files or references outside the expected module scope' },
    },
    journeys: {},
  });

  modules.set('llm', {
    nodes: {
      NativeToolSet: { type: 'interface', description: 'Provides the tool access that could be exploited' },
      WriteFile: { type: 'process', description: 'Worker attempts to write to a path outside the box directory' },
    },
    journeys: {},
  });

  const journeySteps = [
    { node: '_actors/PrivilegeEscalator', action: 'attempts to use LLMWorker native tools to access files outside box scope' },
    { node: 'llm/NativeToolSet', action: 'provides the tool access that could be exploited' },
    { node: 'llm/WriteFile', action: 'worker attempts to write to a path outside the box directory' },
    { node: '_actors/Compiler', action: 'detects files or references outside the expected module scope' },
    { node: 'compilation/DanglingRefDetection', action: 'flags any references to nodes or files outside the box boundary' },
    { node: 'compilation/CompilationResult', action: 'reports the out-of-scope access as validation errors' },
  ];

  // Add a dangling ref if testing that scenario
  if (opts?.danglingRef) {
    journeySteps.push({
      node: 'external-system/ForbiddenNode',
      action: 'tries to reference a node outside the box',
    });
  }

  modules.set('compilation', {
    nodes: {
      DanglingRefDetection: { type: 'process', description: 'Flags references to nodes or files outside the box boundary' },
      CompilationResult: { type: 'artifact', description: 'Reports the out-of-scope access as validation errors' },
    },
    journeys: {
      PrivilegeEscalationDefense: { steps: journeySteps },
    },
  });

  return modules;
}

describe("PrivilegeEscalationDefense", () => {
  const modules = buildEscalationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['PrivilegeEscalationDefense'];

  it("step 1: _actors/PrivilegeEscalator attempts to use LLMWorker's native tools to access files outside box scope", () => {
    const node = result.index.nodes['_actors/PrivilegeEscalator'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: llm/NativeToolSet provides the tool access that could be exploited", () => {
    const node = result.index.nodes['llm/NativeToolSet'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.preceded_by).toContain('_actors/PrivilegeEscalator');
  });

  it("connection: _actors/PrivilegeEscalator → llm/NativeToolSet", () => {
    const from = result.index.nodes['_actors/PrivilegeEscalator'];
    expect(from.followed_by).toContain('llm/NativeToolSet');
  });

  it("step 3: llm/WriteFile worker attempts to write to a path outside the box directory", () => {
    const node = result.index.nodes['llm/WriteFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/NativeToolSet');
  });

  it("connection: llm/NativeToolSet → llm/WriteFile", () => {
    const from = result.index.nodes['llm/NativeToolSet'];
    expect(from.followed_by).toContain('llm/WriteFile');
  });

  it("step 4: _actors/Compiler detects files or references outside the expected module scope", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/WriteFile');
  });

  it("connection: llm/WriteFile → _actors/Compiler", () => {
    const from = result.index.nodes['llm/WriteFile'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 5: compilation/DanglingRefDetection flags any references to nodes or files outside the box boundary", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/DanglingRefDetection", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("step 6: compilation/CompilationResult reports the out-of-scope access as validation errors", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/DanglingRefDetection');
  });

  it("connection: compilation/DanglingRefDetection → compilation/CompilationResult", () => {
    const from = result.index.nodes['compilation/DanglingRefDetection'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("out-of-scope node references are flagged as dangling", () => {
    const danglingModules = buildEscalationModules({ danglingRef: true });
    const danglingResult = compileFromModules(danglingModules);
    const danglingIssues = danglingResult.issues.filter(i =>
      i.message.includes('external-system') || i.message.includes('ForbiddenNode') || i.message.includes('not found')
    );
    expect(danglingIssues.length).toBeGreaterThanOrEqual(1);
  });

  it("journey actor is PrivilegeEscalator", () => {
    expect(journey.actor).toBe('_actors/PrivilegeEscalator');
  });

  it("compiles without errors in the clean scenario", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
