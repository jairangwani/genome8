// Auto-generated from journey: PrivilegeEscalationDefense
// Module: actors
// Triggered by: _actors/PrivilegeEscalator
// Modules touched: _actors, llm, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['PrivilegeEscalationDefense'];
const steps = journey.steps;

describe("PrivilegeEscalationDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'llm', 'compilation'])
    );
  });

  it("step 1: _actors/PrivilegeEscalator attempts to use LLMWorker's native tools to access files outside box scope", () => {
    // Node: _actors/PrivilegeEscalator (actor)
    // Action: attempts to use LLMWorker's native tools to access files outside box scope
    const step = steps[0];
    expect(step.node).toBe('_actors/PrivilegeEscalator');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/PrivilegeEscalator'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('tool access');
    // PrivilegeEscalator is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/PrivilegeEscalator');
    // Followed by NativeToolSet in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['llm/NativeToolSet'])
    );
  });

  it("step 2: llm/NativeToolSet provides the tool access that could be exploited", () => {
    // Node: llm/NativeToolSet (interface)
    // Action: provides the tool access that could be exploited
    const step = steps[1];
    expect(step.node).toBe('llm/NativeToolSet');
    expect(step.step_number).toBe(2);

    const node = index.nodes['llm/NativeToolSet'];
    expect(node).toBeDefined();
    expect(node.type).toBe('interface');
    expect(node.description).toContain('Read, Write, Edit, Bash');
    expect(node.module).toBe('llm');
    // Preceded by PrivilegeEscalator in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/PrivilegeEscalator'])
    );
    // Followed by WriteFile in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['llm/WriteFile'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: llm/WriteFile worker attempts to write to a path outside the box directory", () => {
    // Node: llm/WriteFile (process)
    // Action: worker attempts to write to a path outside the box directory
    const step = steps[2];
    expect(step.node).toBe('llm/WriteFile');
    expect(step.step_number).toBe(3);

    const node = index.nodes['llm/WriteFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('Write tool');
    expect(node.module).toBe('llm');
    // Preceded by NativeToolSet in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['llm/NativeToolSet'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 4: _actors/Compiler detects files or references outside the expected module scope", () => {
    // Node: _actors/Compiler (actor)
    // Action: detects files or references outside the expected module scope
    const step = steps[3];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(4);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Preceded by WriteFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['llm/WriteFile'])
    );
    // Followed by DanglingRefDetection in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/DanglingRefDetection'])
    );
  });

  it("step 5: compilation/DanglingRefDetection flags any references to nodes or files outside the box boundary", () => {
    // Node: compilation/DanglingRefDetection (process)
    // Action: flags any references to nodes or files outside the box boundary
    const step = steps[4];
    expect(step.node).toBe('compilation/DanglingRefDetection');
    expect(step.step_number).toBe(5);

    const node = index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('no known node');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by CompilationResult in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: compilation/CompilationResult reports the out-of-scope access as validation errors", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: reports the out-of-scope access as validation errors
    const step = steps[5];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(6);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by DanglingRefDetection in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/DanglingRefDetection'])
    );
  });

  it("journey forms the full exploit-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/PrivilegeEscalator',
      'llm/NativeToolSet',
      'llm/WriteFile',
      '_actors/Compiler',
      'compilation/DanglingRefDetection',
      'compilation/CompilationResult',
    ]);
  });

  it("exploit flows through llm module (steps 1-3), defense resolves in compilation (steps 4-6)", () => {
    // Exploit: escalator uses llm tools to write out of scope
    const exploitSteps = steps.slice(0, 3);
    expect(exploitSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('llm/')
    )).toBe(true);
    // Defense: compiler detects and reports violations
    const defenseSteps = steps.slice(3);
    expect(defenseSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('compilation/')
    )).toBe(true);
  });

  it("every consecutive step pair crosses a module boundary except within llm and compilation", () => {
    const modules = steps.map(s => s.node.split('/')[0]);
    // _actors→llm→llm→_actors→compilation→compilation
    expect(modules[0]).not.toBe(modules[1]); // _actors → llm
    expect(modules[1]).toBe(modules[2]);     // llm → llm
    expect(modules[2]).not.toBe(modules[3]); // llm → _actors
    expect(modules[3]).not.toBe(modules[4]); // _actors → compilation
    expect(modules[4]).toBe(modules[5]);     // compilation → compilation
  });

  it("crosses 3 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'llm', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("PrivilegeEscalator is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/PrivilegeEscalator');
    const node = index.nodes['_actors/PrivilegeEscalator'];
    expect(node.type).toBe('actor');
  });
});
