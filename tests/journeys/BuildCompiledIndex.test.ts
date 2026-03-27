// Auto-generated from journey: BuildCompiledIndex
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("BuildCompiledIndex", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Reads and compiles all module YAML files' },
      },
      journeys: {},
    }],
    ['auth', {
      spec_sections: [3, 4],
      nodes: {
        LoginForm: { type: 'interface', description: 'Login form UI', files: ['src/login.ts'] },
        AuthProcess: { type: 'process', description: 'Authenticates credentials' },
      },
      journeys: {
        Authenticate: {
          steps: [
            { node: '_actors/Compiler', action: 'reads all module YAML files from the modules directory' },
            { node: 'LoginForm', action: 'provides raw YAML content for each module' },
            { node: 'AuthProcess', action: 'parses every node entry from every module' },
          ],
        },
      },
    }],
    ['data', {
      spec_sections: [5],
      nodes: {
        DataStore: { type: 'artifact', description: 'Persistent storage' },
        QueryEngine: { type: 'process', description: 'Runs queries against the data store' },
      },
      journeys: {
        FetchData: {
          steps: [
            { node: '_actors/Compiler', action: 'initiates data fetch' },
            { node: 'QueryEngine', action: 'runs a query' },
            { node: 'DataStore', action: 'returns results' },
            { node: 'auth/AuthProcess', action: 'validates access' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler reads all module YAML files from the modules directory", () => {
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler).toBeDefined();
    expect(compiler.type).toBe('actor');
    // Compiler triggers both journeys
    expect(compiler.in_journeys.length).toBeGreaterThanOrEqual(2);
  });

  it("step 2: graph/ModuleFile provides raw YAML content for each module", () => {
    // All 3 modules are represented in the compiled index
    expect(result.index._stats.modules).toBe(3);
  });

  it("step 3: graph/NodeDefinition parses every node entry from every module", () => {
    // 5 nodes total: Compiler + LoginForm + AuthProcess + DataStore + QueryEngine
    expect(result.index._stats.total_nodes).toBe(5);
    expect(result.index.nodes['auth/LoginForm']).toBeDefined();
    expect(result.index.nodes['data/DataStore']).toBeDefined();
  });

  it("step 4: graph/NodeTypeSchema validates all node types are legal", () => {
    const validTypes = ['actor', 'process', 'artifact', 'interface', 'rule'];
    for (const node of Object.values(result.index.nodes)) {
      expect(validTypes).toContain(node.type);
    }
    const typeErrors = result.issues.filter(i => i.message.includes('Invalid type'));
    expect(typeErrors).toHaveLength(0);
  });

  it("step 5: graph/JourneyDefinition parses every journey from every module", () => {
    expect(result.index._stats.total_journeys).toBe(2);
    expect(result.index.journeys['Authenticate']).toBeDefined();
    expect(result.index.journeys['FetchData']).toBeDefined();
  });

  it("step 6: graph/StepFormatRule validates all steps have node and action fields", () => {
    for (const journey of Object.values(result.index.journeys)) {
      for (const step of journey.steps) {
        expect(step.node).toBeTruthy();
        expect(step.action).toBeTruthy();
        expect(step.step_number).toBeGreaterThan(0);
      }
    }
  });

  it("step 7: graph/ConnectionComputation computes all connections from all journey steps", () => {
    // Authenticate: 3 steps = 2 edges; FetchData: 4 steps = 3 edges
    // But Compiler->LoginForm edge from Authenticate and Compiler->QueryEngine from FetchData are separate
    expect(result.index._stats.total_connections).toBeGreaterThanOrEqual(5);
  });

  it("step 8: graph/CrossModuleRefResolution resolves all cross-module node references", () => {
    // FetchData references auth/AuthProcess from the data module
    const authProcess = result.index.nodes['auth/AuthProcess'];
    expect(authProcess.cross_module_connections.length).toBeGreaterThan(0);

    // resolveNodeRef parses cross-module reference
    const ref = resolveNodeRef('auth/AuthProcess', 'data');
    expect(ref.module).toBe('auth');
    expect(ref.name).toBe('AuthProcess');
  });

  it("step 9: graph/ActorRefResolution resolves all actor references", () => {
    // Both journeys start with _actors/Compiler
    expect(result.index.journeys['Authenticate'].actor).toBe('_actors/Compiler');
    expect(result.index.journeys['FetchData'].actor).toBe('_actors/Compiler');
  });

  it("step 10: graph/NodeRegistry builds the deduplicated node map", () => {
    // Each node has a unique full key
    const keys = Object.keys(result.index.nodes);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it("step 11: graph/JourneyRegistry builds the journey collection", () => {
    const journeyNames = Object.keys(result.index.journeys);
    expect(journeyNames).toContain('Authenticate');
    expect(journeyNames).toContain('FetchData');
  });

  it("step 12: graph/ConnectionSet builds the edge set", () => {
    // LoginForm follows Compiler in Authenticate journey
    const loginForm = result.index.nodes['auth/LoginForm'];
    expect(loginForm.preceded_by).toContain('_actors/Compiler');
    expect(loginForm.followed_by).toContain('auth/AuthProcess');
  });

  it("step 13: graph/CompiledIndex merges nodes, journeys, and connections into the final compiled structure", () => {
    expect(result.index._compiled).toBeTruthy();
    expect(result.index._stats).toBeDefined();
    expect(result.index.nodes).toBeDefined();
    expect(result.index.journeys).toBeDefined();

    // Coverage is also computed
    expect(result.coverage).toBeDefined();
    expect(result.coverage.modules['auth']).toBeDefined();
    expect(result.coverage.modules['data']).toBeDefined();
  });
});
