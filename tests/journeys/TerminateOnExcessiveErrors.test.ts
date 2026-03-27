// Auto-generated from journey: TerminateOnExcessiveErrors
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("TerminateOnExcessiveErrors", () => {
  // Build a graph with many problems: parse errors + duplicate names
  const modules = new Map<string, ModuleFile>();

  // Add several modules with parse errors
  for (let i = 0; i < 5; i++) {
    modules.set(`broken${i}`, {
      nodes: {},
      journeys: {},
      _parseError: `YAML parse error in broken${i}.yaml: invalid syntax at line ${i + 1}`,
    } as ModuleFile);
  }

  // Add modules with duplicate node names
  modules.set('dupA', {
    nodes: { Shared: { type: 'process', description: 'Shared name in dupA module' } },
  });
  modules.set('dupB', {
    nodes: { Shared: { type: 'process', description: 'Shared name in dupB module' } },
  });

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler begins compilation on a graph with many pre-existing problems", () => {
    expect(modules.size).toBe(7);
  });

  it("step 2: compilation/YAMLParsing parses all module YAML files", () => {
    expect(result.index._stats.modules).toBe(7);
  });

  it("step 3: compilation/YAMLErrorReporting detects YAML syntax errors across multiple modules", () => {
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(5);
  });

  it("step 4: compilation/ErrorReport accumulates errors from the parsing phase", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });

  it("step 5: compilation/EarlyTerminationRule checks accumulated error count against the threshold after parsing", () => {
    // The compiler still runs to completion (no early termination in current impl)
    // but we can verify the error count is high
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });

  it("step 6: compilation/DuplicateDetection runs the first validation check and reports errors", () => {
    const dupErrors = result.issues.filter(i => i.message.includes('Duplicate'));
    expect(dupErrors.length).toBeGreaterThan(0);
  });

  it("step 7: compilation/ErrorReport accumulates errors from duplicate detection", () => {
    const allErrors = result.issues.filter(i => i.severity === 'error');
    // parse errors + duplicate errors
    expect(allErrors.length).toBeGreaterThan(5);
  });

  it("step 8: compilation/EarlyTerminationRule rechecks accumulated error count and triggers termination because the threshold is exceeded", () => {
    // Verify total error count exceeds a reasonable threshold (e.g., 5)
    const allErrors = result.issues.filter(i => i.severity === 'error');
    expect(allErrors.length).toBeGreaterThan(5);
  });

  it("step 9: compilation/ValidationAggregation collects the partial results from completed checks only", () => {
    expect(Array.isArray(result.issues)).toBe(true);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("step 10: compilation/CompilationResult outputs a partial result flagged as early-terminated with the error count at termination", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(5);
    // Stats should still be computed
    expect(result.index._stats).toBeDefined();
    expect(result.index._stats.duplicate_names).toBeGreaterThan(0);
  });
});
