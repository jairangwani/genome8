// Auto-generated from journey: EndToEndCodegenPipeline
// Module: codegen
// Modules touched: convergence, graph, codegen, organization

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("EndToEndCodegenPipeline", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        TriggerCodegen: { type: 'process', description: 'Invokes codegen after convergence declares the graph CONVERGED' },
        TriggerTestgen: { type: 'process', description: 'Signals testgen to begin generating test skeletons' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'Provides the full converged graph', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['organization', {
      nodes: {
        DependencyGraph: { type: 'artifact', description: 'Provides the module build order' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        ReadConvergedGraph: { type: 'process', description: 'Extracts all nodes organized by module', files: ['src/codegen.ts'] },
        GenerateProcessSkeletons: { type: 'process', description: 'Creates function stubs for process nodes', files: ['src/gen/process.ts'] },
        GenerateArtifactSkeletons: { type: 'process', description: 'Creates class stubs for artifact nodes' },
        GenerateInterfaceSkeletons: { type: 'process', description: 'Creates handler stubs for interface nodes' },
        GenerateRuleSkeletons: { type: 'process', description: 'Creates validation stubs for rule nodes' },
        MapConnectionsToImports: { type: 'process', description: 'Generates cross-module import statements' },
        AssembleModuleFile: { type: 'process', description: 'Assembles each modules skeleton file' },
        SkeletonFile: { type: 'artifact', description: 'Stores all skeletons ready for filling' },
        SelectNextModuleToFill: { type: 'process', description: 'Picks each module in dependency order' },
        ProvideCodegenExcerpt: { type: 'process', description: 'Assembles codegen-specific context' },
        FillImplementation: { type: 'process', description: 'LLM fills each skeleton with working code', files: ['src/fill.ts'] },
        FilledSourceFile: { type: 'artifact', description: 'Stores each filled implementation' },
        ValidateFilledSyntax: { type: 'process', description: 'Checks each filled file for syntax errors' },
        StageFilledModule: { type: 'process', description: 'Stages each validated file for review' },
        WriteGeneratedFile: { type: 'process', description: 'Writes each final file to the output directory' },
        ConfirmAllModulesFilled: { type: 'process', description: 'Verifies every module has been filled and staged' },
        GeneratedCodeDirectory: { type: 'artifact', description: 'Contains the complete generated codebase' },
      },
      journeys: {
        EndToEndCodegenPipeline: {
          steps: [
            { node: 'convergence/TriggerCodegen', action: 'invokes codegen after convergence declares the graph CONVERGED' },
            { node: 'graph/CompiledIndex', action: 'provides the full converged graph' },
            { node: 'ReadConvergedGraph', action: 'extracts all nodes organized by module' },
            { node: 'organization/DependencyGraph', action: 'provides the module build order' },
            { node: 'GenerateProcessSkeletons', action: 'creates function stubs for process nodes' },
            { node: 'GenerateArtifactSkeletons', action: 'creates class stubs for artifact nodes' },
            { node: 'GenerateInterfaceSkeletons', action: 'creates handler stubs for interface nodes' },
            { node: 'GenerateRuleSkeletons', action: 'creates validation stubs for rule nodes' },
            { node: 'MapConnectionsToImports', action: 'generates cross-module import statements' },
            { node: 'AssembleModuleFile', action: 'assembles each modules skeleton file' },
            { node: 'SkeletonFile', action: 'stores all skeletons ready for filling' },
            { node: 'SelectNextModuleToFill', action: 'picks each module in dependency order' },
            { node: 'ProvideCodegenExcerpt', action: 'assembles codegen-specific context for each module' },
            { node: 'FillImplementation', action: 'LLM fills each skeleton with working code' },
            { node: 'FilledSourceFile', action: 'stores each filled implementation' },
            { node: 'ValidateFilledSyntax', action: 'checks each filled file for syntax and type errors' },
            { node: 'StageFilledModule', action: 'stages each validated file for review' },
            { node: 'WriteGeneratedFile', action: 'writes each final file to the output directory' },
            { node: 'ConfirmAllModulesFilled', action: 'verifies every module has been filled and staged' },
            { node: 'GeneratedCodeDirectory', action: 'contains the complete generated codebase' },
            { node: 'convergence/TriggerTestgen', action: 'signals testgen to begin generating test skeletons from the filled code' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-e2e-codegen-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TriggerCodegen invokes codegen after convergence declares the graph CONVERGED", () => {
    const node = result.index.nodes['convergence/TriggerCodegen'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    const journey = result.index.journeys['EndToEndCodegenPipeline'];
    expect(journey.steps[0].node).toBe('convergence/TriggerCodegen');
  });

  it("step 2: graph/CompiledIndex provides the full converged graph", () => {
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.files).toContain('src/types.ts');
  });

  it("step 3: codegen/ReadConvergedGraph extracts all nodes organized by module for skeleton generation", () => {
    const node = result.index.nodes['codegen/ReadConvergedGraph'];
    expect(node).toBeDefined();
    expect(node.files).toContain('src/codegen.ts');
    // It is preceded by CompiledIndex
    expect(node.preceded_by).toContain('graph/CompiledIndex');
  });

  it("step 4: organization/DependencyGraph provides the module build order", () => {
    const node = result.index.nodes['organization/DependencyGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 5: codegen/GenerateProcessSkeletons creates function stubs for process nodes", () => {
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    expect(codegenResult.generated).toContain('src/gen/process.ts');
    const content = fs.readFileSync(path.join(tmpDir, 'src/gen/process.ts'), 'utf-8');
    expect(content).toContain('class');
    expect(content).toContain('TODO');
  });

  it("step 6: codegen/GenerateArtifactSkeletons creates class stubs for artifact nodes", () => {
    const node = result.index.nodes['codegen/GenerateArtifactSkeletons'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/GenerateProcessSkeletons');
  });

  it("step 7: codegen/GenerateInterfaceSkeletons creates handler stubs for interface nodes", () => {
    const node = result.index.nodes['codegen/GenerateInterfaceSkeletons'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/GenerateArtifactSkeletons');
  });

  it("step 8: codegen/GenerateRuleSkeletons creates validation stubs for rule nodes", () => {
    const node = result.index.nodes['codegen/GenerateRuleSkeletons'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/GenerateInterfaceSkeletons');
  });

  it("step 9: codegen/MapConnectionsToImports generates cross-module import statements", () => {
    const node = result.index.nodes['codegen/MapConnectionsToImports'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/GenerateRuleSkeletons');
  });

  it("step 10: codegen/AssembleModuleFile assembles each module's skeleton file", () => {
    const node = result.index.nodes['codegen/AssembleModuleFile'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/MapConnectionsToImports');
  });

  it("step 11: codegen/SkeletonFile stores all skeletons ready for filling", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 12: codegen/SelectNextModuleToFill picks each module in dependency order", () => {
    const node = result.index.nodes['codegen/SelectNextModuleToFill'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/SkeletonFile');
  });

  it("step 13: codegen/ProvideCodegenExcerpt assembles codegen-specific context for each module", () => {
    const node = result.index.nodes['codegen/ProvideCodegenExcerpt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/SelectNextModuleToFill');
  });

  it("step 14: codegen/FillImplementation LLM fills each skeleton with working code", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.files).toContain('src/fill.ts');
  });

  it("step 15: codegen/FilledSourceFile stores each filled implementation", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/FillImplementation');
  });

  it("step 16: codegen/ValidateFilledSyntax checks each filled file for syntax and type errors", () => {
    const node = result.index.nodes['codegen/ValidateFilledSyntax'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/FilledSourceFile');
  });

  it("step 17: codegen/StageFilledModule stages each validated file for review", () => {
    const node = result.index.nodes['codegen/StageFilledModule'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/ValidateFilledSyntax');
  });

  it("step 18: codegen/WriteGeneratedFile writes each final file to the output directory", () => {
    const node = result.index.nodes['codegen/WriteGeneratedFile'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/StageFilledModule');
  });

  it("step 19: codegen/ConfirmAllModulesFilled verifies every module has been filled and staged", () => {
    const node = result.index.nodes['codegen/ConfirmAllModulesFilled'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('codegen/GeneratedCodeDirectory');
  });

  it("step 20: codegen/GeneratedCodeDirectory contains the complete generated codebase", () => {
    const node = result.index.nodes['codegen/GeneratedCodeDirectory'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

  it("step 21: convergence/TriggerTestgen signals testgen to begin generating test skeletons from the filled code", () => {
    const node = result.index.nodes['convergence/TriggerTestgen'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It is the last step
    const journey = result.index.journeys['EndToEndCodegenPipeline'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('convergence/TriggerTestgen');
    // It is a cross-module connection from codegen
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

});
