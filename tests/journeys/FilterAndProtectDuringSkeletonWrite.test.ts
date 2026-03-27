// Auto-generated from journey: FilterAndProtectDuringSkeletonWrite
// Module: codegen
// Modules touched: graph, codegen

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("FilterAndProtectDuringSkeletonWrite", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'All nodes in the converged graph', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        ReadConvergedGraph: { type: 'process', description: 'Iterates every node in the compiled index', files: ['src/codegen.ts'] },
        FilesFieldRequired: { type: 'rule', description: 'Skips any node without a files field' },
        GenerateProcessSkeletons: { type: 'process', description: 'Generates a TypeScript skeleton for process nodes that pass the filter', files: ['src/gen/process.ts'] },
        NeverOverwriteExisting: { type: 'rule', description: 'Checks the target path and skips if a file already exists' },
        EnsureOutputDirectory: { type: 'process', description: 'Creates the parent directory tree if needed' },
        WriteGeneratedFile: { type: 'process', description: 'Writes the skeleton to disk at the declared file path' },
        SkeletonFile: { type: 'artifact', description: 'The generated skeleton stored and ready for filling' },
        NoFilesNode: { type: 'process', description: 'A node without any files field' },
      },
      journeys: {
        FilterAndProtectDuringSkeletonWrite: {
          steps: [
            { node: 'graph/CompiledIndex', action: 'provides all nodes in the converged graph' },
            { node: 'ReadConvergedGraph', action: 'iterates every node in the compiled index' },
            { node: 'FilesFieldRequired', action: 'skips any node that does not declare a files field' },
            { node: 'GenerateProcessSkeletons', action: 'generates a TypeScript skeleton for each process node that passes the filter' },
            { node: 'NeverOverwriteExisting', action: 'checks the target file path on disk and skips if a file already exists' },
            { node: 'EnsureOutputDirectory', action: 'creates the parent directory tree if it does not yet exist' },
            { node: 'WriteGeneratedFile', action: 'writes the skeleton to disk at the declared file path' },
            { node: 'SkeletonFile', action: 'the generated skeleton is stored and ready for LLM filling' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-filter-protect-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: graph/CompiledIndex provides all nodes in the converged graph", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(Object.keys(result.index.nodes).length).toBeGreaterThanOrEqual(8);
  });

  it("step 2: codegen/ReadConvergedGraph iterates every node in the compiled index", () => {
    const node = result.index.nodes['codegen/ReadConvergedGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/codegen.ts');
  });

  it("step 3: codegen/FilesFieldRequired skips any node that does not declare a files field", () => {
    // generateCodeSkeletons only processes process nodes with files: field
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    // NoFilesNode has no files field, so it should appear in skipped
    const skippedNoFiles = codegenResult.skipped.filter(s => s.includes('no files'));
    expect(skippedNoFiles.length).toBeGreaterThan(0);

    // Nodes without files fields are skipped
    const nodesWithoutFiles = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'process' && !n.files?.length);
    expect(nodesWithoutFiles.length).toBeGreaterThan(0);
  });

  it("step 4: codegen/GenerateProcessSkeletons generates a TypeScript skeleton for each process node that passes the filter", () => {
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    // Process nodes with files get generated
    expect(codegenResult.generated).toContain('src/gen/process.ts');
    const content = fs.readFileSync(path.join(tmpDir, 'src/gen/process.ts'), 'utf-8');
    expect(content).toContain('class');
    expect(content).toContain('GenerateProcessSkeletons');
  });

  it("step 5: codegen/NeverOverwriteExisting checks the target file path on disk and skips if a file already exists", () => {
    // First generation creates the file
    generateCodeSkeletons(result.index, tmpDir);
    const filePath = path.join(tmpDir, 'src/gen/process.ts');
    expect(fs.existsSync(filePath)).toBe(true);
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    // Second generation should skip existing files
    const secondResult = generateCodeSkeletons(result.index, tmpDir);
    expect(secondResult.skipped).toContainEqual(expect.stringContaining('already exists'));
    // Existing file content was NOT overwritten
    const contentAfter = fs.readFileSync(filePath, 'utf-8');
    expect(contentAfter).toBe(originalContent);
  });

  it("step 6: codegen/EnsureOutputDirectory creates the parent directory tree if it does not yet exist", () => {
    // The nested directory src/gen/ does not exist yet in the temp dir
    const nestedDir = path.join(tmpDir, 'src', 'gen');
    expect(fs.existsSync(nestedDir)).toBe(false);

    generateCodeSkeletons(result.index, tmpDir);
    // After codegen, the directory tree was created
    expect(fs.existsSync(nestedDir)).toBe(true);
  });

  it("step 7: codegen/WriteGeneratedFile writes the skeleton to disk at the declared file path", () => {
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    for (const filePath of codegenResult.generated) {
      const absPath = path.join(tmpDir, filePath);
      expect(fs.existsSync(absPath)).toBe(true);
      const content = fs.readFileSync(absPath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    }
  });

  it("step 8: codegen/SkeletonFile the generated skeleton is stored and ready for LLM filling", () => {
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    // At least one file was generated
    expect(codegenResult.generated.length).toBeGreaterThan(0);
    // Each generated file contains TODO markers for LLM to fill
    for (const filePath of codegenResult.generated) {
      const content = fs.readFileSync(path.join(tmpDir, filePath), 'utf-8');
      expect(content).toContain('TODO');
    }
  });

});
