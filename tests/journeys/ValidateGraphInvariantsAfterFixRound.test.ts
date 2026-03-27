// Auto-generated from journey: ValidateGraphInvariantsAfterFixRound
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Post-fix-round: all gaps have been resolved, full convergence
const authFixed: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    FormatValidator: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates credentials' },
        { node: 'FormatValidator', action: 'checks token format' },
        { node: 'TokenStore', action: 'stores session token' },
      ],
    },
    AuditRun: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles full graph' },
        { node: '_actors/Auditor', action: 'reviews auth coverage' },
        { node: 'Login', action: 'confirms login is tested' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', authFixed]]));

describe("ValidateGraphInvariantsAfterFixRound", () => {
  it("step 1: convergence/RecompileAfterFix triggers full compilation after all fixes in this round are applied", () => {
    // Full compilation produces a result with _compiled timestamp
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 2: _actors/Compiler runs the full compilation pipeline", () => {
    // Compiler processes all modules
    expect(result.index._stats.total_nodes).toBe(6); // 3 actors + 3 auth nodes
    expect(result.index._stats.total_journeys).toBe(2);
    expect(result.index._stats.total_connections).toBeGreaterThanOrEqual(3);
  });

  it("step 3: compilation/CompilationResult provides the complete post-round compilation result", () => {
    expect(result.index).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.coverage).toBeDefined();
    expect(result.coverage.modules['auth']).toBeDefined();
  });

  it("step 4: audit/ValidateGraphInvariantsPostFix reads the error count and confirms it is zero", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix reads the orphan count and confirms it is zero", () => {
    expect(result.index._stats.orphans).toBe(0);
    expect(result.coverage.orphans.length).toBe(0);
  });

  it("step 6: audit/ValidateGraphInvariantsPostFix reads the duplicate count and confirms it is zero", () => {
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 7: compilation/IsolatedModuleDetection checks that no module became isolated as a side effect of fixes", () => {
    // auth has cross-module connections to _actors
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
    expect(result.coverage.isolated_modules.length).toBe(0);
  });

  it("step 8: audit/ValidateGraphInvariantsPostFix reads the isolated module count and confirms it is zero", () => {
    expect(result.index._stats.isolated_modules).toBe(0);
  });

  it("step 9: compilation/ZeroErrorConvergence confirms the zero-error threshold still holds after the fix round", () => {
    const allClear =
      result.issues.filter(i => i.severity === 'error').length === 0 &&
      result.index._stats.orphans === 0;
    expect(allClear).toBe(true);
  });

  it("step 10: convergence/ConvergenceState records that all graph invariants are satisfied after this fix round", () => {
    const state = {
      status: 'invariants-passed' as const,
      errors: result.issues.filter(i => i.severity === 'error').length,
      orphans: result.index._stats.orphans,
      duplicates: result.index._stats.duplicate_names,
      isolated: result.index._stats.isolated_modules,
    };
    expect(state.status).toBe('invariants-passed');
    expect(state.errors).toBe(0);
    expect(state.orphans).toBe(0);
    expect(state.duplicates).toBe(0);
    expect(state.isolated).toBe(0);
  });

});
