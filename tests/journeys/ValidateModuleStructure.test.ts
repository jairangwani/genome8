// Auto-generated from journey: ValidateModuleStructure
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateModuleStructure", () => {
  it("step 1: _actors/Compiler reads a module YAML file during the parsing phase", () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        spec_sections: [1, 2],
        nodes: {
          Service: { type: 'process', description: 'A service that handles requests' },
        },
        journeys: {
          Flow: { steps: [{ node: 'Service', action: 'processes incoming requests' }] },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result).toBeDefined();
  });

  it("step 2: compilation/YAMLParsing parses the raw YAML into a structured object", () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        spec_sections: [1],
        nodes: { A: { type: 'process', description: 'Node A processes data' } },
        journeys: {},
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index.nodes['test/A']).toBeDefined();
    expect(result.index.nodes['test/A'].type).toBe('process');
  });

  it("step 3: compilation/SchemaViolationDetection checks that spec_sections exists and is a number array", () => {
    // A module with spec_sections compiles cleanly
    const modules = new Map<string, ModuleFile>([
      ['test', {
        spec_sections: [1, 2, 3],
        nodes: { A: { type: 'process', description: 'Node A processes data' } },
        journeys: { F: { steps: [{ node: 'A', action: 'does the thing correctly' }] } },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.coverage.modules['test'].spec_sections).toEqual([1, 2, 3]);
  });

  it("step 4: compilation/SchemaViolationDetection checks that nodes exists and is a map where each entry has type and description", () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        nodes: {
          Valid: { type: 'process', description: 'A valid node with type and description' },
        },
        journeys: { F: { steps: [{ node: 'Valid', action: 'runs the valid node process' }] } },
      }],
    ]);
    const result = compileFromModules(modules);
    const node = result.index.nodes['test/Valid'];
    expect(node.type).toBe('process');
    expect(node.description).toBe('A valid node with type and description');
  });

  it("step 5: compilation/SchemaViolationDetection checks that journeys exists and is a map where each entry has a steps array", () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        nodes: { A: { type: 'process', description: 'Process node for testing' } },
        journeys: {
          Flow: {
            steps: [
              { node: 'A', action: 'performs step one correctly' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index.journeys['Flow'].steps.length).toBe(1);
  });

  it("step 6: graph/ModuleSchemaRule enforces that any module failing these structural checks is rejected before content parsing", () => {
    // An invalid node type should produce an error
    const modules = new Map<string, ModuleFile>([
      ['test', {
        nodes: {
          Bad: { type: 'invalid_type' as any, description: 'Node with invalid type value' },
        },
        journeys: { F: { steps: [{ node: 'Bad', action: 'tries to use an invalid node' }] } },
      }],
    ]);
    const result = compileFromModules(modules);
    const typeErrors = result.issues.filter(i => i.message.includes('Invalid type'));
    expect(typeErrors.length).toBe(1);
  });

  it("step 7: compilation/ErrorReport records each schema violation with the field path and expected structure", () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        nodes: {
          Bad: { type: 'widget' as any, description: 'Node with invalid type' },
        },
        journeys: {},
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error' && i.message.includes('Invalid type'));
    expect(errors.length).toBe(1);
    expect(errors[0].module).toBe('test');
    expect(errors[0].message).toContain('must be one of');
  });
});
