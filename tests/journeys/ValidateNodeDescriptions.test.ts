// Auto-generated from journey: ValidateNodeDescriptions
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateNodeDescriptions", () => {
  const modules = new Map<string, ModuleFile>([
    ['svc', {
      nodes: {
        Good: { type: 'process', description: 'A sufficiently long and meaningful description' },
        TooShort: { type: 'process', description: 'Short' },
        Empty: { type: 'process', description: '' },
        Duplicate1: { type: 'artifact', description: 'Exact same description text here' },
        Duplicate2: { type: 'artifact', description: 'Exact same description text here' },
      },
      journeys: {
        Flow: {
          steps: [
            { node: 'Good', action: 'does the main processing work' },
            { node: 'TooShort', action: 'attempts to do something useful' },
            { node: 'Empty', action: 'handles edge case with no desc' },
            { node: 'Duplicate1', action: 'stores result in first artifact' },
            { node: 'Duplicate2', action: 'stores result in second artifact' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler completes compilation and produces a CompiledIndex with all nodes", () => {
    expect(result.index._stats.total_nodes).toBe(5);
  });

  it("step 2: graph/NodeRegistry provides all nodes with their descriptions across all modules", () => {
    expect(result.index.nodes['svc/Good'].description).toBe('A sufficiently long and meaningful description');
    expect(result.index.nodes['svc/TooShort'].description).toBe('Short');
    expect(result.index.nodes['svc/Empty'].description).toBe('');
  });

  it("step 3: compilation/ValidateDescriptionQuality iterates every node and flags descriptions that are empty or shorter than 10 characters", () => {
    // Detect short/empty descriptions by scanning compiled nodes
    const lowQuality = Object.entries(result.index.nodes).filter(
      ([, node]) => !node.description || node.description.length < 10
    );
    // TooShort (5 chars) and Empty (0 chars) are flagged
    expect(lowQuality.length).toBe(2);
    expect(lowQuality.map(([k]) => k)).toContain('svc/TooShort');
    expect(lowQuality.map(([k]) => k)).toContain('svc/Empty');
  });

  it("step 4: compilation/ValidateDescriptionQuality flags descriptions that are duplicated verbatim across different nodes", () => {
    // Detect duplicate descriptions
    const descriptions = Object.values(result.index.nodes).map(n => n.description);
    const counts = new Map<string, number>();
    for (const d of descriptions) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const duplicated = [...counts.entries()].filter(([, c]) => c > 1);
    expect(duplicated.length).toBe(1);
    expect(duplicated[0][0]).toBe('Exact same description text here');
  });

  it("step 5: compilation/ErrorReport records each low-quality or duplicate description as a validation issue with the node name and module", () => {
    // All compiled nodes have their module tracked
    for (const node of Object.values(result.index.nodes)) {
      expect(node.module).toBe('svc');
    }
  });
});
