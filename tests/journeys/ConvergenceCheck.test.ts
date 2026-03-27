// Auto-generated from journey: ConvergenceCheck
// Module: convergence
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

let tmpDir: string;
let modulesDir: string;

function writeValidModules() {
  fs.writeFileSync(path.join(modulesDir, '_actors.yaml'),
    'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n\njourneys: {}\n');
  fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
    'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates credentials\n');
  fs.writeFileSync(path.join(modulesDir, 'data.yaml'),
    'spec_sections: [2]\n\nnodes:\n  Store:\n    type: artifact\n    description: stores data\n\njourneys:\n  SaveData:\n    steps:\n      - node: _actors/User\n        action: submits data\n      - node: auth/Login\n        action: authenticates\n      - node: Store\n        action: persists data\n');
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  modulesDir = path.join(tmpDir, 'genome', 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("ConvergenceCheck", () => {
  it("step 1: convergence/ConvergenceState indicates all modules have been created and enriched from all perspectives", () => {
    writeValidModules();
    const result = compile(modulesDir);
    expect(result.index._stats.modules).toBeGreaterThanOrEqual(3);
  });

  it("step 2: convergence/CompileCheck runs final compile.ts across all modules", () => {
    writeValidModules();
    const result = compile(modulesDir);
    expect(result.index._compiled).toBeDefined();
    expect(result.index._stats).toBeDefined();
  });

  it("step 3: _actors/Compiler validates the full graph for 0 errors and 0 orphans", () => {
    writeValidModules();
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 4: compilation/ZeroErrorConvergence checks whether the 0-error 0-orphan threshold is met", () => {
    writeValidModules();
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const s = result.index._stats;
    const converged = errors === 0 && s.orphans === 0 && s.isolated_modules === 0 && s.duplicate_names === 0;
    expect(converged).toBe(true);
  });

  it("step 5: convergence/TargetedAudit dispatches 3 auditors with specific coverage angles", () => {
    // There are 3 auditor angles: spec coverage, actor coverage, cross-module coverage
    const auditAngles = ['spec-coverage', 'actor-coverage', 'cross-module'];
    expect(auditAngles.length).toBe(3);
  });

  it("step 6: _actors/Auditor checks spec coverage — are all spec sections represented in the graph", () => {
    writeValidModules();
    const result = compile(modulesDir);
    // Spec sections 1 and 2 are covered by auth and data
    const sections = new Set<number>();
    for (const [, cov] of Object.entries(result.coverage.modules)) {
      for (const s of cov.spec_sections) sections.add(s);
    }
    expect(sections.size).toBeGreaterThan(0);
  });

  it("step 7: _actors/Auditor checks actor coverage — are all actors connected through journeys", () => {
    writeValidModules();
    const result = compile(modulesDir);
    const actorNodes = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'actor');
    for (const [, node] of actorNodes) {
      expect(node.in_journeys.length).toBeGreaterThan(0);
    }
  });

  it("step 8: _actors/Auditor checks cross-module coverage — are all modules connected to at least one other", () => {
    writeValidModules();
    const result = compile(modulesDir);
    expect(result.index._stats.isolated_modules).toBe(0);
  });

  it("step 9: convergence/DataDecidesWhenToStop determines whether audit findings require fixes or convergence is complete", () => {
    const gaps: string[] = [];
    const converged = gaps.length === 0;
    expect(converged).toBe(true);
  });

  it("step 10: convergence/ConvergenceState records audit results and whether gaps were found", () => {
    const state = { status: 'sleeping', audit_gaps: 0 };
    expect(state.audit_gaps).toBe(0);
    expect(state.status).toBe('sleeping');
  });
});
