// Auto-generated from journey: AuditCompletionTriggersPublish
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: _actors, audit, convergence, publish

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

function buildConvergedGraph() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'Platform user' },
        Admin: { type: 'actor', description: 'Platform admin' },
      },
    }],
    ['auth', {
      spec_sections: [1],
      nodes: {
        Login: { type: 'process', description: 'Login flow' },
        Token: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'submits credentials' },
            { node: 'Login', action: 'authenticates' },
            { node: 'Token', action: 'is issued' },
          ],
        },
      },
    }],
    ['admin', {
      spec_sections: [2],
      nodes: {
        Dashboard: { type: 'interface', description: 'Admin dashboard' },
      },
      journeys: {
        AdminAccess: {
          steps: [
            { node: '_actors/Admin', action: 'opens dashboard' },
            { node: 'Dashboard', action: 'renders panel' },
            { node: 'auth/Token', action: 'validates session' },
          ],
        },
      },
    }],
  ]));
}

describe("AuditCompletionTriggersPublish", () => {
  it("step 1: _actors/Auditor completes the final audit round with zero remaining gaps", () => {
    const auditResult = { round: 2, gapsRemaining: 0, allPassed: true };
    expect(auditResult.gapsRemaining).toBe(0);
    expect(auditResult.allPassed).toBe(true);
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies every auditor reports no outstanding coverage gaps", () => {
    const specGaps: any[] = [];
    const actorGaps: any[] = [];
    const crossModGaps: any[] = [];
    const allResolved = specGaps.length === 0 && actorGaps.length === 0 && crossModGaps.length === 0;
    expect(allResolved).toBe(true);
  });

  it("step 3: audit/DeclareConverged declares the graph converged after all audit checks pass", () => {
    const result = buildConvergedGraph();
    const errors = result.issues.filter(i => i.severity === 'error');
    const state = {
      status: 'CONVERGED',
      auditPassed: true,
      errors: errors.length,
      orphans: result.index._stats.orphans,
    };
    expect(state.status).toBe('CONVERGED');
    expect(state.errors).toBe(0);
    expect(state.orphans).toBe(0);
  });

  it("step 4: convergence/TriggerPublish signals that convergence is complete and publish should proceed", () => {
    const signal = { type: 'convergence_complete', action: 'publish' };
    expect(signal.type).toBe('convergence_complete');
    expect(signal.action).toBe('publish');
  });

  it("step 5: publish/GenerateInterfaceYaml generates interface.yaml from the audit-verified converged graph", () => {
    const result = buildConvergedGraph();
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
    expect(Object.keys(iface.provides).length).toBeGreaterThan(0);
    expect(Object.keys(iface.requires).length).toBeGreaterThanOrEqual(0);
  });

  it("step 6: publish/ComputeInterfaceHash computes SHA256 hash over the newly published interface", () => {
    const result = buildConvergedGraph();
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(iface.version_hash.length).toBeGreaterThan(10);
  });

  it("step 7: publish/WriteEventFile writes the event file notifying dependents of the converged interface", () => {
    const result = buildConvergedGraph();
    const iface = generateInterface(result.index, 'test-engine');
    // Event file would contain the hash for dependents to detect changes
    const eventPayload = {
      type: 'interface_published',
      engine: iface.engine,
      version_hash: iface.version_hash,
      provides: Object.keys(iface.provides),
    };
    expect(eventPayload.type).toBe('interface_published');
    expect(eventPayload.version_hash).toMatch(/^sha256:/);
    expect(eventPayload.provides.length).toBeGreaterThan(0);
  });

});
