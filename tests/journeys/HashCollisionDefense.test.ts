// Auto-generated from journey: HashCollisionDefense
// Module: actors
// Triggered by: _actors/HashCollisionExploiter
// Modules touched: _actors, publish, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, detectCorruptedHash } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

function buildCollisionModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      HashCollisionExploiter: { type: 'actor', description: 'Manipulates content to produce identical SHA256 hashes' },
      Auditor: { type: 'actor', description: 'Detects the coverage gap during depth audit' },
    },
    journeys: {},
  });

  modules.set('publish', {
    nodes: {
      ComputeInterfaceHash: { type: 'process', description: 'Computes hash on the manipulated content' },
      ComparePreviousHash: { type: 'process', description: 'Compares and incorrectly finds no change due to collision' },
      SkipPublishIfUnchanged: { type: 'process', description: 'Incorrectly skips publish, missing the real change' },
    },
    journeys: {
      HashCollisionDefense: {
        steps: [
          { node: '_actors/HashCollisionExploiter', action: 'manipulates content to produce identical SHA256 hashes' },
          { node: 'ComputeInterfaceHash', action: 'computes hash on the manipulated content' },
          { node: 'ComparePreviousHash', action: 'compares and incorrectly finds no change due to collision' },
          { node: 'SkipPublishIfUnchanged', action: 'incorrectly skips publish, missing the real change' },
          { node: '_actors/Auditor', action: 'detects the coverage gap during depth audit because spec content diverges from graph' },
          { node: 'convergence/AuditGapFix', action: 'targeted fix forces a re-publish of the affected interface' },
        ],
      },
    },
  });

  modules.set('convergence', {
    nodes: {
      AuditGapFix: { type: 'process', description: 'Targeted fix forces a re-publish of the affected interface' },
    },
    journeys: {},
  });

  return modules;
}

describe("HashCollisionDefense", () => {
  const modules = buildCollisionModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['HashCollisionDefense'];

  it("step 1: _actors/HashCollisionExploiter manipulates content to produce identical SHA256 hashes", () => {
    const node = result.index.nodes['_actors/HashCollisionExploiter'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: publish/ComputeInterfaceHash computes hash on the manipulated content", () => {
    const node = result.index.nodes['publish/ComputeInterfaceHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/HashCollisionExploiter');
  });

  it("connection: _actors/HashCollisionExploiter → publish/ComputeInterfaceHash", () => {
    const from = result.index.nodes['_actors/HashCollisionExploiter'];
    expect(from.followed_by).toContain('publish/ComputeInterfaceHash');
  });

  it("step 3: publish/ComparePreviousHash compares and incorrectly finds no change due to collision", () => {
    const node = result.index.nodes['publish/ComparePreviousHash'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('publish/ComputeInterfaceHash');
  });

  it("connection: publish/ComputeInterfaceHash → publish/ComparePreviousHash", () => {
    const from = result.index.nodes['publish/ComputeInterfaceHash'];
    expect(from.followed_by).toContain('publish/ComparePreviousHash');
  });

  it("step 4: publish/SkipPublishIfUnchanged incorrectly skips publish, missing the real change", () => {
    const node = result.index.nodes['publish/SkipPublishIfUnchanged'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('publish/ComparePreviousHash');
  });

  it("connection: publish/ComparePreviousHash → publish/SkipPublishIfUnchanged", () => {
    const from = result.index.nodes['publish/ComparePreviousHash'];
    expect(from.followed_by).toContain('publish/SkipPublishIfUnchanged');
  });

  it("step 5: _actors/Auditor detects the coverage gap during depth audit because spec content diverges from graph", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('publish/SkipPublishIfUnchanged');
  });

  it("connection: publish/SkipPublishIfUnchanged → _actors/Auditor", () => {
    const from = result.index.nodes['publish/SkipPublishIfUnchanged'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 6: convergence/AuditGapFix targeted fix forces a re-publish of the affected interface", () => {
    const node = result.index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → convergence/AuditGapFix", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('convergence/AuditGapFix');
  });

  it("identical content produces identical hashes (the collision scenario)", () => {
    const indexA = result.index;
    const ifaceA = generateInterface(indexA, 'testEngine');
    const ifaceB = generateInterface(indexA, 'testEngine');
    // Same content → same hash (deterministic)
    expect(ifaceA.version_hash).toBe(ifaceB.version_hash);
  });

  it("different content produces different hashes (no false collision)", () => {
    // Build a slightly different module set
    const altModules = buildCollisionModules();
    altModules.set('extra', {
      nodes: { ExtraNode: { type: 'process', description: 'Additional node changes hash' } },
      journeys: {},
    });
    const altResult = compileFromModules(altModules);
    const ifaceOrig = generateInterface(result.index, 'engine');
    const ifaceAlt = generateInterface(altResult.index, 'engine');
    expect(ifaceOrig.version_hash).not.toBe(ifaceAlt.version_hash);
  });

  it("corrupted hash format is detected", () => {
    expect(detectCorruptedHash('sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890')).toBe(false);
    expect(detectCorruptedHash('md5:abc')).toBe(true);
    expect(detectCorruptedHash('sha256:ZZZZ')).toBe(true);
    expect(detectCorruptedHash(undefined)).toBe(false);
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
