// Auto-generated from journey: AuditAuditsItself
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: convergence, audit, excerpt, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildAuditAuditsItselfModules() {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      Auditor: { type: 'actor', description: 'Checks audit.yaml covers audit concepts in spec' },
    },
    journeys: {},
  });

  modules.set('convergence', {
    nodes: {
      TargetedAudit: { type: 'process', description: 'Dispatches auditors including audit.yaml' },
    },
    journeys: {},
  });

  modules.set('excerpt', {
    nodes: {
      SelectTargetModule: { type: 'process', description: 'Selects audit as target module' },
      CollectLocalNodes: { type: 'process', description: 'Extracts audit.yaml\'s own nodes' },
      CollectLocalJourneys: { type: 'process', description: 'Extracts audit.yaml\'s own journeys' },
      AssembleExcerpt: { type: 'process', description: 'Assembles self-referential excerpt' },
      ExcerptOutput: { type: 'artifact', description: 'Provides audit module\'s excerpt' },
    },
    journeys: {},
  });

  modules.set('audit', {
    nodes: {
      GenerateAuditPrompt: { type: 'process', description: 'Builds spec coverage prompt for audit.yaml\'s sections 3 and 5' },
      CheckSpecCoverage: { type: 'process', description: 'Compares spec\'s audit requirements against audit.yaml' },
      SpecCoverageReport: { type: 'artifact', description: 'Records gaps' },
      CollectAuditFindings: { type: 'process', description: 'Adds self-audit gaps' },
      AuditFindingsList: { type: 'artifact', description: 'Stores self-referential gaps' },
    },
    journeys: {
      AuditAuditsItself: {
        steps: [
          { node: 'convergence/TargetedAudit', action: 'dispatches auditors including audit.yaml' },
          { node: 'GenerateAuditPrompt', action: 'builds spec coverage prompt for audit.yaml\'s sections 3 and 5' },
          { node: 'excerpt/SelectTargetModule', action: 'selects audit as target module' },
          { node: 'excerpt/CollectLocalNodes', action: 'extracts audit.yaml\'s own nodes' },
          { node: 'excerpt/CollectLocalJourneys', action: 'extracts audit.yaml\'s own journeys' },
          { node: 'excerpt/AssembleExcerpt', action: 'assembles self-referential excerpt' },
          { node: 'excerpt/ExcerptOutput', action: 'provides audit module\'s excerpt' },
          { node: '_actors/Auditor', action: 'checks audit.yaml covers audit concepts in spec' },
          { node: 'CheckSpecCoverage', action: 'compares spec\'s audit requirements against audit.yaml' },
          { node: 'SpecCoverageReport', action: 'records gaps' },
          { node: 'CollectAuditFindings', action: 'adds self-audit gaps' },
          { node: 'AuditFindingsList', action: 'stores self-referential gaps' },
        ],
      },
    },
  });

  return modules;
}

