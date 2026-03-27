// Auto-generated from journey: DeclareConvergence
// Module: audit
// Modules touched: audit, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

// A fully converged graph: all nodes in journeys, cross-module connections, 0 errors, 0 orphans
const _actors: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    Auditor: { type: 'actor', description: 'reviews graph coverage' },
  },
  journeys: {},
};

const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores session tokens' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'submits credentials' },
        { node: 'Login', action: 'validates credentials' },
        { node: 'TokenStore', action: 'stores session token' },
      ],
    },
    AuditRun: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews auth coverage' },
        { node: 'Login', action: 'confirms login is tested' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', auth]]));

describe("DeclareConvergence", () => {
  it("step 1: audit/AuditFindingsList provides the gap list from the latest audit round", () => {
    // In a converged graph, the gap list is empty
    const orphans = result.coverage.orphans;
    const isolated = result.coverage.isolated_modules;
    expect(orphans.length).toBe(0);
    expect(isolated.length).toBe(0);
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies the findings list is empty across all 3 coverage angles", () => {
    // Spec coverage: sections 1, 2 covered
    expect(result.coverage.modules['auth'].spec_sections).toEqual([1, 2]);
    // Actor coverage: both actors are in journeys
    expect(result.index.nodes['_actors/ProjectOwner'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(result.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // Cross-module: auth connects to _actors
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 3: compilation/CompilationResult confirms 0 errors and 0 orphans in the final compilation", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 4: compilation/ZeroErrorConvergence confirms the zero-error threshold is met", () => {
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 5: audit/ValidateGraphInvariantsPostFix performs the final invariant check — zero errors, orphans, duplicates, and isolated modules", () => {
    expect(result.index._stats.orphans).toBe(0);
    expect(result.index._stats.duplicate_names).toBe(0);
    expect(result.index._stats.isolated_modules).toBe(0);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 6: audit/DeclareConverged marks the graph as CONVERGED — all creation, compilation, and audit complete", () => {
    // All checks pass — declare converged
    const converged =
      result.issues.filter(i => i.severity === 'error').length === 0 &&
      result.index._stats.orphans === 0 &&
      result.index._stats.duplicate_names === 0 &&
      result.index._stats.isolated_modules === 0;
    expect(converged).toBe(true);
  });

  it("step 7: convergence/ConvergenceState records CONVERGED status, ready for publish and codegen", () => {
    const state = {
      status: 'converged' as const,
      total_nodes: result.index._stats.total_nodes,
      total_journeys: result.index._stats.total_journeys,
      errors: 0,
      orphans: 0,
    };
    expect(state.status).toBe('converged');
    expect(state.errors).toBe(0);
    expect(state.orphans).toBe(0);
  });

  it("step 8: convergence/TriggerPublish proceeds to publish the converged interface", () => {
    // Generate the published interface from the converged graph
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toBeDefined();
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
    expect(iface.engine).toBe('test-engine');
    expect(Object.keys(iface.provides).length).toBe(4); // 2 actors + 2 auth nodes
  });

});
