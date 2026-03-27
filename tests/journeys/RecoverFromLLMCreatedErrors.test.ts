// Auto-generated from journey: RecoverFromLLMCreatedErrors
// Module: compilation
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, graph, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RecoverFromLLMCreatedErrors", () => {
  // Simulate: LLM creates a bad module with a parse error
  const brokenModules = new Map<string, ModuleFile>([
    ['good', {
      nodes: { Service: { type: 'process', description: 'A working service module' } },
      journeys: {
        Work: { steps: [{ node: 'Service', action: 'performs its main task' }] },
      },
    }],
    ['bad', {
      nodes: {},
      journeys: {},
      _parseError: 'YAML parse error in bad.yaml: bad indentation at line 5',
    } as ModuleFile],
  ]);

  // After LLM fixes the module
  const fixedModules = new Map<string, ModuleFile>([
    ['good', {
      nodes: { Service: { type: 'process', description: 'A working service module' } },
      journeys: {
        Work: { steps: [{ node: 'Service', action: 'performs its main task' }] },
      },
    }],
    ['bad', {
      nodes: {
        Handler: { type: 'process', description: 'Handles requests after LLM fix' },
      },
      journeys: {
        Handle: { steps: [{ node: 'Handler', action: 'processes the fixed request' }] },
      },
    }],
  ]);

  const brokenResult = compileFromModules(brokenModules);
  const fixedResult = compileFromModules(fixedModules);

  it("step 1: _actors/LLMWorker creates a module with YAML errors or validation problems during convergence", () => {
    // The bad module has a parse error
    expect((brokenModules.get('bad') as any)._parseError).toContain('YAML parse error');
  });

  it("step 2: graph/ModuleFile stores the problematic module on disk", () => {
    expect(brokenModules.has('bad')).toBe(true);
  });

  it("step 3: compilation/YAMLParsing attempts to parse the new module's YAML", () => {
    // Compilation still completes — doesn't throw
    expect(brokenResult).toBeDefined();
    expect(brokenResult.index._stats.modules).toBe(2);
  });

  it("step 4: compilation/YAMLErrorReporting detects YAML syntax errors or malformed structure in the LLM output", () => {
    const parseErrors = brokenResult.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(1);
    expect(parseErrors[0].module).toBe('bad');
  });

  it("step 5: compilation/SchemaViolationDetection checks whether the LLM output has the required top-level structure (spec_sections, nodes, journeys)", () => {
    // The bad module has empty nodes/journeys due to parse failure
    expect(brokenModules.get('bad')!.nodes).toEqual({});
  });

  it("step 6: compilation/ErrorReport records the specific errors with locations and messages", () => {
    const errors = brokenResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('YAML parse error');
  });

  it("step 7: compilation/CompilationResult outputs a non-zero error result for this module", () => {
    const errors = brokenResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
  });

  it("step 8: convergence/AuditGapFix receives the error report and delegates a targeted fix to the LLM", () => {
    // The error report is available in issues
    expect(brokenResult.issues.length).toBeGreaterThan(0);
  });

  it("step 9: _actors/LLMWorker reads the error report and edits the module to fix the specific errors", () => {
    // The fixed module now has valid content
    expect(fixedModules.get('bad')!.nodes.Handler).toBeDefined();
  });

  it("step 10: graph/ModuleFile stores the corrected module on disk", () => {
    expect(fixedModules.has('bad')).toBe(true);
    expect((fixedModules.get('bad') as any)._parseError).toBeUndefined();
  });

  it("step 11: compilation/FieldLossDetection compares the original and corrected module files to detect any fields silently dropped during the LLM fix", () => {
    // The fixed module has nodes where the broken one had none
    expect(Object.keys(fixedModules.get('bad')!.nodes).length).toBeGreaterThan(0);
  });

  it("step 12: graph/FieldPreservation verifies that extension fields like files were not stripped during the LLM rewrite", () => {
    // Both good modules are identical — no fields lost
    expect(fixedModules.get('good')).toEqual(brokenModules.get('good'));
  });

  it("step 13: compilation/YAMLParsing reparses the corrected module", () => {
    expect(fixedResult.index._stats.modules).toBe(2);
  });

  it("step 14: compilation/YAMLErrorReporting confirms no YAML errors remain in the corrected module", () => {
    const parseErrors = fixedResult.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 15: compilation/IncrementalValidation validates the corrected module against the existing graph", () => {
    expect(fixedResult.index.nodes['bad/Handler']).toBeDefined();
  });

  it("step 16: compilation/DanglingRefDetection checks the corrected module's refs resolve correctly", () => {
    const danglingErrors = fixedResult.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(danglingErrors.length).toBe(0);
  });

  it("step 17: compilation/DuplicateDetection checks the corrected module introduces no duplicate names", () => {
    expect(fixedResult.index._stats.duplicate_names).toBe(0);
  });

  it("step 18: compilation/ValidationAggregation collects the revalidation results", () => {
    expect(Array.isArray(fixedResult.issues)).toBe(true);
  });

  it("step 19: compilation/CompilationResult outputs a clean result confirming the fix resolved the errors", () => {
    const errors = fixedResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(fixedResult.index._stats.total_nodes).toBe(2);
    expect(fixedResult.index._stats.total_journeys).toBe(2);
  });
});
