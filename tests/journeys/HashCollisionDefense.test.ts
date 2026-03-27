// Auto-generated from journey: HashCollisionDefense
// Module: actors
// Triggered by: _actors/HashCollisionExploiter
// Modules touched: _actors, publish, convergence

import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

describe("HashCollisionDefense", () => {
  it("step 1: _actors/HashCollisionExploiter manipulates content to produce identical SHA256 hashes", () => {
    // SHA256 collision is computationally infeasible — different content always produces different hashes
    const content1 = JSON.stringify({ provides: { 'a/Node1': { type: 'process', description: 'original' } } });
    const content2 = JSON.stringify({ provides: { 'a/Node1': { type: 'process', description: 'tampered' } } });
    const hash1 = crypto.createHash('sha256').update(content1).digest('hex');
    const hash2 = crypto.createHash('sha256').update(content2).digest('hex');
    // Even a tiny change in content produces a completely different hash
    expect(hash1).not.toBe(hash2);
    expect(hash1.length).toBe(64);
    expect(hash2.length).toBe(64);
  });

  it("step 2: publish/ComputeInterfaceHash computes hash on the manipulated content", () => {
    // generateInterface produces a version_hash from content
    const module1: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'public API' } },
      journeys: {},
    };
    const result1 = compileFromModules(new Map([['service', module1]]));
    const iface1 = generateInterface(result1.index, 'test-engine');
    expect(iface1.version_hash).toBeDefined();
    expect(iface1.version_hash.startsWith('sha256:')).toBe(true);
  });

  it("step 3: publish/ComparePreviousHash compares and incorrectly finds no change due to collision", () => {
    // In practice, different content always produces different hashes
    const moduleA: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'version A' } },
      journeys: {},
    };
    const moduleB: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'version B — modified' } },
      journeys: {},
    };
    const resultA = compileFromModules(new Map([['service', moduleA]]));
    const resultB = compileFromModules(new Map([['service', moduleB]]));
    const ifaceA = generateInterface(resultA.index, 'engine');
    const ifaceB = generateInterface(resultB.index, 'engine');
    // Hashes differ — collision did NOT happen
    expect(ifaceA.version_hash).not.toBe(ifaceB.version_hash);
  });

  it("step 4: publish/SkipPublishIfUnchanged incorrectly skips publish, missing the real change", () => {
    // When hashes are identical, publish is skipped — test that identical content = same hash
    const module: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'stable API' } },
      journeys: {},
    };
    const result = compileFromModules(new Map([['service', module]]));
    const iface1 = generateInterface(result.index, 'engine');
    const iface2 = generateInterface(result.index, 'engine');
    // Same content → same hash → skip is correct
    expect(iface1.version_hash).toBe(iface2.version_hash);
    // But if content changes, hash changes → publish should NOT be skipped
    const modified: ModuleFile = {
      nodes: {
        API: { type: 'interface', description: 'stable API' },
        NewEndpoint: { type: 'process', description: 'added endpoint' },
      },
      journeys: {},
    };
    const resultMod = compileFromModules(new Map([['service', modified]]));
    const ifaceMod = generateInterface(resultMod.index, 'engine');
    expect(ifaceMod.version_hash).not.toBe(iface1.version_hash);
  });

  it("step 5: _actors/Auditor detects the coverage gap during depth audit because spec content diverges from graph", () => {
    // Changelog detects additions/removals between interface versions
    const prev: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'v1 API' } },
      journeys: {},
    };
    const curr: ModuleFile = {
      nodes: {
        API: { type: 'interface', description: 'v2 API — expanded' },
        NewNode: { type: 'process', description: 'new process' },
      },
      journeys: {},
    };
    const prevResult = compileFromModules(new Map([['service', prev]]));
    const currResult = compileFromModules(new Map([['service', curr]]));
    const prevIface = generateInterface(prevResult.index, 'engine');
    const currIface = generateInterface(currResult.index, 'engine');
    const changelog = generateChangelog(prevIface, currIface);
    // Changelog catches the added node — gap detected
    expect(changelog.changes.length).toBeGreaterThanOrEqual(1);
    const added = changelog.changes.filter(c => c.type === 'added');
    expect(added.some(c => c.node.includes('NewNode'))).toBe(true);
  });

  it("step 6: convergence/AuditGapFix targeted fix forces a re-publish of the affected interface", () => {
    // After fixing the gap, the new interface has a different hash from the stale one
    const stale: ModuleFile = {
      nodes: { API: { type: 'interface', description: 'stale' } },
      journeys: {},
    };
    const fixed: ModuleFile = {
      nodes: {
        API: { type: 'interface', description: 'stale' },
        FixedNode: { type: 'process', description: 'audit fix added this' },
      },
      journeys: {},
    };
    const staleResult = compileFromModules(new Map([['service', stale]]));
    const fixedResult = compileFromModules(new Map([['service', fixed]]));
    const staleIface = generateInterface(staleResult.index, 'engine');
    const fixedIface = generateInterface(fixedResult.index, 'engine');
    // Force re-publish produces a new hash
    expect(fixedIface.version_hash).not.toBe(staleIface.version_hash);
    expect(fixedIface.provides['service/FixedNode']).toBeDefined();
  });

});
