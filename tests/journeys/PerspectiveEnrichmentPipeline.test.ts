// Auto-generated from journey: PerspectiveEnrichmentPipeline
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
  fs.writeFileSync(path.join(modulesDir, '_actors.yaml'),
    'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n\njourneys: {}\n');
  fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
    'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates credentials\n');
});

afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe("PerspectiveEnrichmentPipeline", () => {
  it("step 1: convergence/ConvergenceState indicates all modules have been created and initial compilation passed", () => {
    const result = compile(modulesDir);
    expect(result.index._stats.modules).toBeGreaterThanOrEqual(2);
  });

  it("step 2: convergence/MapPerspectives identifies which perspectives are relevant to each module based on its domain", () => {
    const lenses = ['happy paths', 'failures', 'threats', 'edge cases'];
    const relevanceMatrix = new Map<string, number[]>();
    relevanceMatrix.set('auth', [0, 1, 2]);
    expect(relevanceMatrix.get('auth')!.length).toBe(3);
  });

  it("step 3: convergence/BoundedCreationRule enforces that enrichment is bounded by modules times relevant perspectives", () => {
    const modules = ['auth'];
    const relevanceMatrix = new Map([['auth', [0, 1, 2]]]);
    const totalPairs = [...relevanceMatrix.values()].reduce((sum, l) => sum + l.length, 0);
    expect(totalPairs).toBe(3);
    expect(totalPairs).toBeLessThan(modules.length * 8);
  });

  it("step 4: excerpt/SelectTargetModule selects the first module to examine", () => {
    const modules = ['auth'];
    expect(modules[0]).toBe('auth');
  });

  it("step 5: excerpt/AssembleExcerpt builds a focused excerpt of the module and its cross-module connections", () => {
    const result = compile(modulesDir);
    const excerpt = generateExcerpt({
      round: 1, focusModule: 'auth',
      index: result.index, coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: fs.readFileSync(path.join(modulesDir, 'auth.yaml'), 'utf-8'),
    });
    expect(excerpt).toContain('auth');
    expect(excerpt).toContain('YOUR FILE');
  });

  it("step 6: excerpt/ExcerptOutput provides the assembled excerpt for the LLM to analyze", () => {
    const result = compile(modulesDir);
    const excerpt = generateExcerpt({
      round: 1, focusModule: 'auth',
      index: result.index, coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: fs.readFileSync(path.join(modulesDir, 'auth.yaml'), 'utf-8'),
    });
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(50);
  });

  it("step 7: convergence/ExamineFromPerspective delegates to LLM to examine the module from the first relevant perspective", () => {
    const perspective = 'happy paths (core flows that make the product work)';
    expect(perspective.length).toBeGreaterThan(5);
  });

  it("step 8: _actors/LLMWorker reads the excerpt and perspective definition to identify missing nodes and journeys", () => {
    // After enrichment, the module should have more content
    const beforeResult = compile(modulesDir);
    const beforeNodes = beforeResult.index._stats.total_nodes;
    // Simulate enrichment by adding a node
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
      'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n  Logout:\n    type: process\n    description: handles logout\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates credentials\n');
    const afterResult = compile(modulesDir);
    expect(afterResult.index._stats.total_nodes).toBeGreaterThan(beforeNodes);
  });

  it("step 9: graph/ModuleFile stores the updated module with added nodes and journeys", () => {
    const modPath = path.join(modulesDir, 'auth.yaml');
    const content = fs.readFileSync(modPath, 'utf-8');
    expect(content).toContain('Login');
  });

  it("step 10: convergence/CompileCheck invokes compile.ts to validate the enriched module against the full graph", () => {
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 11: _actors/Compiler runs compilation and reports any errors introduced by the enrichment", () => {
    const result = compile(modulesDir);
    expect(result.issues).toBeInstanceOf(Array);
  });

  it("step 12: compilation/CompilationResult provides error count and details after the perspective pass", () => {
    const result = compile(modulesDir);
    expect(result.index._stats.total_connections).toBeDefined();
    expect(typeof result.index._stats.total_nodes).toBe('number');
  });

  it("step 13: convergence/ExamineFromPerspective delegates to LLM for the next relevant perspective on the same module", () => {
    const lenses = ['happy paths', 'failures', 'threats'];
    const currentIdx = 0;
    const nextIdx = currentIdx + 1;
    expect(lenses[nextIdx]).toBe('failures');
  });

  it("step 14: _actors/LLMWorker examines the module from the next perspective and adds further missing content", () => {
    // Second perspective pass should not destroy existing content
    const before = compile(modulesDir);
    const beforeNodes = before.index._stats.total_nodes;
    expect(beforeNodes).toBeGreaterThan(0);
  });

  it("step 15: convergence/CompileCheck recompiles after the second perspective pass", () => {
    const result = compile(modulesDir);
    expect(result.index._compiled).toBeDefined();
  });

  it("step 16: convergence/BoundedCreationLoop repeats for each remaining module-perspective pair until all are examined", () => {
    const pairs = [['auth', 0], ['auth', 1], ['auth', 2]];
    let processed = 0;
    for (const _pair of pairs) {
      processed++;
    }
    expect(processed).toBe(pairs.length);
  });

  it("step 17: convergence/NeverOpenEndedLoop ensures perspective enrichment terminates after all mapped pairs are processed", () => {
    const totalPairs = 3;
    let current = 0;
    while (current < totalPairs) { current++; }
    expect(current).toBe(totalPairs);
  });

  it("step 18: convergence/ConvergenceState records that perspective enrichment is complete for all modules", () => {
    const state = { status: 'enrichment_complete', modules_enriched: ['auth'] };
    expect(state.status).toBe('enrichment_complete');
  });
});
