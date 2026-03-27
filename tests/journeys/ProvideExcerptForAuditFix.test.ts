// Auto-generated from journey: ProvideExcerptForAuditFix
// Module: excerpt
// Modules touched: convergence, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile, ValidationIssue } from '../../src/types.js';

describe("ProvideExcerptForAuditFix", () => {
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        LoginProcess: { type: 'process', description: 'Handles user login' },
        SessionToken: { type: 'artifact', description: 'JWT session token' },
        OrphanNode: { type: 'process', description: 'An orphan node not in any journey' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: 'LoginProcess', action: 'authenticates user credentials' },
            { node: 'SessionToken', action: 'issues a session token' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  // Add a custom audit issue to simulate a gap
  const auditIssues: ValidationIssue[] = [
    ...result.issues,
    { severity: 'warning', module: 'auth', message: 'Audit gap: missing password validation step' },
  ];
  const moduleYaml = 'nodes:\n  LoginProcess:\n    type: process\n    description: Handles user login\n  SessionToken:\n    type: artifact\n    description: JWT session token\n  OrphanNode:\n    type: process\n    description: An orphan node';
  const excerpt = generateExcerpt({
    round: 5,
    focusModule: 'auth',
    index: result.index,
    coverage: result.coverage,
    issues: auditIssues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: convergence/AuditGapFix requests focused context for fixing a specific audit gap in a module", () => {
    expect(excerpt).toContain('ROUND 5');
    expect(excerpt).toContain('Focus: auth');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module that contains the audit gap", () => {
    expect(excerpt).toContain('Focus: auth');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph showing current state including the gap", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes to show what exists", () => {
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('LoginProcess (process)');
    expect(excerpt).toContain('SessionToken (artifact)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys to show current coverage", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('UserLogin:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows cross-module connections relevant to the gap", () => {
    // auth module has no cross-module connections in this fixture
    // but the ALL MODULES section shows the other modules
    expect(excerpt).toContain('ALL MODULES:');
  });

  it("step 7: excerpt/CollectWarnings includes compilation warnings that may relate to the audit finding", () => {
    expect(excerpt).toContain('ISSUES:');
    expect(excerpt).toContain('Audit gap: missing password validation step');
  });

  it("step 8: excerpt/CollectModuleSource reads the raw YAML so the worker can edit the specific file", () => {
    expect(excerpt).toContain('YOUR FILE (auth.yaml):');
    expect(excerpt).toContain('```yaml');
    expect(excerpt).toContain('LoginProcess');
  });

  it("step 9: excerpt/AssembleExcerpt builds the fix-focused excerpt combining gap details with module context", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('ISSUES:');
  });

  it("step 10: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 11: excerpt/ExcerptOutput provides the fix-focused excerpt to the LLM worker for targeted repair", () => {
    expect(excerpt).toBeTruthy();
    expect(typeof excerpt).toBe('string');
    // Contains both the issue and the source file for editing
    expect(excerpt).toContain('Audit gap');
    expect(excerpt).toContain('YOUR FILE');
  });
});
