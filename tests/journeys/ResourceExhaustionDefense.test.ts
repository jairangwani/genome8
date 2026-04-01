// Auto-generated from journey: ResourceExhaustionDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, organization, hierarchy, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      ResourceExhauster: { type: 'actor', description: 'an adversary who submits a spec designed to spawn unbounded child engines or exhaust resources' },
    },
  });

  modules.set('organization', {
    nodes: {
      IdentifyModules: { type: 'process', description: 'analyzes the spec to identify the set of modules the system should have' },
      ModuleList: { type: 'artifact', description: 'the ordered list of modules identified from the spec' },
    },
  });

  modules.set('hierarchy', {
    nodes: {
      DecideSplit: { type: 'process', description: 'evaluates whether a module set is large enough to warrant splitting into parent/child engines' },
    },
  });

  modules.set('convergence', {
    nodes: {
      BoundedCreationRule: { type: 'rule', description: 'creation work is bounded by modules times lenses, ensuring finite work regardless of module count' },
      DataDecidesWhenToStop: { type: 'rule', description: 'convergence completes when all modules pass audit, not after a fixed number of iterations' },
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

  return modules;
}

describe("ResourceExhaustionDefense", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['ResourceExhaustionDefense'];

  it("step 1: _actors/ResourceExhauster submits a spec designed to spawn unbounded child engines", () => {
    const node = result.index.nodes['_actors/ResourceExhauster'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.in_journeys.some(j => j.startsWith('ResourceExhaustionDefense'))).toBe(true);
  });

  it("step 2: organization/IdentifyModules discovers a very large number of modules from the adversarial spec", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/ResourceExhauster');
  });

  it("connection: _actors/ResourceExhauster → organization/IdentifyModules", () => {
    const src = result.index.nodes['_actors/ResourceExhauster'];
    expect(src.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 3: organization/ModuleList stores the inflated module list", () => {
    const node = result.index.nodes['organization/ModuleList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → organization/ModuleList", () => {
    const src = result.index.nodes['organization/IdentifyModules'];
    expect(src.followed_by).toContain('organization/ModuleList');
  });

  it("step 4: hierarchy/DecideSplit evaluates whether the large module count warrants splitting", () => {
    const node = result.index.nodes['hierarchy/DecideSplit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/ModuleList');
  });

  it("connection: organization/ModuleList → hierarchy/DecideSplit", () => {
    const src = result.index.nodes['organization/ModuleList'];
    expect(src.followed_by).toContain('hierarchy/DecideSplit');
  });

  it("step 5: convergence/BoundedCreationRule enforces that creation is bounded by modules times lenses, not unbounded", () => {
    const node = result.index.nodes['convergence/BoundedCreationRule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('hierarchy/DecideSplit');
  });

  it("connection: hierarchy/DecideSplit → convergence/BoundedCreationRule", () => {
    const src = result.index.nodes['hierarchy/DecideSplit'];
    expect(src.followed_by).toContain('convergence/BoundedCreationRule');
  });

  it("step 6: convergence/DataDecidesWhenToStop allows convergence to complete even with many modules since creation is bounded", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('convergence/BoundedCreationRule');
  });

  it("connection: convergence/BoundedCreationRule → convergence/DataDecidesWhenToStop", () => {
    const src = result.index.nodes['convergence/BoundedCreationRule'];
    expect(src.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
