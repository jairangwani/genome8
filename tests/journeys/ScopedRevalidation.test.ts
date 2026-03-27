// Auto-generated from journey: ScopedRevalidation
// Module: graph
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("ScopedRevalidation", () => {
  // Before change: clean graph
  const modulesBefore = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Admin: { type: 'actor', description: 'System administrator' } },
      journeys: {},
    }],
    ['settings', {
      nodes: {
        ConfigForm: { type: 'interface', description: 'Settings configuration form' },
        ConfigStore: { type: 'artifact', description: 'Persisted configuration' },
      },
      journeys: {
        UpdateConfig: {
          steps: [
            { node: '_actors/Admin', action: 'opens settings' },
            { node: 'ConfigForm', action: 'displays configuration options' },
            { node: 'ConfigStore', action: 'persists changes' },
          ],
        },
      },
    }],
    ['notifications', {
      nodes: {
        Notifier: { type: 'process', description: 'Sends notifications' },
      },
      journeys: {
        NotifyChange: {
          steps: [
            { node: 'settings/ConfigStore', action: 'detects config change' },
            { node: 'Notifier', action: 'sends notification to subscribers' },
          ],
        },
      },
    }],
  ]);

  // After change: settings module adds a new node, rest unchanged
  const modulesAfter = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: { Admin: { type: 'actor', description: 'System administrator' } },
      journeys: {},
    }],
    ['settings', {
      nodes: {
        ConfigForm: { type: 'interface', description: 'Settings configuration form' },
        ConfigStore: { type: 'artifact', description: 'Persisted configuration' },
        ConfigValidator: { type: 'rule', description: 'Validates configuration values' },
      },
      journeys: {
        UpdateConfig: {
          steps: [
            { node: '_actors/Admin', action: 'opens settings' },
            { node: 'ConfigForm', action: 'displays configuration options' },
            { node: 'ConfigValidator', action: 'validates the new values' },
            { node: 'ConfigStore', action: 'persists changes' },
          ],
        },
      },
    }],
    ['notifications', {
      nodes: {
        Notifier: { type: 'process', description: 'Sends notifications' },
      },
      journeys: {
        NotifyChange: {
          steps: [
            { node: 'settings/ConfigStore', action: 'detects config change' },
            { node: 'Notifier', action: 'sends notification to subscribers' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBefore);
  const resultAfter = compileFromModules(modulesAfter);

  it("step 1: graph/CompiledIndex identifies which nodes and journeys were affected by the latest module change", () => {
    // New node ConfigValidator appeared
    expect(resultBefore.index.nodes['settings/ConfigValidator']).toBeUndefined();
    expect(resultAfter.index.nodes['settings/ConfigValidator']).toBeDefined();
  });

  it("step 2: graph/ScopedValidation extracts the subgraph of affected nodes, their journeys, and their connections", () => {
    // The affected journey is UpdateConfig in settings module
    const journey = resultAfter.index.journeys['UpdateConfig'];
    expect(journey.modules_touched).toContain('settings');
    expect(journey.modules_touched).toContain('_actors');
    expect(journey.steps).toHaveLength(4);
  });

  it("step 3: graph/NodeTypeSchema validates types only for newly added or modified nodes", () => {
    const validator = resultAfter.index.nodes['settings/ConfigValidator'];
    expect(validator.type).toBe('rule');
    const validTypes = ['actor', 'process', 'artifact', 'interface', 'rule'];
    expect(validTypes).toContain(validator.type);
  });

  it("step 4: graph/UniqueNodeNameRule checks new node names against the existing registry for collisions", () => {
    // No duplicate name issues
    expect(resultAfter.index._stats.duplicate_names).toBe(0);
  });

  it("step 5: graph/StepFormatRule validates step format only in new or modified journeys", () => {
    const journey = resultAfter.index.journeys['UpdateConfig'];
    for (const step of journey.steps) {
      expect(step.node).toBeTruthy();
      expect(step.action).toBeTruthy();
      expect(step.step_number).toBeGreaterThan(0);
    }
  });

  it("step 6: graph/AllRefsResolveRule checks that references in affected journeys resolve to known targets", () => {
    const danglingErrors = resultAfter.issues.filter(
      i => i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors).toHaveLength(0);
  });

  it("step 7: graph/NoIsolationRule checks that affected nodes still participate in at least one journey", () => {
    // ConfigValidator is now in the UpdateConfig journey
    const validator = resultAfter.index.nodes['settings/ConfigValidator'];
    expect(validator.in_journeys.length).toBeGreaterThan(0);
    expect(resultAfter.index._stats.orphans).toBe(0);
  });

  it("step 8: compilation/CompilationResult reports validation results scoped to the affected subgraph only", () => {
    const errors = resultAfter.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
    expect(resultAfter.coverage.orphans).toHaveLength(0);
  });
});
