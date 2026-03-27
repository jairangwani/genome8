// Auto-generated from journey: ProvideActorsForExcerptContext
// Module: actors
// Modules touched: convergence, actors, excerpt, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/excerpt.ts

// Set up _actors + a gateway module that references actors in journeys
const _actorsModule: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

const gatewayModule: ModuleFile = {
  nodes: {
    EntryPoint: { type: 'process', description: 'handles incoming requests' },
    ResponseBuilder: { type: 'process', description: 'builds API responses' },
  },
  journeys: {
    HandleRequest: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'sends a request to the system' },
        { node: 'EntryPoint', action: 'receives and routes the request' },
        { node: 'ResponseBuilder', action: 'builds and returns a response' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['_actors', _actorsModule],
  ['gateway', gatewayModule],
]));

describe("ProvideActorsForExcerptContext", () => {
  it("step 1: convergence/ModuleCreation begins creating a module and requests an excerpt for context", () => {
    // The compiled result is ready — module creation would request an excerpt for 'gateway'
    expect(result.index.journeys['HandleRequest']).toBeDefined();
    expect(result.coverage.modules['gateway']).toBeDefined();
  });

  it("step 2: actors/ActorsFile provides the full actor list as context source", () => {
    // _actors module is compiled and its actors are available
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(result.coverage.modules['_actors']).toBeDefined();
    expect(result.coverage.modules['_actors'].nodes).toBe(2);
  });

  it("step 3: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    // Actors that trigger journeys in gateway are extractable
    const gatewayJourney = result.index.journeys['HandleRequest'];
    const actorSteps = gatewayJourney.steps.filter(s => s.node.startsWith('_actors/'));
    expect(actorSteps.length).toBeGreaterThanOrEqual(1);
    expect(actorSteps[0].node).toBe('_actors/ProjectOwner');
  });

  it("step 4: excerpt/CollectReferencedActors gathers actor references needed by the target module's domain", () => {
    // The gateway module's nodes are triggered by actors — excerpt logic collects them
    const entryPoint = result.index.nodes['gateway/EntryPoint'];
    expect(entryPoint.triggered_by_actors.length).toBeGreaterThanOrEqual(1);
    expect(entryPoint.triggered_by_actors).toContain('_actors/ProjectOwner');
  });

  it("step 5: excerpt/AssembleExcerpt includes the relevant actors in the excerpt so the worker can reference them", () => {
    // Generate the excerpt for gateway and verify actors appear
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'gateway',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  EntryPoint:\n    type: process\n    description: handles incoming requests',
    });
    // Excerpt should mention the triggering actor
    expect(excerpt).toContain('ProjectOwner');
    // Excerpt should contain the TRIGGERED BY section
    expect(excerpt).toContain('TRIGGERED BY');
    // Excerpt should list _actors module in ALL MODULES
    expect(excerpt).toContain('_actors');
  });

  it("step 6: llm/TaskPayload packages the excerpt including actor context into the creation task", () => {
    // The excerpt is a string that can be packaged into an LLM task payload
    const excerpt = generateExcerpt({
      round: 2,
      focusModule: 'gateway',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  EntryPoint:\n    type: process',
    });
    // Excerpt has all the sections needed for a task payload
    expect(excerpt).toContain('ROUND 2');
    expect(excerpt).toContain('Focus: gateway');
    expect(excerpt).toContain('MODULE STATUS');
    expect(excerpt).toContain('YOUR NODES');
    expect(excerpt).toContain('YOUR FILE');
    expect(excerpt).toContain('GLOBAL');
  });

});
