// Auto-generated from journey: ProvideActorsToCompilation
// Module: actors
// Triggered by: _actors/Compiler
// Modules touched: actors, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/compile.ts
// Implementation: src/types.ts

// Set up _actors with actor nodes + a module that references them in journeys
const _actorsModule: ModuleFile = {
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    Compiler: { type: 'actor', description: 'validates the graph' },
  },
  journeys: {},
};

const gatewayModule: ModuleFile = {
  nodes: {
    EntryPoint: { type: 'process', description: 'handles incoming requests' },
    AuthCheck: { type: 'process', description: 'validates credentials' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'initiates login' },
        { node: 'EntryPoint', action: 'receives login request' },
        { node: 'AuthCheck', action: 'validates credentials' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['_actors', _actorsModule],
  ['gateway', gatewayModule],
]));

describe("ProvideActorsToCompilation", () => {
  it("step 1: actors/ActorsFile provides the validated _actors.yaml file on disk", () => {
    // _actors module is loaded and parsed
    expect(result.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(result.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(result.index.nodes['_actors/Compiler']).toBeDefined();
  });

  it("step 2: _actors/Compiler includes _actors.yaml in the set of files to parse", () => {
    // _actors module appears in the compiled stats
    expect(result.index._stats.modules).toBe(2); // _actors + gateway
    expect(result.coverage.modules['_actors']).toBeDefined();
  });

  it("step 3: compilation/YAMLParsing parses _actors.yaml into structured actor node definitions", () => {
    // All 3 actor nodes are parsed with correct types
    for (const name of ['ProjectOwner', 'LLMWorker', 'Compiler']) {
      const node = result.index.nodes[`_actors/${name}`];
      expect(node).toBeDefined();
      expect(node.type).toBe('actor');
      expect(node.module).toBe('_actors');
    }
  });

  it("step 4: graph/NodeDefinition creates a node definition for each discovered actor", () => {
    // Each actor has full CompiledNode fields
    const node = result.index.nodes['_actors/ProjectOwner'];
    expect(node.preceded_by).toBeDefined();
    expect(node.followed_by).toBeDefined();
    expect(node.in_journeys).toBeDefined();
    expect(node.triggered_by_actors).toBeDefined();
    expect(node.cross_module_connections).toBeDefined();
    expect(node.referenced_in_modules).toBeDefined();
  });

  it("step 5: graph/NodeRegistry registers each actor node so _actors/ references in journeys can resolve", () => {
    // The UserLogin journey references _actors/ProjectOwner — it should resolve
    const journey = result.index.journeys['UserLogin'];
    expect(journey).toBeDefined();
    expect(journey.steps[0].node).toBe('_actors/ProjectOwner');
    // No errors about dangling refs to _actors/ProjectOwner
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('ProjectOwner')
    );
    expect(danglingErrors.length).toBe(0);
  });

  it("step 6: graph/CompiledIndex the compiled index now contains all actor nodes alongside module nodes", () => {
    // Total nodes = 3 actors + 2 gateway nodes = 5
    expect(result.index._stats.total_nodes).toBe(5);
    // Actor nodes coexist with process nodes
    const actorNodes = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'actor');
    const processNodes = Object.entries(result.index.nodes).filter(([, n]) => n.type === 'process');
    expect(actorNodes.length).toBe(3);
    expect(processNodes.length).toBe(2);
    // The actor is connected to the gateway module via the journey
    expect(result.index.nodes['_actors/ProjectOwner'].followed_by).toContain('gateway/EntryPoint');
  });
});
