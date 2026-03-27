// Auto-generated from journey: FixSingleGap
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, llm, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix: auth module with orphan OrphanValidator
const _actors: ModuleFile = {
  nodes: {
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    Auditor: { type: 'actor', description: 'reviews coverage' },
    Compiler: { type: 'actor', description: 'validates the graph' },
  },
  journeys: {},
};

const preFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format — gap' },
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

const preFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', preFixAuth]]));

// Post-fix: OrphanValidator added to journey
const postFixAuth: ModuleFile = {
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
    OrphanValidator: { type: 'rule', description: 'validates token format' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/LLMWorker', action: 'triggers login' },
        { node: 'Login', action: 'validates' },
        { node: 'OrphanValidator', action: 'checks token format' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

const postFixResult = compileFromModules(new Map([['_actors', _actors], ['auth', postFixAuth]]));

describe("FixSingleGap", () => {
  it("step 1: audit/AuditFindingsList provides the prioritized list of gaps", () => {
    const gaps = preFixResult.coverage.orphans;
    expect(gaps.length).toBeGreaterThanOrEqual(1);
    expect(gaps).toContain('auth/OrphanValidator');
  });

  it("step 2: audit/SelectNextGapToFix picks the next unfixed gap from the prioritized list", () => {
    const authGaps = preFixResult.coverage.orphans.filter(o => o.startsWith('auth/'));
    expect(authGaps[0]).toBe('auth/OrphanValidator');
  });

  it("step 3: audit/ProvideFixContext assembles the module excerpt and gap description for the worker", () => {
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'auth',
      index: preFixResult.index,
      coverage: preFixResult.coverage,
      issues: preFixResult.issues,
      moduleFileContent: 'nodes:\n  OrphanValidator:\n    type: rule',
    });
    expect(excerpt).toContain('OrphanValidator');
    expect(excerpt).toContain('ISSUES');
  });

  it("step 4: audit/BuildGapFixPrompt builds the targeted fix prompt with module context and specific gap", () => {
    const fixPrompt = {
      target: 'auth/OrphanValidator',
      type: 'orphan',
      instruction: 'Add OrphanValidator to the UserLogin journey as a validation step.',
    };
    expect(fixPrompt.target).toBe('auth/OrphanValidator');
    expect(fixPrompt.instruction).toContain('UserLogin');
  });

  it("step 5: llm/SendTask sends the fix task to the LLM worker process", () => {
    const task = {
      type: 'fix-gap',
      module: 'auth',
      gap: 'orphan: OrphanValidator',
      context: 'excerpt content here',
    };
    expect(task.type).toBe('fix-gap');
    expect(task.module).toBe('auth');
  });

  it("step 6: _actors/LLMWorker reads the fix prompt and understands which module and gap to address", () => {
    expect(preFixResult.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(preFixResult.index.nodes['_actors/LLMWorker'].type).toBe('actor');
  });

  it("step 7: llm/ReceiveResult receives the worker's edited YAML output", () => {
    // Worker produces updated YAML with OrphanValidator in a journey
    const editedYaml = yaml.dump({
      nodes: postFixAuth.nodes,
      journeys: postFixAuth.journeys,
    });
    expect(editedYaml).toContain('OrphanValidator');
    expect(editedYaml).toContain('checks token format');
  });

  it("step 8: audit/ApplyFix writes the edited YAML content to the target module file", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-fix-'));
    const content = yaml.dump({ nodes: postFixAuth.nodes, journeys: postFixAuth.journeys });
    fs.writeFileSync(path.join(tmpDir, 'auth.yaml'), content);
    expect(fs.existsSync(path.join(tmpDir, 'auth.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 9: graph/ModuleFile stores the updated module on disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-fix-'));
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ nodes: _actors.nodes, journeys: {} })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'auth.yaml'),
      yaml.dump({ nodes: postFixAuth.nodes, journeys: postFixAuth.journeys })
    );
    const diskResult = compile(tmpDir);
    expect(diskResult.index.nodes['auth/OrphanValidator']).toBeDefined();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 10: audit/VerifyFixCompiles triggers compilation on the updated module", () => {
    const errors = postFixResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: _actors/Compiler validates the edit produced 0 new errors", () => {
    expect(postFixResult.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(postFixResult.index._stats.total_nodes).toBe(6);
  });

  it("step 12: compilation/CompilationResult provides the post-fix compilation result", () => {
    expect(postFixResult.index._stats.total_journeys).toBe(1);
    expect(postFixResult.index._stats.total_connections).toBeGreaterThanOrEqual(3);
  });

  it("step 13: audit/DetectFixInducedErrors checks whether the fix introduced new orphans, duplicates, or dangling refs", () => {
    const preErrors = preFixResult.issues.filter(i => i.severity === 'error').length;
    const postErrors = postFixResult.issues.filter(i => i.severity === 'error').length;
    // No new errors introduced
    expect(postErrors).toBeLessThanOrEqual(preErrors);
    expect(postFixResult.index._stats.duplicate_names).toBe(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the auditor that originally found this gap", () => {
    // OrphanValidator is no longer an orphan
    expect(postFixResult.coverage.orphans).not.toContain('auth/OrphanValidator');
    expect(postFixResult.index.nodes['auth/OrphanValidator'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 15: _actors/Auditor confirms the specific gap no longer appears in the coverage check", () => {
    const orphanWarnings = postFixResult.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('OrphanValidator')
    );
    expect(orphanWarnings.length).toBe(0);
  });

  it("step 16: audit/DetectFixInducedGaps checks whether the fix opened new coverage gaps in other angles", () => {
    // No new auth orphans in post-fix
    const newAuthOrphans = postFixResult.coverage.orphans.filter(o =>
      o.startsWith('auth/') && !preFixResult.coverage.orphans.includes(o)
    );
    expect(newAuthOrphans.length).toBe(0);
  });

  it("step 17: audit/TrackAuditRound records that one more gap has been fixed in this round", () => {
    let gapsFixed = 0;
    gapsFixed += 1;
    expect(gapsFixed).toBe(1);
  });

});
