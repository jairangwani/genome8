// Auto-generated from journey: AuditCompletionTriggersPublish
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: _actors, audit, convergence, publish

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/publish.ts

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
  },
  journeys: {},
};

// Fully converged graph: 0 errors, 0 orphans, 0 isolated
const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores session tokens' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/ProjectOwner', action: 'submits credentials' },
        { node: 'Login', action: 'validates credentials' },
        { node: 'TokenStore', action: 'stores session token' },
      ],
    },
    AuditRun: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews auth coverage' },
        { node: 'Login', action: 'confirms login is tested' },
      ],
    },
  },
};

const result = compileFromModules(new Map([['_actors', _actors], ['auth', auth]]));

describe("AuditCompletionTriggersPublish", () => {
  it("step 1: _actors/Auditor completes the final audit round with zero remaining gaps", () => {
    expect(result.coverage.orphans.length).toBe(0);
    expect(result.coverage.isolated_modules.length).toBe(0);
    expect(result.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 2: audit/ConfirmAllGapsResolved verifies every auditor reports no outstanding coverage gaps", () => {
    expect(result.coverage.orphans.length).toBe(0);
    expect(result.coverage.isolated_modules.length).toBe(0);
    // All actors in journeys
    expect(result.index.nodes['_actors/Auditor'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(result.index.nodes['_actors/ProjectOwner'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 3: audit/DeclareConverged declares the graph converged after all audit checks pass", () => {
    const converged =
      result.issues.filter(i => i.severity === 'error').length === 0 &&
      result.index._stats.orphans === 0 &&
      result.index._stats.duplicate_names === 0 &&
      result.index._stats.isolated_modules === 0;
    expect(converged).toBe(true);
  });

  it("step 4: convergence/TriggerPublish signals that convergence is complete and publish should proceed", () => {
    // Converged — proceed to publish
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 5: publish/GenerateInterfaceYaml generates interface.yaml from the audit-verified converged graph", () => {
    const iface = generateInterface(result.index, 'genome8');
    expect(iface).toBeDefined();
    expect(iface.engine).toBe('genome8');
    expect(Object.keys(iface.provides).length).toBe(4); // 2 actors + 2 auth nodes
  });

  it("step 6: publish/ComputeInterfaceHash computes SHA256 hash over the newly published interface", () => {
    const iface = generateInterface(result.index, 'genome8');
    expect(iface.version_hash).toBeDefined();
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
    expect(iface.version_hash.length).toBeGreaterThan(10);
  });

  it("step 7: publish/WriteEventFile writes the event file notifying dependents of the converged interface", () => {
    const iface = generateInterface(result.index, 'genome8');
    // Simulate event payload with interface hash
    const event = {
      type: 'interface-published' as const,
      engine: iface.engine,
      version_hash: iface.version_hash,
      provides: Object.keys(iface.provides),
    };
    expect(event.type).toBe('interface-published');
    expect(event.version_hash.startsWith('sha256:')).toBe(true);
    expect(event.provides.length).toBe(4);
  });

});
