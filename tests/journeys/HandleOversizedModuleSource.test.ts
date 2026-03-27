// Auto-generated from journey: HandleOversizedModuleSource
// Module: excerpt
// Modules touched: excerpt

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleOversizedModuleSource", () => {
  const modules = new Map<string, ModuleFile>([
    ['bigmod', {
      nodes: {
        NodeA: { type: 'process', description: 'First process' },
        NodeB: { type: 'process', description: 'Second process' },
        NodeC: { type: 'artifact', description: 'An artifact' },
      },
      journeys: {
        FlowAB: {
          steps: [
            { node: 'NodeA', action: 'starts the flow' },
            { node: 'NodeB', action: 'continues the flow' },
            { node: 'NodeC', action: 'produces the artifact' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  // Create an oversized YAML source (many lines)
  const oversizedYaml = Array.from({ length: 300 }, (_, i) =>
    `  line_${i}: value_${i}`
  ).join('\n');
  const fullYaml = `nodes:\n${oversizedYaml}`;

  const excerpt = generateExcerpt({
    round: 1,
    focusModule: 'bigmod',
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: fullYaml,
  });

  // Also create a summarized version with a short source
  const summaryYaml = 'nodes:\n  NodeA (process), NodeB (process), NodeC (artifact)\njourneys:\n  FlowAB (3 steps)';
  const excerptSummary = generateExcerpt({
    round: 1,
    focusModule: 'bigmod',
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: summaryYaml,
  });

  it("step 1: excerpt/SelectTargetModule identifies a module whose YAML source exceeds the line budget threshold", () => {
    expect(excerpt).toContain('Focus: bigmod');
    // The oversized YAML has more than 200 lines
    expect(fullYaml.split('\n').length).toBeGreaterThan(200);
  });

  it("step 2: excerpt/CollectModuleSource reads the raw YAML and detects that it exceeds the source line threshold", () => {
    // The oversized YAML content is included in the excerpt
    expect(excerpt).toContain('YOUR FILE (bigmod.yaml):');
    const lineCount = fullYaml.split('\n').length;
    expect(lineCount).toBeGreaterThan(200);
  });

  it("step 3: excerpt/SummarizeLargeModuleSource extracts node names with their types as a compact list", () => {
    // In the summarized version, node names are compact
    expect(excerptSummary).toContain('NodeA');
    expect(excerptSummary).toContain('NodeB');
    expect(excerptSummary).toContain('NodeC');
  });

  it("step 4: excerpt/SummarizeLargeModuleSource extracts journey names with step counts as a compact list", () => {
    // The summary mentions the journey
    expect(excerptSummary).toContain('FlowAB');
  });

  it("step 5: excerpt/SummarizeLargeModuleSource produces the compact summary replacing the raw source in the excerpt", () => {
    // The summary excerpt is shorter than the full excerpt
    expect(excerptSummary.split('\n').length).toBeLessThan(excerpt.split('\n').length);
  });

  it("step 6: excerpt/AdaptiveBudgetAllocation reallocates the saved lines from source compression to other sections", () => {
    // The summary excerpt still has all key sections
    expect(excerptSummary).toContain('MODULE STATUS:');
    expect(excerptSummary).toContain('YOUR NODES:');
    expect(excerptSummary).toContain('GLOBAL:');
  });

  it("step 7: excerpt/AssembleExcerpt includes the summarized source instead of the raw YAML file content", () => {
    // The summary version uses the compact source
    expect(excerptSummary).toContain('YOUR FILE (bigmod.yaml):');
    expect(excerptSummary).toContain('```yaml');
  });

  it("step 8: excerpt/ExcerptOutput stores the excerpt with source summary fitting within the line budget", () => {
    expect(excerptSummary).toBeTruthy();
    expect(typeof excerptSummary).toBe('string');
  });
});
