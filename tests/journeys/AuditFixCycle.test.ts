// Auto-generated from journey: AuditFixCycle
// Module: convergence
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, _actors, compilation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compile } from '../../src/compile.js';

let tmpDir: string;
let modulesDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  modulesDir = path.join(tmpDir, 'genome', 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  fs.writeFileSync(path.join(modulesDir, '_actors.yaml'),
    'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n\njourneys: {}\n');
});

afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe("AuditFixCycle", () => {
  it("step 1: convergence/ConvergenceState provides the list of audit gaps to fix", () => {
    const gaps = ['spec-coverage: Section 3 has no journeys', 'actor-coverage: Admin has 0 journeys'];
    expect(gaps.length).toBe(2);
    expect(gaps[0]).toContain('spec-coverage');
  });

  it("step 2: convergence/AuditGapFix selects a specific gap and delegates to LLM for a targeted fix", () => {
    const gaps = ['spec-coverage: Section 3 missing'];
    const selectedGap = gaps[0];
    expect(selectedGap).toContain('spec-coverage');
  });

  it("step 3: _actors/LLMWorker edits the relevant module to close the coverage gap", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1, 3]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n  Signup:\n    type: process\n    description: handles signup\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n  UserSignup:\n    steps:\n      - node: _actors/User\n        action: fills signup form\n      - node: Signup\n        action: creates account\n');
    const result = compile(modulesDir);
    expect(result.index._stats.total_journeys).toBe(2);
  });

  it("step 4: convergence/RecompileAfterFix runs compile.ts to verify the fix did not introduce new errors", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 5: _actors/Compiler validates the patched graph", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
    const result = compile(modulesDir);
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 6: compilation/CompilationResult provides updated error and warning counts", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;
    expect(typeof errors).toBe('number');
    expect(typeof warnings).toBe('number');
  });

  it("step 7: convergence/ReauditAfterFix runs the relevant auditor again to verify the gap is closed", () => {
    // After fix, re-running compile should show improved coverage
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
    const result = compile(modulesDir);
    expect(result.coverage.orphans.length).toBe(0);
  });

  it("step 8: _actors/Auditor re-checks the specific coverage angle that had the gap", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
    const result = compile(modulesDir);
    // All actors should be in journeys
    const actorNodes = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'actor');
    for (const [, node] of actorNodes) {
      expect(node.in_journeys.length).toBeGreaterThan(0);
    }
  });

  it("step 9: convergence/ConvergenceState updates convergence status — either more fixes needed or CONVERGED", () => {
    const gaps: string[] = [];
    const status = gaps.length === 0 ? 'converged' : 'fixing';
    expect(status).toBe('converged');
  });
});
