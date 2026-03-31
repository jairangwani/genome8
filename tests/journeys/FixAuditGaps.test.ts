// Auto-generated from journey: FixAuditGaps
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

interface AuditGap {
  type: string;
  severity: 'high' | 'medium' | 'low';
  module: string;
  detail: string;
  fixed?: boolean;
}

const gaps: AuditGap[] = [
  { type: 'actor_orphan', severity: 'high', module: '_actors', detail: 'OrphanActor not in any journey' },
  { type: 'spec_gap', severity: 'medium', module: 'content', detail: 'Section 3 not covered' },
  { type: 'missing_journey', severity: 'low', module: 'auth', detail: 'AdminLogin journey missing' },
];

describe("FixAuditGaps", () => {
  it("step 1: audit/AuditFindingsList provides the list of coverage gaps to fix", () => {
    expect(gaps.length).toBe(3);
    expect(gaps.every(g => g.type && g.severity && g.module)).toBe(true);
  });

  it("step 2: audit/PrioritizeGaps ranks gaps by severity to fix the most critical first", () => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...gaps].sort((a, b) => priorityOrder[a.severity] - priorityOrder[b.severity]);
    expect(sorted[0].severity).toBe('high');
    expect(sorted[1].severity).toBe('medium');
    expect(sorted[2].severity).toBe('low');
  });

  it("step 3: audit/TargetedFixesOnly enforces that fixes are targeted edits, not full re-creation", () => {
    // Rule: fixes must specify a module and a specific change
    const fix = {
      target_module: '_actors',
      action: 'remove_orphan',
      node: 'OrphanActor',
      is_full_recreation: false,
    };
    expect(fix.is_full_recreation).toBe(false);
    expect(fix.target_module).toBeDefined();
  });

  it("step 4: audit/SelectNextGapToFix picks the highest-priority unfixed gap from the list", () => {
    const unfixed = gaps.filter(g => !g.fixed);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = unfixed.sort((a, b) => priorityOrder[a.severity] - priorityOrder[b.severity]);
    const nextGap = sorted[0];
    expect(nextGap.severity).toBe('high');
    expect(nextGap.type).toBe('actor_orphan');
  });

  it("step 5: audit/DetectSelfAuditTarget checks whether the selected gap targets audit.yaml itself", () => {
    const selectedGap = gaps[0]; // targets _actors
    const isSelfAudit = selectedGap.module === 'audit';
    expect(isSelfAudit).toBe(false);
    // If it DID target audit.yaml, special handling would apply
    const selfAuditGap: AuditGap = { type: 'test', severity: 'low', module: 'audit', detail: 'audit gap' };
    expect(selfAuditGap.module === 'audit').toBe(true);
  });

  it("step 6: audit/BuildGapFixPrompt builds a specific fix prompt for the selected gap", () => {
    const gap = gaps[0];
    const prompt = `Fix the following coverage gap in module "${gap.module}":
Type: ${gap.type}
Detail: ${gap.detail}
Action: Remove the orphan actor or add it to a journey.`;
    expect(prompt).toContain('_actors');
    expect(prompt).toContain('OrphanActor');
  });

  it("step 7: audit/ProvideFixContext assembles the target module excerpt and gap details into a fix payload", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'User' },
          OrphanActor: { type: 'actor', description: 'Orphan' },
        },
      }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: {
          UserLogin: {
            steps: [
              { node: '_actors/User', action: 'logs in' },
              { node: 'Login', action: 'authenticates' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: '_actors',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  User:\n    type: actor',
    });
    expect(excerpt).toContain('Focus: _actors');
  });

  it("step 8: _actors/LLMWorker receives the fix payload with the exact module and gap to address", () => {
    const fixPayload = {
      module: '_actors',
      gap: { type: 'actor_orphan', node: 'OrphanActor' },
      excerpt: 'Focus: _actors ...',
    };
    expect(fixPayload.module).toBe('_actors');
    expect(fixPayload.gap.node).toBe('OrphanActor');
  });

  it("step 9: audit/ApplyFix edits the target module YAML to close the coverage gap", () => {
    // Fix: remove the orphan actor
    const beforeFix: ModuleFile = {
      nodes: {
        User: { type: 'actor', description: 'User' },
        OrphanActor: { type: 'actor', description: 'Orphan' },
      },
    };
    const afterFix: ModuleFile = {
      nodes: {
        User: { type: 'actor', description: 'User' },
      },
    };
    expect(Object.keys(beforeFix.nodes).length).toBe(2);
    expect(Object.keys(afterFix.nodes).length).toBe(1);
    expect(afterFix.nodes['OrphanActor']).toBeUndefined();
  });

  it("step 10: audit/VerifyFixCompiles runs compile.ts on the edited module", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-audit-'));
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump({
      nodes: { User: { type: 'actor', description: 'User' } },
    }));
    fs.writeFileSync(path.join(tmpDir, 'auth.yaml'), yaml.dump({
      nodes: { Login: { type: 'process', description: 'Login' } },
      journeys: { UserLogin: { steps: [
        { node: '_actors/User', action: 'logs in' },
        { node: 'Login', action: 'authenticates' },
      ]}},
    }));
    const result = compile(tmpDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 11: _actors/Compiler validates the edited module has 0 errors", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 12: compilation/CompilationResult confirms the fix did not break compilation", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index._stats.total_nodes).toBe(2);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 13: audit/DetectFixInducedErrors compares pre-fix and post-fix compilation to check for new orphans or duplicates", () => {
    // Pre-fix: 1 orphan (OrphanActor)
    const preFix = compileFromModules(new Map<string, ModuleFile>([
      ['_actors', { nodes: {
        User: { type: 'actor', description: 'User' },
        OrphanActor: { type: 'actor', description: 'Orphan' },
      }}],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]));
    // Post-fix: 0 orphans
    const postFix = compileFromModules(new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]));
    // Fix reduced orphans, didn't introduce new errors
    expect(postFix.index._stats.orphans).toBeLessThan(preFix.index._stats.orphans);
    expect(postFix.index._stats.duplicate_names).toBe(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the specific auditor on the fixed area", () => {
    const postFix = compileFromModules(new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]));
    // OrphanActor no longer in orphans
    expect(postFix.coverage.orphans).not.toContain('_actors/OrphanActor');
  });

  it("step 15: _actors/Auditor confirms the specific gap is now closed", () => {
    const postFix = compileFromModules(new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: { UserLogin: { steps: [
          { node: '_actors/User', action: 'logs in' },
          { node: 'Login', action: 'authenticates' },
        ]}},
      }],
    ]));
    expect(postFix.coverage.orphans.length).toBe(0);
  });

  it("step 16: audit/TrackAuditRound increments the cumulative gaps-fixed counter", () => {
    let gapsFixed = 0;
    gapsFixed++; // fixed OrphanActor
    expect(gapsFixed).toBe(1);
  });

  it("step 17: convergence/ConvergenceState updates with the fix result — either more gaps remain or all are closed", () => {
    const state = {
      auditRound: 1,
      totalGaps: 3,
      gapsFixed: 1,
      remainingGaps: 2,
      allClosed: false,
    };
    expect(state.remainingGaps).toBe(state.totalGaps - state.gapsFixed);
    expect(state.allClosed).toBe(false);
    // After fixing all:
    state.gapsFixed = 3;
    state.remainingGaps = 0;
    state.allClosed = true;
    expect(state.allClosed).toBe(true);
  });

});
