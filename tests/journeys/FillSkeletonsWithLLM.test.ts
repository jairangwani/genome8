// Auto-generated from journey: FillSkeletonsWithLLM
// Module: codegen
// Triggered by: _actors/LLMWorker
// Modules touched: codegen, excerpt, llm, _actors

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("FillSkeletonsWithLLM", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        LLMWorker: { type: 'actor', description: 'Reads skeleton and excerpt to fill code' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        SkeletonFile: { type: 'artifact', description: 'The empty skeleton for a module' },
        ProvideCodegenExcerpt: { type: 'process', description: 'Assembles codegen-specific context' },
        FillImplementation: { type: 'process', description: 'LLM writes working code into stubs', files: ['src/fill.ts'] },
        FilledSourceFile: { type: 'artifact', description: 'The implementation-complete TypeScript file' },
        ValidateFilledSyntax: { type: 'process', description: 'Runs TypeScript syntax and type checking' },
        WriteGeneratedFile: { type: 'process', description: 'Writes validated file to output directory' },
        GeneratedCodeDirectory: { type: 'artifact', description: 'File is on disk in the output directory' },
      },
      journeys: {
        FillSkeletonsWithLLM: {
          steps: [
            { node: 'SkeletonFile', action: 'provides the empty skeleton for a module' },
            { node: 'ProvideCodegenExcerpt', action: 'assembles codegen-specific context' },
            { node: 'FillImplementation', action: 'LLM writes working code into each empty function body' },
            { node: 'FilledSourceFile', action: 'stores the implementation-complete TypeScript file' },
            { node: 'ValidateFilledSyntax', action: 'runs TypeScript syntax and type checking on the filled output' },
            { node: 'WriteGeneratedFile', action: 'writes the validated file to the generated code output directory' },
            { node: 'GeneratedCodeDirectory', action: 'the file is now on disk in the output directory' },
          ],
        },
      },
    }],
    ['excerpt', {
      nodes: {
        ExcerptOutput: { type: 'artifact', description: 'Focused context for the module to guide implementation' },
      },
      journeys: {},
    }],
    ['llm', {
      nodes: {
        TaskPayload: { type: 'artifact', description: 'Packages skeleton and excerpt into a task' },
        SendTask: { type: 'process', description: 'Sends the fill task to the LLM worker' },
        ReceiveResult: { type: 'process', description: 'Receives the filled source code from the worker' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-fill-skeletons-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: codegen/SkeletonFile provides the empty skeleton for a module", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');

    // Generate a skeleton to verify it's an "empty" skeleton with TODO stubs
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    expect(codegenResult.generated.length).toBeGreaterThan(0);
    const content = fs.readFileSync(path.join(tmpDir, codegenResult.generated[0]), 'utf-8');
    expect(content).toContain('TODO');
  });

  it("step 2: codegen/ProvideCodegenExcerpt assembles codegen-specific context including node descriptions and journey flows", () => {
    const node = result.index.nodes['codegen/ProvideCodegenExcerpt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It is the first step after SkeletonFile in the journey
    const journey = result.index.journeys['FillSkeletonsWithLLM'];
    expect(journey.steps[1].node).toBe('codegen/ProvideCodegenExcerpt');
  });

  it("step 3: excerpt/ExcerptOutput provides focused context for the module to guide implementation", () => {
    const node = result.index.nodes['excerpt/ExcerptOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 4: llm/TaskPayload packages the skeleton and excerpt into a task for the worker", () => {
    const node = result.index.nodes['llm/TaskPayload'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 5: llm/SendTask sends the fill task to the LLM worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 6: _actors/LLMWorker reads the skeleton and excerpt to understand what each stub should do", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 7: codegen/FillImplementation LLM writes working code into each empty function body and class method", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/fill.ts');
  });

  it("step 8: llm/ReceiveResult receives the filled source code from the worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 9: codegen/FilledSourceFile stores the implementation-complete TypeScript file", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 10: codegen/ValidateFilledSyntax runs TypeScript syntax and type checking on the filled output", () => {
    const node = result.index.nodes['codegen/ValidateFilledSyntax'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It follows FilledSourceFile in the journey
    expect(node.preceded_by).toContain('codegen/FilledSourceFile');
  });

  it("step 11: codegen/WriteGeneratedFile writes the validated file to the generated code output directory", () => {
    const node = result.index.nodes['codegen/WriteGeneratedFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/ValidateFilledSyntax');
  });

  it("step 12: codegen/GeneratedCodeDirectory the file is now on disk in the output directory", () => {
    const node = result.index.nodes['codegen/GeneratedCodeDirectory'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');

    // Verify the pipeline flow: SkeletonFile -> ... -> GeneratedCodeDirectory
    const journey = result.index.journeys['FillSkeletonsWithLLM'];
    expect(journey.steps[0].node).toBe('codegen/SkeletonFile');
    expect(journey.steps[journey.steps.length - 1].node).toBe('codegen/GeneratedCodeDirectory');
  });

});
