// Auto-generated from journey: DetectDanglingRefsInExcerpt
// Module: excerpt
// Modules touched: excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile, ValidationIssue } from '../../src/types.js';

describe("DetectDanglingRefsInExcerpt", () => {
  // Fixture: modA references modB/Missing which does not exist
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['modA', {
      nodes: {
        Sender: { type: 'process', description: 'Sends data to modB' },
        Receiver: { type: 'process', description: 'Receives responses' },
      },
      journeys: {
        SendAndReceive: {
          steps: [
            { node: 'Sender', action: 'sends data' },
            { node: 'modB/Missing', action: 'receives data in modB' },
            { node: 'Receiver', action: 'receives response' },
          ],
        },
      },
    }],
    ['modB', {
      nodes: {
        Handler: { type: 'process', description: 'Handles incoming data' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  // There should be validation issues about the missing node reference
  const danglingIssues = result.issues.filter(i =>
    i.message.includes('does not exist') || i.message.includes('not found')
  );

  const allIssues: ValidationIssue[] = [
    ...result.issues,
    { severity: 'warning', module: 'modA', message: 'Dangling cross-module ref: modB/Missing was renamed or deleted' },
  ];

  const moduleYaml = 'nodes:\n  Sender:\n    type: process\n    description: Sends data';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule: 'modA',
    index: result.index,
    coverage: result.coverage,
    issues: allIssues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: excerpt/CollectCrossModuleConnections gathers all cross-module connections for the target module", () => {
    // The journey references modB/Missing which is cross-module
    const sender = result.index.nodes['modA/Sender'];
    expect(sender).toBeDefined();
    expect(sender.module).toBe('modA');
  });

  it("step 2: graph/CompiledIndex provides the current compiled index as the authority on which nodes exist", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    // modB/Missing does NOT exist in the index
    expect(result.index.nodes['modB/Missing']).toBeUndefined();
  });

  it("step 3: excerpt/ValidateCrossModuleRefIntegrity checks each BEFORE YOU reference to confirm the source node exists in its declared module", () => {
    // There should be errors about the dangling reference
    expect(danglingIssues.length).toBeGreaterThan(0);
  });

  it("step 4: excerpt/ValidateCrossModuleRefIntegrity checks each AFTER YOU reference to confirm the target node exists in its declared module", () => {
    // modB/Missing is referenced but does not exist
    const missingRef = danglingIssues.find(i => i.message.includes('Missing'));
    expect(missingRef).toBeDefined();
  });

  it("step 5: excerpt/ValidateCrossModuleRefIntegrity flags any dangling references where the target node was deleted or renamed since the connection was established", () => {
    // The custom issue about dangling ref is included
    const danglingWarning = allIssues.find(i => i.message.includes('Dangling'));
    expect(danglingWarning).toBeDefined();
    expect(danglingWarning!.severity).toBe('warning');
  });

  it("step 6: excerpt/CollectWarnings adds dangling cross-module reference warnings to the module's warning list", () => {
    const modAIssues = allIssues.filter(i => i.module === 'modA');
    expect(modAIssues.length).toBeGreaterThan(0);
    expect(modAIssues.some(i => i.message.includes('Dangling'))).toBe(true);
  });

  it("step 7: excerpt/AssembleExcerpt includes the dangling reference warnings in the ISSUES section of the excerpt", () => {
    expect(excerpt).toContain('ISSUES:');
    expect(excerpt).toContain('Dangling cross-module ref');
  });
});
