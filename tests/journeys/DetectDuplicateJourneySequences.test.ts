// Auto-generated from journey: DetectDuplicateJourneySequences
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules, detectDuplicateSequences } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectDuplicateJourneySequences", () => {
  const modules = new Map<string, ModuleFile>([
    ['svc', {
      nodes: {
        A: { type: 'process', description: 'Step A in the pipeline' },
        B: { type: 'process', description: 'Step B in the pipeline' },
        C: { type: 'process', description: 'Step C in the pipeline' },
        D: { type: 'artifact', description: 'Step D stores result' },
      },
      journeys: {
        Journey1: {
          steps: [
            { node: 'A', action: 'starts the first journey flow' },
            { node: 'B', action: 'continues the first journey' },
            { node: 'C', action: 'finishes the first journey' },
          ],
        },
        Journey2: {
          steps: [
            { node: 'A', action: 'starts the second journey flow' },
            { node: 'B', action: 'continues the second journey' },
            { node: 'C', action: 'finishes the second journey' },
            { node: 'D', action: 'stores the second journey result' },
          ],
        },
        Journey3: {
          steps: [
            { node: 'D', action: 'starts with a different node' },
            { node: 'A', action: 'then goes to node A step' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const duplicates = detectDuplicateSequences(result);

  it("step 1: _actors/Compiler completes full compilation and produces a CompileResult", () => {
    expect(result).toBeDefined();
    expect(result.index._stats.total_journeys).toBe(3);
  });

  it("step 2: compilation/CompilationResult provides the compiled index containing all journeys and their steps", () => {
    expect(result.index.journeys['Journey1'].steps.length).toBe(3);
    expect(result.index.journeys['Journey2'].steps.length).toBe(4);
    expect(result.index.journeys['Journey3'].steps.length).toBe(2);
  });

  it("step 3: compilation/DetectDuplicateSequences slides a 3-step window over every journey's node list and groups matching sequences by key", () => {
    // Journey1 has one 3-step window: [A, B, C]
    // Journey2 has two 3-step windows: [A, B, C] and [B, C, D]
    // Journey3 has no 3-step window (only 2 steps)
    // So [A, B, C] appears in both Journey1 and Journey2
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].sequence).toEqual(['svc/A', 'svc/B', 'svc/C']);
  });

  it("step 4: compilation/DetectDuplicateSequences filters to sequences appearing in two or more distinct journeys", () => {
    expect(duplicates[0].journeys.length).toBe(2);
    expect(duplicates[0].journeys).toContain('Journey1');
    expect(duplicates[0].journeys).toContain('Journey2');
  });

  it("step 5: compilation/WarningReport records each duplicate sequence with the shared node triple and the list of journeys that contain it", () => {
    expect(duplicates[0].sequence.length).toBe(3);
    expect(duplicates[0].journeys.length).toBeGreaterThanOrEqual(2);
  });
});
