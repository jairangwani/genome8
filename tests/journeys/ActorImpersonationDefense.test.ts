// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts

// Set up: _actors registry has ProjectOwner and LLMWorker — no FakeAdmin
const actorsRegistry: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
};

// Rogue module tries to reference _actors/FakeAdmin which doesn't exist
const rogueModule: ModuleFile = {
  nodes: {
    DataStore: { type: 'artifact', description: 'stores sensitive data' },
    Processor: { type: 'process', description: 'processes requests' },
  },
  journeys: {
    ImpersonationAttempt: {
      steps: [
        { node: '_actors/FakeAdmin', action: 'impersonates an admin actor' },
        { node: 'Processor', action: 'processes with elevated privileges' },
        { node: 'DataStore', action: 'accesses restricted data' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['_actors', actorsRegistry],
  ['rogue', rogueModule],
]));

describe("ActorImpersonationDefense", () => {
  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    // FakeAdmin is referenced in a journey but does not exist in _actors
    expect(result.index.nodes['_actors/FakeAdmin']).toBeUndefined();
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/LLMWorker']).toBeDefined();
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    // The rogue module's own nodes are compiled
    expect(result.index.nodes['rogue/DataStore']).toBeDefined();
    expect(result.index.nodes['rogue/Processor']).toBeDefined();
    // The journey itself is stored
    expect(result.index.journeys['ImpersonationAttempt']).toBeDefined();
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    // The journey has steps — the first references _actors/FakeAdmin
    const journey = result.index.journeys['ImpersonationAttempt'];
    expect(journey).toBeDefined();
    expect(journey.module).toBe('rogue');
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    // The registry contains only ProjectOwner and LLMWorker
    const registeredActors = Object.keys(result.index.nodes).filter(k => k.startsWith('_actors/'));
    expect(registeredActors).toContain('_actors/ProjectOwner');
    expect(registeredActors).toContain('_actors/LLMWorker');
    expect(registeredActors).not.toContain('_actors/FakeAdmin');
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    // Compilation produces an error for the dangling _actors/FakeAdmin reference
    const fakeAdminErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('FakeAdmin')
    );
    expect(fakeAdminErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    // _actors/FakeAdmin does not exist as a compiled node
    expect(result.index.nodes['_actors/FakeAdmin']).toBeUndefined();
    // The error specifically mentions the node doesn't exist
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('FakeAdmin') && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    // The error includes the journey name and step number
    const err = result.issues.find(i => i.message.includes('FakeAdmin'));
    expect(err).toBeDefined();
    expect(err!.journey).toBe('ImpersonationAttempt');
    expect(err!.message).toContain('step 1');
    expect(err!.module).toBe('rogue');
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    // After fixing: replace FakeAdmin with a real actor
    const fixedModule: ModuleFile = {
      nodes: {
        DataStore: { type: 'artifact', description: 'stores sensitive data' },
        Processor: { type: 'process', description: 'processes requests' },
      },
      journeys: {
        ImpersonationAttempt: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'requests data access' },
            { node: 'Processor', action: 'processes with normal privileges' },
            { node: 'DataStore', action: 'accesses data' },
          ],
        },
      },
    };
    const fixedResult = compileFromModules(new Map([
      ['_actors', actorsRegistry],
      ['rogue', fixedModule],
    ]));
    const errors = fixedResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // No dangling FakeAdmin reference
    const fakeRefs = fixedResult.issues.filter(i => i.message.includes('FakeAdmin'));
    expect(fakeRefs.length).toBe(0);
  });

});
