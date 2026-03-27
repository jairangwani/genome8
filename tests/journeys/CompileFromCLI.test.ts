// Auto-generated from journey: CompileFromCLI
// Module: compilation
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("CompileFromCLI", () => {
  // Simulate a CLI-triggered compile by calling compileFromModules directly
  const modules = new Map<string, ModuleFile>([
    ['api', {
      spec_sections: [1],
      nodes: {
        Handler: { type: 'process', description: 'Handles incoming API requests' },
        Response: { type: 'artifact', description: 'Formats the API response payload' },
      },
      journeys: {
        Request: {
          steps: [
            { node: 'Handler', action: 'receives and processes request' },
            { node: 'Response', action: 'formats and returns response' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/HumanDeveloper runs compile.ts from the command line", () => {
    // The compile function is callable and returns a result
    expect(result).toBeDefined();
    expect(result.index).toBeDefined();
  });

  it("step 2: compilation/CompileCLI accepts the command and passes it to the compiler", () => {
    // compileFromModules accepts a Map and produces a valid CompileResult
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats).toBeDefined();
  });

  it("step 3: _actors/Compiler executes the full compilation pipeline", () => {
    // The pipeline computes nodes, journeys, and connections
    expect(result.index._stats.total_nodes).toBe(2);
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.index._stats.total_connections).toBeGreaterThan(0);
  });

  it("step 4: compilation/CompilationResult returns the validation output", () => {
    // Result contains index, issues, coverage
    expect(result.index).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.coverage).toBeDefined();
  });

  it("step 5: compilation/CompileCLI displays errors, warnings, and summary to the developer", () => {
    // Stats are available for display
    const stats = result.index._stats;
    expect(typeof stats.total_nodes).toBe('number');
    expect(typeof stats.orphans).toBe('number');
    expect(typeof stats.duplicate_names).toBe('number');
    expect(Array.isArray(result.issues)).toBe(true);
  });
});
