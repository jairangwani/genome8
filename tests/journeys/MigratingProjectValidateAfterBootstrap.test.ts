// Auto-generated from journey: MigratingProjectValidateAfterBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, compilation, audit, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      MigratingProject: { type: 'actor', description: 'an existing project with source code that predates the genome8 graph' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      CheckSpecCoverage: { type: 'process', description: 'auditor 1 compares spec sections against the graph to find sections not represented by any node or journey' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list of coverage gaps with locations and descriptions' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedAudit: { type: 'process', description: 'dispatches auditors to check coverage from all angles' },
    },
  });

  modules.set('actors', {
    nodes: {},
    journeys: {
      MigratingProjectValidateAfterBootstrap: {
        steps: [
          { node: '_actors/MigratingProject', action: 'has been bootstrapped into genome8 with modules created from its spec' },
          { node: '_actors/Compiler', action: 'runs full compilation on the bootstrapped graph' },
          { node: 'compilation/CompilationResult', action: 'confirms zero errors after bootstrap' },
          { node: '_actors/Auditor', action: 'checks spec coverage to verify the bootstrap captured all system concepts' },
          { node: 'audit/CheckSpecCoverage', action: 'compares spec sections against bootstrapped module nodes and journeys' },
          { node: 'audit/CollectAuditFindings', action: 'identifies any legacy concepts missing from the bootstrapped graph' },
          { node: 'audit/AuditFindingsList', action: 'records gaps between the existing system and the new graph' },
          { node: 'convergence/TargetedAudit', action: 'triggers targeted fixes for any gaps found during migration validation' },
        ],
      },
    },
  });

  return modules;
}

describe("MigratingProjectValidateAfterBootstrap", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['MigratingProjectValidateAfterBootstrap'];

  it("step 1: _actors/MigratingProject has been bootstrapped into genome8 with modules created from its spec", () => {
    const node = result.index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('MigratingProjectValidateAfterBootstrap'))).toBe(true);
  });

  it("step 2: _actors/Compiler runs full compilation on the bootstrapped graph", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('_actors/MigratingProject');
  });

  it("connection: _actors/MigratingProject → _actors/Compiler", () => {
    const src = result.index.nodes['_actors/MigratingProject'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 3: compilation/CompilationResult confirms zero errors after bootstrap", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 4: _actors/Auditor checks spec coverage to verify the bootstrap captured all system concepts", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → _actors/Auditor", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 5: audit/CheckSpecCoverage compares spec sections against bootstrapped module nodes and journeys", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 6: audit/CollectAuditFindings identifies any legacy concepts missing from the bootstrapped graph", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/CheckSpecCoverage'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 7: audit/AuditFindingsList records gaps between the existing system and the new graph", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/CollectAuditFindings'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 8: convergence/TargetedAudit triggers targeted fixes for any gaps found during migration validation", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → convergence/TargetedAudit", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('convergence/TargetedAudit');
  });

  it("journey has 8 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(8);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
