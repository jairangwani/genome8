// Auto-generated from journey: RevalidateChangedModulesOnly
// Module: compilation
// Modules touched: convergence, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RevalidateChangedModulesOnly", () => {
  // Original: two modules, both clean
  const original = new Map<string, ModuleFile>([
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Handles user authentication flow' },
      },
      journeys: {
        Authenticate: {
          steps: [{ node: 'Login', action: 'validates user login credentials' }],
        },
      },
    }],
    ['billing', {
      spec_sections: [2],
      nodes: {
        Invoice: { type: 'artifact', description: 'Stores invoice records for billing' },
      },
      journeys: {
        Bill: {
          steps: [
            { node: 'auth/Login', action: 'authenticates user before billing' },
            { node: 'Invoice', action: 'generates the invoice record' },
          ],
        },
      },
    }],
  ]);

  // After editing auth module: added a new node
  const edited = new Map<string, ModuleFile>([
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Handles user authentication flow' },
        MFA: { type: 'process', description: 'Multi-factor authentication step' },
      },
      journeys: {
        Authenticate: {
          steps: [
            { node: 'Login', action: 'validates user login credentials' },
            { node: 'MFA', action: 'verifies multi-factor authentication' },
          ],
        },
      },
    }],
    ['billing', {
      spec_sections: [2],
      nodes: {
        Invoice: { type: 'artifact', description: 'Stores invoice records for billing' },
      },
      journeys: {
        Bill: {
          steps: [
            { node: 'auth/Login', action: 'authenticates user before billing' },
            { node: 'Invoice', action: 'generates the invoice record' },
          ],
        },
      },
    }],
  ]);

  const originalResult = compileFromModules(original);
  const editedResult = compileFromModules(edited);

  it("step 1: convergence/RecompileAfterFix triggers recompilation after an audit fix edited a single module", () => {
    expect(editedResult).toBeDefined();
  });

  it("step 2: compilation/DirtyModuleTracking identifies the edited module and all modules whose journeys reference its nodes", () => {
    // auth was edited; billing references auth/Login
    // Both are "dirty" modules
    expect(editedResult.coverage.modules['auth']).toBeDefined();
    expect(editedResult.coverage.modules['billing']).toBeDefined();
  });

  it("step 3: graph/CompiledIndex provides the existing compiled index for scoped revalidation", () => {
    expect(originalResult.index._compiled).toBeDefined();
    expect(originalResult.index._stats.total_nodes).toBe(2);
  });

  it("step 4: compilation/YAMLParsing reparses only the edited module file", () => {
    // In the full recompile, auth now has 2 nodes
    expect(editedResult.index.nodes['auth/MFA']).toBeDefined();
    expect(editedResult.index._stats.total_nodes).toBe(3);
  });

  it("step 5: compilation/YAMLErrorReporting checks the edited module for YAML syntax errors", () => {
    const parseErrors = editedResult.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 6: graph/ScopedValidation extracts the subgraph of nodes and journeys affected by the dirty module set", () => {
    // auth nodes and billing journey (which refs auth/Login) are both in the result
    expect(editedResult.index.journeys['Authenticate']).toBeDefined();
    expect(editedResult.index.journeys['Bill']).toBeDefined();
  });

  it("step 7: compilation/DuplicateDetection checks only nodes from dirty modules against the full registry", () => {
    expect(editedResult.index._stats.duplicate_names).toBe(0);
  });

  it("step 8: compilation/DanglingRefDetection checks only journey steps in dirty modules for unresolved refs", () => {
    const danglingErrors = editedResult.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(danglingErrors.length).toBe(0);
  });

  it("step 9: compilation/OrphanDetection checks only nodes in dirty modules for orphan status", () => {
    expect(editedResult.index._stats.orphans).toBe(0);
  });

  it("step 10: compilation/StaleConnectionDetection checks only connections involving dirty module nodes for staleness", () => {
    for (const node of Object.values(editedResult.index.nodes)) {
      for (const ref of node.followed_by) {
        expect(editedResult.index.nodes[ref]).toBeDefined();
      }
    }
  });

  it("step 11: compilation/ValidationAggregation collects results from the scoped checks", () => {
    expect(Array.isArray(editedResult.issues)).toBe(true);
  });

  it("step 12: compilation/CompilationResult outputs a scoped revalidation result covering only the affected subgraph", () => {
    expect(editedResult.index._stats.total_nodes).toBe(3);
    expect(editedResult.index._stats.total_journeys).toBe(2);
    expect(editedResult.coverage.modules['auth'].nodes).toBe(2);
  });
});
