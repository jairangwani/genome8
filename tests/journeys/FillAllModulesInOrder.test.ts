// Auto-generated from journey: FillAllModulesInOrder
// Module: codegen
// Triggered by: _actors/LLMWorker
// Modules touched: organization, codegen, _actors, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("FillAllModulesInOrder", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        LLMWorker: { type: 'actor', description: 'Fills modules with access to previously filled dependency files' },
      },
      journeys: {},
    }],
    ['organization', {
      nodes: {
        DependencyGraph: { type: 'artifact', description: 'Provides the build order so dependencies are filled before dependents' },
      },
      journeys: {},
    }],
    ['convergence', {
      nodes: {
        ConvergenceState: { type: 'artifact', description: 'Records that code generation is complete for all modules' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        SelectNextModuleToFill: { type: 'process', description: 'Picks the first module in build order' },
        SkeletonFile: { type: 'artifact', description: 'Provides the selected modules skeleton' },
        FillImplementation: { type: 'process', description: 'LLM fills the module', files: ['src/fill.ts'] },
        FilledSourceFile: { type: 'artifact', description: 'Filled file available for subsequent modules' },
        ValidateFilledSyntax: { type: 'process', description: 'Checks filled file for syntax and type errors' },
        WriteGeneratedFile: { type: 'process', description: 'Writes filled file to disk' },
        GeneratedCodeDirectory: { type: 'artifact', description: 'Accumulates all filled files in build order' },
        ConfirmAllModulesFilled: { type: 'process', description: 'Verifies every module has a filled source file' },
      },
      journeys: {
        FillAllModulesInOrder: {
          steps: [
            { node: 'organization/DependencyGraph', action: 'provides the build order' },
            { node: 'SelectNextModuleToFill', action: 'picks the first module in build order' },
            { node: 'SkeletonFile', action: 'provides the selected modules skeleton' },
            { node: 'FillImplementation', action: 'LLM fills the first module' },
            { node: 'FilledSourceFile', action: 'the first filled file is available' },
            { node: 'ValidateFilledSyntax', action: 'checks the filled file for syntax and type errors' },
            { node: 'WriteGeneratedFile', action: 'writes the first filled file to disk' },
            { node: 'SelectNextModuleToFill', action: 'advances to the next module in build order' },
            { node: 'SkeletonFile', action: 'provides the next modules skeleton' },
            { node: '_actors/LLMWorker', action: 'fills the next module with access to previously filled dependency files' },
            { node: 'FillImplementation', action: 'LLM fills the module referencing already-implemented dependencies' },
            { node: 'ValidateFilledSyntax', action: 'checks each subsequent filled file for errors' },
            { node: 'WriteGeneratedFile', action: 'writes each filled file to disk as it completes' },
            { node: 'GeneratedCodeDirectory', action: 'accumulates all filled files in build order' },
            { node: 'ConfirmAllModulesFilled', action: 'verifies every module in the build list has a filled source file' },
            { node: 'convergence/ConvergenceState', action: 'records that code generation is complete for all modules' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-fill-all-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: organization/DependencyGraph provides the build order so dependencies are filled before dependents", () => {
    const node = result.index.nodes['organization/DependencyGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // It is the first step in the journey
    const journey = result.index.journeys['FillAllModulesInOrder'];
    expect(journey.steps[0].node).toBe('organization/DependencyGraph');
  });

  it("step 2: codegen/SelectNextModuleToFill picks the first module in build order which has no internal dependencies", () => {
    const node = result.index.nodes['codegen/SelectNextModuleToFill'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It follows DependencyGraph
    expect(node.preceded_by).toContain('organization/DependencyGraph');
  });

  it("step 3: codegen/SkeletonFile provides the selected module's skeleton", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/SelectNextModuleToFill');
  });

  it("step 4: codegen/FillImplementation LLM fills the first module", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/fill.ts');
  });

  it("step 5: codegen/FilledSourceFile the first filled file is available for subsequent modules to import", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/FillImplementation');
  });

  it("step 6: codegen/ValidateFilledSyntax checks the filled file for syntax and type errors", () => {
    const node = result.index.nodes['codegen/ValidateFilledSyntax'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/FilledSourceFile');
  });

  it("step 7: codegen/WriteGeneratedFile writes the first filled file to disk", () => {
    const node = result.index.nodes['codegen/WriteGeneratedFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/ValidateFilledSyntax');
  });

  it("step 8: codegen/SelectNextModuleToFill advances to the next module in build order", () => {
    // SelectNextModuleToFill appears multiple times in the journey
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const selectSteps = journey.steps.filter(s => s.node === 'codegen/SelectNextModuleToFill');
    expect(selectSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 9: codegen/SkeletonFile provides the next module's skeleton", () => {
    // SkeletonFile appears multiple times in the journey (for each module)
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const skeletonSteps = journey.steps.filter(s => s.node === 'codegen/SkeletonFile');
    expect(skeletonSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 10: _actors/LLMWorker fills the next module with access to previously filled dependency files", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 11: codegen/FillImplementation LLM fills the module referencing already-implemented dependencies", () => {
    // FillImplementation appears multiple times in the journey
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const fillSteps = journey.steps.filter(s => s.node === 'codegen/FillImplementation');
    expect(fillSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 12: codegen/ValidateFilledSyntax checks each subsequent filled file for errors", () => {
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const validateSteps = journey.steps.filter(s => s.node === 'codegen/ValidateFilledSyntax');
    expect(validateSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 13: codegen/WriteGeneratedFile writes each filled file to disk as it completes", () => {
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const writeSteps = journey.steps.filter(s => s.node === 'codegen/WriteGeneratedFile');
    expect(writeSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 14: codegen/GeneratedCodeDirectory accumulates all filled files in build order", () => {
    const node = result.index.nodes['codegen/GeneratedCodeDirectory'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // It follows WriteGeneratedFile
    expect(node.preceded_by).toContain('codegen/WriteGeneratedFile');
  });

  it("step 15: codegen/ConfirmAllModulesFilled verifies every module in the build list has a filled source file", () => {
    const node = result.index.nodes['codegen/ConfirmAllModulesFilled'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/GeneratedCodeDirectory');
  });

  it("step 16: convergence/ConvergenceState records that code generation is complete for all modules", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // It is the last step in the journey
    const journey = result.index.journeys['FillAllModulesInOrder'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('convergence/ConvergenceState');
    // Cross-module connection from codegen
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

});
