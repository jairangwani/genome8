// Auto-generated from journey: ValidateActionDescriptions
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules, validateActionQuality } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateActionDescriptions", () => {
  const modules = new Map<string, ModuleFile>([
    ['svc', {
      nodes: {
        Alpha: { type: 'process', description: 'First process in the service' },
        Beta: { type: 'process', description: 'Second process in the service' },
      },
      journeys: {
        Good: {
          steps: [
            { node: 'Alpha', action: 'performs a meaningful action step' },
            { node: 'Beta', action: 'does another meaningful thing' },
          ],
        },
        Bad: {
          steps: [
            { node: 'Alpha', action: 'ok' },   // too short (<5 chars)
            { node: 'Beta', action: '' },        // empty
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const actionIssues = validateActionQuality(result);

  it("step 1: _actors/Compiler completes compilation and produces a CompileResult", () => {
    expect(result).toBeDefined();
    expect(result.index._stats.total_journeys).toBe(2);
  });

  it("step 2: compilation/CompilationResult provides the compiled index containing all journeys and their steps", () => {
    expect(result.index.journeys['Good']).toBeDefined();
    expect(result.index.journeys['Bad']).toBeDefined();
    expect(result.index.journeys['Good'].steps.length).toBe(2);
    expect(result.index.journeys['Bad'].steps.length).toBe(2);
  });

  it("step 3: compilation/ValidateActionQuality iterates every journey step and flags actions that are empty or shorter than 5 characters", () => {
    // "Good" journey has valid actions, "Bad" has 2 bad ones
    expect(actionIssues.length).toBe(2);
    // All flagged issues are from the "Bad" journey
    expect(actionIssues.every(i => i.journey === 'Bad')).toBe(true);
  });

  it("step 4: compilation/WarningReport records each low-quality action as a warning with journey name and step number", () => {
    for (const issue of actionIssues) {
      expect(issue.severity).toBe('warning');
      expect(issue.journey).toBe('Bad');
      expect(issue.message).toContain('action is empty or too short');
    }
  });
});
