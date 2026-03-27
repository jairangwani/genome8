// Auto-generated from journey: ProvideExcerptForAudit
// Module: excerpt
// Triggered by: _actors/Auditor
// Modules touched: convergence, excerpt, graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile, ValidationIssue } from '../../src/types.js';

describe("ProvideExcerptForAudit", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Auditor: { type: 'actor', description: 'Audits modules for coverage and quality' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['payments', {
      nodes: {
        ChargeCard: { type: 'process', description: 'Charges a credit card' },
        Receipt: { type: 'artifact', description: 'Payment receipt' },
        RefundPolicy: { type: 'rule', description: 'Defines refund eligibility rules' },
      },
      journeys: {
        ProcessPayment: {
          steps: [
            { node: '_actors/Auditor', action: 'reviews the payment module' },
            { node: 'ChargeCard', action: 'charges the card' },
            { node: 'Receipt', action: 'generates a receipt' },
            { node: 'graph/CompiledIndex', action: 'records in the index' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const warningIssues: ValidationIssue[] = [
    ...result.issues,
    { severity: 'warning', module: 'payments', message: 'Missing error handling journey for failed charges' },
  ];
  const moduleYaml = 'nodes:\n  ChargeCard:\n    type: process\n    description: Charges a credit card\n  Receipt:\n    type: artifact\n    description: Payment receipt';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule: 'payments',
    index: result.index,
    coverage: result.coverage,
    issues: warningIssues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: convergence/TargetedAudit requests focused context for an auditor to check a specific module", () => {
    expect(excerpt).toContain('Focus: payments');
    expect(excerpt).toContain('ROUND 1');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module being audited", () => {
    expect(excerpt).toContain('Focus: payments');
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph for extraction", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes for the auditor to review", () => {
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('ChargeCard (process)');
    expect(excerpt).toContain('Receipt (artifact)');
    expect(excerpt).toContain('RefundPolicy (rule)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys for the auditor to review", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('ProcessPayment:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows the auditor how this module connects to others", () => {
    expect(excerpt).toContain('CROSS-MODULE:');
    // The journey references _actors/Auditor and graph/CompiledIndex
    expect(excerpt).toContain('_actors/Auditor');
  });

  it("step 7: excerpt/CollectWarnings includes any existing warnings the auditor should consider", () => {
    expect(excerpt).toContain('ISSUES:');
    expect(excerpt).toContain('Missing error handling journey for failed charges');
  });

  it("step 8: excerpt/AssembleExcerpt builds the audit-focused excerpt", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 9: excerpt/ExcerptOutput provides the excerpt to the auditor", () => {
    expect(excerpt).toContain('YOUR FILE (payments.yaml):');
    expect(excerpt).toBeTruthy();
  });

  it("step 10: _actors/Auditor receives the focused context and begins coverage checking", () => {
    // The auditor actor exists and is referenced via TRIGGERED BY
    const auditor = result.index.nodes['_actors/Auditor'];
    expect(auditor).toBeDefined();
    expect(auditor.type).toBe('actor');
    expect(excerpt).toContain('TRIGGERED BY:');
    expect(excerpt).toContain('Auditor');
  });
});
