// Auto-generated from journey: HandlePartialParseFailure
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandlePartialParseFailure", () => {
  // One good module, one with a parse error
  const modules = new Map<string, ModuleFile>([
    ['good', {
      spec_sections: [1],
      nodes: {
        Worker: { type: 'process', description: 'Processes work items reliably' },
      },
      journeys: {
        DoWork: { steps: [{ node: 'Worker', action: 'processes a work item end-to-end' }] },
      },
    }],
    ['broken', {
      nodes: {},
      journeys: {},
      _parseError: 'YAML parse error in broken.yaml: unexpected token at line 3',
    } as ModuleFile],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler begins parsing all module YAML files", () => {
    expect(modules.size).toBe(2);
  });

  it("step 2: compilation/YAMLParsing attempts to parse each module file", () => {
    // Both modules are in the map (one parseable, one with error)
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 3: compilation/YAMLErrorReporting catches a fatal parse error in one or more modules", () => {
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(1);
    expect(parseErrors[0].module).toBe('broken');
  });

  it("step 4: compilation/ErrorReport records the parse failure with file name, line number, and error message", () => {
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors[0].message).toContain('broken.yaml');
    expect(parseErrors[0].severity).toBe('error');
  });

  it("step 5: compilation/SkipMalformedModule excludes the malformed module from the compiled index", () => {
    // The broken module contributed no nodes
    expect(result.index.nodes['broken/anything']).toBeUndefined();
    // Only the good module's node is present
    expect(result.index.nodes['good/Worker']).toBeDefined();
  });

  it("step 6: graph/NodeDefinition parses node entries from only the successfully parsed modules", () => {
    expect(result.index._stats.total_nodes).toBe(1);
    expect(result.index.nodes['good/Worker'].type).toBe('process');
  });

  it("step 7: graph/JourneyDefinition parses journey entries from only the successfully parsed modules", () => {
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.index.journeys['DoWork']).toBeDefined();
  });

  it("step 8: graph/CompiledIndex builds a partial compiled index from the parseable modules", () => {
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(1);
  });

  it("step 9: compilation/ValidationAggregation aggregates errors including the skipped module's parse failure", () => {
    expect(result.issues.length).toBeGreaterThan(0);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
  });

  it("step 10: compilation/CompilationResult outputs a result with non-zero error count due to the malformed module", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(1);
  });

  it("step 11: compilation/ZeroErrorConvergence fails the zero-error check, blocking convergence until the module is fixed", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
    // Convergence would be blocked
  });
});
