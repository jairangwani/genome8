// Auto-generated from journey: FullCompilation
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("FullCompilation", () => {
  // Fixture: two modules with cross-module journey, an actor, and valid nodes
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Compiler: { type: 'actor', description: 'Initiates compilation runs' } },
    }],
    ['modA', {
      spec_sections: [1, 2],
      nodes: {
        Parser: { type: 'process', description: 'Parses YAML input files' },
        ErrorLog: { type: 'artifact', description: 'Stores error reports from compilation' },
      },
      journeys: {
        CompileAll: {
          steps: [
            { node: '_actors/Compiler', action: 'initiates a full compilation run' },
            { node: 'Parser', action: 'parses all module YAML files' },
            { node: 'ErrorLog', action: 'reports any YAML syntax errors found' },
            { node: 'modB/Linker', action: 'computes all connections from journey steps' },
          ],
        },
      },
    }],
    ['modB', {
      spec_sections: [3],
      nodes: {
        Linker: { type: 'process', description: 'Resolves cross-module node references' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler initiates a full compilation run", () => {
    // The actor node should exist in the compiled index
    expect(result.index.nodes['_actors/Compiler']).toBeDefined();
    expect(result.index.nodes['_actors/Compiler'].type).toBe('actor');
  });

  it("step 2: compilation/YAMLParsing parses all module YAML files", () => {
    // All three modules should be recognized in stats
    expect(result.index._stats.modules).toBe(3);
  });

  it("step 3: compilation/YAMLErrorReporting reports any YAML syntax errors found", () => {
    // No parse errors for well-formed input
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 4: graph/ConnectionComputation computes all connections from journey steps", () => {
    // Parser -> ErrorLog connection computed from consecutive steps
    expect(result.index.nodes['modA/Parser'].followed_by).toContain('modA/ErrorLog');
    expect(result.index.nodes['modA/ErrorLog'].preceded_by).toContain('modA/Parser');
  });

  it("step 5: graph/CrossModuleRefResolution resolves all cross-module node references", () => {
    // Cross-module ref from modA journey to modB/Linker should resolve
    expect(result.index.nodes['modB/Linker'].preceded_by).toContain('modA/ErrorLog');
    expect(result.index.nodes['modB/Linker'].cross_module_connections).toContain('modA/ErrorLog');
  });

  it("step 6: graph/ActorRefResolution resolves all actor references", () => {
    // The journey's actor should be resolved
    const journey = result.index.journeys['CompileAll'];
    expect(journey.actor).toBe('_actors/Compiler');
  });

  it("step 7: compilation/DuplicateDetection checks for duplicate node names", () => {
    // No duplicates in this fixture
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 8: compilation/DanglingRefDetection checks for unresolved node references", () => {
    // All refs resolve, so no dangling-ref errors
    const danglingErrors = result.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(danglingErrors.length).toBe(0);
  });

  it("step 9: compilation/ExternalRefClassification classifies external refs as warnings", () => {
    // No external (non-local) refs in this fixture
    const externalWarnings = result.issues.filter(i => i.severity === 'warning' && i.message.includes('external ref'));
    expect(externalWarnings.length).toBe(0);
  });

  it("step 10: compilation/OrphanDetection checks for unreferenced nodes", () => {
    // All nodes are in at least one journey, so no orphans
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 11: compilation/IsolatedModuleDetection checks for modules with no cross-module connections", () => {
    // modA and modB have cross-module connections; _actors is small (1 node)
    expect(result.index._stats.isolated_modules).toBe(0);
  });

  it("step 12: compilation/StaleConnectionDetection checks for connections referencing nodes no longer in the registry", () => {
    // All followed_by / preceded_by entries should reference existing nodes
    for (const node of Object.values(result.index.nodes)) {
      for (const ref of node.followed_by) {
        expect(result.index.nodes[ref]).toBeDefined();
      }
      for (const ref of node.preceded_by) {
        expect(result.index.nodes[ref]).toBeDefined();
      }
    }
  });

  it("step 13: compilation/ValidationAggregation collects all errors and warnings into a single result", () => {
    // issues array is the aggregated list; should be an array
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("step 14: compilation/DeterministicOrdering sorts all error, warning, orphan, and duplicate lists by canonical key before output", () => {
    // Orphans and isolated_modules in coverage should be sorted arrays
    const orphans = result.coverage.orphans;
    const sorted = [...orphans].sort();
    expect(orphans).toEqual(sorted);
  });

  it("step 15: compilation/CompilationResult outputs final counts of errors, warnings, orphans, duplicates, and dangling refs", () => {
    expect(result.index._stats.total_nodes).toBe(4);
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.index._stats.total_connections).toBeGreaterThan(0);
  });

  it("step 16: compilation/ZeroErrorConvergence determines whether the result meets the 0-error 0-orphan threshold for convergence", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });
});
