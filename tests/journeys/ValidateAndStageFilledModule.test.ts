// Auto-generated from journey: ValidateAndStageFilledModule
// Module: codegen
// Modules touched: codegen, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("ValidateAndStageFilledModule", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        StageGeneratedCode: { type: 'process', description: 'Registers the staged file in the convergence state for review' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        FillImplementation: { type: 'process', description: 'Has produced a filled source file from the LLM worker' },
        FilledSourceFile: { type: 'artifact', description: 'Provides the filled TypeScript content for validation' },
        ValidateFilledSyntax: { type: 'process', description: 'Parses the filled file to check for syntax errors' },
        CodeComesFromNodes: { type: 'rule', description: 'Verifies the filled file still contains one function per graph node' },
        StageFilledModule: { type: 'process', description: 'Writes the validated file to the staging directory', files: ['src/stage.ts'] },
        WriteGeneratedFile: { type: 'process', description: 'Writes the final approved file to the output directory' },
        GeneratedCodeDirectory: { type: 'artifact', description: 'The validated and staged file is in the final output location' },
      },
      journeys: {
        ValidateAndStageFilledModule: {
          steps: [
            { node: 'FillImplementation', action: 'has produced a filled source file from the LLM worker' },
            { node: 'FilledSourceFile', action: 'provides the filled TypeScript content for validation' },
            { node: 'ValidateFilledSyntax', action: 'parses the filled file to check for syntax errors' },
            { node: 'ValidateFilledSyntax', action: 'runs type checking against the modules imports and dependencies' },
            { node: 'CodeComesFromNodes', action: 'verifies the filled file still contains one function or class per graph node' },
            { node: 'StageFilledModule', action: 'writes the validated file to the staging directory' },
            { node: 'convergence/StageGeneratedCode', action: 'registers the staged file in the convergence state for review' },
            { node: 'WriteGeneratedFile', action: 'writes the final approved file to the generated code output directory' },
            { node: 'GeneratedCodeDirectory', action: 'the validated and staged file is now in the final output location' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-validate-stage-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: codegen/FillImplementation has produced a filled source file from the LLM worker", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    const journey = result.index.journeys['ValidateAndStageFilledModule'];
    expect(journey.steps[0].node).toBe('codegen/FillImplementation');
  });

  it("step 2: codegen/FilledSourceFile provides the filled TypeScript content for validation", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/FillImplementation');
  });

  it("step 3: codegen/ValidateFilledSyntax parses the filled file to check for syntax errors", () => {
    const node = result.index.nodes['codegen/ValidateFilledSyntax'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/FilledSourceFile');
  });

  it("step 4: codegen/ValidateFilledSyntax runs type checking against the module's imports and dependencies", () => {
    // ValidateFilledSyntax appears twice in the journey (syntax + type checking)
    const journey = result.index.journeys['ValidateAndStageFilledModule'];
    const validateSteps = journey.steps.filter(s => s.node === 'codegen/ValidateFilledSyntax');
    expect(validateSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 5: codegen/CodeComesFromNodes verifies the filled file still contains one function or class per graph node", () => {
    const node = result.index.nodes['codegen/CodeComesFromNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.preceded_by).toContain('codegen/ValidateFilledSyntax');
  });

  it("step 6: codegen/StageFilledModule writes the validated file to the staging directory", () => {
    const node = result.index.nodes['codegen/StageFilledModule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/stage.ts');

    // Generate skeleton for StageFilledModule
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    expect(codegenResult.generated).toContain('src/stage.ts');
    const content = fs.readFileSync(path.join(tmpDir, 'src/stage.ts'), 'utf-8');
    expect(content).toContain('StageFilledModule');
  });

  it("step 7: convergence/StageGeneratedCode registers the staged file in the convergence state for review", () => {
    const node = result.index.nodes['convergence/StageGeneratedCode'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Cross-module connection from codegen to convergence
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: codegen/WriteGeneratedFile writes the final approved file to the generated code output directory", () => {
    const node = result.index.nodes['codegen/WriteGeneratedFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 9: codegen/GeneratedCodeDirectory the validated and staged file is now in the final output location", () => {
    const node = result.index.nodes['codegen/GeneratedCodeDirectory'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // It is the last step in the journey
    const journey = result.index.journeys['ValidateAndStageFilledModule'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('codegen/GeneratedCodeDirectory');
  });

});
