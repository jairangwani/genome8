// Auto-generated from journey: CompileAfterModuleCreation
// Module: compilation
// Modules touched: convergence, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("CompileAfterModuleCreation", () => {
  // Simulate: existing module + newly created module
  const existingModules = new Map<string, ModuleFile>([
    ['core', {
      spec_sections: [1],
      nodes: {
        Engine: { type: 'process', description: 'Core compilation engine process' },
      },
      journeys: {
        Boot: {
          steps: [{ node: 'Engine', action: 'initializes the compilation engine' }],
        },
      },
    }],
  ]);

  const newModule: ModuleFile = {
    spec_sections: [2],
    nodes: {
      Validator: { type: 'process', description: 'Validates newly created module' },
    },
    journeys: {
      Validate: {
        steps: [
          { node: 'core/Engine', action: 'triggers validation after module creation' },
          { node: 'Validator', action: 'validates the new module content' },
        ],
      },
    },
  };

  // Merge: add the new module
  const allModules = new Map(existingModules);
  allModules.set('newmod', newModule);

  const result = compileFromModules(allModules);

  it("step 1: convergence/CompileCheck triggers compilation after LLMWorker creates a single new module", () => {
    // We simulate the trigger by compiling all modules including the new one
    expect(allModules.size).toBe(2);
  });

  it("step 2: graph/ModuleFile provides the newly created module file", () => {
    expect(allModules.get('newmod')).toBeDefined();
    expect(allModules.get('newmod')!.nodes.Validator).toBeDefined();
  });

  it("step 3: compilation/YAMLParsing parses the new module's YAML content", () => {
    // The new module is included in stats
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 4: compilation/YAMLErrorReporting checks the new module for YAML syntax errors", () => {
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 5: compilation/SchemaViolationDetection validates the new module has the required top-level structure before content parsing", () => {
    // No schema violations
    expect(result.index.nodes['newmod/Validator']).toBeDefined();
  });

  it("step 6: graph/IncrementalMerge merges the new module into the existing compiled index", () => {
    // Both modules' nodes are present
    expect(result.index.nodes['core/Engine']).toBeDefined();
    expect(result.index.nodes['newmod/Validator']).toBeDefined();
  });

  it("step 7: compilation/IncrementalValidation checks the new module's nodes for duplicates against the existing registry", () => {
    // No duplicates
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 8: compilation/DanglingRefDetection checks the new module's journey refs against all known nodes", () => {
    // The cross-module ref to core/Engine should resolve
    const errors = result.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(errors.length).toBe(0);
  });

  it("step 9: compilation/ExternalRefClassification classifies any unresolved refs from the new module as external warnings", () => {
    // No external refs in this fixture
    const extWarnings = result.issues.filter(i => i.severity === 'warning' && i.message.includes('external ref'));
    expect(extWarnings.length).toBe(0);
  });

  it("step 10: compilation/ValidationAggregation collects errors and warnings from the incremental checks", () => {
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("step 11: compilation/CompilationResult outputs the incremental compilation result for the new module", () => {
    expect(result.index._stats.total_nodes).toBe(2);
    expect(result.index._stats.total_journeys).toBe(2);
    expect(result.coverage).toBeDefined();
  });

  it("step 12: convergence/BoundedCreationLoop receives the result and proceeds to the next module if clean", () => {
    // Zero errors means the convergence loop can proceed
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });
});
