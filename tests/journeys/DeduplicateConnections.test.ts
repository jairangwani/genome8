// Auto-generated from journey: DeduplicateConnections
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DeduplicateConnections", () => {
  // Two journeys share the same consecutive step pair (A -> B)
  const modules = new Map<string, ModuleFile>([
    ['workflow', {
      nodes: {
        Intake: { type: 'process', description: 'Receives input' },
        Validate: { type: 'rule', description: 'Validates input' },
        Process: { type: 'process', description: 'Processes validated input' },
        Store: { type: 'artifact', description: 'Stores output' },
      },
      journeys: {
        FastPath: {
          steps: [
            { node: 'Intake', action: 'receives input' },
            { node: 'Validate', action: 'validates input' },
            { node: 'Process', action: 'processes input quickly' },
          ],
        },
        SlowPath: {
          steps: [
            { node: 'Intake', action: 'receives input' },
            { node: 'Validate', action: 'validates input thoroughly' },
            { node: 'Store', action: 'stores for later processing' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/JourneyRegistry provides all journeys whose steps may produce overlapping directed edges", () => {
    expect(result.index.journeys['FastPath']).toBeDefined();
    expect(result.index.journeys['SlowPath']).toBeDefined();
    expect(result.index._stats.total_journeys).toBe(2);
  });

  it("step 2: graph/ConnectionComputation derives directed edges from all journey steps including potential duplicates", () => {
    // Both journeys have Intake -> Validate, producing a potentially duplicate edge
    const intake = result.index.nodes['workflow/Intake'];
    expect(intake.followed_by).toContain('workflow/Validate');

    const validate = result.index.nodes['workflow/Validate'];
    expect(validate.preceded_by).toContain('workflow/Intake');
  });

  it("step 3: graph/ConnectionDeduplication identifies edges that appear in multiple journeys and merges them into unique entries with provenance", () => {
    // Intake -> Validate appears in both FastPath and SlowPath, but is stored only once
    const intake = result.index.nodes['workflow/Intake'];
    const validateRefs = intake.followed_by.filter(r => r === 'workflow/Validate');
    expect(validateRefs).toHaveLength(1);

    // But Intake participates in both journeys
    expect(intake.in_journeys.length).toBe(2);

    // Validate has two different followed_by targets (Process from FastPath, Store from SlowPath)
    const validate = result.index.nodes['workflow/Validate'];
    expect(validate.followed_by).toContain('workflow/Process');
    expect(validate.followed_by).toContain('workflow/Store');
  });

  it("step 4: graph/ConnectionSet stores only unique directed edges with tracking back to their source journeys", () => {
    // Total unique edges: Intake->Validate, Validate->Process, Validate->Store = 3
    expect(result.index._stats.total_connections).toBe(3);

    // Each edge is unique — no duplicates in any node's followed_by
    for (const node of Object.values(result.index.nodes)) {
      const uniqueFollowed = new Set(node.followed_by);
      expect(node.followed_by.length).toBe(uniqueFollowed.size);

      const uniquePreceded = new Set(node.preceded_by);
      expect(node.preceded_by.length).toBe(uniquePreceded.size);
    }
  });
});
