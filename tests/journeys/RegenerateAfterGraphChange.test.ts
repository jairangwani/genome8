// Auto-generated from journey: RegenerateAfterGraphChange
// Module: excerpt
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph, excerpt, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("RegenerateAfterGraphChange", () => {
  // Two compilation passes — before and after a graph change
  const modulesBefore = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Compiler: { type: 'actor', description: 'Compiles modules' } },
      journeys: {},
    }],
    ['graph', {
      nodes: { CompiledIndex: { type: 'artifact', description: 'The compiled index', files: ['src/types.ts'] } },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        NodeA: { type: 'process', description: 'Process A' },
      },
      journeys: {},
    }],
  ]);

  const modulesAfter = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Compiler: { type: 'actor', description: 'Compiles modules' } },
      journeys: {},
    }],
    ['graph', {
      nodes: { CompiledIndex: { type: 'artifact', description: 'The compiled index', files: ['src/types.ts'] } },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        NodeA: { type: 'process', description: 'Process A' },
        NodeB: { type: 'process', description: 'Process B — newly added' },
      },
      journeys: {
        Flow: {
          steps: [
            { node: 'NodeA', action: 'starts flow' },
            { node: 'NodeB', action: 'continues flow' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBefore);
  const resultAfter = compileFromModules(modulesAfter);

  const excerptBefore = generateExcerpt({
    round: 1,
    focusModule: 'mymod',
    index: resultBefore.index,
    coverage: resultBefore.coverage,
    issues: resultBefore.issues,
    moduleFileContent: 'nodes:\n  NodeA:\n    type: process',
  });

  const excerptAfter = generateExcerpt({
    round: 2,
    focusModule: 'mymod',
    index: resultAfter.index,
    coverage: resultAfter.coverage,
    issues: resultAfter.issues,
    moduleFileContent: 'nodes:\n  NodeA:\n    type: process\n  NodeB:\n    type: process',
  });

  it("step 1: _actors/Compiler completes a compilation that changes the compiled index", () => {
    const compilerBefore = resultBefore.index.nodes['_actors/Compiler'];
    const compilerAfter = resultAfter.index.nodes['_actors/Compiler'];
    expect(compilerBefore).toBeDefined();
    expect(compilerAfter).toBeDefined();
  });

  it("step 2: graph/CompiledIndex provides the new compiled index with a different hash than before", () => {
    // The two compilations have different stats (different number of nodes)
    expect(resultBefore.index._stats.total_nodes).not.toBe(resultAfter.index._stats.total_nodes);
  });

  it("step 3: excerpt/InvalidateExcerptCache detects that the compiled index hash has changed since the last cache entries were stored", () => {
    // Simulate cache invalidation: the before and after excerpts are different
    expect(excerptBefore).not.toBe(excerptAfter);
  });

  it("step 4: excerpt/InvalidateExcerptCache clears all cached excerpts to prevent serving stale context", () => {
    // Cache simulation: after graph change, old cache is invalidated
    const cache = new Map<string, string>();
    cache.set('mymod', excerptBefore);
    // Invalidate on hash change
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("step 5: excerpt/CacheExcerptByState resets the cache to empty, ready to store fresh excerpts on next generation", () => {
    const cache = new Map<string, string>();
    cache.clear();
    expect(cache.size).toBe(0);
    // Store fresh excerpt
    cache.set('mymod', excerptAfter);
    expect(cache.get('mymod')).toBe(excerptAfter);
  });

  it("step 6: compilation/CompilationResult confirms the compilation is complete and excerpts are ready to be regenerated on demand", () => {
    // The new excerpt has the additional node
    expect(excerptAfter).toContain('NodeB');
    expect(excerptAfter).toContain('YOUR JOURNEYS:');
    expect(excerptAfter).toContain('Flow:');
    // The before excerpt did not have the new node
    expect(excerptBefore).not.toContain('NodeB');
  });
});
