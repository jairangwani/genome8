// Auto-generated from journey: PreserveFieldsOnRewrite
// Module: graph
// Triggered by: _actors/LLMWorker
// Modules touched: graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("PreserveFieldsOnRewrite", () => {
  // Original module with extension fields (files, properties)
  const originalModule: ModuleFile = {
    spec_sections: [1, 2],
    nodes: {
      Processor: {
        type: 'process',
        description: 'Processes data',
        files: ['src/processor.ts'],
        properties: { priority: 'high' },
      },
      Store: { type: 'artifact', description: 'Data store', files: ['src/store.ts'] },
    },
    journeys: {
      Process: {
        steps: [
          { node: 'Processor', action: 'processes the data' },
          { node: 'Store', action: 'stores the result' },
        ],
      },
    },
  };

  // Rewritten module: LLM adds a new node but preserves existing fields
  const rewrittenModule: ModuleFile = {
    spec_sections: [1, 2],
    nodes: {
      Processor: {
        type: 'process',
        description: 'Processes data with validation',
        files: ['src/processor.ts'],
        properties: { priority: 'high' },
      },
      Store: { type: 'artifact', description: 'Data store', files: ['src/store.ts'] },
      Validator: { type: 'rule', description: 'Validates input data' },
    },
    journeys: {
      Process: {
        steps: [
          { node: 'Processor', action: 'processes the data' },
          { node: 'Validator', action: 'validates the output' },
          { node: 'Store', action: 'stores the result' },
        ],
      },
    },
  };

  const originalModules = new Map<string, ModuleFile>([['mymod', originalModule]]);
  const rewrittenModules = new Map<string, ModuleFile>([['mymod', rewrittenModule]]);

  const resultOriginal = compileFromModules(originalModules);
  const resultRewritten = compileFromModules(rewrittenModules);

  it("step 1: graph/ModuleFile provides the original YAML content of a module before modification", () => {
    expect(resultOriginal.index.nodes['mymod/Processor']).toBeDefined();
    expect(resultOriginal.index.nodes['mymod/Store']).toBeDefined();
    expect(resultOriginal.index._stats.total_nodes).toBe(2);
  });

  it("step 2: _actors/LLMWorker edits the module file to add or modify nodes or journeys", () => {
    // After rewrite, a new node was added
    expect(resultRewritten.index.nodes['mymod/Validator']).toBeDefined();
    expect(resultRewritten.index._stats.total_nodes).toBe(3);

    // Description was updated on Processor
    expect(resultRewritten.index.nodes['mymod/Processor'].description).toBe('Processes data with validation');
  });

  it("step 3: graph/FieldPreservation verifies that all fields present in the original file still exist in the rewritten file", () => {
    // Processor's files and properties are preserved
    const proc = resultRewritten.index.nodes['mymod/Processor'];
    expect(proc.files).toEqual(['src/processor.ts']);
    expect(proc.properties).toEqual({ priority: 'high' });
  });

  it("step 4: graph/FieldPreservation verifies that extension fields like files were not stripped during the rewrite", () => {
    // Store's files are preserved
    const store = resultRewritten.index.nodes['mymod/Store'];
    expect(store.files).toEqual(['src/store.ts']);
  });

  it("step 5: graph/ModuleSchemaRule validates the rewritten file still conforms to the required module structure", () => {
    // No errors from the rewritten module
    const errors = resultRewritten.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);

    // All node types are valid
    const validTypes = ['actor', 'process', 'artifact', 'interface', 'rule'];
    for (const node of Object.values(resultRewritten.index.nodes)) {
      expect(validTypes).toContain(node.type);
    }
  });

  it("step 6: graph/ModuleFile stores the rewritten module only after preservation checks pass", () => {
    // Coverage still has the same spec_sections
    const coverage = resultRewritten.coverage.modules['mymod'];
    expect(coverage.spec_sections).toEqual([1, 2]);
    expect(coverage.nodes).toBe(3);
    expect(coverage.journeys).toBe(1);
  });
});
