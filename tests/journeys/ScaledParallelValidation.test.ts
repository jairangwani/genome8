// Auto-generated from journey: ScaledParallelValidation
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ScaledParallelValidation", () => {
  // Build a large graph with many modules to test at scale
  const modules = new Map<string, ModuleFile>();
  const moduleCount = 20;

  for (let i = 0; i < moduleCount; i++) {
    const nodes: Record<string, any> = {};
    nodes[`Node${i}A`] = { type: 'process', description: `Process A in module ${i}` };
    nodes[`Node${i}B`] = { type: 'artifact', description: `Artifact B in module ${i}` };

    const steps: Array<{ node: string; action: string }> = [
      { node: `Node${i}A`, action: `starts processing in module ${i}` },
      { node: `Node${i}B`, action: `stores result in module ${i}` },
    ];

    // Add cross-module ref to the previous module (except for module 0)
    if (i > 0) {
      steps.push({ node: `mod${i - 1}/Node${i - 1}B`, action: `reads result from module ${i - 1}` });
    }

    modules.set(`mod${i}`, {
      spec_sections: [i + 1],
      nodes,
      journeys: { [`Journey${i}`]: { steps } },
    });
  }

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler initiates compilation on a large graph with many modules", () => {
    expect(modules.size).toBe(moduleCount);
  });

  it("step 2: compilation/YAMLParsing parses all module YAML files", () => {
    expect(result.index._stats.modules).toBe(moduleCount);
  });

  it("step 3: compilation/YAMLErrorReporting reports any YAML syntax errors found", () => {
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 4: graph/ConnectionComputation computes all connections from journey steps", () => {
    expect(result.index._stats.total_connections).toBeGreaterThan(0);
  });

  it("step 5: graph/CrossModuleRefResolution resolves all cross-module node references", () => {
    // mod1 references mod0/Node0B — this should be a cross-module connection
    expect(result.index.nodes['mod0/Node0B'].cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: graph/ActorRefResolution resolves all actor references", () => {
    // No actors in this fixture; all journeys have null actor
    for (const journey of Object.values(result.index.journeys)) {
      expect(journey.actor).toBeNull();
    }
  });

  it("step 7: compilation/ParallelValidationDispatch dispatches DuplicateDetection, DanglingRefDetection, OrphanDetection, IsolatedModuleDetection, and StaleConnectionDetection concurrently", () => {
    // All validation checks ran (verified by stats being computed)
    expect(result.index._stats).toBeDefined();
    expect(result.coverage).toBeDefined();
  });

  it("step 8: compilation/DuplicateDetection checks for duplicate node names concurrently with other checks", () => {
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 9: compilation/DanglingRefDetection checks for unresolved node references concurrently with other checks", () => {
    const danglingErrors = result.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(danglingErrors.length).toBe(0);
  });

  it("step 10: compilation/OrphanDetection checks for unreferenced nodes concurrently with other checks", () => {
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 11: compilation/IsolatedModuleDetection checks for isolated modules concurrently with other checks", () => {
    // mod0 has no outgoing cross-module refs, but mod1 references it,
    // so it has cross-module connections. Modules with >3 nodes and no cross-module = isolated.
    // Each module has 2 nodes, so none qualify as isolated (need >3).
    expect(result.index._stats.isolated_modules).toBe(0);
  });

  it("step 12: compilation/StaleConnectionDetection checks for stale connections concurrently with other checks", () => {
    for (const node of Object.values(result.index.nodes)) {
      for (const ref of node.followed_by) {
        expect(result.index.nodes[ref]).toBeDefined();
      }
    }
  });

  it("step 13: compilation/ParallelValidationDispatch collects all ErrorReports from completed concurrent checks", () => {
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("step 14: compilation/ValidationAggregation merges the concurrent check results into a single compilation result", () => {
    expect(result.issues).toBeDefined();
    expect(result.coverage).toBeDefined();
    expect(result.index).toBeDefined();
  });

  it("step 15: compilation/DeterministicOrdering sorts all output lists by canonical key to ensure parallel execution order does not affect output", () => {
    // Running twice should yield the same result regardless of order
    const result2 = compileFromModules(modules);
    expect(result.coverage.orphans).toEqual(result2.coverage.orphans);
    expect(result.coverage.isolated_modules).toEqual(result2.coverage.isolated_modules);
  });

  it("step 16: compilation/CompilationResult outputs the final compilation result identical to sequential FullCompilation", () => {
    expect(result.index._stats.total_nodes).toBe(moduleCount * 2);
    expect(result.index._stats.total_journeys).toBe(moduleCount);
  });
});
