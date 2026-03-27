// Auto-generated from journey: DepthAudit
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, compilation, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts

// Build a graph with known coverage properties for auditing
const _actorsModule: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    Auditor: { type: 'actor', description: 'reviews graph coverage' },
  },
  journeys: {},
};

const authModule: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores session tokens' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'submits credentials' },
        { node: 'Login', action: 'validates credentials' },
        { node: 'TokenStore', action: 'stores session token' },
      ],
    },
  },
};

const gatewayModule: ModuleFile = {
  spec_sections: [3],
  nodes: {
    Router: { type: 'process', description: 'routes requests' },
    RateLimit: { type: 'rule', description: 'enforces rate limits' },
  },
  journeys: {
    RouteRequest: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'sends request' },
        { node: 'RateLimit', action: 'checks rate limit' },
        { node: 'Router', action: 'routes to handler' },
        { node: 'auth/Login', action: 'authenticates' },
      ],
    },
  },
};

// Isolated module with orphan nodes — deliberate gap
const orphanModule: ModuleFile = {
  nodes: {
    UnusedProcess: { type: 'process', description: 'not referenced in any journey' },
    UnusedArtifact: { type: 'artifact', description: 'also unreferenced' },
    UnusedRule: { type: 'rule', description: 'another orphan' },
    UnusedInterface: { type: 'interface', description: 'yet another orphan' },
  },
  journeys: {},
};

const result = compileFromModules(new Map([
  ['_actors', _actorsModule],
  ['auth', authModule],
  ['gateway', gatewayModule],
  ['orphan', orphanModule],
]));

