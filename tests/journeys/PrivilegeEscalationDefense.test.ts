// Auto-generated from journey: PrivilegeEscalationDefense
// Module: actors
// Triggered by: _actors/PrivilegeEscalator
// Modules touched: _actors, llm, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      PrivilegeEscalator: { type: 'actor', description: 'an adversary who attempts to use LLM worker native tools to access files outside box scope' },
      Compiler: { type: 'actor', description: 'the compilation engine that reads all YAML modules and produces the compiled index' },
    },
  });

  modules.set('llm', {
    nodes: {
      NativeToolSet: { type: 'interface', description: 'the set of native tools (Read, Write, Bash, etc.) available to the LLM worker' },
      WriteFile: { type: 'process', description: 'writes a file to disk using the LLM worker native Write tool' },
    },
  });

  modules.set('compilation', {
    nodes: {
      DanglingRefDetection: { type: 'process', description: 'detects journey step references to nodes that do not exist in any module' },
      CompilationResult: { type: 'artifact', description: 'the final compilation output containing the index, issues, and coverage report' },
    },
    journeys: {
      PrivilegeEscalationDefense: {
        steps: [
          { node: '_actors/PrivilegeEscalator', action: 'attempts to use LLMWorker native tools to access files outside box scope' },
          { node: 'llm/NativeToolSet', action: 'provides the tool access that could be exploited' },
          { node: 'llm/WriteFile', action: 'worker attempts to write to a path outside the box directory' },
          { node: '_actors/Compiler', action: 'detects files or references outside the expected module scope' },
          { node: 'DanglingRefDetection', action: 'flags any references to nodes or files outside the box boundary' },
          { node: 'CompilationResult', action: 'reports the out-of-scope access as validation errors' },
        ],
      },
    },
  });

  return modules;
}

describe("PrivilegeEscalationDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['PrivilegeEscalationDefense'];

  it("step 1: _actors/PrivilegeEscalator attempts to use LLMWorker's native tools to access files outside box scope", () => {
    const node = result.index.nodes['_actors/PrivilegeEscalator'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('PrivilegeEscalationDefense'))).toBe(true);
  });

  it("step 2: llm/NativeToolSet provides the tool access that could be exploited", () => {
    const node = result.index.nodes['llm/NativeToolSet'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.preceded_by).toContain('_actors/PrivilegeEscalator');
  });

  it("connection: _actors/PrivilegeEscalator → llm/NativeToolSet", () => {
    const src = result.index.nodes['_actors/PrivilegeEscalator'];
    expect(src.followed_by).toContain('llm/NativeToolSet');
  });

  it("step 3: llm/WriteFile worker attempts to write to a path outside the box directory", () => {
    const node = result.index.nodes['llm/WriteFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/NativeToolSet');
  });

  it("connection: llm/NativeToolSet → llm/WriteFile", () => {
    const src = result.index.nodes['llm/NativeToolSet'];
    expect(src.followed_by).toContain('llm/WriteFile');
  });

  it("step 4: _actors/Compiler detects files or references outside the expected module scope", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/WriteFile');
  });

  it("connection: llm/WriteFile → _actors/Compiler", () => {
    const src = result.index.nodes['llm/WriteFile'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 5: compilation/DanglingRefDetection flags any references to nodes or files outside the box boundary", () => {
    const node = result.index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/DanglingRefDetection", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/DanglingRefDetection');
  });

  it("step 6: compilation/CompilationResult reports the out-of-scope access as validation errors", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/DanglingRefDetection');
  });

  it("connection: compilation/DanglingRefDetection → compilation/CompilationResult", () => {
    const src = result.index.nodes['compilation/DanglingRefDetection'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
