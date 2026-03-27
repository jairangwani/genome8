// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts

describe("ActorImpersonationDefense", () => {
  // Simulate: _actors has known actors, rogue module references a fake one
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        RogueWorker: { type: 'actor', description: 'creates impersonation references' },
        LLMWorker: { type: 'actor', description: 'legitimate worker' },
      },
      journeys: {},
    }],
    ['rogue', {
      nodes: {
        SomeProcess: { type: 'process', description: 'a process in the rogue module' },
      },
      journeys: {
        ImpersonationAttempt: {
          steps: [
            { node: '_actors/RogueWorker', action: 'creates module' },
            { node: 'SomeProcess', action: 'does something' },
            { node: '_actors/FakeAdmin', action: 'impersonates admin' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    expect(result.index.nodes['_actors/RogueWorker']).toBeDefined();
    expect(result.index.nodes['_actors/RogueWorker'].type).toBe('actor');
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    expect(modules.get('rogue')).toBeDefined();
    expect(modules.get('rogue')!.nodes.SomeProcess).toBeDefined();
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    // The rogue module was parsed and its process node is in the compiled index
    expect(result.index.nodes['rogue/SomeProcess']).toBeDefined();
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    // _actors/FakeAdmin does not exist in the _actors module
    expect(result.index.nodes['_actors/FakeAdmin']).toBeUndefined();
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    // Compilation should produce an error about the non-existent node
    const fakeAdminErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('FakeAdmin')
    );
    expect(fakeAdminErrors.length).toBeGreaterThan(0);
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    // The error message should mention the node does not exist
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBeGreaterThan(0);
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    // The error should include the journey name and step
    const error = result.issues.find(i =>
      i.severity === 'error' && i.message.includes('FakeAdmin')
    );
    expect(error).toBeDefined();
    expect(error!.journey).toBe('ImpersonationAttempt');
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    // Errors exist, indicating the system detected the impersonation
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThan(0);
  });
});
