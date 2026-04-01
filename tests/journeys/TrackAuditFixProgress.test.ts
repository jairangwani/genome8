// Auto-generated from journey: TrackAuditFixProgress
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
      DataDecidesWhenToStop: { type: 'rule', description: 'convergence terminates when data shows no more progress, not after a fixed number of iterations' },
    },
  });

  modules.set('audit', {
    nodes: {
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed for progress tracking and termination decisions' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
    },
    journeys: {
      TrackAuditFixProgress: {
        steps: [
          { node: 'convergence/ConvergenceState', action: 'provides the current pipeline step showing audit is in progress' },
          { node: 'TrackAuditRound', action: 'provides the current round number and cumulative gaps fixed' },
          { node: 'AuditFindingsList', action: 'provides the current gap count remaining' },
          { node: 'convergence/DataDecidesWhenToStop', action: 'evaluates whether progress is being made based on gap count trending toward zero' },
          { node: 'TrackAuditRound', action: 'records the gap count delta between this round and the previous round' },
          { node: 'convergence/ConvergenceState', action: 'updates with the audit progress metrics for the current round' },
        ],
      },
    },
  });

  return modules;
}

describe("TrackAuditFixProgress", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['TrackAuditFixProgress'];

  it("step 1: convergence/ConvergenceState provides the current pipeline step showing audit is in progress", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('TrackAuditFixProgress'))).toBe(true);
  });

  it("step 2: audit/TrackAuditRound provides the current round number and cumulative gaps fixed", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState → audit/TrackAuditRound", () => {
    const src = result.index.nodes['convergence/ConvergenceState'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 3: audit/AuditFindingsList provides the current gap count remaining", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 4: convergence/DataDecidesWhenToStop evaluates whether progress is being made based on gap count trending toward zero", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → convergence/DataDecidesWhenToStop", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("step 5: audit/TrackAuditRound records the gap count delta between this round and the previous round", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node.preceded_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("connection: convergence/DataDecidesWhenToStop → audit/TrackAuditRound", () => {
    const src = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 6: convergence/ConvergenceState updates with the audit progress metrics for the current round", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound → convergence/ConvergenceState", () => {
    const src = result.index.nodes['audit/TrackAuditRound'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 6 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(6);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
