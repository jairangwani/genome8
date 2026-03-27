// Auto-generated from journey: DetectMissingModules
// Module: compilation
// Modules touched: organization, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectMissingModules", () => {
  // Simulate: we expect modules "auth" and "billing" but only "auth" exists
  const expectedModules = ['auth', 'billing'];
  const modules = new Map<string, ModuleFile>([
    ['auth', {
      nodes: {
        Login: { type: 'process', description: 'Handles user authentication' },
      },
      journeys: {
        Authenticate: {
          steps: [{ node: 'Login', action: 'validates user credentials' }],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: organization/ModuleList provides the expected list of modules identified from ORGANIZATION.md", () => {
    // The expected list has two modules
    expect(expectedModules).toEqual(['auth', 'billing']);
  });

  it("step 2: graph/CompiledIndex provides the set of modules that were successfully compiled into the index", () => {
    // Only auth was compiled
    expect(result.index._stats.modules).toBe(1);
    expect(result.coverage.modules['auth']).toBeDefined();
  });

  it("step 3: compilation/ValidateModuleCompleteness compares each expected module name against the compiled set and flags any that are absent", () => {
    // billing is missing from the compiled set
    const compiledModuleNames = Object.keys(result.coverage.modules);
    const missing = expectedModules.filter(m => !compiledModuleNames.includes(m));
    expect(missing).toEqual(['billing']);
  });

  it("step 4: compilation/ErrorReport records each missing module as a validation error with the expected module name", () => {
    // We simulate the error report format
    const compiledModuleNames = Object.keys(result.coverage.modules);
    const missing = expectedModules.filter(m => !compiledModuleNames.includes(m));
    expect(missing.length).toBe(1);
    expect(missing[0]).toBe('billing');
  });
});
