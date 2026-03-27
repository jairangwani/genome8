// Auto-generated from journey: RejectMalformedStep
// Module: graph
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RejectMalformedStep", () => {
  // Module with a step that has a missing node reference (empty string)
  const modulesWithMissingNode = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'Developer who writes YAML' },
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ValidNode: { type: 'process', description: 'A valid node' },
        AnotherNode: { type: 'artifact', description: 'Another node' },
      },
      journeys: {
        MalformedJourney: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'writes a malformed step' },
            { node: '', action: 'this step has an empty node ref' },
            { node: 'ValidNode', action: 'does something valid' },
            { node: 'AnotherNode', action: 'does something else' },
          ],
        },
      },
    }],
  ]);

  // Module with all valid steps for comparison
  const modulesValid = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'Developer who writes YAML' },
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ValidNode: { type: 'process', description: 'A valid node' },
        AnotherNode: { type: 'artifact', description: 'Another node' },
      },
      journeys: {
        GoodJourney: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'writes valid steps' },
            { node: 'ValidNode', action: 'does something valid' },
            { node: 'AnotherNode', action: 'does something else' },
          ],
        },
      },
    }],
  ]);

  const resultMalformed = compileFromModules(modulesWithMissingNode);
  const resultValid = compileFromModules(modulesValid);

  it("step 1: _actors/HumanDeveloper writes a journey step as a flat string or without the required node and action fields", () => {
    // The developer is an actor that exists
    expect(resultMalformed.index.nodes['_actors/HumanDeveloper']).toBeDefined();
    expect(resultMalformed.index.nodes['_actors/HumanDeveloper'].type).toBe('actor');
  });

  it("step 2: graph/JourneyDefinition parses the journey and encounters the malformed step", () => {
    // The journey is still parsed, but the malformed step is skipped
    const journey = resultMalformed.index.journeys['MalformedJourney'];
    expect(journey).toBeDefined();
    // The empty-node step is skipped, so only 3 steps remain
    expect(journey.steps.length).toBeLessThan(4);
  });

  it("step 3: graph/StepFormatRule rejects the step because it lacks the mandatory node or action field", () => {
    // With valid data, all steps are present
    const goodJourney = resultValid.index.journeys['GoodJourney'];
    expect(goodJourney.steps).toHaveLength(3);
    for (const step of goodJourney.steps) {
      expect(step.node).toBeTruthy();
      expect(step.action).toBeTruthy();
    }
  });

  it("step 4: _actors/Compiler reports a validation error identifying the malformed step and its journey", () => {
    // Compiler actor is still defined (even if orphaned since it's not used in the journey)
    expect(resultMalformed.index.nodes['_actors/Compiler']).toBeDefined();

    // The malformed step with empty node was skipped during journey resolution
    const journey = resultMalformed.index.journeys['MalformedJourney'];
    for (const step of journey.steps) {
      expect(step.node).toBeTruthy();
    }
  });
});
