// Auto-generated from journey: DetectSpecChangeToAuditDomain
// Module: audit
// Modules touched: convergence, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('convergence', {
    nodes: {
      TargetedReconvergence: { type: 'process', description: 'reconverges only the modules affected by a dependency change' },
      SpecFile: { type: 'artifact', description: 'the spec.md file on disk containing the system specification' },
      ConvergenceState: { type: 'artifact', description: 'persistent JSON file tracking which pipeline steps have completed and their results' },
    },
  });

  modules.set('audit', {
    nodes: {
      DetectSpecChangeToAuditSections: { type: 'process', description: 'detects when spec sections referenced by audit.yaml have changed, triggering re-evaluation of audit coverage requirements' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
      PrioritizeGaps: { type: 'process', description: 'ranks the collected gaps by severity' },
      DetectSelfAuditTarget: { type: 'process', description: 'detects when a coverage gap targets audit.yaml itself' },
    },
    journeys: {
      DetectSpecChangeToAuditDomain: {
        steps: [
          { node: 'convergence/TargetedReconvergence', action: 'signals that the spec has changed and modules may need updating' },
          { node: 'convergence/SpecFile', action: 'provides the changed spec content' },
          { node: 'DetectSpecChangeToAuditSections', action: 'reads the updated spec sections 3 and 5 that audit.yaml references' },
          { node: 'DetectSpecChangeToAuditSections', action: 'compares the updated spec sections against audit.yaml current node and journey coverage' },
          { node: 'DetectSpecChangeToAuditSections', action: 'identifies new audit requirements in the spec that have no corresponding nodes or journeys' },
          { node: 'AuditFindingsList', action: 'adds the spec-change-induced gaps to the findings list as new coverage requirements' },
          { node: 'PrioritizeGaps', action: 'ranks the new spec-driven gaps alongside any existing gaps' },
          { node: 'DetectSelfAuditTarget', action: 'flags all new gaps as self-referential since they target audit.yaml' },
          { node: 'convergence/ConvergenceState', action: 'records that audit.yaml needs updating due to spec changes in its own domain' },
        ],
      },
    },
  });

  return modules;
}

describe("DetectSpecChangeToAuditDomain", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['DetectSpecChangeToAuditDomain'];

  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and modules may need updating", () => {
    const node = result.index.nodes['convergence/TargetedReconvergence'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('DetectSpecChangeToAuditDomain'))).toBe(true);
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    const node = result.index.nodes['convergence/SpecFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('convergence/TargetedReconvergence');
  });

  it("connection: convergence/TargetedReconvergence → convergence/SpecFile", () => {
    const src = result.index.nodes['convergence/TargetedReconvergence'];
    expect(src.followed_by).toContain('convergence/SpecFile');
  });

  it("step 3: audit/DetectSpecChangeToAuditSections reads the updated spec sections 3 and 5 that audit.yaml references", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/SpecFile');
  });

  it("connection: convergence/SpecFile → audit/DetectSpecChangeToAuditSections", () => {
    const src = result.index.nodes['convergence/SpecFile'];
    expect(src.followed_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 4: audit/DetectSpecChangeToAuditSections compares the updated spec sections against audit.yaml's current node and journey coverage", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("connection: audit/DetectSpecChangeToAuditSections → audit/DetectSpecChangeToAuditSections", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
    expect(node.followed_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 5: audit/DetectSpecChangeToAuditSections identifies new audit requirements in the spec that have no corresponding nodes or journeys", () => {
    const node = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("step 6: audit/AuditFindingsList adds the spec-change-induced gaps to the findings list as new coverage requirements", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DetectSpecChangeToAuditSections');
  });

  it("connection: audit/DetectSpecChangeToAuditSections → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/DetectSpecChangeToAuditSections'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("step 7: audit/PrioritizeGaps ranks the new spec-driven gaps alongside any existing gaps", () => {
    const node = result.index.nodes['audit/PrioritizeGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/PrioritizeGaps", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/PrioritizeGaps');
  });

  it("step 8: audit/DetectSelfAuditTarget flags all new gaps as self-referential since they target audit.yaml", () => {
    const node = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/PrioritizeGaps');
  });

  it("connection: audit/PrioritizeGaps → audit/DetectSelfAuditTarget", () => {
    const src = result.index.nodes['audit/PrioritizeGaps'];
    expect(src.followed_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("step 9: convergence/ConvergenceState records that audit.yaml needs updating due to spec changes in its own domain", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DetectSelfAuditTarget');
  });

  it("connection: audit/DetectSelfAuditTarget → convergence/ConvergenceState", () => {
    const src = result.index.nodes['audit/DetectSelfAuditTarget'];
    expect(src.followed_by).toContain('convergence/ConvergenceState');
  });

  it("journey has 9 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(9);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
