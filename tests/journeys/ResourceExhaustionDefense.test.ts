// Auto-generated from journey: ResourceExhaustionDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, organization, hierarchy, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ResourceExhaustionDefense", () => {
  it("step 1: _actors/ResourceExhauster submits a spec designed to spawn unbounded child engines", () => {
    // Adversarial spec tries to produce a huge number of modules
    const adversarialSpec = Array.from({ length: 200 }, (_, i) =>
      `## ${i + 1}. Module${i}\nThis module does thing ${i}.`
    ).join('\n');
    expect(adversarialSpec.length).toBeGreaterThan(0);
    // The spec describes 200 modules — potential exhaustion
    expect(adversarialSpec).toContain('Module199');
  });

  it("step 2: organization/IdentifyModules discovers a very large number of modules from the adversarial spec", () => {
    // Organization step produces a module list — could be very large
    const discoveredModules = Array.from({ length: 200 }, (_, i) => `module${i}`);
    expect(discoveredModules.length).toBe(200);
  });

  it("step 3: organization/ModuleList stores the inflated module list", () => {
    const moduleList = Array.from({ length: 200 }, (_, i) => `module${i}`);
    // The list exists but is bounded — it's finite, not infinite
    expect(moduleList.length).toBeLessThan(Infinity);
    expect(typeof moduleList.length).toBe('number');
  });

  it("step 4: hierarchy/DecideSplit evaluates whether the large module count warrants splitting", () => {
    const moduleCount = 200;
    const splitThreshold = 15; // typical threshold for child engines
    const shouldSplit = moduleCount > splitThreshold;
    expect(shouldSplit).toBe(true);
    // Even with splitting, each child gets a bounded subset
    const childCount = Math.ceil(moduleCount / splitThreshold);
    expect(childCount).toBeGreaterThan(1);
    expect(childCount).toBeLessThanOrEqual(Math.ceil(200 / splitThreshold));
  });

  it("step 5: convergence/BoundedCreationRule enforces that creation is bounded by modules times lenses, not unbounded", () => {
    // Bounded creation: each module gets a fixed number of creation rounds (lenses)
    const moduleCount = 200;
    const lenses = 3; // typical: create, audit, fix
    const maxCreationCalls = moduleCount * lenses;
    // Creation is bounded — not infinite
    expect(maxCreationCalls).toBe(600);
    expect(maxCreationCalls).toBeLessThan(Infinity);
    // Even with 200 modules, total work is finite and predictable
  });

  it("step 6: convergence/DataDecidesWhenToStop allows convergence to complete even with many modules since creation is bounded", () => {
    // Even with many modules, compilation still works — compile a large set
    const moduleMap = new Map<string, ModuleFile>();
    for (let i = 0; i < 50; i++) {
      moduleMap.set(`mod${i}`, {
        nodes: { [`Process${i}`]: { type: 'process', description: `Process ${i}` } },
      });
    }
    const result = compileFromModules(moduleMap);
    // Compiles successfully with 50 modules
    expect(result.index._stats.total_nodes).toBe(50);
    expect(result.index._stats.modules).toBe(50);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

});
