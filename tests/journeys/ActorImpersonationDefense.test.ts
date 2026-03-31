// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ActorImpersonationDefense", () => {
  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    // Rogue worker's module references a non-existent actor
    const rogueModule: ModuleFile = {
      nodes: {
        StolenData: { type: 'artifact', description: 'Data the rogue wants to access' },
      },
      journeys: {
        ImpersonationAttempt: {
          steps: [
            { node: '_actors/FakeAdmin', action: 'impersonates an admin' },
            { node: 'StolenData', action: 'accesses restricted data' },
          ],
        },
      },
    };
    expect(rogueModule.journeys!.ImpersonationAttempt.steps[0].node).toBe('_actors/FakeAdmin');
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Real user' },
          Admin: { type: 'actor', description: 'Real admin' },
        },
      }],
      ['rogue', {
        nodes: { StolenData: { type: 'artifact', description: 'Stolen data' } },
        journeys: {
          Impersonate: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates admin' },
              { node: 'StolenData', action: 'steals data' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Module is stored — compilation ran
    expect(result.index.nodes['rogue/StolenData']).toBeDefined();
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', {
        nodes: { Target: { type: 'process', description: 'Target' } },
        journeys: {
          Attack: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates' },
              { node: 'Target', action: 'is exploited' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Journey was parsed — steps were extracted and resolved
    const journey = result.index.journeys['Attack'];
    expect(journey).toBeDefined();
    expect(journey.module).toBe('rogue');
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', {
        nodes: { Target: { type: 'process', description: 'Target' } },
        journeys: {
          Attack: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates' },
              { node: 'Target', action: 'is exploited' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // _actors/User exists, _actors/FakeAdmin does NOT
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/FakeAdmin']).toBeUndefined();
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', {
        nodes: { Target: { type: 'process', description: 'Target' } },
        journeys: {
          Attack: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates' },
              { node: 'Target', action: 'is exploited' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const fakeAdminErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('FakeAdmin')
    );
    expect(fakeAdminErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', {
        nodes: { Target: { type: 'process', description: 'Target' } },
        journeys: {
          Attack: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates' },
              { node: 'Target', action: 'is exploited' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBeGreaterThanOrEqual(1);
    expect(danglingErrors[0].message).toContain('FakeAdmin');
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', {
        nodes: { Target: { type: 'process', description: 'Target' } },
        journeys: {
          Attack: {
            steps: [
              { node: '_actors/FakeAdmin', action: 'impersonates' },
              { node: 'Target', action: 'is exploited' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const error = result.issues.find(i => i.message.includes('FakeAdmin'));
    expect(error).toBeDefined();
    expect(error!.journey).toBe('Attack');
    expect(error!.module).toBe('rogue');
    expect(error!.message).toContain('step 1');
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    // Fix: replace FakeAdmin with real User in the journey
    const fixedModule: ModuleFile = {
      nodes: { Target: { type: 'process', description: 'Target' } },
      journeys: {
        Attack: {
          steps: [
            { node: '_actors/User', action: 'logs in normally' },
            { node: 'Target', action: 'is accessed legitimately' },
          ],
        },
      },
    };
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'Real user' } },
      }],
      ['rogue', fixedModule],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

});
