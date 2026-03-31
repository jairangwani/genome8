// Auto-generated from journey: ProvideActorsForExcerptContext
// Module: actors
// Modules touched: convergence, actors, excerpt, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const actorsModule: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Uses the platform' },
    Admin: { type: 'actor', description: 'Manages the platform' },
  },
};

const identityModule: ModuleFile = {
  spec_sections: [2],
  nodes: {
    LoginProcess: { type: 'process', description: 'Handles user login' },
    SessionToken: { type: 'artifact', description: 'JWT session token' },
  },
  journeys: {
    UserLogsIn: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'LoginProcess', action: 'validates credentials' },
        { node: 'SessionToken', action: 'is issued to the user' },
      ],
    },
  },
};

function buildCompileResult() {
  const modules = new Map<string, ModuleFile>([
    ['_actors', actorsModule],
    ['identity', identityModule],
  ]);
  return compileFromModules(modules);
}

describe("ProvideActorsForExcerptContext", () => {
  it("step 1: convergence/ModuleCreation begins creating a module and requests an excerpt for context", () => {
    // Module creation needs an excerpt — the compile result provides the data
    const result = buildCompileResult();
    expect(result.index.nodes['identity/LoginProcess']).toBeDefined();
    expect(result.coverage.modules['identity']).toBeDefined();
  });

  it("step 2: actors/ActorsFile provides the full actor list as context source", () => {
    const result = buildCompileResult();
    // Actor nodes are in the compiled index
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/Admin']).toBeDefined();
    expect(result.index.nodes['_actors/User'].type).toBe('actor');
  });

  it("step 3: actors/ProvideActorsForModuleCreation extracts actor names and descriptions relevant to the target module", () => {
    const result = buildCompileResult();
    // User is referenced by identity module's journey — it's relevant
    const userNode = result.index.nodes['_actors/User'];
    expect(userNode.in_journeys.length).toBeGreaterThanOrEqual(1);
    // The journey that touches identity also references _actors/User
    const journey = result.index.journeys['UserLogsIn'];
    expect(journey.modules_touched).toContain('_actors');
  });

  it("step 4: excerpt/CollectReferencedActors gathers actor references needed by the target module's domain", () => {
    const result = buildCompileResult();
    // Identity module's nodes are triggered by _actors/User
    const loginNode = result.index.nodes['identity/LoginProcess'];
    expect(loginNode.triggered_by_actors).toContain('_actors/User');
  });

  it("step 5: excerpt/AssembleExcerpt includes the relevant actors in the excerpt so the worker can reference them", () => {
    const result = buildCompileResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'identity',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  LoginProcess:\n    type: process\n    description: Handles user login',
    });
    // Excerpt includes the TRIGGERED BY section showing actors
    expect(excerpt).toContain('TRIGGERED BY:');
    expect(excerpt).toContain('User');
    // Excerpt contains cross-module info about _actors
    expect(excerpt).toContain('_actors');
  });

  it("step 6: llm/TaskPayload packages the excerpt including actor context into the creation task", () => {
    const result = buildCompileResult();
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'identity',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  LoginProcess:\n    type: process\n    description: Handles user login',
    });
    // The excerpt is a string that can be packaged into an LLM payload
    expect(typeof excerpt).toBe('string');
    expect(excerpt.length).toBeGreaterThan(0);
    // It contains the focus module info
    expect(excerpt).toContain('Focus: identity');
    // It contains the global stats
    expect(excerpt).toContain('GLOBAL:');
  });

});
