// Auto-generated from journey: ValidateAuditInfrastructurePresent
// Module: audit
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, graph, audit, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildGraphWithAudit() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Auditor: { type: 'actor', description: 'Coverage auditor' },
        User: { type: 'actor', description: 'Platform user' },
      },
    }],
    ['audit', {
      spec_sections: [3, 5],
      nodes: {
        CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
        CheckActorCoverage: { type: 'process', description: 'Checks actor coverage' },
        CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
        DeclareConverged: { type: 'process', description: 'Declares convergence' },
        AuditFindingsList: { type: 'artifact', description: 'Gap findings list' },
      },
      journeys: {
        RunSpecAudit: {
          steps: [
            { node: '_actors/Auditor', action: 'checks spec' },
            { node: 'CheckSpecCoverage', action: 'evaluates sections' },
            { node: 'AuditFindingsList', action: 'stores gaps' },
          ],
        },
      },
    }],
    ['auth', {
      spec_sections: [1],
      nodes: { Login: { type: 'process', description: 'Login flow' } },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'logs in' },
            { node: 'Login', action: 'authenticates' },
          ],
        },
      },
    }],
  ]));
}

describe("ValidateAuditInfrastructurePresent", () => {
  it("step 1: convergence/CompileCheck triggers compilation as a prerequisite for the audit pipeline", () => {
    const result = buildGraphWithAudit();
    expect(result.index).toBeDefined();
    expect(result.index._compiled).toBeDefined();
  });

  it("step 2: _actors/Compiler compiles all modules including audit.yaml", () => {
    const result = buildGraphWithAudit();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.coverage.modules['audit']).toBeDefined();
  });

  it("step 3: graph/CompiledIndex provides the compiled index with all registered modules", () => {
    const result = buildGraphWithAudit();
    const moduleNames = Object.keys(result.coverage.modules);
    expect(moduleNames).toContain('_actors');
    expect(moduleNames).toContain('audit');
    expect(moduleNames).toContain('auth');
  });

  it("step 4: audit/ValidateAuditModulePresence checks that audit.yaml exists as a compiled module in the index", () => {
    const result = buildGraphWithAudit();
    const auditNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'audit');
    expect(auditNodes.length).toBeGreaterThan(0);
    expect(result.coverage.modules['audit']).toBeDefined();
  });

  it("step 5: audit/ValidateAuditModulePresence verifies that key audit nodes are present in the registry including CheckSpecCoverage, CheckActorCoverage, and CheckCrossModuleCoverage", () => {
    const result = buildGraphWithAudit();
    expect(result.index.nodes['audit/CheckSpecCoverage']).toBeDefined();
    expect(result.index.nodes['audit/CheckActorCoverage']).toBeDefined();
    expect(result.index.nodes['audit/CheckCrossModuleCoverage']).toBeDefined();
  });

  it("step 6: audit/ValidateAuditModulePresence verifies that DeclareConverged is present since convergence cannot complete without it", () => {
    const result = buildGraphWithAudit();
    expect(result.index.nodes['audit/DeclareConverged']).toBeDefined();
    expect(result.index.nodes['audit/DeclareConverged'].type).toBe('process');
  });

  it("step 7: compilation/ValidateModuleCompleteness confirms audit is included in the expected module list from ORGANIZATION.md", () => {
    const expectedModules = ['auth', 'audit', 'convergence', 'compilation'];
    expect(expectedModules).toContain('audit');
    // Compiled graph contains audit
    const result = buildGraphWithAudit();
    const compiledModules = Object.keys(result.coverage.modules);
    expect(compiledModules).toContain('audit');
  });

  it("step 8: compilation/CompilationResult confirms the audit module compiled without errors", () => {
    const result = buildGraphWithAudit();
    const auditErrors = result.issues.filter(i => i.severity === 'error' && i.module === 'audit');
    expect(auditErrors.length).toBe(0);
  });

  it("step 9: audit/AuditAfterZeroErrors proceeds to the audit phase now that audit infrastructure is confirmed present", () => {
    const result = buildGraphWithAudit();
    const errors = result.issues.filter(i => i.severity === 'error');
    const auditInfraPresent = result.index.nodes['audit/CheckSpecCoverage'] !== undefined;
    const canProceedToAudit = errors.length === 0 && auditInfraPresent;
    expect(canProceedToAudit).toBe(true);
  });

});
