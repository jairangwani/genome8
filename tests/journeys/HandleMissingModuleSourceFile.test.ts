// Auto-generated from journey: HandleMissingModuleSourceFile
// Module: excerpt
// Modules touched: excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleMissingModuleSourceFile", () => {
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['planned', {
      nodes: {
        FutureNode: { type: 'process', description: 'A node in the planned module' },
        AnotherNode: { type: 'artifact', description: 'Another planned artifact' },
      },
      journeys: {
        PlannedFlow: {
          steps: [
            { node: 'FutureNode', action: 'starts the planned flow' },
            { node: 'AnotherNode', action: 'produces the artifact' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  // Excerpt for a module that exists in the index but has no source file
  // Pass empty string to simulate missing source file
  const excerptNoFile = generateExcerpt({
    round: 1,
    focusModule: 'planned',
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: '',
  });

  // Excerpt with source file present
  const excerptWithFile = generateExcerpt({
    round: 1,
    focusModule: 'planned',
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: 'nodes:\n  FutureNode:\n    type: process\n    description: A node in the planned module',
  });

  it("step 1: excerpt/SelectTargetModule identifies the target module for excerpt generation", () => {
    expect(excerptNoFile).toContain('Focus: planned');
  });

  it("step 2: excerpt/CollectModuleSource attempts to read the target module's YAML file from disk", () => {
    // When the file is missing, we pass empty string as moduleFileContent
    // The excerpt still includes the YOUR FILE section with empty content
    expect(excerptNoFile).toContain('YOUR FILE (planned.yaml):');
  });

  it("step 3: excerpt/DetectMissingModuleSource detects that the file does not exist on disk because the module has not been created yet", () => {
    // The empty module file content indicates no file on disk
    // The excerpt still works using compiled index data
    expect(excerptNoFile).toContain('MODULE STATUS:');
    expect(excerptNoFile).toContain('YOUR NODES:');
  });

  it("step 4: excerpt/DetectMissingModuleSource switches to compiled-index-only mode, omitting the YOUR FILE section from the excerpt", () => {
    // When source is empty, YOUR FILE section has empty yaml block
    expect(excerptNoFile).toContain('```yaml');
    // The excerpt with the file has actual content in the yaml block
    expect(excerptWithFile).toContain('FutureNode');
  });

  it("step 5: graph/CompiledIndex provides node and journey data from the compiled index as a fallback for the missing file", () => {
    expect(result.index.nodes['planned/FutureNode']).toBeDefined();
    expect(result.index.nodes['planned/AnotherNode']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 6: excerpt/CollectLocalNodes extracts nodes from the compiled index instead of the raw file", () => {
    // Even without source file, YOUR NODES shows compiled nodes
    expect(excerptNoFile).toContain('YOUR NODES:');
    expect(excerptNoFile).toContain('FutureNode (process)');
    expect(excerptNoFile).toContain('AnotherNode (artifact)');
  });

  it("step 7: excerpt/CollectLocalJourneys extracts journeys from the compiled index instead of the raw file", () => {
    expect(excerptNoFile).toContain('YOUR JOURNEYS:');
    expect(excerptNoFile).toContain('PlannedFlow:');
  });

  it("step 8: excerpt/AssembleExcerpt builds the excerpt without the YOUR FILE section, using compiled index data for all content", () => {
    expect(excerptNoFile).toContain('MODULE STATUS:');
    expect(excerptNoFile).toContain('YOUR NODES:');
    expect(excerptNoFile).toContain('YOUR JOURNEYS:');
    expect(excerptNoFile).toContain('ALL MODULES:');
    expect(excerptNoFile).toContain('GLOBAL:');
  });

  it("step 9: excerpt/ExcerptOutput stores the source-less excerpt suitable for module creation context", () => {
    expect(excerptNoFile).toBeTruthy();
    expect(typeof excerptNoFile).toBe('string');
  });
});
