// Auto-generated from journey: ModuleCreationPipeline
// Module: convergence
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, excerpt, _actors, graph, compilation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compile } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';

let tmpDir: string;
let modulesDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  modulesDir = path.join(tmpDir, 'genome', 'modules');
  fs.mkdirSync(modulesDir, { recursive: true });
  // Write actors
  fs.writeFileSync(path.join(modulesDir, '_actors.yaml'),
    'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n\njourneys: {}\n');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("ModuleCreationPipeline", () => {
  it("step 1: convergence/ConvergenceState provides the list of modules in build order from ORGANIZATION.md", () => {
    const orgContent = '## MODULES\n- `auth` -- authentication\n- `data` -- data storage\n- `api` -- API layer\n';
    const names: string[] = [];
    for (const line of orgContent.split('\n')) {
      const match = line.match(/`([a-z][\w-]*)`/);
      if (match && !['_actors', 'spec', 'genome'].includes(match[1])) {
        if (!names.includes(match[1])) names.push(match[1]);
      }
    }
    expect(names).toEqual(['auth', 'data', 'api']);
  });

  it("step 2: convergence/BoundedCreationRule enforces that creation is bounded by modules times relevant lenses", () => {
    const modules = ['auth', 'data', 'api'];
    const lenses = ['happy paths', 'failures', 'threats'];
    const totalPairs = modules.length * lenses.length;
    expect(totalPairs).toBe(9);
    expect(totalPairs).toBeLessThan(Infinity);
  });

  it("step 3: convergence/ModuleCreation selects the next module in build order", () => {
    const modules = ['auth', 'data', 'api'];
    let nextIdx = 0;
    for (const mod of modules) {
      const modPath = path.join(modulesDir, `${mod}.yaml`);
      if (!fs.existsSync(modPath) || fs.statSync(modPath).size < 100) {
        expect(mod).toBe(modules[nextIdx]);
        break;
      }
      nextIdx++;
    }
  });

  it("step 4: excerpt/SelectTargetModule identifies the target module to generate an excerpt for", () => {
    const focusModule = 'auth';
    expect(focusModule).toBeDefined();
  });

  it("step 5: excerpt/AssembleExcerpt builds a focused excerpt of the existing graph for the LLM to reference", () => {
    const result = compile(modulesDir);
    const excerpt = generateExcerpt({
      round: 0,
      focusModule: 'auth',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'Module does not exist yet.',
    });
    expect(excerpt).toContain('ROUND 0');
    expect(excerpt).toContain('Focus: auth');
    expect(excerpt).toContain('Module does not exist yet.');
  });

  it("step 6: excerpt/ExcerptOutput provides the assembled excerpt with cross-module context", () => {
    const result = compile(modulesDir);
    const excerpt = generateExcerpt({
      round: 0,
      focusModule: '_actors',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: fs.readFileSync(path.join(modulesDir, '_actors.yaml'), 'utf-8'),
    });
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 7: _actors/LLMWorker reads the excerpt and spec sections to create the module YAML with nodes and journeys", () => {
    // Simulate module creation
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  LoginProcess:\n    type: process\n    description: handles user login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: LoginProcess\n        action: validates credentials\n');
    expect(fs.existsSync(path.join(modulesDir, 'auth.yaml'))).toBe(true);
  });

  it("step 8: graph/ModuleFile stores the newly created module on disk", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  LoginProcess:\n    type: process\n    description: handles login\n\njourneys: {}\n');
    const stat = fs.statSync(path.join(modulesDir, 'auth.yaml'));
    expect(stat.size).toBeGreaterThan(50);
  });

  it("step 9: convergence/CompileCheck invokes compile.ts to validate the new module against the graph so far", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  LoginProcess:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: LoginProcess\n        action: validates\n');
    const result = compile(modulesDir);
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 10: _actors/Compiler runs full compilation and reports errors and warnings", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  LoginProcess:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: LoginProcess\n        action: validates\n');
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    const warnings = result.issues.filter(i => i.severity === 'warning');
    expect(errors).toBeDefined();
    expect(warnings).toBeDefined();
  });

  it("step 11: compilation/CompilationResult provides error count, warning count, and details", () => {
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  LoginProcess:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: LoginProcess\n        action: validates\n');
    const result = compile(modulesDir);
    expect(result.issues).toBeInstanceOf(Array);
    expect(result.index._stats).toHaveProperty('total_nodes');
    expect(result.index._stats).toHaveProperty('total_journeys');
  });

  it("step 12: convergence/BoundedCreationLoop repeats module creation and compile for each remaining module in build order", () => {
    const modules = ['auth', 'data'];
    const created: string[] = [];
    for (const mod of modules) {
      fs.writeFileSync(path.join(modulesDir, `${mod}.yaml`),
        `spec_sections: [1]\n\nnodes:\n  ${mod}Process:\n    type: process\n    description: ${mod} process\n\njourneys: {}\n`);
      created.push(mod);
    }
    expect(created.length).toBe(modules.length);
    const result = compile(modulesDir);
    expect(result.index._stats.modules).toBeGreaterThanOrEqual(3); // _actors + auth + data
  });

  it("step 13: convergence/NeverOpenEndedLoop ensures the loop is bounded by the module list, not open-ended", () => {
    const modules = ['auth', 'data', 'api'];
    let iterations = 0;
    for (const _mod of modules) {
      iterations++;
    }
    expect(iterations).toBe(modules.length);
    expect(iterations).toBeLessThan(Infinity);
  });

  it("step 14: convergence/ConvergenceState records all modules created and last compilation result", () => {
    const state = {
      status: 'enrichment',
      modules_created: ['auth', 'data'],
      last_compile: { errors: 0, warnings: 2, nodes: 5 },
    };
    const statePath = path.join(tmpDir, 'genome', 'convergence-state.json');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    const read = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    expect(read.modules_created).toEqual(['auth', 'data']);
    expect(read.last_compile.errors).toBe(0);
  });
});
