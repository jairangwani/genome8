// Auto-generated from journey: DefineNode
// Module: graph
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("DefineNode", () => {
  // Shared fixture: a developer writes a node entry in a module YAML
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'A developer who writes module YAML files' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        NodeDefinition: { type: 'process', description: 'Parses a node entry and validates name, type, description' },
        NodeTypeSchema: { type: 'rule', description: 'Checks that the type is one of the 5 universal types' },
        NodeRegistry: { type: 'artifact', description: 'Deduplicated map of all nodes' },
      },
      journeys: {
        DefineNode: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'writes a node entry in a module YAML file with name, type, and description' },
            { node: 'NodeDefinition', action: 'parses the node entry and validates it has a name, type, and description' },
            { node: 'NodeTypeSchema', action: 'checks that the type is one of the 5 universal types' },
            { node: 'NodeRegistry', action: 'registers the node in the deduplicated map of all nodes' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/HumanDeveloper writes a node entry in a module YAML file with name, type, and description", () => {
    // The actor node exists and is type 'actor'
    const actor = result.index.nodes['_actors/HumanDeveloper'];
    expect(actor).toBeDefined();
    expect(actor.type).toBe('actor');
    expect(actor.module).toBe('_actors');
  });

  it("step 2: graph/NodeDefinition parses the node entry and validates it has a name, type, and description", () => {
    // NodeDefinition is parsed as a process node with a description
    const nodeDef = result.index.nodes['graph/NodeDefinition'];
    expect(nodeDef).toBeDefined();
    expect(nodeDef.type).toBe('process');
    expect(nodeDef.description).toBeTruthy();
    expect(nodeDef.module).toBe('graph');
  });

  it("step 3: graph/NodeTypeSchema checks that the type is one of the 5 universal types", () => {
    // All nodes should have valid types — no errors about invalid types
    const typeErrors = result.issues.filter(i => i.message.includes('Invalid type'));
    expect(typeErrors).toHaveLength(0);

    // Each compiled node has a type from the valid set
    const validTypes = ['actor', 'process', 'artifact', 'interface', 'rule'];
    for (const node of Object.values(result.index.nodes)) {
      expect(validTypes).toContain(node.type);
    }
  });

  it("step 4: graph/NodeRegistry registers the node in the deduplicated map of all nodes", () => {
    // All 4 nodes across both modules are registered
    expect(Object.keys(result.index.nodes)).toHaveLength(4);
    expect(result.index.nodes['_actors/HumanDeveloper']).toBeDefined();
    expect(result.index.nodes['graph/NodeDefinition']).toBeDefined();
    expect(result.index.nodes['graph/NodeTypeSchema']).toBeDefined();
    expect(result.index.nodes['graph/NodeRegistry']).toBeDefined();

    // No duplicate name issues
    const dupeIssues = result.issues.filter(i => i.message.includes('Duplicate'));
    expect(dupeIssues).toHaveLength(0);
  });
});
