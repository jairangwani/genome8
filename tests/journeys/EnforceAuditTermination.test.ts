import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildEnforceAuditTerminationModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      DataDecidesWhenToStop: { type: 'rule', description: 'Detects that gap count has not decreased for consecutive rounds' },
      ConvergenceState: { type: 'artifact', description: 'Records that audit has stalled or hit the round limit' },
    },
    journeys: {},
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'Provides the final compilation state at the point of termination' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      TrackAuditRound: { type: 'artifact', description: 'Provides the current round number and gap count history' },
      AuditRoundLimit: { type: 'rule', description: 'Checks whether the current round exceeds the maximum allowed cycles' },
      AuditFindingsList: { type: 'artifact', description: 'Provides the remaining unresolvable gaps' },
    },
    journeys: {
      EnforceAuditTermination: {
        steps: [
          { node: 'TrackAuditRound', action: 'provides the current round number and gap count history' },
          { node: 'AuditRoundLimit', action: 'checks whether the current round exceeds the maximum allowed cycles' },
          { node: 'TrackAuditRound', action: 'compares the gap count from this round against the previous round' },
          { node: 'convergence/DataDecidesWhenToStop', action: 'detects that gap count has not decreased for consecutive rounds' },
          { node: 'AuditFindingsList', action: 'provides the remaining unresolvable gaps' },
          { node: 'convergence/ConvergenceState', action: 'records that audit has stalled or hit the round limit' },
          { node: 'compilation/CompilationResult', action: 'provides the final compilation state at the point of termination' },
        ],
      },
    },
  });

  return modules;
}

describe("EnforceAuditTermination", () => {
  const modules = buildEnforceAuditTerminationModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['EnforceAuditTermination'];

  it("step 1: audit/TrackAuditRound provides the current round number and gap count history", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 2: audit/AuditRoundLimit checks whether the current round exceeds the maximum allowed cycles", () => {
    const node = result.index.nodes['audit/AuditRoundLimit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound -> audit/AuditRoundLimit", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('audit/AuditRoundLimit');
  });

  it("step 3: audit/TrackAuditRound compares the gap count from this round against the previous round (revisited)", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/AuditRoundLimit');
  });

  it("connection: audit/AuditRoundLimit -> audit/TrackAuditRound", () => {
    const from = result.index.nodes['audit/AuditRoundLimit'];
    expect(from.followed_by).toContain('audit/TrackAuditRound');
  });

  it("step 4: convergence/DataDecidesWhenToStop detects that gap count has not decreased for consecutive rounds", () => {
    const node = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('audit/TrackAuditRound');
  });

  it("connection: audit/TrackAuditRound -> convergence/DataDecidesWhenToStop", () => {
    const from = result.index.nodes['audit/TrackAuditRound'];
    expect(from.followed_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("step 5: audit/AuditFindingsList provides the remaining unresolvable gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/DataDecidesWhenToStop');
  });

  it("connection: convergence/DataDecidesWhenToStop -> audit/AuditFindingsList", () => {
    const from = result.index.nodes['convergence/DataDecidesWhenToStop'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 6: convergence/ConvergenceState records that audit has stalled or hit the round limit", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList -> convergence/ConvergenceState", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("step 7: compilation/CompilationResult provides the final compilation state at the point of termination", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("connection: convergence/ConvergenceState -> compilation/CompilationResult", () => {
    const from = result.index.nodes['convergence/ConvergenceState'];
    expect(from.followed_by).toContain('compilation/CompilationResult');
  });

  it("journey covers full pipeline (7 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(7);
    expect(journey.steps[0].node).toBe('audit/TrackAuditRound');
    expect(journey.steps[6].node).toBe('compilation/CompilationResult');
  });

  it("journey has no actor (no actor nodes in steps)", () => {
    expect(journey.actor).toBeNull();
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
