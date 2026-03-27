// Auto-generated from journey: ValidateAssembledExcerpt
// Module: excerpt
// Modules touched: excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateAssembledExcerpt", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user' },
      },
      journeys: {},
    }],
    ['mymod', {
      nodes: {
        ProcessA: { type: 'process', description: 'First process' },
        ArtifactB: { type: 'artifact', description: 'Output artifact' },
      },
      journeys: {
        MainFlow: {
          steps: [
            { node: '_actors/User', action: 'initiates flow' },
            { node: 'ProcessA', action: 'processes input' },
            { node: 'ArtifactB', action: 'stores result' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const moduleYaml = 'nodes:\n  ProcessA:\n    type: process\n    description: First process\n  ArtifactB:\n    type: artifact\n    description: Output artifact';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule: 'mymod',
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: excerpt/AssembleExcerpt produces a structured excerpt from the collected sections", () => {
    expect(excerpt).toBeTruthy();
    expect(excerpt).toContain('ROUND 1');
    expect(excerpt).toContain('Focus: mymod');
  });

  it("step 2: excerpt/ValidateExcerptCompleteness checks that the YOUR NODES section is present and non-empty for modules that define nodes", () => {
    expect(excerpt).toContain('YOUR NODES:');
    // It should list the module's nodes
    const nodesSection = excerpt.split('YOUR NODES:')[1]?.split('\n\n')[0] ?? '';
    expect(nodesSection).toContain('ProcessA');
    expect(nodesSection).toContain('ArtifactB');
  });

  it("step 3: excerpt/ValidateExcerptCompleteness checks that the YOUR JOURNEYS section is present and non-empty for modules that define journeys", () => {
    expect(excerpt).toContain('YOUR JOURNEYS:');
    const journeySection = excerpt.split('YOUR JOURNEYS:')[1]?.split('\n\n')[0] ?? '';
    expect(journeySection).toContain('MainFlow');
  });

  it("step 4: excerpt/ValidateExcerptCompleteness checks that the CROSS-MODULE section is present for modules with cross-module connections in the compiled index", () => {
    // mymod has cross-module connections to _actors/User
    const cov = result.coverage.modules['mymod'];
    expect(cov.cross_module_connections).toBeGreaterThan(0);
    expect(excerpt).toContain('CROSS-MODULE:');
  });

  it("step 5: excerpt/ValidateExcerptSectionOrder checks that sections appear in the expected order from MODULE STATUS through YOUR FILE", () => {
    const moduleStatusIdx = excerpt.indexOf('MODULE STATUS:');
    const yourNodesIdx = excerpt.indexOf('YOUR NODES:');
    const yourJourneysIdx = excerpt.indexOf('YOUR JOURNEYS:');
    const crossModuleIdx = excerpt.indexOf('CROSS-MODULE:');
    const allModulesIdx = excerpt.indexOf('ALL MODULES:');
    const globalIdx = excerpt.indexOf('GLOBAL:');
    const yourFileIdx = excerpt.indexOf('YOUR FILE');

    // All sections exist
    expect(moduleStatusIdx).toBeGreaterThanOrEqual(0);
    expect(yourNodesIdx).toBeGreaterThanOrEqual(0);
    expect(yourJourneysIdx).toBeGreaterThanOrEqual(0);
    expect(allModulesIdx).toBeGreaterThanOrEqual(0);
    expect(globalIdx).toBeGreaterThanOrEqual(0);
    expect(yourFileIdx).toBeGreaterThanOrEqual(0);

    // Sections appear in order
    expect(moduleStatusIdx).toBeLessThan(yourNodesIdx);
    expect(yourNodesIdx).toBeLessThan(yourJourneysIdx);
    expect(yourJourneysIdx).toBeLessThan(crossModuleIdx);
    expect(allModulesIdx).toBeLessThan(globalIdx);
    expect(globalIdx).toBeLessThan(yourFileIdx);
  });

  it("step 6: excerpt/ValidateExcerptSectionOrder flags any duplicated or misordered sections that would confuse the LLM parser", () => {
    // No duplicated section headers
    const moduleStatusCount = (excerpt.match(/MODULE STATUS:/g) || []).length;
    const yourNodesCount = (excerpt.match(/YOUR NODES:/g) || []).length;
    const allModulesCount = (excerpt.match(/ALL MODULES:/g) || []).length;
    expect(moduleStatusCount).toBe(1);
    expect(yourNodesCount).toBe(1);
    expect(allModulesCount).toBe(1);
  });

  it("step 7: excerpt/ExcerptOutput stores the validated excerpt only after completeness and ordering checks pass", () => {
    expect(excerpt).toBeTruthy();
    expect(excerpt).toContain('YOUR FILE (mymod.yaml):');
    expect(excerpt).toContain('```yaml');
  });
});
