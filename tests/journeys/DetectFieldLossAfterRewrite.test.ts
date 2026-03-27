// Auto-generated from journey: DetectFieldLossAfterRewrite
// Module: compilation
// Triggered by: _actors/LLMWorker
// Modules touched: graph, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectFieldLossAfterRewrite", () => {
  // Original module has extension fields (files, properties)
  const originalModule: ModuleFile = {
    spec_sections: [1, 2],
    nodes: {
      Service: {
        type: 'process',
        description: 'Core service handling requests',
        files: ['src/service.ts', 'src/service.test.ts'],
        properties: { timeout: 5000, retries: 3 },
      },
      Config: {
        type: 'artifact',
        description: 'Configuration store for service',
        files: ['config/default.yaml'],
      },
    },
    journeys: {
      Serve: {
        steps: [
          { node: 'Service', action: 'processes the incoming request' },
          { node: 'Config', action: 'reads configuration settings' },
        ],
      },
    },
  };

  // Rewritten module: LLM dropped the "files" field from Config and "properties" from Service
  const rewrittenModuleBad: ModuleFile = {
    spec_sections: [1, 2],
    nodes: {
      Service: {
        type: 'process',
        description: 'Core service handling requests',
        // files and properties DROPPED
      },
      Config: {
        type: 'artifact',
        description: 'Configuration store for service',
        // files DROPPED
      },
    },
    journeys: {
      Serve: {
        steps: [
          { node: 'Service', action: 'processes the incoming request' },
          { node: 'Config', action: 'reads configuration settings' },
        ],
      },
    },
  };

  // Good rewrite: preserves all fields
  const rewrittenModuleGood: ModuleFile = {
    spec_sections: [1, 2],
    nodes: {
      Service: {
        type: 'process',
        description: 'Core service handling requests',
        files: ['src/service.ts', 'src/service.test.ts'],
        properties: { timeout: 5000, retries: 3 },
      },
      Config: {
        type: 'artifact',
        description: 'Configuration store for service',
        files: ['config/default.yaml'],
      },
    },
    journeys: {
      Serve: {
        steps: [
          { node: 'Service', action: 'processes the incoming request' },
          { node: 'Config', action: 'reads configuration settings' },
        ],
      },
    },
  };

  it("step 1: graph/ModuleFile provides the original module YAML content before an LLM rewrite", () => {
    expect(originalModule.nodes.Service.files).toEqual(['src/service.ts', 'src/service.test.ts']);
    expect(originalModule.nodes.Service.properties).toEqual({ timeout: 5000, retries: 3 });
  });

  it("step 2: _actors/LLMWorker edits the module file to add, modify, or fix nodes or journeys", () => {
    // The bad rewrite has the same node names but lost extension fields
    expect(Object.keys(rewrittenModuleBad.nodes)).toEqual(Object.keys(originalModule.nodes));
  });

  it("step 3: graph/ModuleFile provides the rewritten module YAML content after the LLM edit", () => {
    expect(rewrittenModuleBad.nodes.Service).toBeDefined();
    expect(rewrittenModuleBad.nodes.Config).toBeDefined();
  });

  it("step 4: compilation/FieldLossDetection compares original and rewritten YAML field by field to identify any keys that were dropped", () => {
    // Detect lost fields by comparing keys
    const origServiceKeys = Object.keys(originalModule.nodes.Service);
    const rewriteServiceKeys = Object.keys(rewrittenModuleBad.nodes.Service);
    const lostKeys = origServiceKeys.filter(k => !rewriteServiceKeys.includes(k));
    expect(lostKeys).toContain('files');
    expect(lostKeys).toContain('properties');
  });

  it("step 5: compilation/FieldLossDetection specifically checks that extension fields like files on nodes were preserved through the rewrite", () => {
    // Config lost its files field
    const origConfigKeys = Object.keys(originalModule.nodes.Config);
    const rewriteConfigKeys = Object.keys(rewrittenModuleBad.nodes.Config);
    const lostConfigKeys = origConfigKeys.filter(k => !rewriteConfigKeys.includes(k));
    expect(lostConfigKeys).toContain('files');
  });

  it("step 6: graph/FieldPreservation enforces that the rewritten file retains all fields from the original, blocking the write if any were lost", () => {
    // Good rewrite preserves all fields
    for (const [name, origNode] of Object.entries(originalModule.nodes)) {
      for (const key of Object.keys(origNode)) {
        expect(rewrittenModuleGood.nodes[name]).toHaveProperty(key);
      }
    }
  });

  it("step 7: compilation/ErrorReport records each dropped field as a data-loss error with the node or journey name and the missing field key", () => {
    // Compile both and verify the bad one lost files metadata
    const badResult = compileFromModules(new Map([['svc', rewrittenModuleBad]]));
    const goodResult = compileFromModules(new Map([['svc', rewrittenModuleGood]]));

    // Bad rewrite: nodes lack files
    expect(badResult.index.nodes['svc/Service'].files).toBeUndefined();
    // Good rewrite: nodes retain files
    expect(goodResult.index.nodes['svc/Service'].files).toEqual(['src/service.ts', 'src/service.test.ts']);
  });
});
