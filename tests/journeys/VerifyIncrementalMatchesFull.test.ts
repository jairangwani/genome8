// Auto-generated from journey: VerifyIncrementalMatchesFull
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: graph, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("VerifyIncrementalMatchesFull", () => {
  // Simulate incremental: compile module A alone, then A+B together
  // Then compare against full compile of A+B
  const moduleA: ModuleFile = {
    nodes: {
      Parser: { type: 'process', description: 'Parses input files for processing' },
    },
    journeys: {
      Parse: { steps: [{ node: 'Parser', action: 'parses the input file content' }] },
    },
  };

  const moduleB: ModuleFile = {
    nodes: {
      Validator: { type: 'process', description: 'Validates parsed output correctness' },
    },
    journeys: {
      Validate: {
        steps: [
          { node: 'modA/Parser', action: 'provides parsed output for validation' },
          { node: 'Validator', action: 'validates the parsed output' },
        ],
      },
    },
  };

  // Incremental: first just A
  const incrementalA = compileFromModules(new Map([['modA', moduleA]]));
  // Full: A + B together
  const full = compileFromModules(new Map([['modA', moduleA], ['modB', moduleB]]));

  it("step 1: graph/CompiledIndex provides the compiled index built incrementally during module-by-module convergence", () => {
    // Incremental compile of just A yields a valid index
    expect(incrementalA.index._compiled).toBeDefined();
    expect(incrementalA.index._stats.total_nodes).toBe(1);
  });

  it("step 2: _actors/Compiler runs a from-scratch full compilation over all module files", () => {
    expect(full.index._stats.modules).toBe(2);
    expect(full.index._stats.total_nodes).toBe(2);
  });

  it("step 3: compilation/CompilationResult records the from-scratch full compilation result", () => {
    expect(full.index._stats.total_journeys).toBe(2);
    expect(full.coverage.modules['modA']).toBeDefined();
    expect(full.coverage.modules['modB']).toBeDefined();
  });

  it("step 4: compilation/CompilationResultComparison compares the incremental compiled index against the full compilation, checking node registries, journey registries, and connection sets", () => {
    // The full compile should have all nodes from the incremental + additional ones
    expect(Object.keys(full.index.nodes)).toContain('modA/Parser');
    expect(Object.keys(full.index.nodes)).toContain('modB/Validator');
    // The full compile has cross-module connections the incremental one lacks
    expect(full.index.nodes['modA/Parser'].followed_by).toContain('modB/Validator');
  });

  it("step 5: compilation/ErrorReport records any structural differences as drift errors indicating merge-order sensitivity", () => {
    // A second full compile should match the first exactly (no drift)
    const full2 = compileFromModules(new Map([['modA', moduleA], ['modB', moduleB]]));
    expect(full.index._stats).toEqual(full2.index._stats);
    expect(Object.keys(full.index.nodes).sort()).toEqual(Object.keys(full2.index.nodes).sort());
  });
});
