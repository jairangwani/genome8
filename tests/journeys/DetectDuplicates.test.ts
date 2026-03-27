// Auto-generated from journey: DetectDuplicates
// Module: compilation
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectDuplicates", () => {
  const modules = new Map<string, ModuleFile>([
    ['alpha', {
      nodes: {
        SharedName: { type: 'process', description: 'First definition of SharedName' },
      },
    }],
    ['beta', {
      nodes: {
        SharedName: { type: 'process', description: 'Second definition of SharedName' },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/CompiledIndex provides the full node registry for inspection", () => {
    // Both nodes exist under their fully qualified names
    expect(result.index.nodes['alpha/SharedName']).toBeDefined();
    expect(result.index.nodes['beta/SharedName']).toBeDefined();
  });

  it("step 2: compilation/DuplicateDetection scans all node names and flags any name that appears in more than one module", () => {
    // Stats should report a duplicate
    expect(result.index._stats.duplicate_names).toBeGreaterThan(0);
  });

  it("step 3: compilation/ErrorReport records each duplicate as a validation error with both module locations", () => {
    const dupIssues = result.issues.filter(i => i.message.includes('Duplicate') && i.message.includes('SharedName'));
    expect(dupIssues.length).toBeGreaterThan(0);
    expect(dupIssues[0].severity).toBe('error');
    // The message should mention both modules
    expect(dupIssues[0].message).toContain('alpha');
    expect(dupIssues[0].message).toContain('beta');
  });
});
