// Auto-generated from journey: RejectInvalidNodeType
// Module: graph
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RejectInvalidNodeType", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'Developer who writes YAML' },
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        GoodNode: { type: 'process', description: 'A valid process node' },
        BadNode: { type: 'widget' as any, description: 'Has an invalid type' },
        AnotherBad: { type: 'service' as any, description: 'Also invalid type' },
      },
      journeys: {
        UseNodes: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'writes nodes with invalid types' },
            { node: 'GoodNode', action: 'processes data' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/HumanDeveloper writes a node entry with a type value not in the 5 universal types", () => {
    expect(result.index.nodes['_actors/HumanDeveloper']).toBeDefined();
    // The bad nodes are still collected, but flagged
    expect(result.index.nodes['mymod/BadNode']).toBeDefined();
    expect(result.index.nodes['mymod/AnotherBad']).toBeDefined();
  });

  it("step 2: graph/NodeDefinition parses the node entry and extracts the type field", () => {
    const badNode = result.index.nodes['mymod/BadNode'];
    expect(badNode.type).toBe('widget');

    const goodNode = result.index.nodes['mymod/GoodNode'];
    expect(goodNode.type).toBe('process');
  });

  it("step 3: graph/NodeTypeSchema rejects the node because the type is not actor, process, artifact, interface, or rule", () => {
    const typeErrors = result.issues.filter(
      i => i.severity === 'error' && i.message.includes('Invalid type')
    );
    expect(typeErrors.length).toBe(2);

    const widgetError = typeErrors.find(i => i.message.includes('widget'));
    expect(widgetError).toBeDefined();
    expect(widgetError!.node).toBe('BadNode');

    const serviceError = typeErrors.find(i => i.message.includes('service'));
    expect(serviceError).toBeDefined();
    expect(serviceError!.node).toBe('AnotherBad');
  });

  it("step 4: _actors/Compiler reports a validation error identifying the invalid node type and its location", () => {
    const typeErrors = result.issues.filter(
      i => i.severity === 'error' && i.message.includes('Invalid type')
    );
    // Each error identifies the module
    for (const err of typeErrors) {
      expect(err.module).toBe('mymod');
    }
    // The error message includes the valid types
    expect(typeErrors[0].message).toContain('actor');
    expect(typeErrors[0].message).toContain('process');
    expect(typeErrors[0].message).toContain('artifact');
    expect(typeErrors[0].message).toContain('interface');
    expect(typeErrors[0].message).toContain('rule');
  });
});
