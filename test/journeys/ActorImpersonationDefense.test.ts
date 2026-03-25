// Auto-generated from journey: ActorImpersonationDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, graph, compilation, actors, convergence

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['ActorImpersonationDefense'];
const steps = journey.steps;

describe("ActorImpersonationDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(8);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'graph', 'compilation', 'actors', 'convergence'])
    );
  });

  it("step 1: _actors/RogueWorker creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry", () => {
    // Node: _actors/RogueWorker (actor)
    // Action: creates a module with journey steps referencing _actors/FakeAdmin that does not exist in the registry
    const step = steps[0];
    expect(step.node).toBe('_actors/RogueWorker');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/RogueWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('subtly wrong');
    // RogueWorker is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/RogueWorker');
    // Followed by ModuleFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
  });

  it("step 2: graph/ModuleFile stores the module containing the impersonation reference", () => {
    // Node: graph/ModuleFile (artifact)
    // Action: stores the module containing the impersonation reference
    const step = steps[1];
    expect(step.node).toBe('graph/ModuleFile');
    expect(step.step_number).toBe(2);

    const node = index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('YAML file');
    expect(node.module).toBe('graph');
    // Preceded by RogueWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/RogueWorker'])
    );
    // Followed by YAMLParsing in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/YAMLParsing'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: compilation/YAMLParsing parses the module and extracts the _actors/ references from journey steps", () => {
    // Node: compilation/YAMLParsing (process)
    // Action: parses the module and extracts the _actors/ references from journey steps
    const step = steps[2];
    expect(step.node).toBe('compilation/YAMLParsing');
    expect(step.step_number).toBe(3);

    const node = index.nodes['compilation/YAMLParsing'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('YAML');
    expect(node.module).toBe('compilation');
    // Preceded by ModuleFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
    // Followed by DetectActorImpersonation in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DetectActorImpersonation'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: actors/DetectActorImpersonation compares each _actors/ reference against the validated actor registry", () => {
    // Node: actors/DetectActorImpersonation (process)
    // Action: compares each _actors/ reference against the validated actor registry
    const step = steps[3];
    expect(step.node).toBe('actors/DetectActorImpersonation');
    expect(step.step_number).toBe(4);

    const node = index.nodes['actors/DetectActorImpersonation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('registry');
    expect(node.module).toBe('actors');
    // Preceded by YAMLParsing in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/YAMLParsing'])
    );
    // Followed by DanglingRefDetection in this journey (cross-module edge)
    // (steps 4→5 are the same node, so the edge is from step 5→6)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/DanglingRefDetection'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: actors/DetectActorImpersonation flags the unregistered _actors/FakeAdmin reference as a validation error", () => {
    // Node: actors/DetectActorImpersonation (process)
    // Action: flags the unregistered _actors/FakeAdmin reference as a validation error
    const step = steps[4];
    expect(step.node).toBe('actors/DetectActorImpersonation');
    expect(step.step_number).toBe(5);

    // Same node as step 4, appearing twice to model two-phase detection
    const node = index.nodes['actors/DetectActorImpersonation'];
    expect(node.description).toContain('non-existent');
  });

  it("step 6: compilation/DanglingRefDetection confirms the reference does not resolve to any known node", () => {
    // Node: compilation/DanglingRefDetection (process)
    // Action: confirms the reference does not resolve to any known node
    const step = steps[5];
    expect(step.node).toBe('compilation/DanglingRefDetection');
    expect(step.step_number).toBe(6);

    const node = index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('no known node');
    expect(node.module).toBe('compilation');
    // Preceded by DetectActorImpersonation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DetectActorImpersonation'])
    );
    // Followed by ErrorReport in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: compilation/ErrorReport records the impersonation attempt with the specific step location and fake actor name", () => {
    // Node: compilation/ErrorReport (artifact)
    // Action: records the impersonation attempt with the specific step location and fake actor name
    const step = steps[6];
    expect(step.node).toBe('compilation/ErrorReport');
    expect(step.step_number).toBe(7);

    const node = index.nodes['compilation/ErrorReport'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('validation errors');
    expect(node.module).toBe('compilation');
    // Preceded by DanglingRefDetection in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/DanglingRefDetection'])
    );
    // Followed by AuditGapFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/AuditGapFix'])
    );
  });

  it("step 8: convergence/AuditGapFix targeted fix removes or replaces the fake actor reference with a valid one", () => {
    // Node: convergence/AuditGapFix (process)
    // Action: targeted fix removes or replaces the fake actor reference with a valid one
    const step = steps[7];
    expect(step.node).toBe('convergence/AuditGapFix');
    expect(step.step_number).toBe(8);

    const node = index.nodes['convergence/AuditGapFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted');
    expect(node.module).toBe('convergence');
    // Preceded by ErrorReport in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/ErrorReport'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full impersonation-then-detection sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/RogueWorker',
      'graph/ModuleFile',
      'compilation/YAMLParsing',
      'actors/DetectActorImpersonation',
      'actors/DetectActorImpersonation',
      'compilation/DanglingRefDetection',
      'compilation/ErrorReport',
      'convergence/AuditGapFix',
    ]);
  });

  it("attack phase stores bad module (steps 1-2), detection phase catches it (steps 3-7), fix resolves it (step 8)", () => {
    // Attack: rogue worker creates module with fake actor ref
    const attackSteps = steps.slice(0, 2);
    expect(attackSteps.every(s =>
      s.node.startsWith('_actors/') || s.node.startsWith('graph/')
    )).toBe(true);
    // Detection: parsing, actor impersonation check, dangling ref, error report
    const detectionSteps = steps.slice(2, 7);
    expect(detectionSteps.every(s =>
      s.node.startsWith('compilation/') || s.node.startsWith('actors/')
    )).toBe(true);
    // Fix: audit gap fix
    expect(steps[7].node).toBe('convergence/AuditGapFix');
  });

  it("DetectActorImpersonation appears twice for two-phase detection (compare then flag)", () => {
    const impersonationSteps = steps.filter(s => s.node === 'actors/DetectActorImpersonation');
    expect(impersonationSteps).toHaveLength(2);
    expect(impersonationSteps[0].step_number).toBe(4);
    expect(impersonationSteps[1].step_number).toBe(5);
  });

  it("crosses 5 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'graph', 'compilation', 'actors', 'convergence']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("RogueWorker is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/RogueWorker');
    const node = index.nodes['_actors/RogueWorker'];
    expect(node.type).toBe('actor');
  });
});
