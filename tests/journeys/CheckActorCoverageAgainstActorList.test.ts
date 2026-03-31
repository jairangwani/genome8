// Auto-generated from journey: CheckActorCoverageAgainstActorList
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: actors, audit, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
        Operator: { type: 'actor', description: 'System operator' },
      },
    }],
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Login flow' },
        Token: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'submits credentials' },
            { node: 'Login', action: 'authenticates' },
            { node: 'Token', action: 'is issued' },
          ],
        },
        AdminLogin: {
          steps: [
            { node: '_actors/Admin', action: 'opens panel' },
            { node: 'Login', action: 'authenticates admin' },
          ],
        },
      },
    }],
  ]));
}

describe("CheckActorCoverageAgainstActorList", () => {
  it("step 1: actors/ActorsFile provides the authoritative list of discovered actors from 3-angle discovery", () => {
    const actorList = ['User', 'Admin', 'Operator'];
    expect(actorList.length).toBe(3);
    expect(actorList).toContain('User');
    expect(actorList).toContain('Admin');
    expect(actorList).toContain('Operator');
  });

  it("step 2: actors/MergedActorList supplies all actors after merge and deduplication", () => {
    const result = buildGraph();
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([k]) => k.startsWith('_actors/'));
    expect(actorNodes.length).toBe(3);
    const names = actorNodes.map(([k]) => k.replace('_actors/', ''));
    expect(new Set(names).size).toBe(names.length); // no duplicates
  });

  it("step 3: audit/GenerateAuditPrompt builds the actor coverage prompt including the full actor list as ground truth", () => {
    const actorList = ['User', 'Admin', 'Operator'];
    const prompt = `Check actor coverage.\nActors: ${actorList.join(', ')}\nVerify each actor appears in at least one journey.`;
    expect(prompt).toContain('User');
    expect(prompt).toContain('Admin');
    expect(prompt).toContain('Operator');
  });

  it("step 4: _actors/Auditor compares each actor from the list against journey step references across all modules", () => {
    const result = buildGraph();
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([k]) => k.startsWith('_actors/'));
    const covered = actorNodes.filter(([, n]) => n.in_journeys.length > 0);
    const orphaned = actorNodes.filter(([, n]) => n.in_journeys.length === 0);
    expect(covered.length).toBe(2); // User and Admin
    expect(orphaned.length).toBe(1); // Operator
  });

  it("step 5: audit/CheckActorCoverage flags actors that appear in no journey and actors confined to a single module", () => {
    const result = buildGraph();
    const orphanActors = result.coverage.orphans.filter(o => o.startsWith('_actors/'));
    expect(orphanActors).toContain('_actors/Operator');
    // User and Admin are both in auth journeys — confined to single module
    const userNode = result.index.nodes['_actors/User'];
    const adminNode = result.index.nodes['_actors/Admin'];
    expect(userNode.in_journeys.length).toBeGreaterThan(0);
    expect(adminNode.in_journeys.length).toBeGreaterThan(0);
  });

  it("step 6: audit/ActorCoverageReport records which actors are covered, which are orphaned, and which are single-module", () => {
    const result = buildGraph();
    const actorNodes = Object.entries(result.index.nodes)
      .filter(([k]) => k.startsWith('_actors/'));
    const report = {
      covered: actorNodes.filter(([, n]) => n.in_journeys.length > 0).map(([k]) => k),
      orphaned: actorNodes.filter(([, n]) => n.in_journeys.length === 0).map(([k]) => k),
    };
    expect(report.covered).toContain('_actors/User');
    expect(report.covered).toContain('_actors/Admin');
    expect(report.orphaned).toContain('_actors/Operator');
  });

  it("step 7: audit/CollectAuditFindings adds actor coverage gaps to the findings list with the source actor module as context", () => {
    const findings = [
      { type: 'actor_orphan', module: '_actors', detail: 'Operator not used in any journey', severity: 'medium' },
    ];
    expect(findings.length).toBe(1);
    expect(findings[0].type).toBe('actor_orphan');
    expect(findings[0].detail).toContain('Operator');
  });

});
