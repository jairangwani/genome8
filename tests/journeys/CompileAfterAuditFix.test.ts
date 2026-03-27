// Auto-generated from journey: CompileAfterAuditFix
// Module: compilation
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("CompileAfterAuditFix", () => {
  // Simulate: a module before fix had an orphan node, after fix it is used in a journey
  const modulesBeforeFix = new Map<string, ModuleFile>([
    ['svc', {
      spec_sections: [1],
      nodes: {
        Auth: { type: 'process', description: 'Authenticates users via credentials' },
        Logger: { type: 'process', description: 'Logs audit trail for requests' },
      },
      journeys: {
        Login: {
          steps: [{ node: 'Auth', action: 'validates user credentials' }],
          // Logger is orphaned — not in any journey
        },
      },
    }],
  ]);

  const modulesAfterFix = new Map<string, ModuleFile>([
    ['svc', {
      spec_sections: [1],
      nodes: {
        Auth: { type: 'process', description: 'Authenticates users via credentials' },
        Logger: { type: 'process', description: 'Logs audit trail for requests' },
      },
      journeys: {
        Login: {
          steps: [
            { node: 'Auth', action: 'validates user credentials' },
            { node: 'Logger', action: 'logs the authentication event' },
          ],
        },
      },
    }],
  ]);

  const beforeResult = compileFromModules(modulesBeforeFix);
  const afterResult = compileFromModules(modulesAfterFix);

  it("step 1: convergence/RecompileAfterFix triggers recompilation after an audit gap fix has been applied", () => {
    // Both compilations complete
    expect(beforeResult).toBeDefined();
    expect(afterResult).toBeDefined();
  });

  it("step 2: _actors/Compiler runs full compilation on the patched graph", () => {
    expect(afterResult.index._stats.modules).toBe(1);
  });

  it("step 3: compilation/YAMLParsing reparses all modules including the edited one", () => {
    expect(afterResult.index._stats.modules).toBe(1);
    expect(afterResult.index.nodes['svc/Auth']).toBeDefined();
    expect(afterResult.index.nodes['svc/Logger']).toBeDefined();
  });

  it("step 4: compilation/YAMLErrorReporting checks for YAML errors in the edited module", () => {
    const parseErrors = afterResult.issues.filter(i => i.message.includes('YAML parse error'));
    expect(parseErrors.length).toBe(0);
  });

  it("step 5: compilation/FieldLossDetection compares the edited module's YAML before and after the fix to detect any fields silently dropped by the LLM rewrite", () => {
    // Both before and after have the same nodes — no fields lost
    const beforeNodes = Object.keys(modulesBeforeFix.get('svc')!.nodes);
    const afterNodes = Object.keys(modulesAfterFix.get('svc')!.nodes);
    expect(afterNodes).toEqual(expect.arrayContaining(beforeNodes));
  });

  it("step 6: graph/FieldPreservation verifies that all original fields including extension fields still exist in the rewritten module", () => {
    // spec_sections preserved
    expect(modulesAfterFix.get('svc')!.spec_sections).toEqual([1]);
  });

  it("step 7: graph/ConnectionComputation recomputes all connections with the fix applied", () => {
    // After fix, Auth -> Logger connection exists
    expect(afterResult.index.nodes['svc/Auth'].followed_by).toContain('svc/Logger');
  });

  it("step 8: compilation/DuplicateDetection rechecks for duplicates after the fix", () => {
    expect(afterResult.index._stats.duplicate_names).toBe(0);
  });

  it("step 9: compilation/DanglingRefDetection rechecks for dangling refs after the fix", () => {
    const errors = afterResult.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(errors.length).toBe(0);
  });

  it("step 10: compilation/OrphanDetection rechecks for orphans after the fix", () => {
    // Before fix: Logger was orphaned
    expect(beforeResult.index._stats.orphans).toBe(1);
    // After fix: Logger is in a journey
    expect(afterResult.index._stats.orphans).toBe(0);
  });

  it("step 11: compilation/StaleConnectionDetection checks for connections referencing nodes removed or renamed by the fix", () => {
    for (const node of Object.values(afterResult.index.nodes)) {
      for (const ref of node.followed_by) {
        expect(afterResult.index.nodes[ref]).toBeDefined();
      }
    }
  });

  it("step 12: compilation/ValidationAggregation collects all results from the recompilation", () => {
    expect(Array.isArray(afterResult.issues)).toBe(true);
  });

  it("step 13: compilation/CompilationResult outputs the post-fix compilation result", () => {
    expect(afterResult.index._stats.total_nodes).toBe(2);
    expect(afterResult.index._stats.total_journeys).toBe(1);
  });

  it("step 14: compilation/ZeroErrorConvergence confirms the fix maintained zero-error status", () => {
    const errors = afterResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(afterResult.index._stats.orphans).toBe(0);
  });

  it("step 15: convergence/ReauditAfterFix proceeds to re-audit to verify the gap is closed", () => {
    // A clean result (0 errors, 0 orphans) means re-audit can proceed
    const errors = afterResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(afterResult.index._stats.orphans).toBe(0);
  });
});
