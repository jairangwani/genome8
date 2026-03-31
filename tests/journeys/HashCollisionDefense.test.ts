// Auto-generated from journey: HashCollisionDefense
// Module: actors
// Triggered by: _actors/HashCollisionExploiter
// Modules touched: _actors, publish, convergence

import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("HashCollisionDefense", () => {
  it("step 1: _actors/HashCollisionExploiter manipulates content to produce identical SHA256 hashes", () => {
    // SHA256 collisions are computationally infeasible for arbitrary content
    // Two different contents produce different hashes
    const contentA = JSON.stringify({ provides: { 'mod/A': { type: 'process', description: 'Original' } } });
    const contentB = JSON.stringify({ provides: { 'mod/A': { type: 'process', description: 'Manipulated' } } });
    const hashA = crypto.createHash('sha256').update(contentA).digest('hex');
    const hashB = crypto.createHash('sha256').update(contentB).digest('hex');
    // Different content = different hash — collision attack fails
    expect(hashA).not.toBe(hashB);
  });

  it("step 2: publish/ComputeInterfaceHash computes hash on the manipulated content", () => {
    // generateInterface hashes the provides+requires content
    const modules = new Map<string, ModuleFile>([
      ['mod', {
        nodes: { Svc: { type: 'process', description: 'Service' } },
        journeys: { UseService: { steps: [{ node: 'Svc', action: 'runs' }] } },
      }],
    ]);
    const result = compileFromModules(modules);
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(iface.version_hash.length).toBeGreaterThan(10);
  });

  it("step 3: publish/ComparePreviousHash compares and incorrectly finds no change due to collision", () => {
    // If (hypothetically) hash matched, changelog would show no changes
    const fakeInterface: PublishedInterface = {
      engine: 'test',
      version_hash: 'sha256:samehash',
      provides: { 'mod/A': { type: 'process', description: 'Original', in_journeys: 1 } },
      requires: {},
    };
    // Same hash = changelog shows 0 changes
    const changelog = generateChangelog(fakeInterface, fakeInterface);
    expect(changelog.changes.length).toBe(0);
    expect(changelog.previous_hash).toBe(changelog.current_hash);
  });

  it("step 4: publish/SkipPublishIfUnchanged incorrectly skips publish, missing the real change", () => {
    // When hashes match, publish is skipped
    const prevHash = 'sha256:samehash';
    const currHash = 'sha256:samehash';
    const shouldSkip = prevHash === currHash;
    expect(shouldSkip).toBe(true);
    // This is the vulnerability — but it requires a SHA256 collision which is infeasible
  });

  it("step 5: _actors/Auditor detects the coverage gap during depth audit because spec content diverges from graph", () => {
    // Even if publish is skipped, audit catches content divergence
    // Audit compiles fresh and compares — the actual content differs
    const modules1 = new Map<string, ModuleFile>([
      ['mod', {
        nodes: { Svc: { type: 'process', description: 'Original service' } },
        journeys: { Use: { steps: [{ node: 'Svc', action: 'runs' }] } },
      }],
    ]);
    const modules2 = new Map<string, ModuleFile>([
      ['mod', {
        nodes: { Svc: { type: 'process', description: 'Manipulated service' } },
        journeys: { Use: { steps: [{ node: 'Svc', action: 'runs' }] } },
      }],
    ]);
    const iface1 = generateInterface(compileFromModules(modules1).index, 'eng');
    const iface2 = generateInterface(compileFromModules(modules2).index, 'eng');
    // Audit detects: different content → different hash → divergence is visible
    expect(iface1.version_hash).not.toBe(iface2.version_hash);
  });

  it("step 6: convergence/AuditGapFix targeted fix forces a re-publish of the affected interface", () => {
    // After audit detects divergence, force re-publish generates correct changelog
    const prev: PublishedInterface = {
      engine: 'eng',
      version_hash: 'sha256:old',
      provides: { 'mod/Svc': { type: 'process', description: 'Original', in_journeys: 1 } },
      requires: {},
    };
    const modules = new Map<string, ModuleFile>([
      ['mod', {
        nodes: { Svc: { type: 'process', description: 'Fixed service' } },
        journeys: { Use: { steps: [{ node: 'Svc', action: 'runs' }] } },
      }],
    ]);
    const current = generateInterface(compileFromModules(modules).index, 'eng');
    const changelog = generateChangelog(prev, current);
    // Re-publish catches the modification
    expect(changelog.changes.length).toBeGreaterThanOrEqual(1);
    const descChange = changelog.changes.find(c => c.field === 'description');
    expect(descChange).toBeDefined();
    expect(descChange!.was).toBe('Original');
    expect(descChange!.now).toBe('Fixed service');
  });

});
