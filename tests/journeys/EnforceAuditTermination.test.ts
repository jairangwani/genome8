// Auto-generated from journey: EnforceAuditTermination
// Module: audit
// Modules touched: audit, convergence, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      DataDecidesWhenToStop: { type: 'rule', description: 'convergence terminates when data shows no more progress' },
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed' },
      AuditRoundLimit: { type: 'rule', description: 'audit-fix-reaudit cycles are capped at a maximum number of rounds' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
    },
    journeys: {
      EnforceAuditTermination: {
        steps: [
          { node: 'TrackAuditRound', action: 'provides the current round number and gap count history across rounds' },
          { node: 'AuditRoundLimit', action: 'checks whether the current round exceeds the maximum allowed cycles' },
          { node: 'TrackAuditRound', action: 'compares the gap count from this round against the previous round' },
          { node: 'convergence/DataDecidesWhenToStop', action: 'detects that gap count has not decreased for consecutive rounds indicating a stall' },
          { node: 'AuditFindingsList', action: 'provides the remaining unresolvable gaps' },
          { node: 'convergence/ConvergenceState', action: 'records that audit has stalled or hit the round limit with gaps still remaining' },
          { node: 'compilation/CompilationResult', action: 'provides the final compilation state at the point of termination' },
        ],
      },
    },
  });

  return modules;
}

describe("EnforceAuditTermination", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EnforceAuditTermination'];

  it("step 1: audit/TrackAuditRound provides the current round number and gap count history across rounds", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('EnforceAuditTermination'))).toBe(true);
  });

  it("step 2: audit/AuditRoundLimit checks whether the current round exceeds the maximum allowed cycles", () => {
    const node = result.index.nodes['audit/AuditRoundLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → audit/AuditRoundLimit", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('audit/AuditRoundLimit');
  });

  it("step 3: audit/TrackAuditRound compares the gap count from this round against the previous round", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node.preceded_by).toContain('audit/AuditRoundLimit');
  });

  it("connection: audit/AuditRoundLimit → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/AuditRoundLimit'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 4: convergence/DataDecidesWhenToStop detects that gap count has not decreased for consecutive rounds indicating a stall", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → convergence/DataDecidesWhenToStop", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("step 5: audit/AuditFindingsList provides the remaining unresolvable gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("connection: convergence/DataDecidesWhenToStop → audit/AuditFindingsList", () => {
    const src = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 6: convergence/ConvergenceState records that audit has stalled or hit the round limit with gaps still remaining", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → convergence/ConvergenceState", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("step 7: compilation/CompilationResult provides the final compilation state at the point of termination", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState → compilation/CompilationResult", () => {
    const src = result.index.nodes['convergence/ConvergenceState'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey has 7 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(7);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
