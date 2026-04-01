// Auto-generated from journey: DeprecatedModuleCleanup
// Module: actors
// Triggered by: _actors/DeprecatedModule
// Modules touched: _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      DeprecatedModule: { type: 'actor', description: 'a module that exists on disk but is no longer relevant to the current spec' },
      Auditor: { type: 'actor', description: 'the audit engine that checks spec coverage and flags gaps' },
    },
  });

  modules.set('compilation', {
    nodes: {
      OrphanDetection: { type: 'process', description: 'detects nodes that exist in modules but are never referenced by any journey step' },
      IsolatedModuleDetection: { type: 'process', description: 'detects modules with zero cross-module connections' },
      CompilationResult: { type: 'artifact', description: 'the final compilation output containing the index, issues, and coverage report' },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'applies targeted fixes to close gaps found during audit' },
    },
    journeys: {
      DeprecatedModuleCleanup: {
        steps: [
          { node: '_actors/DeprecatedModule', action: 'exists on disk but is no longer relevant to the current spec' },
          { node: 'compilation/OrphanDetection', action: 'detects that the module nodes are no longer referenced by any journey' },
          { node: 'compilation/IsolatedModuleDetection', action: 'detects that the module has zero cross-module connections' },
          { node: 'compilation/CompilationResult', action: 'reports the module as both orphaned and isolated' },
          { node: '_actors/Auditor', action: 'flags the deprecated module during coverage audit' },
          { node: 'AuditGapFix', action: 'targeted fix removes or archives the deprecated module' },
        ],
      },
    },
  });

  return modules;
}

describe("DeprecatedModuleCleanup", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DeprecatedModuleCleanup'];

  it("step 1: _actors/DeprecatedModule exists on disk but is no longer relevant to the current spec", () => {
    const node = result.index.nodes['_actors/DeprecatedModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('DeprecatedModuleCleanup'))).toBe(true);
  });

  it("step 2: compilation/OrphanDetection detects that the module's nodes are no longer referenced by any journey", () => {
    const node = result.index.nodes['compilation/OrphanDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/DeprecatedModule');
  });

  it("connection: _actors/DeprecatedModule → compilation/OrphanDetection", () => {
    const src = result.index.nodes['_actors/DeprecatedModule'];
    expect(src.followed_by).toContain('compilation/OrphanDetection');
  });

  it("step 3: compilation/IsolatedModuleDetection detects that the module has zero cross-module connections", () => {
    const node = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/OrphanDetection');
  });

  it("connection: compilation/OrphanDetection → compilation/IsolatedModuleDetection", () => {
    const src = result.index.nodes['compilation/OrphanDetection'];
    expect(src.followed_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("step 4: compilation/CompilationResult reports the module as both orphaned and isolated", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('compilation/IsolatedModuleDetection');
  });

  it("connection: compilation/IsolatedModuleDetection → compilation/CompilationResult", () => {
    const src = result.index.nodes['compilation/IsolatedModuleDetection'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 5: _actors/Auditor flags the deprecated module during coverage audit", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → _actors/Auditor", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 6: convergence/AuditGapFix targeted fix removes or archives the deprecated module", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → convergence/AuditGapFix", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('convergence/AuditGapFix');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
