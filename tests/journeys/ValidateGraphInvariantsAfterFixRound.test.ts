// Auto-generated from journey: ValidateGraphInvariantsAfterFixRound
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildPostFixGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
      },
    }],
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Login flow' },
        Token: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'submits credentials' },
            { node: 'Login', action: 'authenticates' },
            { node: 'Token', action: 'is issued' },
          ],
        },
      },
    }],
    ['admin', {
      spec_sections: [2],
      nodes: {
        Dashboard: { type: 'interface', description: 'Admin dashboard' },
      },
      journeys: {
        AdminAccess: {
          steps: [
            { node: '_actors/Admin', action: 'opens dashboard' },
            { node: 'Dashboard', action: 'renders panel' },
            { node: 'auth/Token', action: 'validates session' },
          ],
        },
      },
    }],
  ]));
}

describe("ValidateGraphInvariantsAfterFixRound", () => {
  it("step 1: convergence/RecompileAfterFix triggers full compilation after all fixes in this round are applied", () => {
    const result = buildPostFixGraph();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 2: _actors/Compiler runs the full compilation pipeline", () => {
    const result = buildPostFixGraph();
    expect(result.index.nodes).toBeDefined();
    expect(result.index.journeys).toBeDefined();
    expect(result.issues).toBeDefined();
    expect(result.coverage).toBeDefined();
  });

  it("step 3: compilation/CompilationResult provides the complete post-round compilation result", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.total_nodes).toBe(5); // User, Admin, Login, Token, Dashboard
    expect(result.index._stats.total_journeys).toBe(2); // UserLogin, AdminAccess
    expect(result.issues).toBeDefined();
  });

  it("step 4: audit/ValidateGraphInvariantsPostFix reads the error count and confirms it is zero", () => {
    const result = buildPostFixGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix reads the orphan count and confirms it is zero", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.orphans).toBe(0);
    expect(result.coverage.orphans.length).toBe(0);
  });

  it("step 6: audit/ValidateGraphInvariantsPostFix reads the duplicate count and confirms it is zero", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 7: compilation/IsolatedModuleDetection checks that no module became isolated as a side effect of fixes", () => {
    const result = buildPostFixGraph();
    // admin references auth/Token — cross-module connection prevents isolation
    expect(result.coverage.modules['admin'].cross_module_connections).toBeGreaterThan(0);
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThan(0);
  });

  it("step 8: audit/ValidateGraphInvariantsPostFix reads the isolated module count and confirms it is zero", () => {
    const result = buildPostFixGraph();
    expect(result.index._stats.isolated_modules).toBe(0);
    expect(result.coverage.isolated_modules.length).toBe(0);
  });

  it("step 9: compilation/ZeroErrorConvergence confirms the zero-error threshold still holds after the fix round", () => {
    const result = buildPostFixGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    const zeroErrorThresholdMet = errors.length === 0;
    expect(zeroErrorThresholdMet).toBe(true);
  });

  it("step 10: convergence/ConvergenceState records that all graph invariants are satisfied after this fix round", () => {
    const result = buildPostFixGraph();
    const invariants = {
      zeroErrors: result.issues.filter(i => i.severity === 'error').length === 0,
      zeroOrphans: result.index._stats.orphans === 0,
      zeroDuplicates: result.index._stats.duplicate_names === 0,
      zeroIsolated: result.index._stats.isolated_modules === 0,
    };
    expect(invariants.zeroErrors).toBe(true);
    expect(invariants.zeroOrphans).toBe(true);
    expect(invariants.zeroDuplicates).toBe(true);
    expect(invariants.zeroIsolated).toBe(true);

    const allSatisfied = Object.values(invariants).every(v => v === true);
    expect(allSatisfied).toBe(true);
  });

});
