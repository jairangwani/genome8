// Auto-generated from journey: EnforceModuleSchema
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("EnforceModuleSchema", () => {
  // A well-formed module
  const validModules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      spec_sections: [1, 2, 3],
      nodes: {
        TaskRunner: { type: 'process', description: 'Runs tasks in order' },
        TaskLog: { type: 'artifact', description: 'Log of completed tasks' },
      },
      journeys: {
        RunTask: {
          steps: [
            { node: '_actors/Compiler', action: 'initiates task run' },
            { node: 'TaskRunner', action: 'runs the task' },
            { node: 'TaskLog', action: 'logs the result' },
          ],
        },
      },
    }],
  ]);

  // Module with invalid node type
  const invalidTypeModules = new Map<string, ModuleFile>([
    ['broken', {
      nodes: {
        BadNode: { type: 'widget' as any, description: 'Has an invalid type' },
      },
      journeys: {},
    }],
  ]);

  const validResult = compileFromModules(validModules);
  const invalidResult = compileFromModules(invalidTypeModules);

  it("step 1: graph/ModuleFile provides the raw YAML content of a module file for structural validation", () => {
    // The module is loaded and its nodes are available
    expect(validResult.index.nodes['mymod/TaskRunner']).toBeDefined();
    expect(validResult.index.nodes['mymod/TaskLog']).toBeDefined();
  });

  it("step 2: graph/ModuleSchemaRule checks that spec_sections exists and is a number array", () => {
    // Coverage includes spec_sections from the module
    const coverage = validResult.coverage.modules['mymod'];
    expect(coverage).toBeDefined();
    expect(coverage.spec_sections).toEqual([1, 2, 3]);
  });

  it("step 3: graph/ModuleSchemaRule checks that nodes exists and is a map where each entry has type and description fields", () => {
    // Each node has type and description
    const taskRunner = validResult.index.nodes['mymod/TaskRunner'];
    expect(taskRunner.type).toBe('process');
    expect(taskRunner.description).toBe('Runs tasks in order');
  });

  it("step 4: graph/ModuleSchemaRule checks that journeys exists and is a map where each entry has a steps array", () => {
    const journey = validResult.index.journeys['RunTask'];
    expect(journey).toBeDefined();
    expect(journey.steps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: graph/NodeDefinition validates each node entry has a non-empty description string", () => {
    for (const node of Object.values(validResult.index.nodes)) {
      expect(node.description).toBeTruthy();
      expect(typeof node.description).toBe('string');
    }
  });

  it("step 6: graph/StepFormatRule validates each step within each journey has node and action fields", () => {
    for (const journey of Object.values(validResult.index.journeys)) {
      for (const step of journey.steps) {
        expect(step.node).toBeTruthy();
        expect(step.action).toBeTruthy();
      }
    }
  });

  it("step 7: _actors/Compiler reports schema violations with the specific field path and expected structure", () => {
    // Invalid type generates an error
    const typeErrors = invalidResult.issues.filter(
      i => i.severity === 'error' && i.message.includes('Invalid type')
    );
    expect(typeErrors.length).toBeGreaterThan(0);
    expect(typeErrors[0].message).toContain('widget');
    expect(typeErrors[0].module).toBe('broken');
    expect(typeErrors[0].node).toBe('BadNode');
  });
});
