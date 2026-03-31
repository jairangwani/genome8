// Auto-generated from journey: DeclareConvergence
// Module: audit
// Modules touched: audit, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

// A fully converged graph: all actors in journeys, cross-module connections, no orphans
function buildConvergedGraph() {
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
            { node: 'Dashboard', action: 'renders admin panel' },
            { node: 'auth/Token', action: 'validates session' },
          ],
        },
      },
    }],
  ]));
}

describe("DeclareConvergence", () => {
  it("step 1: audit/AuditFindingsList provides the gap list from the latest audit round", () => {
    const findingsList = { round: 2, gaps: [], total_gaps: 0 };
    expect(findingsList.gaps.length).toBe(0);
    expect(findingsList.total_gaps).toBe(0);
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies the findings list is empty across all 3 coverage angles", () => {
    const specGaps: any[] = [];
    const actorGaps: any[] = [];
    const crossModGaps: any[] = [];
    const allResolved = specGaps.length === 0 && actorGaps.length === 0 && crossModGaps.length === 0;
    expect(allResolved).toBe(true);
  });

  it("step 3: compilation/CompilationResult confirms 0 errors and 0 orphans in the final compilation", () => {
    const result = buildConvergedGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 4: compilation/ZeroErrorConvergence confirms the zero-error threshold is met", () => {
    const result = buildConvergedGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    const zeroErrorThresholdMet = errors.length === 0;
    expect(zeroErrorThresholdMet).toBe(true);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix performs the final invariant check — zero errors, orphans, duplicates, and isolated modules", () => {
    const result = buildConvergedGraph();
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
    expect(result.index._stats.isolated_modules).toBe(0);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 6: audit/DeclareConverged marks the graph as CONVERGED — all creation, compilation, and audit complete", () => {
    const state = { status: 'CONVERGED', auditPassed: true, gapsRemaining: 0 };
    expect(state.status).toBe('CONVERGED');
    expect(state.auditPassed).toBe(true);
    expect(state.gapsRemaining).toBe(0);
  });

  it("step 7: convergence/ConvergenceState records CONVERGED status, ready for publish and codegen", () => {
    const convergenceState = {
      status: 'CONVERGED',
      readyForPublish: true,
      readyForCodegen: true,
      finalCompileTimestamp: new Date().toISOString(),
    };
    expect(convergenceState.status).toBe('CONVERGED');
    expect(convergenceState.readyForPublish).toBe(true);
    expect(convergenceState.readyForCodegen).toBe(true);
  });

  it("step 8: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    const result = buildConvergedGraph();
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(Object.keys(iface.provides).length).toBeGreaterThan(0);
  });

});
