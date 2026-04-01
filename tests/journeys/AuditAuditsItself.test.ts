// Auto-generated from journey: AuditAuditsItself
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
    },
  });

  modules.set('convergence', {
    nodes: {
      TargetedAudit: { type: 'process', description: 'dispatches auditors to check coverage from all angles' },
    },
  });

  modules.set('excerpt', {
    nodes: {
      SelectTargetModule: { type: 'process', description: 'identifies the module the auditor will examine' },
      CollectLocalNodes: { type: 'process', description: 'extracts the target module nodes for the auditor to review' },
      CollectLocalJourneys: { type: 'process', description: 'extracts the target module journeys for the auditor to review' },
      AssembleExcerpt: { type: 'process', description: 'assembles the final excerpt including all context sections for the worker' },
      ExcerptOutput: { type: 'artifact', description: 'the assembled excerpt text ready to be sent to the worker as context' },
    },
  });

  modules.set('audit', {
    nodes: {
      GenerateAuditPrompt: { type: 'process', description: 'builds a focused prompt for each auditor' },
      CheckSpecCoverage: { type: 'process', description: 'auditor 1 compares spec sections against the graph' },
      SpecCoverageReport: { type: 'artifact', description: 'auditor 1 report listing which spec sections are covered and which have no representation' },
      CollectAuditFindings: { type: 'process', description: 'gathers findings from all 4 auditors into a single list' },
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps' },
    },
    journeys: {
      AuditAuditsItself: {
        steps: [
          { node: 'convergence/TargetedAudit', action: 'dispatches auditors to check all modules including audit.yaml' },
          { node: 'GenerateAuditPrompt', action: 'builds the spec coverage prompt targeting audit.yaml own spec sections 3 and 5' },
          { node: 'excerpt/SelectTargetModule', action: 'selects audit as the target module for excerpt generation' },
          { node: 'excerpt/CollectLocalNodes', action: 'extracts audit.yaml own nodes for the auditor to review' },
          { node: 'excerpt/CollectLocalJourneys', action: 'extracts audit.yaml own journeys for the auditor to review' },
          { node: 'excerpt/AssembleExcerpt', action: 'assembles the self-referential excerpt showing the audit module to the auditor' },
          { node: 'excerpt/ExcerptOutput', action: 'provides the audit module excerpt to the auditor' },
          { node: '_actors/Auditor', action: 'checks whether audit.yaml covers the audit concepts described in spec sections 3 and 5' },
          { node: 'CheckSpecCoverage', action: 'compares the spec audit requirements against audit.yaml own nodes and journeys' },
          { node: 'SpecCoverageReport', action: 'records any gaps where audit concepts in the spec are not represented in audit.yaml' },
          { node: 'CollectAuditFindings', action: 'adds any self-audit gaps to the findings list' },
          { node: 'AuditFindingsList', action: 'stores the self-referential gaps alongside gaps from other modules' },
        ],
      },
    },
  });

  return modules;
}

describe("AuditAuditsItself", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['AuditAuditsItself'];

  it("step 1: convergence/TargetedAudit dispatches auditors to check all modules including audit.yaml", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.in_journeys.some(j => j.startsWith('AuditAuditsItself'))).toBe(true);
  });

  it("step 2: audit/GenerateAuditPrompt builds the spec coverage prompt targeting audit.yaml's own spec sections 3 and 5", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit → audit/GenerateAuditPrompt", () => {
    const src = result.index.nodes['convergence/TargetedAudit'];
    expect(src.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 3: excerpt/SelectTargetModule selects audit as the target module for excerpt generation", () => {
    const node = result.index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → excerpt/SelectTargetModule", () => {
    const src = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(src.followed_by).toContain('excerpt/SelectTargetModule');
  });

  it("step 4: excerpt/CollectLocalNodes extracts audit.yaml's own nodes for the auditor to review", () => {
    const node = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/SelectTargetModule');
  });

  it("connection: excerpt/SelectTargetModule → excerpt/CollectLocalNodes", () => {
    const src = result.index.nodes['excerpt/SelectTargetModule'];
    expect(src.followed_by).toContain('excerpt/CollectLocalNodes');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts audit.yaml's own journeys for the auditor to review", () => {
    const node = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalNodes');
  });

  it("connection: excerpt/CollectLocalNodes → excerpt/CollectLocalJourneys", () => {
    const src = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(src.followed_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("step 6: excerpt/AssembleExcerpt assembles the self-referential excerpt showing the audit module to the auditor", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("connection: excerpt/CollectLocalJourneys → excerpt/AssembleExcerpt", () => {
    const src = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(src.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 7: excerpt/ExcerptOutput provides the audit module's excerpt to the auditor", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/ExcerptOutput", () => {
    const src = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(src.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 8: _actors/Auditor checks whether audit.yaml covers the audit concepts described in spec sections 3 and 5", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → _actors/Auditor", () => {
    const src = result.index.nodes['excerpt/ExcerptOutput'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 9: audit/CheckSpecCoverage compares the spec's audit requirements against audit.yaml's own nodes and journeys", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 10: audit/SpecCoverageReport records any gaps where audit concepts in the spec are not represented in audit.yaml", () => {
    const node = result.index.nodes['audit/SpecCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/SpecCoverageReport", () => {
    const src = result.index.nodes['audit/CheckSpecCoverage'];
    expect(src.followed_by).toContain('audit/SpecCoverageReport');
  });

  it("step 11: audit/CollectAuditFindings adds any self-audit gaps to the findings list", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SpecCoverageReport');
  });

  it("connection: audit/SpecCoverageReport → audit/CollectAuditFindings", () => {
    const src = result.index.nodes['audit/SpecCoverageReport'];
    expect(src.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 12: audit/AuditFindingsList stores the self-referential gaps alongside gaps from other modules", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const src = result.index.nodes['audit/CollectAuditFindings'];
    expect(src.followed_by).toContain('audit/AuditFindingsList');
  });

  it("journey has 12 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(12);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
