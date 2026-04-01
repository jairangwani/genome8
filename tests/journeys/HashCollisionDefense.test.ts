// Auto-generated from journey: HashCollisionDefense
// Module: actors
// Triggered by: _actors/HashCollisionExploiter
// Modules touched: _actors, publish, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      HashCollisionExploiter: { type: 'actor', description: 'an adversary who manipulates content to produce identical SHA256 hashes' },
      Auditor: { type: 'actor', description: 'the audit engine that checks spec coverage and flags gaps' },
    },
  });

  modules.set('publish', {
    nodes: {
      ComputeInterfaceHash: { type: 'process', description: 'computes a SHA256 hash of the interface provides and requires for change detection' },
      ComparePreviousHash: { type: 'process', description: 'compares the current interface hash against the previously published hash' },
      SkipPublishIfUnchanged: { type: 'process', description: 'skips publishing when the interface hash has not changed since last publish' },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'applies targeted fixes to close gaps found during audit' },
    },
    journeys: {
      HashCollisionDefense: {
        steps: [
          { node: '_actors/HashCollisionExploiter', action: 'manipulates content to produce identical SHA256 hashes' },
          { node: 'publish/ComputeInterfaceHash', action: 'computes hash on the manipulated content' },
          { node: 'publish/ComparePreviousHash', action: 'compares and incorrectly finds no change due to collision' },
          { node: 'publish/SkipPublishIfUnchanged', action: 'incorrectly skips publish, missing the real change' },
          { node: '_actors/Auditor', action: 'detects the coverage gap during depth audit because spec content diverges from graph' },
          { node: 'AuditGapFix', action: 'targeted fix forces a re-publish of the affected interface' },
        ],
      },
    },
  });

  return modules;
}

describe("HashCollisionDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HashCollisionDefense'];

  it("step 1: _actors/HashCollisionExploiter manipulates content to produce identical SHA256 hashes", () => {
    const node = result.index.nodes['_actors/HashCollisionExploiter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('HashCollisionDefense'))).toBe(true);
  });

  it("step 2: publish/ComputeInterfaceHash computes hash on the manipulated content", () => {
    const node = result.index.nodes['publish/ComputeInterfaceHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/HashCollisionExploiter');
  });

  it("connection: _actors/HashCollisionExploiter → publish/ComputeInterfaceHash", () => {
    const src = result.index.nodes['_actors/HashCollisionExploiter'];
    expect(src.followed_by).toContain('publish/ComputeInterfaceHash');
  });

  it("step 3: publish/ComparePreviousHash compares and incorrectly finds no change due to collision", () => {
    const node = result.index.nodes['publish/ComparePreviousHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('publish/ComputeInterfaceHash');
  });

  it("connection: publish/ComputeInterfaceHash → publish/ComparePreviousHash", () => {
    const src = result.index.nodes['publish/ComputeInterfaceHash'];
    expect(src.followed_by).toContain('publish/ComparePreviousHash');
  });

  it("step 4: publish/SkipPublishIfUnchanged incorrectly skips publish, missing the real change", () => {
    const node = result.index.nodes['publish/SkipPublishIfUnchanged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('publish/ComparePreviousHash');
  });

  it("connection: publish/ComparePreviousHash → publish/SkipPublishIfUnchanged", () => {
    const src = result.index.nodes['publish/ComparePreviousHash'];
    expect(src.followed_by).toContain('publish/SkipPublishIfUnchanged');
  });

  it("step 5: _actors/Auditor detects the coverage gap during depth audit because spec content diverges from graph", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('publish/SkipPublishIfUnchanged');
  });

  it("connection: publish/SkipPublishIfUnchanged → _actors/Auditor", () => {
    const src = result.index.nodes['publish/SkipPublishIfUnchanged'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 6: convergence/AuditGapFix targeted fix forces a re-publish of the affected interface", () => {
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
