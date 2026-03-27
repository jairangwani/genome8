// Auto-generated from journey: ValidateAuditInfrastructurePresent
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, graph, audit, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/types.ts

const _actors: ModuleFile = {
  nodes: {
    Compiler: { type: 'actor', description: 'validates the graph' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
  },
  journeys: {},
};

const audit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec section coverage' },
    CheckActorCoverage: { type: 'process', description: 'checks actor participation' },
    CheckCrossModuleCoverage: { type: 'process', description: 'checks cross-module connections' },
    DeclareConverged: { type: 'process', description: 'marks graph as converged' },
    AuditAfterZeroErrors: { type: 'rule', description: 'gate: audit proceeds only after zero errors' },
  },
  journeys: {
    RunAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'dispatches coverage checks' },
        { node: 'CheckSpecCoverage', action: 'checks spec coverage' },
        { node: 'CheckActorCoverage', action: 'checks actor coverage' },
        { node: 'CheckCrossModuleCoverage', action: 'checks cross-module coverage' },
        { node: 'AuditAfterZeroErrors', action: 'gates audit start' },
      ],
    },
    DeclareComplete: {
      steps: [
        { node: '_actors/Compiler', action: 'compiles graph' },
        { node: 'DeclareConverged', action: 'marks convergence' },
      ],
    },
  },
};

const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews auth' },
        { node: 'Login', action: 'validates' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['audit', audit], ['auth', auth]]));

describe("ValidateAuditInfrastructurePresent", () => {
  it("step 1: convergence/CompileCheck triggers compilation as a prerequisite for the audit pipeline", () => {
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
  });

  it("step 2: _actors/Compiler compiles all modules including audit.yaml", () => {
    expect(result.index._stats.modules).toBe(3); // _actors + audit + auth
    expect(result.coverage.modules['audit']).toBeDefined();
  });

  it("step 3: graph/CompiledIndex provides the compiled index with all registered modules", () => {
    expect(result.index.nodes).toBeDefined();
    expect(result.index.journeys).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(8); // 2 actors + 5 audit + 1 auth
  });

  it("step 4: audit/ValidateAuditModulePresence checks that audit.yaml exists as a compiled module in the index", () => {
    const auditNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'audit');
    expect(auditNodes.length).toBe(5);
  });

  it("step 5: audit/ValidateAuditModulePresence verifies that key audit nodes are present in the registry including CheckSpecCoverage, CheckActorCoverage, and CheckCrossModuleCoverage", () => {
    expect(result.index.nodes['audit/CheckSpecCoverage']).toBeDefined();
    expect(result.index.nodes['audit/CheckActorCoverage']).toBeDefined();
    expect(result.index.nodes['audit/CheckCrossModuleCoverage']).toBeDefined();
  });

  it("step 6: audit/ValidateAuditModulePresence verifies that DeclareConverged is present since convergence cannot complete without it", () => {
    expect(result.index.nodes['audit/DeclareConverged']).toBeDefined();
    expect(result.index.nodes['audit/DeclareConverged'].type).toBe('process');
  });

  it("step 7: compilation/ValidateModuleCompleteness confirms audit is included in the expected module list from ORGANIZATION.md", () => {
    const moduleNames = Object.keys(result.coverage.modules);
    expect(moduleNames).toContain('audit');
    expect(moduleNames).toContain('auth');
  });

  it("step 8: compilation/CompilationResult confirms the audit module compiled without errors", () => {
    const auditErrors = result.issues.filter(i => i.severity === 'error' && i.module === 'audit');
    expect(auditErrors.length).toBe(0);
  });

  it("step 9: audit/AuditAfterZeroErrors proceeds to the audit phase now that audit infrastructure is confirmed present", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // AuditAfterZeroErrors node is in a journey — gate is active
    expect(result.index.nodes['audit/AuditAfterZeroErrors'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

});
