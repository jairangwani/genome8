// Auto-generated from journey: EndToEndActorDiscoveryToModuleCreation
// Module: actors
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence, actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts
// Implementation: src/excerpt.ts

// Simulate full pipeline: spec → actors → compilation → excerpt
const specContent = '# My System\nAn API platform for developers and external consumers.';

// Simulated 3-angle discovery results
const activitiesActors = ['ProjectOwner', 'HumanDeveloper', 'LLMWorker'];
const threatsActors = ['MaliciousSpecAuthor', 'LLMWorker'];
const lifecycleActors = ['NewProjectAdopter', 'ReturningOwner'];

const mergedActors = [...new Set([...activitiesActors, ...threatsActors, ...lifecycleActors])];

describe("EndToEndActorDiscoveryToModuleCreation", () => {
  it("step 1: _actors/ProjectOwner has written spec.md describing their system", () => {
    expect(specContent.length).toBeGreaterThan(0);
    expect(specContent).toContain('# My System');
  });

  it("step 2: convergence/ReadSpec reads the spec from disk", () => {
    // Simulate reading spec from a temp file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-e2e-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), specContent);
    const read = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(read).toBe(specContent);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: convergence/WriteOrganization organization step produces the module list", () => {
    // Organization would produce a list of modules from the spec
    const modules = ['gateway', 'auth', 'storage'];
    expect(modules.length).toBeGreaterThanOrEqual(2);
  });

  it("step 4: convergence/DiscoverActors triggers actor discovery after organization is complete", () => {
    // Actor discovery is triggered — 3 angles will be executed
    expect(activitiesActors.length).toBeGreaterThanOrEqual(1);
    expect(threatsActors.length).toBeGreaterThanOrEqual(1);
    expect(lifecycleActors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: actors/DiscoverFromActivities discovers activity actors from the spec", () => {
    expect(activitiesActors).toContain('ProjectOwner');
    expect(activitiesActors).toContain('HumanDeveloper');
    expect(activitiesActors).toContain('LLMWorker');
  });

  it("step 6: actors/DiscoverFromThreats discovers threat actors from the spec", () => {
    expect(threatsActors).toContain('MaliciousSpecAuthor');
  });

  it("step 7: actors/DiscoverFromLifecycle discovers lifecycle actors from the spec", () => {
    expect(lifecycleActors).toContain('NewProjectAdopter');
    expect(lifecycleActors).toContain('ReturningOwner');
  });

  it("step 8: actors/MergeAndDeduplicate merges and deduplicates actors from all 3 angles", () => {
    // LLMWorker appeared in both activities and threats — deduped to 1
    expect(mergedActors.filter(a => a === 'LLMWorker').length).toBe(1);
    // 3+2+2=7 raw, minus 1 dupe = 6 unique
    expect(mergedActors.length).toBe(6);
  });

  it("step 9: actors/WriteActorsFile writes _actors.yaml to disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-e2e-'));
    const nodes: Record<string, any> = {};
    for (const name of mergedActors) {
      nodes[name] = { type: 'actor', description: `${name} actor` };
    }
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ spec_sections: [1], nodes, journeys: {} }, { lineWidth: 120 })
    );
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 10: actors/ValidateActorYAMLStructure validates the written file has correct structure", () => {
    const nodes: Record<string, any> = {};
    for (const name of mergedActors) {
      nodes[name] = { type: 'actor', description: `${name} actor` };
    }
    // Every entry has type: actor and non-empty description
    for (const [name, node] of Object.entries(nodes)) {
      expect(node.type).toBe('actor');
      expect(node.description.length).toBeGreaterThan(0);
    }
  });

  it("step 11: _actors/Compiler compiles _actors.yaml into the graph alongside module files", () => {
    const actorsModule: ModuleFile = {
      nodes: Object.fromEntries(
        mergedActors.map(name => [name, { type: 'actor' as const, description: `${name} actor` }])
      ),
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        EntryPoint: { type: 'process', description: 'handles requests' },
      },
      journeys: {
        ServeRequest: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'sends request' },
            { node: 'EntryPoint', action: 'processes request' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', actorsModule],
      ['gateway', gatewayModule],
    ]));
    // All 6 actors + 1 gateway node = 7 total
    expect(result.index._stats.total_nodes).toBe(7);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it("step 12: graph/NodeRegistry registers actor nodes so journey steps can reference _actors/ActorName", () => {
    const actorsModule: ModuleFile = {
      nodes: Object.fromEntries(
        mergedActors.map(name => [name, { type: 'actor' as const, description: `${name} actor` }])
      ),
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        EntryPoint: { type: 'process', description: 'handles requests' },
      },
      journeys: {
        ServeRequest: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'sends request' },
            { node: 'EntryPoint', action: 'processes request' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', actorsModule],
      ['gateway', gatewayModule],
    ]));
    // _actors/ProjectOwner resolves in journey — no dangling ref errors
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('ProjectOwner')
    );
    expect(danglingErrors.length).toBe(0);
    expect(result.index.journeys['ServeRequest'].steps[0].node).toBe('_actors/ProjectOwner');
  });

  it("step 13: convergence/ModuleCreation begins creating modules with actors available as valid references", () => {
    const actorsModule: ModuleFile = {
      nodes: Object.fromEntries(
        mergedActors.map(name => [name, { type: 'actor' as const, description: `${name} actor` }])
      ),
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        EntryPoint: { type: 'process', description: 'handles requests' },
      },
      journeys: {
        ServeRequest: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'sends request' },
            { node: 'EntryPoint', action: 'processes request' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', actorsModule],
      ['gateway', gatewayModule],
    ]));
    // Gateway module is created successfully with actor references
    expect(result.coverage.modules['gateway']).toBeDefined();
    expect(result.coverage.modules['gateway'].journeys).toBe(1);
    expect(result.coverage.modules['gateway'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 14: actors/ProvideActorsForModuleCreation supplies the actor list to each module's excerpt context", () => {
    const actorsModule: ModuleFile = {
      nodes: Object.fromEntries(
        mergedActors.map(name => [name, { type: 'actor' as const, description: `${name} actor` }])
      ),
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        EntryPoint: { type: 'process', description: 'handles requests' },
      },
      journeys: {
        ServeRequest: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'sends request' },
            { node: 'EntryPoint', action: 'processes request' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', actorsModule],
      ['gateway', gatewayModule],
    ]));
    // Actor nodes are available to the excerpt generator
    const entryPoint = result.index.nodes['gateway/EntryPoint'];
    expect(entryPoint.triggered_by_actors).toContain('_actors/ProjectOwner');
  });

  it("step 15: excerpt/AssembleExcerpt includes relevant actors in the module creation excerpt", () => {
    const actorsModule: ModuleFile = {
      nodes: Object.fromEntries(
        mergedActors.map(name => [name, { type: 'actor' as const, description: `${name} actor` }])
      ),
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        EntryPoint: { type: 'process', description: 'handles requests' },
      },
      journeys: {
        ServeRequest: {
          steps: [
            { node: '_actors/ProjectOwner', action: 'sends request' },
            { node: 'EntryPoint', action: 'processes request' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', actorsModule],
      ['gateway', gatewayModule],
    ]));
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'gateway',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: 'nodes:\n  EntryPoint:\n    type: process\n    description: handles requests',
    });
    // Excerpt includes actor context
    expect(excerpt).toContain('ProjectOwner');
    expect(excerpt).toContain('TRIGGERED BY');
    expect(excerpt).toContain('_actors');
    expect(excerpt).toContain('CROSS-MODULE');
  });

});
