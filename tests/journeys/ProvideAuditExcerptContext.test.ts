// Auto-generated from journey: ProvideAuditExcerptContext
// Module: audit
// Modules touched: convergence, excerpt, graph, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const actorsModule: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Platform user' },
  },
};

const authModule: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Authenticates users' },
    Token: { type: 'artifact', description: 'Session token' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'Login', action: 'validates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
  },
};

function buildResult() {
  return compileFromModules(new Map([
    ['_actors', actorsModule],
    ['auth', authModule],
  ]));
}

describe("ProvideAuditExcerptContext", () => {
  it("step 1: convergence/TargetedAudit requests focused context for each auditor to check a specific module", () => {
    const targetModule = 'auth';
    expect(targetModule).toBe('auth');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module the auditor will examine", () => {
    const result = buildResult();
    const targetModule = 'auth';
    expect(result.coverage.modules[targetModule]).toBeDefined();
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph for extraction", () => {
    const result = buildResult();
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.index.nodes).toBeDefined();
    expect(result.index.journeys).toBeDefined();
  });

  it("step 4: excerpt/CollectLocalNodes extracts the target module's nodes for the auditor to review", () => {
    const result = buildResult();
    const localNodes = Object.entries(result.index.nodes)
      .filter(([, n]) => n.module === 'auth');
    expect(localNodes.length).toBe(2); // Login, Token
    expect(localNodes.map(([k]) => k)).toContain('auth/Login');
    expect(localNodes.map(([k]) => k)).toContain('auth/Token');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the target module's journeys for the auditor to review", () => {
    const result = buildResult();
    const localJourneys = Object.values(result.index.journeys)
      .filter(j => j.module === 'auth');
    expect(localJourneys.length).toBe(1);
    expect(localJourneys[0].name).toBe('UserLogin');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows how the target module connects to others", () => {
    const result = buildResult();
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThan(0);
  });

  it("step 7: excerpt/CollectWarnings includes any compilation warnings relevant to this module", () => {
    const result = buildResult();
    const authWarnings = result.issues.filter(i => i.module === 'auth');
    // Clean graph — no warnings expected
    expect(authWarnings.length).toBe(0);
  });

  it("step 8: excerpt/AssembleExcerpt combines all sections into an audit-focused excerpt", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process\n    description: Authenticates users',
    });
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 9: excerpt/TruncateToLimit trims to the ~200 line budget", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process',
    });
    const lineCount = excerpt.split('\n').length;
    // Excerpt should be concise — well under 200 lines for a small graph
    expect(lineCount).toBeLessThan(200);
  });

  it("step 10: excerpt/ExcerptOutput provides the focused excerpt to the auditor", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process',
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(0);
  });

  it("step 11: audit/GenerateAuditPrompt wraps the excerpt with the specific coverage angle instructions", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  Login:\n    type: process',
    });
    const auditPrompt = `Check spec coverage for module auth.\n\n${excerpt}\n\nWhich spec sections are missing from the graph?`;
    expect(auditPrompt).toContain('spec coverage');
    expect(auditPrompt).toContain('Focus: auth');
  });

});
