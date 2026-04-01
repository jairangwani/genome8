// Auto-generated from journey: OrganizationContextDrivesDiscovery
// Module: actors
// Modules touched: convergence, organization, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      WriteOrganization: { type: 'process', description: 'analyzes the spec to produce ORGANIZATION.md with module list and dependencies' },
      DiscoverActors: { type: 'process', description: 'delegates to LLM to discover actors from 3 angles and write _actors.yaml' },
    },
  });

  modules.set('organization', {
    nodes: {
      OrganizationFile: { type: 'artifact', description: 'the ORGANIZATION.md file containing scope, module list, dependency order, and independence analysis' },
      IdentifyScope: { type: 'process', description: 'defines the system boundary that constrains which actors are relevant' },
      IdentifyModules: { type: 'process', description: 'analyzes the spec to identify the set of modules the system should have' },
      ModuleSpecSectionMap: { type: 'artifact', description: 'maps spec sections to modules so each discovery angle knows which sections matter' },
    },
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'analyzes the spec to find actors from the activities perspective' },
      DiscoverFromThreats: { type: 'process', description: 'analyzes the spec to find threat actors' },
      DiscoverFromLifecycle: { type: 'process', description: 'analyzes the spec to find lifecycle actors' },
      MergeAndDeduplicate: { type: 'process', description: 'combines actors from all 3 angles, removes duplicates, and keeps the best description for each' },
    },
    journeys: {
      OrganizationContextDrivesDiscovery: {
        steps: [
          { node: 'convergence/WriteOrganization', action: 'completes the organization step producing ORGANIZATION.md' },
          { node: 'organization/OrganizationFile', action: 'provides the module list, dependencies, and scope analysis' },
          { node: 'organization/IdentifyScope', action: 'defines the system boundary that constrains which actors are relevant' },
          { node: 'organization/IdentifyModules', action: 'provides the module names so discovery can target actors per domain' },
          { node: 'organization/ModuleSpecSectionMap', action: 'maps spec sections to modules so each discovery angle knows which sections matter' },
          { node: 'convergence/DiscoverActors', action: 'receives the organization context and begins actor discovery' },
          { node: 'DiscoverFromActivities', action: 'uses the module list to identify which activities produce which actors' },
          { node: 'DiscoverFromThreats', action: 'uses the scope boundary to identify which threat actors target which modules' },
          { node: 'DiscoverFromLifecycle', action: 'uses the module domains to identify lifecycle actors per concern area' },
          { node: 'MergeAndDeduplicate', action: 'merges actors with organization context ensuring each actor maps to at least one module' },
        ],
      },
    },
  });

  return modules;
}

describe("OrganizationContextDrivesDiscovery", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['OrganizationContextDrivesDiscovery'];

  it("step 1: convergence/WriteOrganization completes the organization step producing ORGANIZATION.md", () => {
    const node = result.index.nodes['convergence/WriteOrganization'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('OrganizationContextDrivesDiscovery'))).toBe(true);
  });

  it("step 2: organization/OrganizationFile provides the module list, dependencies, and scope analysis", () => {
    const node = result.index.nodes['organization/OrganizationFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/WriteOrganization');
  });

  it("connection: convergence/WriteOrganization → organization/OrganizationFile", () => {
    const src = result.index.nodes['convergence/WriteOrganization'];
    expect(src.followed_by).toContain('organization/OrganizationFile');
  });

  it("step 3: organization/IdentifyScope defines the system boundary that constrains which actors are relevant", () => {
    const node = result.index.nodes['organization/IdentifyScope'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/OrganizationFile');
  });

  it("connection: organization/OrganizationFile → organization/IdentifyScope", () => {
    const src = result.index.nodes['organization/OrganizationFile'];
    expect(src.followed_by).toContain('organization/IdentifyScope');
  });

  it("step 4: organization/IdentifyModules provides the module names so discovery can target actors per domain", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/IdentifyScope');
  });

  it("connection: organization/IdentifyScope → organization/IdentifyModules", () => {
    const src = result.index.nodes['organization/IdentifyScope'];
    expect(src.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 5: organization/ModuleSpecSectionMap maps spec sections to modules so each discovery angle knows which sections matter", () => {
    const node = result.index.nodes['organization/ModuleSpecSectionMap'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → organization/ModuleSpecSectionMap", () => {
    const src = result.index.nodes['organization/IdentifyModules'];
    expect(src.followed_by).toContain('organization/ModuleSpecSectionMap');
  });

  it("step 6: convergence/DiscoverActors receives the organization context and begins actor discovery", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/ModuleSpecSectionMap');
  });

  it("connection: organization/ModuleSpecSectionMap → convergence/DiscoverActors", () => {
    const src = result.index.nodes['organization/ModuleSpecSectionMap'];
    expect(src.followed_by).toContain('convergence/DiscoverActors');
  });

  it("step 7: actors/DiscoverFromActivities uses the module list to identify which activities produce which actors", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → actors/DiscoverFromActivities", () => {
    const src = result.index.nodes['convergence/DiscoverActors'];
    expect(src.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 8: actors/DiscoverFromThreats uses the scope boundary to identify which threat actors target which modules", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const src = result.index.nodes['actors/DiscoverFromActivities'];
    expect(src.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 9: actors/DiscoverFromLifecycle uses the module domains to identify lifecycle actors per concern area", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const src = result.index.nodes['actors/DiscoverFromThreats'];
    expect(src.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 10: actors/MergeAndDeduplicate merges actors with organization context ensuring each actor maps to at least one module", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const src = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(src.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("journey has 10 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(10);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
