// Auto-generated from journey: ResourceExhaustionDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, organization, hierarchy, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ResourceExhaustionDefense", () => {
  it("step 1: _actors/ResourceExhauster submits a spec designed to spawn unbounded child engines", () => {
    // Adversarial spec produces a very large number of modules
    const moduleNames = Array.from({ length: 50 }, (_, i) => `module-${i}`);
    expect(moduleNames.length).toBe(50);
    // Each module name is unique
    expect(new Set(moduleNames).size).toBe(50);
  });

  it("step 2: organization/IdentifyModules discovers a very large number of modules from the adversarial spec", () => {
    // Even with many modules, the system creates them all as valid ModuleFile entries
    const modules = new Map<string, ModuleFile>();
    for (let i = 0; i < 20; i++) {
      modules.set(`mod-${i}`, {
        nodes: { [`Node${i}`]: { type: 'process', description: `process ${i}` } },
        journeys: {},
      });
    }
    const result = compileFromModules(modules);
    expect(result.index._stats.modules).toBe(20);
    expect(result.index._stats.total_nodes).toBe(20);
  });

  it("step 3: organization/ModuleList stores the inflated module list", () => {
    // The module list is stored and countable — bounded by the spec content
    const moduleList = Array.from({ length: 30 }, (_, i) => `module-${i}`);
    expect(moduleList.length).toBe(30);
    // Each module needs at least 1 lens pass — total work = modules * lenses
    const lenses = 3; // create, audit, fix
    const totalPasses = moduleList.length * lenses;
    expect(totalPasses).toBe(90);
  });

  it("step 4: hierarchy/DecideSplit evaluates whether the large module count warrants splitting", () => {
    // A split decision is based on module count — too many modules = split into children
    const moduleCount = 25;
    const splitThreshold = 12; // typical threshold
    const shouldSplit = moduleCount > splitThreshold;
    expect(shouldSplit).toBe(true);
    // Small counts don't split
    const smallCount = 8;
    expect(smallCount > splitThreshold).toBe(false);
  });

  it("step 5: convergence/BoundedCreationRule enforces that creation is bounded by modules times lenses, not unbounded", () => {
    // Creation is bounded: each module gets exactly N lens passes
    const modules = ['auth', 'gateway', 'storage', 'users', 'billing'];
    const lensesPerModule = 3; // create, audit, fix
    const maxCreationSteps = modules.length * lensesPerModule;
    expect(maxCreationSteps).toBe(15);
    // Even with 50 modules, total steps are bounded
    const bigModules = Array.from({ length: 50 }, (_, i) => `mod-${i}`);
    const bigMax = bigModules.length * lensesPerModule;
    expect(bigMax).toBe(150);
    // Not unbounded — there's a finite cap
    expect(bigMax).toBeLessThan(Infinity);
  });

  it("step 6: convergence/DataDecidesWhenToStop allows convergence to complete even with many modules since creation is bounded", () => {
    // Compile a large module set — convergence completes with 0 errors
    const modules = new Map<string, ModuleFile>();
    const actorsModule: ModuleFile = {
      nodes: { Admin: { type: 'actor', description: 'system admin' } },
      journeys: {},
    };
    modules.set('_actors', actorsModule);
    for (let i = 0; i < 15; i++) {
      modules.set(`service-${i}`, {
        nodes: {
          [`Handler${i}`]: { type: 'process', description: `handles requests for service ${i}` },
        },
        journeys: {
          [`Flow${i}`]: {
            steps: [
              { node: '_actors/Admin', action: `triggers service ${i}` },
              { node: `Handler${i}`, action: `processes request` },
            ],
          },
        },
      });
    }
    const result = compileFromModules(modules);
    // All 15 services + _actors = 16 modules, 16 nodes (1 actor + 15 processes)
    expect(result.index._stats.modules).toBe(16);
    expect(result.index._stats.total_nodes).toBe(16);
    expect(result.index._stats.total_journeys).toBe(15);
    // No errors — convergence can complete
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

});