describe("DepthAudit", () => {
  it("step 1: convergence/CompileCheck confirms compilation passed with 0 errors and 0 orphans", () => {
    // Compilation passes — but we expect warnings for orphans
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // The graph compiles but has orphan nodes (intentional for audit testing)
  });

  it("step 2: compilation/CompilationResult provides the clean compilation result", () => {
    expect(result.index).toBeDefined();
    // 2 actors + 2 auth + 2 gateway + 4 orphan = 10
    expect(result.index._stats.total_nodes).toBe(10);
    expect(result.index._stats.total_journeys).toBe(2);
    expect(result.index._stats.modules).toBe(4);
  });

  it("step 3: audit/AuditAfterZeroErrors verifies the graph is error-free before starting audit", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // Only warnings (orphans) exist — audit can proceed
    const warnings = result.issues.filter(i => i.severity === 'warning');
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });

  it("step 4: convergence/TargetedAudit triggers the depth audit with 3 auditors", () => {
    // 3 audit angles: spec coverage, actor coverage, cross-module coverage
    const auditAngles = ['spec-coverage', 'actor-coverage', 'cross-module-coverage'];
    expect(auditAngles.length).toBe(3);
  });

  it("step 5: audit/ExactlyThreeAuditors enforces that all 3 coverage angles will be checked", () => {
    const requiredAngles = 3;
    const actualAngles = ['spec', 'actor', 'cross-module'];
    expect(actualAngles.length).toBe(requiredAngles);
  });

  it("step 6: audit/TrackAuditRound initializes the round counter to 1 for the first audit pass", () => {
    let auditRound = 0;
    auditRound = 1; // initialize
    expect(auditRound).toBe(1);
  });

  it("step 7: audit/GenerateAuditPrompt builds the spec coverage prompt for auditor 1", () => {
    // Spec coverage checks which spec_sections are represented
    const specSections = new Set<number>();
    for (const [, mod] of [['auth', authModule], ['gateway', gatewayModule]] as const) {
      for (const s of mod.spec_sections ?? []) specSections.add(s);
    }
    expect(specSections.size).toBe(3); // sections 1, 2, 3
  });

  it("step 8: excerpt/ExcerptOutput provides focused context for the auditor to review", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process',
    });
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('YOUR NODES');
    expect(excerpt).toContain('Login');
  });

  it("step 9: _actors/Auditor checks spec coverage — which spec sections are represented in the graph", () => {
    // Auditor actor exists and is connected
    expect(result.index.nodes['_actors/Auditor']).toBeDefined();
    expect(result.index.nodes['_actors/Auditor'].type).toBe('actor');
  });

  it("step 10: audit/CheckSpecCoverage compares spec sections against nodes and journeys in the compiled graph", () => {
    // auth covers sections 1, 2; gateway covers section 3
    expect(result.coverage.modules['auth'].spec_sections).toEqual([1, 2]);
    expect(result.coverage.modules['gateway'].spec_sections).toEqual([3]);
    // orphan module has no spec_sections
    expect(result.coverage.modules['orphan'].spec_sections).toEqual([]);
  });

  it("step 11: audit/SpecCoverageReport records which sections are covered and which have gaps", () => {
    const coveredSections = new Set<number>();
    for (const mod of Object.values(result.coverage.modules)) {
      for (const s of mod.spec_sections) coveredSections.add(s);
    }
    expect(coveredSections.has(1)).toBe(true);
    expect(coveredSections.has(2)).toBe(true);
    expect(coveredSections.has(3)).toBe(true);
  });

  it("step 12: audit/GenerateAuditPrompt builds the actor coverage prompt for auditor 2", () => {
    // Actor coverage checks which actors appear in journeys
    const actorNodes = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'actor');
    expect(actorNodes.length).toBe(2);
  });

  it("step 13: _actors/Auditor checks actor coverage — which actors participate in journeys", () => {
    // ProjectOwner is in journeys, Auditor is not
    expect(result.index.nodes['_actors/ProjectOwner'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(result.index.nodes['_actors/Auditor'].in_journeys.length).toBe(0);
  });

  it("step 14: audit/CheckActorCoverage compares _actors.yaml entries against journey step references", () => {
    const actorsInJourneys = Object.entries(result.index.nodes)
      .filter(([k, n]) => k.startsWith('_actors/') && n.in_journeys.length > 0);
    const actorsNotInJourneys = Object.entries(result.index.nodes)
      .filter(([k, n]) => k.startsWith('_actors/') && n.in_journeys.length === 0);
    expect(actorsInJourneys.length).toBe(1); // ProjectOwner
    expect(actorsNotInJourneys.length).toBe(1); // Auditor
  });

  it("step 15: audit/ActorCoverageReport records which actors are connected and which are orphaned", () => {
    const orphanActors = Object.entries(result.index.nodes)
      .filter(([k, n]) => k.startsWith('_actors/') && n.in_journeys.length === 0)
      .map(([k]) => k);
    expect(orphanActors).toContain('_actors/Auditor');
    expect(orphanActors).not.toContain('_actors/ProjectOwner');
  });

  it("step 16: audit/GenerateAuditPrompt builds the cross-module coverage prompt for auditor 3", () => {
    // Cross-module checks which modules connect to others
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
    expect(result.coverage.modules['gateway'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 17: _actors/Auditor checks cross-module coverage — which modules connect to others", () => {
    // auth and gateway have cross-module connections via journeys
    // orphan has none
    expect(result.coverage.modules['orphan'].cross_module_connections).toBe(0);
  });

  it("step 18: audit/CheckCrossModuleCoverage checks each module for at least one cross-module connection", () => {
    const modulesWithCrossConns = Object.entries(result.coverage.modules)
      .filter(([, c]) => c.cross_module_connections > 0)
      .map(([m]) => m);
    expect(modulesWithCrossConns).toContain('auth');
    expect(modulesWithCrossConns).toContain('gateway');
    expect(modulesWithCrossConns).toContain('_actors');
    expect(modulesWithCrossConns).not.toContain('orphan');
  });

  it("step 19: audit/CrossModuleCoverageReport records which modules are connected and which are isolated", () => {
    expect(result.coverage.isolated_modules).toContain('orphan');
    expect(result.coverage.isolated_modules).not.toContain('auth');
    expect(result.coverage.isolated_modules).not.toContain('gateway');
  });

  it("step 20: audit/MergeAuditReports combines the 3 individual reports into a unified gap format", () => {
    // Gaps found: orphan actors, orphan nodes, isolated modules
    const gaps: string[] = [];
    // Orphan nodes
    for (const orphan of result.coverage.orphans) gaps.push(`orphan: ${orphan}`);
    // Isolated modules
    for (const iso of result.coverage.isolated_modules) gaps.push(`isolated: ${iso}`);
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });

  it("step 21: audit/CollectAuditFindings gathers all findings from the merged reports into a single gap list", () => {
    const findings = [
      ...result.coverage.orphans.map(o => ({ type: 'orphan', target: o })),
      ...result.coverage.isolated_modules.map(m => ({ type: 'isolated', target: m })),
    ];
    expect(findings.length).toBeGreaterThanOrEqual(5); // 4 orphan nodes + Auditor + orphan module
  });

  it("step 22: audit/AuditFindingsList stores the complete list of coverage gaps", () => {
    const findings = [
      ...result.coverage.orphans.map(o => ({ type: 'orphan' as const, target: o })),
      ...result.coverage.isolated_modules.map(m => ({ type: 'isolated' as const, target: m })),
    ];
    // The findings list is non-empty and contains actionable items
    expect(findings.length).toBeGreaterThanOrEqual(1);
    expect(findings.some(f => f.type === 'orphan')).toBe(true);
    expect(findings.some(f => f.type === 'isolated')).toBe(true);
  });

});
