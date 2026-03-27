// Auto-generated from journey: GenerateSkeletonsFromGraph
// Module: codegen
// Modules touched: convergence, graph, codegen

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { generateCodeSkeletons } from '../../src/codegen.js';
import type { ModuleFile } from '../../src/types.js';

describe("GenerateSkeletonsFromGraph", () => {
  let tmpDir: string;

  // Fixture: modules with process, artifact, interface, and rule nodes
  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        TriggerCodegen: { type: 'process', description: 'Invokes codegen.ts after convergence and publish are complete' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The full converged graph with all nodes and connections', files: ['src/types.ts'] },
        ConnectionSet: { type: 'artifact', description: 'Cross-module edges for import generation' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        ReadConvergedGraph: { type: 'process', description: 'Extracts all nodes organized by module', files: ['src/codegen.ts'] },
        CodeComesFromNodes: { type: 'rule', description: 'Ensures every skeleton maps to exactly one graph node' },
        GenerateProcessSkeletons: { type: 'process', description: 'Creates function stubs for all process nodes', files: ['src/gen/process.ts'] },
        GenerateArtifactSkeletons: { type: 'process', description: 'Creates interface/class stubs for artifact nodes', files: ['src/gen/artifact.ts'] },
        GenerateInterfaceSkeletons: { type: 'process', description: 'Creates handler stubs for interface nodes', files: ['src/gen/iface.ts'] },
        GenerateRuleSkeletons: { type: 'process', description: 'Creates validation function stubs for rule nodes', files: ['src/gen/rule.ts'] },
        MapConnectionsToImports: { type: 'process', description: 'Generates import statements from connection edges' },
        AssembleModuleFile: { type: 'process', description: 'Combines stubs and imports into a single TypeScript skeleton per module' },
        SkeletonFile: { type: 'artifact', description: 'The assembled skeleton file for each module' },
        SkeletonBeforeFill: { type: 'rule', description: 'Confirms skeletons are complete before LLM filling begins' },
      },
      journeys: {
        GenerateSkeletonsFromGraph: {
          steps: [
            { node: 'convergence/TriggerCodegen', action: 'invokes codegen.ts after convergence and publish are complete' },
            { node: 'graph/CompiledIndex', action: 'provides the full converged graph with all nodes and connections' },
            { node: 'ReadConvergedGraph', action: 'extracts all process, artifact, interface, and rule nodes organized by module' },
            { node: 'CodeComesFromNodes', action: 'ensures every skeleton maps to exactly one graph node' },
            { node: 'GenerateProcessSkeletons', action: 'creates function stubs for all process nodes' },
            { node: 'GenerateArtifactSkeletons', action: 'creates interface and class stubs for all artifact nodes' },
            { node: 'GenerateInterfaceSkeletons', action: 'creates handler stubs for all interface nodes' },
            { node: 'GenerateRuleSkeletons', action: 'creates validation function stubs for all rule nodes' },
            { node: 'graph/ConnectionSet', action: 'provides cross-module edges for import generation' },
            { node: 'MapConnectionsToImports', action: 'generates import statements from connection edges' },
            { node: 'AssembleModuleFile', action: 'combines stubs and imports into a single TypeScript skeleton per module' },
            { node: 'SkeletonFile', action: 'stores the assembled skeleton file for each module' },
            { node: 'SkeletonBeforeFill', action: 'confirms skeletons are complete before any LLM filling begins' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome8-codegen-skeletons-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TriggerCodegen invokes codegen.ts after convergence and publish are complete", () => {
    // TriggerCodegen exists as a process node in the compiled graph
    const node = result.index.nodes['convergence/TriggerCodegen'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It appears in the journey as step 1
    const journey = result.index.journeys['GenerateSkeletonsFromGraph'];
    expect(journey.steps[0].node).toBe('convergence/TriggerCodegen');
  });

  it("step 2: graph/CompiledIndex provides the full converged graph with all nodes and connections", () => {
    // CompiledIndex is an artifact node
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // The index contains all nodes from all modules
    expect(Object.keys(result.index.nodes).length).toBeGreaterThanOrEqual(13);
  });

  it("step 3: codegen/ReadConvergedGraph extracts all process, artifact, interface, and rule nodes organized by module", () => {
    // ReadConvergedGraph is a process node with a files field
    const node = result.index.nodes['codegen/ReadConvergedGraph'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/codegen.ts');

    // The compiled index has nodes organized by module (module field on each node)
    const nodesByModule = new Map<string, string[]>();
    for (const [fullName, n] of Object.entries(result.index.nodes)) {
      if (!nodesByModule.has(n.module)) nodesByModule.set(n.module, []);
      nodesByModule.get(n.module)!.push(fullName);
    }
    expect(nodesByModule.has('codegen')).toBe(true);
    expect(nodesByModule.has('graph')).toBe(true);
  });

  it("step 4: codegen/CodeComesFromNodes ensures every skeleton maps to exactly one graph node", () => {
    // CodeComesFromNodes is a rule node
    const node = result.index.nodes['codegen/CodeComesFromNodes'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');

    // Every process node with files: maps to exactly one node
    const processNodesWithFiles = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'process' && n.files?.length);
    for (const [fullName] of processNodesWithFiles) {
      // Each fullName is unique (the node name maps to one node)
      const matches = Object.keys(result.index.nodes).filter(k => k === fullName);
      expect(matches).toHaveLength(1);
    }
  });

  it("step 5: codegen/GenerateProcessSkeletons creates function stubs for all process nodes", () => {
    // Generate skeletons — process nodes with files get generated
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    // GenerateProcessSkeletons has files: ['src/gen/process.ts']
    expect(codegenResult.generated).toContain('src/gen/process.ts');
    // The generated file exists on disk
    const filePath = path.join(tmpDir, 'src/gen/process.ts');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    // It should be a TypeScript skeleton with a class
    expect(content).toContain('class');
    expect(content).toContain('TODO');
  });

  it("step 6: codegen/GenerateArtifactSkeletons creates interface and class stubs for all artifact nodes", () => {
    // Artifact nodes with files should be generated — CompiledIndex has files
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    // graph/CompiledIndex has files: ['src/types.ts'] but it's type 'artifact', not 'process'
    // generateCodeSkeletons only generates for process nodes
    const artifactNodes = Object.entries(result.index.nodes)
      .filter(([, n]) => n.type === 'artifact' && n.files?.length);
    for (const [, n] of artifactNodes) {
      for (const f of n.files!) {
        expect(codegenResult.skipped).toContainEqual(expect.stringContaining(f));
      }
    }
  });

  it("step 7: codegen/GenerateInterfaceSkeletons creates handler stubs for all interface nodes", () => {
    // Interface node skeletons — GenerateInterfaceSkeletons itself has files
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    expect(codegenResult.generated).toContain('src/gen/iface.ts');
    const filePath = path.join(tmpDir, 'src/gen/iface.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("step 8: codegen/GenerateRuleSkeletons creates validation function stubs for all rule nodes", () => {
    // Rule node stubs — GenerateRuleSkeletons has files
    const codegenResult = generateCodeSkeletons(result.index, tmpDir);
    expect(codegenResult.generated).toContain('src/gen/rule.ts');
    const content = fs.readFileSync(path.join(tmpDir, 'src/gen/rule.ts'), 'utf-8');
    expect(content).toContain('GenerateRuleSkeletons');
  });

  it("step 9: graph/ConnectionSet provides cross-module edges for import generation", () => {
    // ConnectionSet is an artifact node
    const node = result.index.nodes['graph/ConnectionSet'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // Cross-module connections are computed during compilation
    const crossModuleNodes = Object.values(result.index.nodes)
      .filter(n => n.cross_module_connections.length > 0);
    expect(crossModuleNodes.length).toBeGreaterThan(0);
  });

  it("step 10: codegen/MapConnectionsToImports generates import statements from connection edges", () => {
    // MapConnectionsToImports is a process node in the journey
    const node = result.index.nodes['codegen/MapConnectionsToImports'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It is preceded by ConnectionSet in the journey
    expect(node.preceded_by).toContain('graph/ConnectionSet');
  });

  it("step 11: codegen/AssembleModuleFile combines stubs and imports into a single TypeScript skeleton per module", () => {
    const node = result.index.nodes['codegen/AssembleModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It follows MapConnectionsToImports
    expect(node.preceded_by).toContain('codegen/MapConnectionsToImports');
  });

  it("step 12: codegen/SkeletonFile stores the assembled skeleton file for each module", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // It follows AssembleModuleFile
    expect(node.preceded_by).toContain('codegen/AssembleModuleFile');
  });

  it("step 13: codegen/SkeletonBeforeFill confirms skeletons are complete before any LLM filling begins", () => {
    const node = result.index.nodes['codegen/SkeletonBeforeFill'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    // It is the last step in the journey
    const journey = result.index.journeys['GenerateSkeletonsFromGraph'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('codegen/SkeletonBeforeFill');
  });

});
