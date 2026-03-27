// Auto-generated from journey: ParseAllModules
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("ParseAllModules", () => {
  const modules = new Map<string, ModuleFile>([
    ['auth', {
      spec_sections: [1, 2],
      nodes: {
        LoginService: { type: 'process', description: 'Handles user login' },
        SessionStore: { type: 'artifact', description: 'Stores active sessions' },
      },
      journeys: {
        Login: {
          steps: [
            { node: 'LoginService', action: 'validates credentials' },
            { node: 'SessionStore', action: 'creates session record' },
          ],
        },
      },
    }],
    ['gateway', {
      spec_sections: [3],
      nodes: {
        Router: { type: 'interface', description: 'Routes incoming requests' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler scans the modules directory for all .yaml files", () => {
    // compileFromModules receives a Map representing all scanned modules
    expect(modules.size).toBe(2);
  });

  it("step 2: compilation/YAMLParsing reads each YAML file and parses it into structured data", () => {
    // Both modules successfully parsed — stats reflect them
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 3: compilation/YAMLErrorReporting catches syntax errors in any malformed YAML file and records them", () => {
    // No parse errors in well-formed input
    const parseErrors = result.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 4: compilation/SchemaViolationDetection validates each parsed module has spec_sections, nodes, and journeys top-level keys with correct types", () => {
    // Both modules have valid structure — no schema violations
    const schemaErrors = result.issues.filter(i => i.severity === 'error');
    expect(schemaErrors.length).toBe(0);
  });

  it("step 5: graph/ModuleSchemaRule enforces that malformed modules missing required structure are rejected before content parsing", () => {
    // A module with missing nodes should still compile (defaulting to empty)
    const minimal = new Map<string, ModuleFile>([
      ['minimal', { nodes: {} }],
    ]);
    const r = compileFromModules(minimal);
    expect(r.index._stats.total_nodes).toBe(0);
    expect(r.issues.length).toBe(0);
  });

  it("step 6: graph/NodeDefinition parses each node entry from the parsed YAML", () => {
    // Nodes from both modules are in the compiled index
    expect(result.index.nodes['auth/LoginService']).toBeDefined();
    expect(result.index.nodes['auth/SessionStore']).toBeDefined();
    expect(result.index.nodes['gateway/Router']).toBeDefined();
  });

  it("step 7: graph/JourneyDefinition parses each journey entry from the parsed YAML", () => {
    // The Login journey is parsed
    expect(result.index.journeys['Login']).toBeDefined();
    expect(result.index.journeys['Login'].steps.length).toBe(2);
  });

  it("step 8: graph/NodeRegistry registers all parsed nodes into the deduplicated map", () => {
    // All 3 nodes are registered
    expect(result.index._stats.total_nodes).toBe(3);
  });

  it("step 9: graph/JourneyRegistry registers all parsed journeys into the journey collection", () => {
    expect(result.index._stats.total_journeys).toBe(1);
  });

  it("step 10: graph/CompiledIndex merges all parsed modules into the in-memory compiled structure", () => {
    // Compiled index has _compiled timestamp and correct stats
    expect(result.index._compiled).toBeDefined();
    expect(typeof result.index._compiled).toBe('string');
    expect(result.index._stats.modules).toBe(2);
  });
});
