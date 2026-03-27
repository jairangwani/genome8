// Auto-generated from journey: VerifyCompilationIdempotency
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("VerifyCompilationIdempotency", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Developer: { type: 'actor', description: 'Human developer user' } },
    }],
    ['auth', {
      spec_sections: [1, 2],
      nodes: {
        Login: { type: 'process', description: 'Handles user login flow' },
        Token: { type: 'artifact', description: 'JWT access token artifact' },
      },
      journeys: {
        Authenticate: {
          steps: [
            { node: '_actors/Developer', action: 'submits login credentials' },
            { node: 'Login', action: 'validates the submitted credentials' },
            { node: 'Token', action: 'issues an access token to user' },
          ],
        },
      },
    }],
  ]);

  const result1 = compileFromModules(modules);
  const result2 = compileFromModules(modules);

  it("step 1: _actors/Compiler runs full compilation on all module files and stores the first CompilationResult", () => {
    expect(result1).toBeDefined();
    expect(result1.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 2: compilation/CompilationResult records the first compilation output with all counts and sorted lists", () => {
    expect(result1.index._stats.total_nodes).toBe(3);
    expect(result1.index._stats.total_journeys).toBe(1);
  });

  it("step 3: _actors/Compiler runs full compilation a second time on the same unmodified module files", () => {
    expect(result2).toBeDefined();
  });

  it("step 4: compilation/CompilationResult records the second compilation output", () => {
    expect(result2.index._stats.total_nodes).toBe(3);
    expect(result2.index._stats.total_journeys).toBe(1);
  });

  it("step 5: compilation/DeterministicOrdering confirms both results have identically sorted error, warning, orphan, and duplicate lists", () => {
    // Issues should be identical
    expect(result1.issues.map(i => i.message)).toEqual(result2.issues.map(i => i.message));
    // Coverage orphans and isolated modules should be identical
    expect(result1.coverage.orphans).toEqual(result2.coverage.orphans);
    expect(result1.coverage.isolated_modules).toEqual(result2.coverage.isolated_modules);
  });

  it("step 6: compilation/CompilationResultComparison compares the two results field by field and flags any difference as a non-determinism defect", () => {
    // Stats must be identical
    expect(result1.index._stats).toEqual(result2.index._stats);
    // Node keys must match
    expect(Object.keys(result1.index.nodes).sort()).toEqual(Object.keys(result2.index.nodes).sort());
    // Journey keys must match
    expect(Object.keys(result1.index.journeys).sort()).toEqual(Object.keys(result2.index.journeys).sort());
  });

  it("step 7: compilation/ErrorReport records any differences found between the two compilation runs", () => {
    // No differences means no errors to record
    expect(result1.index._stats).toEqual(result2.index._stats);
  });
});
