// Auto-generated from journey: HandoffToTestgen
// Module: codegen
// Modules touched: codegen, convergence, testgen

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandoffToTestgen", () => {
  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        ConvergenceState: { type: 'artifact', description: 'Records that codegen phase is complete' },
        TriggerTestgen: { type: 'process', description: 'Invokes testgen.ts to generate test skeletons' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        ConfirmAllModulesFilled: { type: 'process', description: 'Confirms every module has a validated filled source file' },
        GeneratedCodeDirectory: { type: 'artifact', description: 'Provides the complete output directory' },
        FilledSourceFile: { type: 'artifact', description: 'Each filled file is available for testgen to analyze' },
      },
      journeys: {
        HandoffToTestgen: {
          steps: [
            { node: 'ConfirmAllModulesFilled', action: 'confirms every module has a validated filled source file' },
            { node: 'GeneratedCodeDirectory', action: 'provides the complete output directory with all filled files' },
            { node: 'FilledSourceFile', action: 'each filled file is available for testgen to analyze' },
            { node: 'convergence/ConvergenceState', action: 'records that codegen phase is complete' },
            { node: 'convergence/TriggerTestgen', action: 'invokes testgen.ts to generate test skeletons from the filled code' },
            { node: 'testgen/MapTestImports', action: 'reads the generated code files to produce test import statements' },
          ],
        },
      },
    }],
    ['testgen', {
      nodes: {
        MapTestImports: { type: 'process', description: 'Reads the generated code files to produce test imports' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: codegen/ConfirmAllModulesFilled confirms every module has a validated filled source file", () => {
    const node = result.index.nodes['codegen/ConfirmAllModulesFilled'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    const journey = result.index.journeys['HandoffToTestgen'];
    expect(journey.steps[0].node).toBe('codegen/ConfirmAllModulesFilled');
  });

  it("step 2: codegen/GeneratedCodeDirectory provides the complete output directory with all filled files", () => {
    const node = result.index.nodes['codegen/GeneratedCodeDirectory'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/ConfirmAllModulesFilled');
  });

  it("step 3: codegen/FilledSourceFile each filled file is available for testgen to analyze", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/GeneratedCodeDirectory');
  });

  it("step 4: convergence/ConvergenceState records that codegen phase is complete", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // Cross-module connection from codegen
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: convergence/TriggerTestgen invokes testgen.ts to generate test skeletons from the filled code", () => {
    const node = result.index.nodes['convergence/TriggerTestgen'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('convergence/ConvergenceState');
  });

  it("step 6: testgen/MapTestImports reads the generated code files to produce test import statements", () => {
    const node = result.index.nodes['testgen/MapTestImports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Cross-module connection from convergence to testgen
    expect(node.cross_module_connections).toContain('convergence/TriggerTestgen');
    // The journey touches codegen, convergence, and testgen
    const journey = result.index.journeys['HandoffToTestgen'];
    expect(journey.modules_touched).toContain('codegen');
    expect(journey.modules_touched).toContain('convergence');
    expect(journey.modules_touched).toContain('testgen');
  });

});
