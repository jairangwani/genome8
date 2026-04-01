// Auto-generated from journey: DetectSpecChangeToAuditDomain
// Module: audit
// Triggered by: none
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildDetectSpecChangeToAuditDomainModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'Signals spec has changed' },
      SpecFile: { type: 'artifact', description: 'Provides changed spec content' },
      ConvergenceState: { type: 'artifact', description: 'Records audit.yaml needs updating' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      DetectSpecChangeToAuditSections: { type: 'process', description: 'Reads updated spec sections 3 and 5' },
      AuditFindingsList: { type: 'artifact', description: 'Adds spec-change-induced gaps' },
      PrioritizeGaps: { type: 'process', description: 'Ranks new gaps alongside existing' },
      DetectSelfAuditTarget: { type: 'process', description: 'Flags gaps as self-referential' },
    },
    journeys: {
      DetectSpecChangeToAuditDomain: {
        steps: [
          { node: 'convergence/TargetedReconvergence', action: 'signals spec has changed' },
          { node: 'convergence/SpecFile', action: 'provides changed spec content' },
          { node: 'DetectSpecChangeToAuditSections', action: 'reads updated spec sections 3 and 5' },
          { node: 'DetectSpecChangeToAuditSections', action: 'compares updated spec against audit.yaml' },
          { node: 'DetectSpecChangeToAuditSections', action: 'identifies new audit requirements' },
          { node: 'AuditFindingsList', action: 'adds spec-change-induced gaps' },
          { node: 'PrioritizeGaps', action: 'ranks new gaps alongside existing' },
          { node: 'DetectSelfAuditTarget', action: 'flags gaps as self-referential' },
          { node: 'convergence/ConvergenceState', action: 'records audit.yaml needs updating' },
        ],
      },
    },
  });

  return modules;
}

describe("DetectSpecChangeToAuditDomain", () => {
  const modules = buildDetectSpecChangeToAuditDomainModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DetectSpecChangeToAuditDomain'];

  it("step 1: convergence/TargetedReconvergence signals spec has changed", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: convergence/SpecFile provides changed spec content", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → convergence/SpecFile", () => {
    const from = result.index.nodes['convergence/TargetedReconvergence'];
    expect(from.followed_by).toContain('convergence/SpecFile');
  });

  it("step 3: audit/DetectSpecChangeToAuditSections reads updated spec sections 3 and 5", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/SpecFile');
  });

  it("connection: convergence/SpecFile → audit/DetectSpecChangeToAuditSections", () => {
    const from = result.index.nodes['convergence/SpecFile'];
    expect(from.followed_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 4: audit/DetectSpecChangeToAuditSections compares updated spec against audit.yaml (self-loop)", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("connection: audit/DetectSpecChangeToAuditSections → audit/DetectSpecChangeToAuditSections", () => {
    const from = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(from.followed_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 5: audit/DetectSpecChangeToAuditSections identifies new audit requirements (self-loop)", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 6: audit/AuditFindingsList adds spec-change-induced gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("connection: audit/DetectSpecChangeToAuditSections → audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 7: audit/PrioritizeGaps ranks new gaps alongside existing", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const from = result.index.nodes['audit/AuditFindingsList'];
    expect(from.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 8: audit/DetectSelfAuditTarget flags gaps as self-referential", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/DetectSelfAuditTarget", () => {
    const from = result.index.nodes['audit/PrioritizeGaps'];
    expect(from.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 9: convergence/ConvergenceState records audit.yaml needs updating", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → convergence/ConvergenceState", () => {
    const from = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(from.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey covers full pipeline (9 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(9);
    expect(journey.steps[0].node).toBe('convergence/TargetedReconvergence');
    expect(journey.steps[8].node).toBe('convergence/ConvergenceState');
  });

  it("journey actor is correct", () => {
    expect(journey.actor).toBeNull();
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
