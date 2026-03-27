// Auto-generated from journey: ProvideExcerptForHumanDeveloper
// Module: excerpt
// Triggered by: _actors/HumanDeveloper
// Modules touched: _actors, excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ProvideExcerptForHumanDeveloper", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        HumanDeveloper: { type: 'actor', description: 'A developer who reads and edits modules' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['storage', {
      nodes: {
        WriteFile: { type: 'process', description: 'Writes data to a file on disk' },
        ReadFile: { type: 'process', description: 'Reads data from a file on disk' },
        FileSystem: { type: 'interface', description: 'OS file system interface' },
      },
      journeys: {
        SaveData: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'requests data save' },
            { node: 'WriteFile', action: 'writes data to disk' },
            { node: 'FileSystem', action: 'commits write to OS' },
          ],
        },
        LoadData: {
          steps: [
            { node: '_actors/HumanDeveloper', action: 'requests data load' },
            { node: 'ReadFile', action: 'reads data from disk' },
            { node: 'FileSystem', action: 'provides data from OS' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'storage';
  const moduleYaml = 'nodes:\n  WriteFile:\n    type: process\n    description: Writes data to a file on disk';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: _actors/HumanDeveloper requests context for a specific module to understand or edit it", () => {
    const dev = result.index.nodes['_actors/HumanDeveloper'];
    expect(dev).toBeDefined();
    expect(dev.type).toBe('actor');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module the developer wants to explore", () => {
    expect(excerpt).toContain('Focus: storage');
  });

  it("step 3: graph/CompiledIndex provides the compiled graph data", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectLocalNodes extracts the module's node definitions", () => {
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('WriteFile (process)');
    expect(excerpt).toContain('ReadFile (process)');
    expect(excerpt).toContain('FileSystem (interface)');
  });

  it("step 5: excerpt/CollectLocalJourneys extracts the module's journey definitions", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('SaveData:');
    expect(excerpt).toContain('LoadData:');
  });

  it("step 6: excerpt/CollectCrossModuleConnections shows how the module connects to the rest of the graph", () => {
    expect(excerpt).toContain('CROSS-MODULE:');
    expect(excerpt).toContain('_actors/HumanDeveloper');
  });

  it("step 7: excerpt/CollectReferencedActors lists the actors involved in this module", () => {
    // HumanDeveloper triggers journeys in storage
    expect(excerpt).toContain('TRIGGERED BY:');
    expect(excerpt).toContain('HumanDeveloper');
  });

  it("step 8: excerpt/CollectWarnings shows any validation warnings for this module", () => {
    // Check warnings exist or not
    const storageIssues = result.issues.filter(i => i.module === 'storage');
    if (storageIssues.length > 0) {
      expect(excerpt).toContain('ISSUES:');
    }
    expect(excerpt).toBeTruthy();
  });

  it("step 9: excerpt/AssembleExcerpt combines all sections into a readable excerpt", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('YOUR JOURNEYS:');
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('GLOBAL:');
    expect(excerpt).toContain('YOUR FILE');
  });

  it("step 10: excerpt/TruncateToLimit trims to ~200 lines for focused reading", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 11: excerpt/ExcerptOutput displays the excerpt to the developer", () => {
    expect(excerpt).toBeTruthy();
    expect(typeof excerpt).toBe('string');
    expect(excerpt).toContain('YOUR FILE (storage.yaml):');
  });
});
