// Auto-generated from journey: OrganizationContextDrivesDiscovery
// Module: actors
// Modules touched: convergence, organization, actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildOrgDiscoveryModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      WriteOrganization: { type: 'process', description: 'Completes the organization step producing ORGANIZATION.md' },
      DiscoverActors: { type: 'process', description: 'Receives the organization context and begins actor discovery' },
    },
    journeys: {},
  });

  modules.set('organization', {
    nodes: {
      OrganizationFile: { type: 'artifact', description: 'Provides the module list, dependencies, and scope analysis' },
      IdentifyScope: { type: 'process', description: 'Defines the system boundary that constrains which actors are relevant' },
      IdentifyModules: { type: 'process', description: 'Provides the module names so discovery can target actors per domain' },
      ModuleSpecSectionMap: { type: 'artifact', description: 'Maps spec sections to modules so each discovery angle knows which sections matter' },
    },
    journeys: {},
  });

  modules.set('actors', {
    nodes: {
      DiscoverFromActivities: { type: 'process', description: 'Uses the module list to identify which activities produce which actors' },
      DiscoverFromThreats: { type: 'process', description: 'Uses the scope boundary to identify which threat actors target which modules' },
      DiscoverFromLifecycle: { type: 'process', description: 'Uses the module domains to identify lifecycle actors per concern area' },
      MergeAndDeduplicate: { type: 'process', description: 'Merges actors with organization context ensuring each actor maps to at least one module' },
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
  const modules = buildOrgDiscoveryModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['OrganizationContextDrivesDiscovery'];

  it("step 1: convergence/WriteOrganization completes the organization step producing ORGANIZATION.md", () => {
    const node = result.index.nodes['convergence/WriteOrganization'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: organization/OrganizationFile provides the module list, dependencies, and scope analysis", () => {
    const node = result.index.nodes['organization/OrganizationFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/WriteOrganization');
  });

  it("connection: convergence/WriteOrganization → organization/OrganizationFile", () => {
    const from = result.index.nodes['convergence/WriteOrganization'];
    expect(from.followed_by).toContain('organization/OrganizationFile');
  });

  it("step 3: organization/IdentifyScope defines the system boundary that constrains which actors are relevant", () => {
    const node = result.index.nodes['organization/IdentifyScope'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/OrganizationFile');
  });

  it("connection: organization/OrganizationFile → organization/IdentifyScope", () => {
    const from = result.index.nodes['organization/OrganizationFile'];
    expect(from.followed_by).toContain('organization/IdentifyScope');
  });

  it("step 4: organization/IdentifyModules provides the module names so discovery can target actors per domain", () => {
    const node = result.index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/IdentifyScope');
  });

  it("connection: organization/IdentifyScope → organization/IdentifyModules", () => {
    const from = result.index.nodes['organization/IdentifyScope'];
    expect(from.followed_by).toContain('organization/IdentifyModules');
  });

  it("step 5: organization/ModuleSpecSectionMap maps spec sections to modules so each discovery angle knows which sections matter", () => {
    const node = result.index.nodes['organization/ModuleSpecSectionMap'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('organization/IdentifyModules');
  });

  it("connection: organization/IdentifyModules → organization/ModuleSpecSectionMap", () => {
    const from = result.index.nodes['organization/IdentifyModules'];
    expect(from.followed_by).toContain('organization/ModuleSpecSectionMap');
  });

  it("step 6: convergence/DiscoverActors receives the organization context and begins actor discovery", () => {
    const node = result.index.nodes['convergence/DiscoverActors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('organization/ModuleSpecSectionMap');
  });

  it("connection: organization/ModuleSpecSectionMap → convergence/DiscoverActors", () => {
    const from = result.index.nodes['organization/ModuleSpecSectionMap'];
    expect(from.followed_by).toContain('convergence/DiscoverActors');
  });

  it("step 7: actors/DiscoverFromActivities uses the module list to identify which activities produce which actors", () => {
    const node = result.index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/DiscoverActors');
  });

  it("connection: convergence/DiscoverActors → actors/DiscoverFromActivities", () => {
    const from = result.index.nodes['convergence/DiscoverActors'];
    expect(from.followed_by).toContain('actors/DiscoverFromActivities');
  });

  it("step 8: actors/DiscoverFromThreats uses the scope boundary to identify which threat actors target which modules", () => {
    const node = result.index.nodes['actors/DiscoverFromThreats'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromActivities');
  });

  it("connection: actors/DiscoverFromActivities → actors/DiscoverFromThreats", () => {
    const from = result.index.nodes['actors/DiscoverFromActivities'];
    expect(from.followed_by).toContain('actors/DiscoverFromThreats');
  });

  it("step 9: actors/DiscoverFromLifecycle uses the module domains to identify lifecycle actors per concern area", () => {
    const node = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromThreats');
  });

  it("connection: actors/DiscoverFromThreats → actors/DiscoverFromLifecycle", () => {
    const from = result.index.nodes['actors/DiscoverFromThreats'];
    expect(from.followed_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("step 10: actors/MergeAndDeduplicate merges actors with organization context ensuring each actor maps to at least one module", () => {
    const node = result.index.nodes['actors/MergeAndDeduplicate'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('actors/DiscoverFromLifecycle');
  });

  it("connection: actors/DiscoverFromLifecycle → actors/MergeAndDeduplicate", () => {
    const from = result.index.nodes['actors/DiscoverFromLifecycle'];
    expect(from.followed_by).toContain('actors/MergeAndDeduplicate');
  });

  it("journey covers full organization-driven discovery pipeline (10 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(10);
    expect(journey.steps[0].node).toBe('convergence/WriteOrganization');
    expect(journey.steps[9].node).toBe('actors/MergeAndDeduplicate');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
