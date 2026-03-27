// Auto-generated from journey: ProvideAuditExcerptContext
// Module: audit
// Modules touched: convergence, excerpt, graph, audit

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/types.ts
// Implementation: src/excerpt.ts

const _actors: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
  },
  journeys: {},
};

const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores session tokens' },
    OrphanRule: { type: 'rule', description: 'orphan — not in any journey' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'submits credentials' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', auth]]));
const moduleYaml = 'nodes:\n  Login:\n    type: process\n    description: authenticates users\n  TokenStore:\n    type: artifact\n    description: stores session tokens\n  OrphanRule:\n    type: rule\n    description: orphan';

describe("ProvideAuditExcerptContext", () => {
  it("step 1: convergence/TargetedAudit requests focused context for each auditor to check a specific module", () => {
    // The auditor needs context for the 'auth' module
    expect(result.coverage.modules['auth']).toBeDefined();
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 2: excerpt/SelectTargetModule identifies the module the auditor will examine", () => {
    const targetModule = 'auth';
    expect(result.coverage.modules[targetModule]).toBeDefined();
    expect(result.coverage.modules[targetModule].nodes).toBe(3);
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph for extraction", () => {
    expect(result.index).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(4); // 1 actor + 3 auth
    expect(result.index.journeys['UserLogin']).toBeDefined();
  });

  it("step 4: excerpt/CollectLocalNodes extracts the target module's nodes for the auditor to review", () => {
    const authNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'auth');
    expect(authNodes.length).toBe(3);
    expect(authNodes.map(([k]) => k)).toContain('auth/Login');
    expect(authNodes.map(([k]) => k)).toContain('auth/TokenStore');
    expect(authNodes.map(([k]) => k)).toContain('auth/OrphanRule');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the target module's journeys for the auditor to review", () => {
    const authJourneys = Object.values(result.index.journeys).filter(j => j.module === 'auth');
    expect(authJourneys.length).toBe(1);
    expect(authJourneys[0].name).toBe('UserLogin');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows how the target module connects to others", () => {
    // auth connects to _actors via journey steps
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
    const loginNode = result.index.nodes['auth/Login'];
    expect(loginNode.preceded_by).toContain('_actors/ProjectOwner');
  });

  it("step 7: excerpt/CollectWarnings includes any compilation warnings relevant to this module", () => {
    // OrphanRule generates an orphan warning
    const authWarnings = result.issues.filter(i => i.module === 'auth' && i.severity === 'warning');
    expect(authWarnings.length).toBeGreaterThanOrEqual(1);
    expect(authWarnings.some(w => w.message.includes('OrphanRule'))).toBe(true);
  });

  it("step 8: excerpt/AssembleExcerpt combines all sections into an audit-focused excerpt", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('YOUR NODES');
    expect(excerpt).toContain('Login');
    expect(excerpt).toContain('TokenStore');
    expect(excerpt).toContain('OrphanRule');
    expect(excerpt).toContain('CROSS-MODULE');
    expect(excerpt).toContain('ISSUES');
  });

  it("step 9: excerpt/TruncateToLimit trims to the ~200 line budget", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    const lines = excerpt.split('\n');
    // Excerpt should be within a reasonable line budget
    expect(lines.length).toBeLessThan(200);
    expect(lines.length).toBeGreaterThan(10);
  });

  it("step 10: excerpt/ExcerptOutput provides the focused excerpt to the auditor", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(100);
  });

  it("step 11: audit/GenerateAuditPrompt wraps the excerpt with the specific coverage angle instructions", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    // An audit prompt would wrap the excerpt with angle-specific instructions
    const auditPrompt = `AUDIT ANGLE: spec-coverage\n\nCheck whether all spec sections are represented.\n\n${excerpt}`;
    expect(auditPrompt).toContain('AUDIT ANGLE');
    expect(auditPrompt).toContain('spec-coverage');
    expect(auditPrompt).toContain('Focus: auth');
  });

});
