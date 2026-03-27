// Auto-generated from journey: DefineJourney
// Module: graph
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("DefineJourney", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'A developer who writes module YAML files' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        JourneyDefinition: { type: 'process', description: 'Parses a journey entry and validates it has a name and steps array' },
        StepFormatRule: { type: 'rule', description: 'Checks that each step has node and action fields' },
        StepDefinition: { type: 'process', description: 'Parses each step binding a node reference to an action' },
        JourneyRegistry: { type: 'artifact', description: 'Collection of all journeys' },
      },
      journeys: {
        DefineJourney: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'writes a journey with ordered steps in a module YAML file' },
            { node: 'JourneyDefinition', action: 'parses the journey entry and validates it has a name and steps array' },
            { node: 'StepFormatRule', action: 'checks that each step has node and action fields, rejecting flat strings' },
            { node: 'StepDefinition', action: 'parses each step binding a node reference to an action description' },
            { node: 'JourneyRegistry', action: 'registers the journey in the collection of all journeys' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/HumanDeveloper writes a journey with ordered steps in a module YAML file", () => {
    const actor = result.index.nodes['_actors/HumanDeveloper'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
    // Actor is referenced as the first step, so it triggers the journey
    const journey = result.index.journeys['DefineJourney'];
    expect(journey.actor).toBe('_actors/HumanDeveloper');
  });

  it("step 2: graph/JourneyDefinition parses the journey entry and validates it has a name and steps array", () => {
    const journey = result.index.journeys['DefineJourney'];
    expect(journey).toBeDefined();
    expect(journey.name).toBe('DefineJourney');
    expect(journey.steps).toHaveLength(5);
    expect(journey.module).toBe('graph');
  });

  it("step 3: graph/StepFormatRule checks that each step has node and action fields, rejecting flat strings", () => {
    // Every step in the journey has both node and action
    const journey = result.index.journeys['DefineJourney'];
    for (const step of journey.steps) {
      expect(step.node).toBeTruthy();
      expect(step.action).toBeTruthy();
    }
    // No step-format validation errors
    const stepErrors = result.issues.filter(i => i.message.includes('step'));
    expect(stepErrors.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it("step 4: graph/StepDefinition parses each step binding a node reference to an action description", () => {
    // resolveNodeRef correctly parses cross-module and local refs
    const ref1 = resolveNodeRef('_actors/HumanDeveloper', 'graph');
    expect(ref1).toEqual({ module: '_actors', name: 'HumanDeveloper' });

    const ref2 = resolveNodeRef('JourneyDefinition', 'graph');
    expect(ref2).toEqual({ module: 'graph', name: 'JourneyDefinition' });

    // Steps have step_numbers assigned
    const journey = result.index.journeys['DefineJourney'];
    expect(journey.steps[0].step_number).toBe(1);
    expect(journey.steps[4].step_number).toBe(5);
  });

  it("step 5: graph/JourneyRegistry registers the journey in the collection of all journeys", () => {
    expect(Object.keys(result.index.journeys)).toContain('DefineJourney');
    expect(result.index._stats.total_journeys).toBe(1);

    // The journey's modules_touched includes both _actors and graph
    const journey = result.index.journeys['DefineJourney'];
    expect(journey.modules_touched).toContain('_actors');
    expect(journey.modules_touched).toContain('graph');
  });
});
