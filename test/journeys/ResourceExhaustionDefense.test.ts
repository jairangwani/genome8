// Auto-generated from journey: ResourceExhaustionDefense
// Module: actors
// Triggered by: _actors/ResourceExhauster
// Modules touched: _actors, organization, hierarchy, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ResourceExhaustionDefense'];
const steps = journey.steps;

describe("ResourceExhaustionDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(6);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'organization', 'hierarchy', 'convergence'])
    );
  });

  it("step 1: _actors/ResourceExhauster submits a spec designed to spawn unbounded child engines", () => {
    // Node: _actors/ResourceExhauster (actor)
    // Action: submits a spec designed to spawn unbounded child engines
    const step = steps[0];
    expect(step.node).toBe('_actors/ResourceExhauster');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/ResourceExhauster'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('unbounded');
    // ResourceExhauster is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/ResourceExhauster');
    // Followed by IdentifyModules in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
  });

  it("step 2: organization/IdentifyModules discovers a very large number of modules from the adversarial spec", () => {
    // Node: organization/IdentifyModules (process)
    // Action: discovers a very large number of modules from the adversarial spec
    const step = steps[1];
    expect(step.node).toBe('organization/IdentifyModules');
    expect(step.step_number).toBe(2);

    const node = index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('independent concerns');
    expect(node.module).toBe('organization');
    // Preceded by ResourceExhauster in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ResourceExhauster'])
    );
    // Followed by ModuleList in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['organization/ModuleList'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: organization/ModuleList stores the inflated module list", () => {
    // Node: organization/ModuleList (artifact)
    // Action: stores the inflated module list
    const step = steps[2];
    expect(step.node).toBe('organization/ModuleList');
    expect(step.step_number).toBe(3);

    const node = index.nodes['organization/ModuleList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('module');
    expect(node.module).toBe('organization');
    // Preceded by IdentifyModules in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
    // Followed by DecideSplit in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['hierarchy/DecideSplit'])
    );
  });

  it("step 4: hierarchy/DecideSplit evaluates whether the large module count warrants splitting", () => {
    // Node: hierarchy/DecideSplit (process)
    // Action: evaluates whether the large module count warrants splitting
    const step = steps[3];
    expect(step.node).toBe('hierarchy/DecideSplit');
    expect(step.step_number).toBe(4);

    const node = index.nodes['hierarchy/DecideSplit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('no hardcoded threshold');
    expect(node.module).toBe('hierarchy');
    // Preceded by ModuleList in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['organization/ModuleList'])
    );
    // Followed by BoundedCreationRule in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/BoundedCreationRule'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: convergence/BoundedCreationRule enforces that creation is bounded by modules times lenses, not unbounded", () => {
    // Node: convergence/BoundedCreationRule (rule)
    // Action: enforces that creation is bounded by modules times lenses, not unbounded
    const step = steps[4];
    expect(step.node).toBe('convergence/BoundedCreationRule');
    expect(step.step_number).toBe(5);

    const node = index.nodes['convergence/BoundedCreationRule'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('bounded');
    expect(node.module).toBe('convergence');
    // Preceded by DecideSplit in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['hierarchy/DecideSplit'])
    );
    // Followed by DataDecidesWhenToStop in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/DataDecidesWhenToStop'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: convergence/DataDecidesWhenToStop allows convergence to complete even with many modules since creation is bounded", () => {
    // Node: convergence/DataDecidesWhenToStop (rule)
    // Action: allows convergence to complete even with many modules since creation is bounded
    const step = steps[5];
    expect(step.node).toBe('convergence/DataDecidesWhenToStop');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/DataDecidesWhenToStop'];
    expect(node).toBeDefined();
    expect(node.type).toBe('rule');
    expect(node.description).toContain('data determines convergence');
    expect(node.module).toBe('convergence');
    // Preceded by BoundedCreationRule in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/BoundedCreationRule'])
    );
  });

  it("journey forms the full attack-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/ResourceExhauster',
      'organization/IdentifyModules',
      'organization/ModuleList',
      'hierarchy/DecideSplit',
      'convergence/BoundedCreationRule',
      'convergence/DataDecidesWhenToStop',
    ]);
  });

  it("attack inflates modules (steps 1-3), defense bounds creation (steps 4-6)", () => {
    // Attack: adversarial spec produces inflated module list
    const attackSteps = steps.slice(0, 3);
    expect(attackSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('organization/')
    )).toBe(true);
    // Defense: hierarchy and convergence rules bound the damage
    const defenseSteps = steps.slice(3);
    expect(defenseSteps.every(s =>
      s.node.startsWith('hierarchy/') || s.node.startsWith('convergence/')
    )).toBe(true);
  });

  it("defense relies on two convergence rules working together", () => {
    const convergenceRules = steps.filter(s => s.node.startsWith('convergence/'));
    expect(convergenceRules).toHaveLength(2);
    // BoundedCreationRule bounds the work, DataDecidesWhenToStop allows completion
    const ruleNodes = convergenceRules.map(s => {
      const node = index.nodes[s.node];
      return node.type;
    });
    expect(ruleNodes).toEqual(['rule', 'rule']);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'organization', 'hierarchy', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("ResourceExhauster is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/ResourceExhauster');
    const node = index.nodes['_actors/ResourceExhauster'];
    expect(node.type).toBe('actor');
  });
});
