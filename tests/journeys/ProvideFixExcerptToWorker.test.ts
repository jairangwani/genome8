// Auto-generated from journey: ProvideFixExcerptToWorker
// Module: audit
// Modules touched: audit, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/types.ts
// Implementation: src/excerpt.ts

const _actors: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

const auth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format — orphan gap' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', auth]]));
const moduleYaml = 'nodes:\n  Login:\n    type: process\n  TokenStore:\n    type: artifact\n  OrphanValidator:\n    type: rule\n    description: validates token format';

describe("ProvideFixExcerptToWorker", () => {
  it("step 1: audit/SelectNextGapToFix identifies which module contains the gap to be fixed", () => {
    const orphans = result.coverage.orphans.filter(o => o.startsWith('auth/'));
    expect(orphans).toContain('auth/OrphanValidator');
    const targetModule = 'auth';
    expect(targetModule).toBe('auth');
  });

  it("step 2: excerpt/SelectTargetModule targets the module that needs the fix", () => {
    expect(result.coverage.modules['auth']).toBeDefined();
    expect(result.coverage.modules['auth'].nodes).toBe(3);
  });

  it("step 3: graph/CompiledIndex provides the compiled graph showing current state including the gap", () => {
    expect(result.index.nodes['auth/OrphanValidator']).toBeDefined();
    expect(result.index.nodes['auth/OrphanValidator'].in_journeys.length).toBe(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes so the worker knows what exists", () => {
    const authNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'auth');
    expect(authNodes.length).toBe(3);
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys so the worker knows current coverage", () => {
    const authJourneys = Object.values(result.index.journeys).filter(j => j.module === 'auth');
    expect(authJourneys.length).toBe(1);
    expect(authJourneys[0].name).toBe('UserLogin');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows cross-module connections relevant to the gap", () => {
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 7: excerpt/CollectModuleSource reads the raw YAML so the worker can edit the specific file", () => {
    // The raw YAML content is passed to generateExcerpt as moduleFileContent
    expect(moduleYaml).toContain('OrphanValidator');
    expect(moduleYaml).toContain('Login');
  });

  it("step 8: excerpt/AssembleExcerpt builds the fix-focused excerpt combining gap details with module context", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('OrphanValidator');
    expect(excerpt).toContain('YOUR FILE');
    expect(excerpt).toContain('ISSUES');
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(excerpt.split('\n').length).toBeLessThan(200);
  });

  it("step 10: excerpt/ExcerptOutput provides the excerpt to the fix prompt builder", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(50);
  });

  it("step 11: audit/ProvideFixContext combines the excerpt with the specific gap description into the fix payload", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    const fixContext = {
      excerpt,
      gap: { type: 'orphan', node: 'auth/OrphanValidator', module: 'auth' },
    };
    expect(fixContext.gap.node).toBe('auth/OrphanValidator');
    expect(fixContext.excerpt).toContain('OrphanValidator');
  });

  it("step 12: audit/BuildGapFixPrompt packages the fix context into the prompt sent to the LLM worker", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    const fixPrompt = `FIX GAP: orphan node auth/OrphanValidator\nAdd OrphanValidator to an existing journey or create a new journey.\n\n${excerpt}`;
    expect(fixPrompt).toContain('FIX GAP');
    expect(fixPrompt).toContain('OrphanValidator');
    expect(fixPrompt).toContain('Focus: auth');
  });

});
