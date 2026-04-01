// Auto-generated from journey: MigratingProjectValidateAfterBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, compilation, audit, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildValidateBootstrapModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'Has been bootstrapped into genome8 with modules created from its spec' },
      Compiler: { type: 'actor', description: 'Runs full compilation on the bootstrapped graph' },
      Auditor: { type: 'actor', description: 'Checks spec coverage to verify the bootstrap captured all system concepts' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Confirms zero errors after bootstrap' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      CheckSpecCoverage: { type: 'process', description: 'Compares spec sections against bootstrapped module nodes and journeys' },
      CollectAuditFindings: { type: 'process', description: 'Identifies any legacy concepts missing from the bootstrapped graph' },
      AuditFindingsList: { type: 'artifact', description: 'Records gaps between the existing system and the new graph' },
    },
    journeys: {
      MigratingProjectValidateAfterBootstrap: {
        steps: [
          { node: '_actors/MigratingProject', action: 'has been bootstrapped into genome8 with modules created from its spec' },
          { node: '_actors/Compiler', action: 'runs full compilation on the bootstrapped graph' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors after bootstrap' },
          { node: '_actors/Auditor', action: 'checks spec coverage to verify the bootstrap captured all system concepts' },
          { node: 'CheckSpecCoverage', action: 'compares spec sections against bootstrapped module nodes and journeys' },
          { node: 'CollectAuditFindings', action: 'identifies any legacy concepts missing from the bootstrapped graph' },
          { node: 'AuditFindingsList', action: 'records gaps between the existing system and the new graph' },
          { node: 'convergence/TargetedAudit', action: 'triggers targeted fixes for any gaps found during migration validation' },
        ],
      },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedAudit: { type: 'process', description: 'Triggers targeted fixes for any gaps found during migration validation' },
    },
    journeys: {},
  });

  return modules;
}

describe("MigratingProjectValidateAfterBootstrap", () => {
  const modules = buildValidateBootstrapModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectValidateAfterBootstrap'];

  it("step 1: _actors/MigratingProject has been bootstrapped into genome8 with modules created from its spec", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: _actors/Compiler runs full compilation on the bootstrapped graph", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/Compiler", () => {
    const from = result.index.nodes['_actors/MigratingProject'];
    expect(from.followed_by).toContain('_actors/Compiler');
  });

  it("step 3: compilation/CompilationResult confirms zero errors after bootstrap", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const from = result.index.nodes['_actors/Compiler'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 4: _actors/Auditor checks spec coverage to verify the bootstrap captured all system concepts", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → _actors/Auditor", () => {
    const from = result.index.nodes['compilation/CompilationResult'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 5: audit/CheckSpecCoverage compares spec sections against bootstrapped module nodes and journeys", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 6: audit/CollectAuditFindings identifies any legacy concepts missing from the bootstrapped graph", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/CheckSpecCoverage'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 7: audit/AuditFindingsList records gaps between the existing system and the new graph", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/CollectAuditFindings'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 8: convergence/TargetedAudit triggers targeted fixes for any gaps found during migration validation", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → convergence/TargetedAudit", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('convergence/TargetedAudit');
  });

  it("journey covers full validation pipeline (8 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(8);
    expect(journey.steps[0].node).toBe('_actors/MigratingProject');
    expect(journey.steps[7].node).toBe('convergence/TargetedAudit');
  });

  it("journey actor is MigratingProject", () => {
    expect(journey.actor).toBe('_actors/MigratingProject');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
