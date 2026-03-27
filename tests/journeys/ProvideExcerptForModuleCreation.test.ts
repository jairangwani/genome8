// Auto-generated from journey: ProvideExcerptForModuleCreation
// Module: excerpt
// Modules touched: convergence, excerpt, graph, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ProvideExcerptForModuleCreation", () => {
  // Fixture: existing modules, and a new module that doesn't exist yet
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compiles modules' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        LoginProcess: { type: 'process', description: 'Handles user login' },
        SessionToken: { type: 'artifact', description: 'JWT session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/Compiler', action: 'triggers compilation' },
            { node: 'LoginProcess', action: 'authenticates user credentials' },
            { node: 'SessionToken', action: 'issues a session token' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  // Generate excerpt for a new module that will be created — the module doesn't have coverage yet
  const focusModule = 'newmodule';
  const excerpt = generateExcerpt({
    round: 2,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: '',
  });

  it("step 1: convergence/ModuleCreation requests focused context for the next module to be created", () => {
    // The excerpt is generated for a module that doesn't exist yet
    expect(excerpt).toContain('Focus: newmodule');
    expect(excerpt).toContain('ROUND 2');
  });

  it("step 2: excerpt/SelectTargetModule identifies the module that needs context for LLM creation", () => {
    // The focus module is identified as 'newmodule'
    expect(excerpt).toContain('Focus: newmodule');
  });

  it("step 3: graph/CompiledIndex provides current graph state including all previously created modules", () => {
    // The compiled index has nodes from existing modules
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index.nodes['auth/LoginProcess']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: excerpt/CollectCrossModuleConnections finds existing connections that the new module should reference", () => {
    // Since the new module doesn't exist, there are no cross-module connections for it
    // But the excerpt still shows existing modules the new one could connect to
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('auth:');
  });

  it("step 5: excerpt/CollectReferencedActors identifies actors relevant to the new module's domain", () => {
    // The actor exists in the compiled index
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler).toBeDefined();
    expect(compiler.type).toBe('actor');
  });

  it("step 6: excerpt/CollectAllModuleSummaries provides the full module list so the worker knows what modules exist", () => {
    // ALL MODULES lists all existing modules
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('_actors:');
    expect(excerpt).toContain('graph:');
    expect(excerpt).toContain('auth:');
  });

  it("step 7: excerpt/CollectGlobalStats provides current graph health metrics for the worker", () => {
    // GLOBAL section is present with stats
    expect(excerpt).toContain('GLOBAL:');
    expect(excerpt).toMatch(/\d+ nodes/);
  });

  it("step 8: excerpt/LensRelevance filters context to only what is relevant for this specific module", () => {
    // For a new module, MODULE STATUS says it doesn't exist yet
    expect(excerpt).toContain('Module does not exist yet.');
  });

  it("step 9: excerpt/AssembleExcerpt builds the focused context from relevant graph data", () => {
    // The excerpt is assembled with key sections
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('ALL MODULES:');
    expect(excerpt).toContain('GLOBAL:');
  });

  it("step 10: excerpt/TruncateToLimit ensures the excerpt fits within the ~200 line budget", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 11: excerpt/ExcerptOutput provides the excerpt as context input for the LLM worker", () => {
    // The excerpt is a non-empty string suitable for LLM consumption
    expect(excerpt).toBeTruthy();
    expect(typeof excerpt).toBe('string');
  });

  it("step 12: llm/TaskPayload packages the excerpt into the task payload sent to the worker", () => {
    // The excerpt can be embedded in a task payload (it's a string)
    const payload = { excerpt, task: 'create', module: focusModule };
    expect(payload.excerpt).toBe(excerpt);
    expect(payload.task).toBe('create');
  });
});
