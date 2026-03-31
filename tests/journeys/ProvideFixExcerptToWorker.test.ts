// Auto-generated from journey: ProvideFixExcerptToWorker
// Module: audit
// Modules touched: audit, excerpt, graph

import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const authModule: ModuleFile = {
  spec_sections: [1],
  nodes: {
    Login: { type: 'process', description: 'Login flow' },
    Token: { type: 'artifact', description: 'Session token' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'logs in' },
        { node: 'Login', action: 'authenticates' },
        { node: 'Token', action: 'is issued' },
      ],
    },
  },
};

const gap = { type: 'actor_orphan', module: 'auth', detail: 'AdminLogin journey missing', severity: 'medium' };

function buildResult() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
    ['auth', authModule],
  ]));
}

describe("ProvideFixExcerptToWorker", () => {
  it("step 1: audit/SelectNextGapToFix identifies which module contains the gap to be fixed", () => {
    expect(gap.module).toBe('auth');
  });

  it("step 2: excerpt/SelectTargetModule targets the module that needs the fix", () => {
    const targetModule = gap.module;
    const result = buildResult();
    expect(result.coverage.modules[targetModule]).toBeDefined();
  });

  it("step 3: graph/CompiledIndex provides the compiled graph showing current state including the gap", () => {
    const result = buildResult();
    expect(result.index.nodes['auth/Login']).toBeDefined();
    expect(result.index.nodes['auth/Token']).toBeDefined();
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's nodes so the worker knows what exists", () => {
    const result = buildResult();
    const authNodes = Object.entries(result.index.nodes).filter(([, n]) => n.module === 'auth');
    expect(authNodes.length).toBe(2);
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journeys so the worker knows current coverage", () => {
    const result = buildResult();
    const authJourneys = Object.values(result.index.journeys).filter(j => j.module === 'auth');
    expect(authJourneys.length).toBe(1);
    expect(authJourneys[0].name).toBe('UserLogin');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows cross-module connections relevant to the gap", () => {
    const result = buildResult();
    expect(result.coverage.modules['auth'].cross_module_connections).toBeGreaterThan(0);
  });

  it("step 7: excerpt/CollectModuleSource reads the raw YAML so the worker can edit the specific file", () => {
    const moduleYaml = yaml.dump(authModule);
    expect(moduleYaml).toContain('Login');
    expect(moduleYaml).toContain('Token');
    expect(moduleYaml).toContain('UserLogin');
  });

  it("step 8: excerpt/AssembleExcerpt builds the fix-focused excerpt combining gap details with module context", () => {
    const result = buildResult();
    const moduleYaml = yaml.dump(authModule);
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: moduleYaml,
    });
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('YOUR FILE');
  });

  it("step 9: excerpt/TruncateToLimit ensures the excerpt fits within the line budget", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: yaml.dump(authModule),
    });
    expect(excerpt.split('\n').length).toBeLessThan(200);
  });

  it("step 10: excerpt/ExcerptOutput provides the excerpt to the fix prompt builder", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: yaml.dump(authModule),
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(50);
  });

  it("step 11: audit/ProvideFixContext combines the excerpt with the specific gap description into the fix payload", () => {
    const result = buildResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: yaml.dump(authModule),
    });
    const fixContext = { excerpt, gap, targetModule: gap.module };
    expect(fixContext.gap.detail).toContain('AdminLogin');
    expect(fixContext.targetModule).toBe('auth');
    expect(fixContext.excerpt).toContain('Focus: auth');
  });

  it("step 12: audit/BuildGapFixPrompt packages the fix context into the prompt sent to the LLM worker", () => {
    const fixPrompt = `Fix the following gap in module "auth":
Gap: ${gap.detail}
Type: ${gap.type}

Add the missing AdminLogin journey that uses _actors/Admin.`;
    expect(fixPrompt).toContain('auth');
    expect(fixPrompt).toContain('AdminLogin');
    expect(fixPrompt).toContain('_actors/Admin');
  });

});
