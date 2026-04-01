import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildTrackAuditFixProgressModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      ConvergenceState: { type: 'artifact', description: 'Provides current pipeline step showing audit in progress' },
      DataDecidesWhenToStop: { type: 'rule', description: 'Evaluates whether progress is being made' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      TrackAuditRound: { type: 'artifact', description: 'Provides current round number and cumulative gaps fixed' },
      AuditFindingsList: { type: 'artifact', description: 'Provides current gap count remaining' },
    },
    journeys: {
      TrackAuditFixProgress: {
        steps: [
          { node: 'convergence/ConvergenceState', action: 'provides current pipeline step showing audit in progress' },
          { node: 'TrackAuditRound', action: 'provides current round number and cumulative gaps fixed' },
          { node: 'AuditFindingsList', action: 'provides current gap count remaining' },
          { node: 'convergence/DataDecidesWhenToStop', action: 'evaluates whether progress is being made' },
          { node: 'TrackAuditRound', action: 'records gap count delta' },
          { node: 'convergence/ConvergenceState', action: 'updates with audit progress metrics' },
        ],
      },
    },
  });

  return modules;
}

describe("TrackAuditFixProgress", () => {
  const modules = buildTrackAuditFixProgressModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['TrackAuditFixProgress'];

  it("step 1: convergence/ConvergenceState provides current pipeline step showing audit in progress", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: audit/TrackAuditRound provides current round number and cumulative gaps fixed", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState -> audit/TrackAuditRound", () => {
    const from = result.index.nodes['convergence/ConvergenceState'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 3: audit/AuditFindingsList provides current gap count remaining", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound -> audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 4: convergence/DataDecidesWhenToStop evaluates whether progress is being made", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList -> convergence/DataDecidesWhenToStop", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("step 5: audit/TrackAuditRound records gap count delta (self-loop)", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("connection: convergence/DataDecidesWhenToStop -> audit/TrackAuditRound", () => {
    const from = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 6: convergence/ConvergenceState updates with audit progress metrics (revisited)", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound -> convergence/ConvergenceState", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full pipeline (6 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(6);
    expect(journey.steps[0].node).toBe('convergence/ConvergenceState');
    expect(journey.steps[5].node).toBe('convergence/ConvergenceState');
  });

  it("journey has no actor (no actor nodes in steps)", () => {
    expect(journey.actor).toBeNull();
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
