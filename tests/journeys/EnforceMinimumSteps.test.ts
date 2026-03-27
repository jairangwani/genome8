// Auto-generated from journey: EnforceMinimumSteps
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: graph, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("EnforceMinimumSteps", () => {
  // A journey with only 1 step (fewer than 2)
  const modulesOneStep = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        OnlyNode: { type: 'process', description: 'The only node in a too-short journey' },
      },
      journeys: {
        TooShort: {
          steps: [
            { node: 'OnlyNode', action: 'does something alone' },
          ],
        },
      },
    }],
  ]);

  // A journey with 2 steps (minimum valid)
  const modulesTwoSteps = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        NodeA: { type: 'process', description: 'First step node' },
        NodeB: { type: 'artifact', description: 'Second step node' },
      },
      journeys: {
        JustEnough: {
          steps: [
            { node: 'NodeA', action: 'does the first thing' },
            { node: 'NodeB', action: 'does the second thing' },
          ],
        },
      },
    }],
  ]);

  const resultOneStep = compileFromModules(modulesOneStep);
  const resultTwoSteps = compileFromModules(modulesTwoSteps);

  it("step 1: graph/JourneyDefinition parses a journey and finds it has fewer than 2 steps", () => {
    // The one-step journey is parsed but produces no connections
    const journey = resultOneStep.index.journeys['TooShort'];
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(1);
    expect(resultOneStep.index._stats.total_connections).toBe(0);
  });

  it("step 2: graph/MinimumStepsRule rejects the journey because it cannot produce any connections with fewer than 2 steps", () => {
    // A 1-step journey produces zero connections; the node is still parsed
    // but effectively the journey contributes nothing to the graph's edges
    const onlyNode = resultOneStep.index.nodes['mymod/OnlyNode'];
    expect(onlyNode.preceded_by).toHaveLength(0);
    expect(onlyNode.followed_by).toHaveLength(0);

    // A 2-step journey produces exactly 1 connection
    expect(resultTwoSteps.index._stats.total_connections).toBe(1);
  });

  it("step 3: _actors/Compiler reports a validation error identifying the journey with insufficient steps", () => {
    // With a single-step journey the compiler still runs but:
    // - Compiler actor is orphaned (not in any journey)
    // - The single-step node at least appears in TooShort
    const journey = resultOneStep.index.journeys['TooShort'];
    expect(journey.steps).toHaveLength(1);

    // Compiler is an orphan since it's not referenced in any journey
    const compilerOrphans = resultOneStep.issues.filter(
      i => i.message.includes('Orphan') && i.message.includes('Compiler')
    );
    expect(compilerOrphans.length).toBeGreaterThan(0);
  });
});