describe("AuditAuditsItself", () => {
  const modules = buildAuditAuditsItselfModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['AuditAuditsItself'];

  it("step 1: convergence/TargetedAudit dispatches auditors including audit.yaml", () => {
    const node = result.index.nodes['convergence/TargetedAudit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: audit/GenerateAuditPrompt builds spec coverage prompt for audit.yaml's sections 3 and 5", () => {
    const node = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/TargetedAudit');
  });

  it("connection: convergence/TargetedAudit → audit/GenerateAuditPrompt", () => {
    const from = result.index.nodes['convergence/TargetedAudit'];
    expect(from.followed_by).toContain('audit/GenerateAuditPrompt');
  });

  it("step 3: excerpt/SelectTargetModule selects audit as target module", () => {
    const node = result.index.nodes['excerpt/SelectTargetModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/GenerateAuditPrompt');
  });

  it("connection: audit/GenerateAuditPrompt → excerpt/SelectTargetModule", () => {
    const from = result.index.nodes['audit/GenerateAuditPrompt'];
    expect(from.followed_by).toContain('excerpt/SelectTargetModule');
  });

  it("step 4: excerpt/CollectLocalNodes extracts audit.yaml's own nodes", () => {
    const node = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/SelectTargetModule');
  });

  it("connection: excerpt/SelectTargetModule → excerpt/CollectLocalNodes", () => {
    const from = result.index.nodes['excerpt/SelectTargetModule'];
    expect(from.followed_by).toContain('excerpt/CollectLocalNodes');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts audit.yaml's own journeys", () => {
    const node = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalNodes');
  });

  it("connection: excerpt/CollectLocalNodes → excerpt/CollectLocalJourneys", () => {
    const from = result.index.nodes['excerpt/CollectLocalNodes'];
    expect(from.followed_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("step 6: excerpt/AssembleExcerpt assembles self-referential excerpt", () => {
    const node = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('excerpt/CollectLocalJourneys');
  });

  it("connection: excerpt/CollectLocalJourneys → excerpt/AssembleExcerpt", () => {
    const from = result.index.nodes['excerpt/CollectLocalJourneys'];
    expect(from.followed_by).toContain('excerpt/AssembleExcerpt');
  });

  it("step 7: excerpt/ExcerptOutput provides audit module's excerpt", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('excerpt/AssembleExcerpt');
  });

  it("connection: excerpt/AssembleExcerpt → excerpt/ExcerptOutput", () => {
    const from = result.index.nodes['excerpt/AssembleExcerpt'];
    expect(from.followed_by).toContain('excerpt/ExcerptOutput');
  });

  it("step 8: _actors/Auditor checks audit.yaml covers audit concepts in spec", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('excerpt/ExcerptOutput');
  });

  it("connection: excerpt/ExcerptOutput → _actors/Auditor", () => {
    const from = result.index.nodes['excerpt/ExcerptOutput'];
    expect(from.followed_by).toContain('_actors/Auditor');
  });

  it("step 9: audit/CheckSpecCoverage compares spec's audit requirements against audit.yaml", () => {
    const node = result.index.nodes['audit/CheckSpecCoverage'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/CheckSpecCoverage", () => {
    const from = result.index.nodes['_actors/Auditor'];
    expect(from.followed_by).toContain('audit/CheckSpecCoverage');
  });

  it("step 10: audit/SpecCoverageReport records gaps", () => {
    const node = result.index.nodes['audit/SpecCoverageReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CheckSpecCoverage');
  });

  it("connection: audit/CheckSpecCoverage → audit/SpecCoverageReport", () => {
    const from = result.index.nodes['audit/CheckSpecCoverage'];
    expect(from.followed_by).toContain('audit/SpecCoverageReport');
  });

  it("step 11: audit/CollectAuditFindings adds self-audit gaps", () => {
    const node = result.index.nodes['audit/CollectAuditFindings'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SpecCoverageReport');
  });

  it("connection: audit/SpecCoverageReport → audit/CollectAuditFindings", () => {
    const from = result.index.nodes['audit/SpecCoverageReport'];
    expect(from.followed_by).toContain('audit/CollectAuditFindings');
  });

  it("step 12: audit/AuditFindingsList stores self-referential gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/CollectAuditFindings');
  });

  it("connection: audit/CollectAuditFindings → audit/AuditFindingsList", () => {
    const from = result.index.nodes['audit/CollectAuditFindings'];
    expect(from.followed_by).toContain('audit/AuditFindingsList');
  });

  it("journey covers full pipeline (12 steps)", () => {
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(12);
    expect(journey.steps[0].node).toBe('convergence/TargetedAudit');
    expect(journey.steps[11].node).toBe('audit/AuditFindingsList');
  });

  it("journey actor is Auditor (first actor in steps)", () => {
    expect(journey.actor).toBe('_actors/Auditor');
  });

  it("compiles without errors", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
