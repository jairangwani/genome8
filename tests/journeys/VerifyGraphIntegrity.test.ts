// Auto-generated from journey: VerifyGraphIntegrity
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("VerifyGraphIntegrity", () => {
  // A well-formed graph with no integrity issues
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'Compilation engine' },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        LoginForm: { type: 'interface', description: 'Login UI' },
        AuthProcess: { type: 'process', description: 'Validates credentials' },
        AuthToken: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        Login: {
          steps: [
            { node: '_actors/Compiler', action: 'initiates a full integrity check on the compiled graph' },
            { node: 'LoginForm', action: 'provides the full graph for verification' },
            { node: 'AuthProcess', action: 'validates credentials' },
            { node: 'AuthToken', action: 'issues token' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: _actors/Compiler initiates a full integrity check on the compiled graph", () => {
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler).toBeDefined();
    expect(compiler.type).toBe('actor');
  });

  it("step 2: graph/CompiledIndex provides the full graph for verification", () => {
    expect(result.index._compiled).toBeTruthy();
    expect(result.index._stats.total_nodes).toBe(4);
    expect(result.index._stats.total_journeys).toBe(1);
  });

  it("step 3: graph/NodeTypeSchema verifies every node has a valid type", () => {
    const validTypes = ['actor', 'process', 'artifact', 'interface', 'rule'];
    for (const node of Object.values(result.index.nodes)) {
      expect(validTypes).toContain(node.type);
    }
  });

  it("step 4: graph/UniqueNodeNameRule verifies no duplicate node names exist across all modules", () => {
    expect(result.index._stats.duplicate_names).toBe(0);
    const dupeIssues = result.issues.filter(i => i.message.includes('Duplicate name'));
    expect(dupeIssues).toHaveLength(0);
  });

  it("step 5: graph/NodeRegistry confirms every name in the registry maps to exactly one definition", () => {
    const nodeKeys = Object.keys(result.index.nodes);
    const uniqueKeys = new Set(nodeKeys);
    expect(nodeKeys.length).toBe(uniqueKeys.size);
  });

  it("step 6: graph/StepFormatRule verifies every journey step has node and action fields", () => {
    for (const journey of Object.values(result.index.journeys)) {
      for (const step of journey.steps) {
        expect(step.node).toBeTruthy();
        expect(step.action).toBeTruthy();
      }
    }
  });

  it("step 7: graph/AllRefsResolveRule verifies every node reference in every step resolves to a known target", () => {
    // No "does not exist" errors in a well-formed graph
    const danglingErrors = result.issues.filter(
      i => i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors).toHaveLength(0);
  });

  it("step 8: graph/CrossModuleRefResolution confirms all cross-module references point to existing nodes", () => {
    // resolveNodeRef correctly resolves cross-module refs
    const ref = resolveNodeRef('_actors/Compiler', 'auth');
    expect(ref.module).toBe('_actors');
    expect(ref.name).toBe('Compiler');
    expect(result.index.nodes[`${ref.module}/${ref.name}`]).toBeDefined();

    // Compiler has cross-module connections
    const compiler = result.index.nodes['_actors/Compiler'];
    expect(compiler.cross_module_connections).toContain('auth/LoginForm');
  });

  it("step 9: graph/ActorRefResolution confirms all actor references point to existing actors", () => {
    const journey = result.index.journeys['Login'];
    expect(journey.actor).toBe('_actors/Compiler');
    expect(result.index.nodes[journey.actor!]).toBeDefined();
    expect(result.index.nodes[journey.actor!].type).toBe('actor');
  });

  it("step 10: graph/NoIsolationRule verifies every node participates in at least one journey", () => {
    expect(result.index._stats.orphans).toBe(0);
    const orphanWarnings = result.issues.filter(i => i.message.includes('Orphan'));
    expect(orphanWarnings).toHaveLength(0);
  });

  it("step 11: graph/ConnectionSet confirms no orphan edges remain pointing to missing nodes", () => {
    // Every preceded_by and followed_by reference points to an existing node
    for (const node of Object.values(result.index.nodes)) {
      for (const ref of node.preceded_by) {
        expect(result.index.nodes[ref]).toBeDefined();
      }
      for (const ref of node.followed_by) {
        expect(result.index.nodes[ref]).toBeDefined();
      }
    }
  });

  it("step 12: compilation/CompilationResult records zero errors, zero orphans, and zero dangling refs as the integrity result", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
    expect(result.index._stats.orphans).toBe(0);
    expect(result.coverage.orphans).toHaveLength(0);
  });
});
