// Auto-generated from journey: ResourceExhaustionDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, organization, hierarchy, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildExhaustionModules(opts?: { manyModules?: boolean }) {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ResourceExhauster: { type: 'actor', description: 'Submits a spec designed to spawn unbounded child engines' },
    },
    journeys: {},
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'Discovers modules from the spec' },
      ModuleList: { type: 'artifact', description: 'Stores the module list' },
    },
    journeys: {},
  });

  modules.set('hierarchy', {
    nodes: {
      DecideSplit: { type: 'process', description: 'Evaluates whether the large module count warrants splitting' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      BoundedCreationRule: { type: 'rule', description: 'Enforces that creation is bounded by modules times lenses' },
      DataDecidesWhenToStop: { type: 'rule', description: 'Allows convergence to complete based on data, not loops' },
    },
    journeys: {
      ResourceExhaustionDefense: {
        steps: [
          { node: '_actors/ResourceExhauster', action: 'submits a spec designed to spawn unbounded child engines' },
          { node: 'organization/IdentifyModules', action: 'discovers a very large number of modules from the adversarial spec' },
          { node: 'organization/ModuleList', action: 'stores the inflated module list' },
          { node: 'hierarchy/DecideSplit', action: 'evaluates whether the large module count warrants splitting' },
          { node: 'BoundedCreationRule', action: 'enforces that creation is bounded by modules times lenses, not unbounded' },
          { node: 'DataDecidesWhenToStop', action: 'allows convergence to complete even with many modules since creation is bounded' },
        ],
      },
    },
  });

  // If testing many modules, create a large number of filler modules
  if (opts?.manyModules) {
    for (let i = 0; i < 20; i++) {
      modules.set(`filler${i}`, {
        nodes: { [`Process${i}`]: { type: 'process', description: `Filler process ${i}` } },
        journeys: {},
      });
    }
  }

  return modules;
}

describe("ResourceExhaustionDefense", () => {
  const modules = buildExhaustionModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ResourceExhaustionDefense'];

  it("step 1: _actors/ResourceExhauster submits a spec designed to spawn unbounded child engines", () => {
    const node = result.index.nodes['_actors/ResourceExhauster'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: organization/IdentifyModules discovers a very large number of modules from the adversarial spec", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ResourceExhauster');
  });

  it("connection: _actors/ResourceExhauster → organization/IdentifyModules", () => {
    const from = result.index.nodes['_actors/ResourceExhauster'];
    expect(from.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 3: organization/ModuleList stores the inflated module list", () => {
    const node = result.index.nodes['organization/ModuleList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → organization/ModuleList", () => {
    const from = result.index.nodes['organization/IdentifyModules'];
    expect(from.followed_by).toContain('organization/ModuleList');
  });

  it("step 4: hierarchy/DecideSplit evaluates whether the large module count warrants splitting", () => {
    const node = result.index.nodes['hierarchy/DecideSplit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/ModuleList');
  });

  it("connection: organization/ModuleList → hierarchy/DecideSplit", () => {
    const from = result.index.nodes['organization/ModuleList'];
    expect(from.followed_by).toContain('hierarchy/DecideSplit');
  });

  it("step 5: convergence/BoundedCreationRule enforces that creation is bounded by modules times lenses, not unbounded", () => {
    const node = result.index.nodes['convergence/BoundedCreationRule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('hierarchy/DecideSplit');
  });

  it("connection: hierarchy/DecideSplit → convergence/BoundedCreationRule", () => {
    const from = result.index.nodes['hierarchy/DecideSplit'];
    expect(from.followed_by).toContain('convergence/BoundedCreationRule');
  });

  it("step 6: convergence/DataDecidesWhenToStop allows convergence to complete even with many modules since creation is bounded", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('convergence/BoundedCreationRule');
  });

  it("connection: convergence/BoundedCreationRule → convergence/DataDecidesWhenToStop", () => {
    const from = result.index.nodes['convergence/BoundedCreationRule'];
    expect(from.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("compilation handles many modules without errors", () => {
    const manyModules = buildExhaustionModules({ manyModules: true });
    const manyResult = compileFromModules(manyModules);
    // 20 filler modules + 4 core modules = 24 modules
    expect(Object.keys(manyResult.coverage.modules).length).toBeGreaterThanOrEqual(24);
    const errors = manyResult.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("journey actor is ResourceExhauster", () => {
    expect(journey.actor).toBe('_actors/ResourceExhauster');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
