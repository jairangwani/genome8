// Auto-generated from journey: SpecInjectionDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, convergence, actors, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['SpecInjectionDefense'];
const steps = journey.steps;

describe("SpecInjectionDefense", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(8);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'convergence', 'actors', 'compilation'])
    );
  });

  it("step 1: _actors/MaliciousSpecAuthor submits a spec.md containing prompt injection or adversarial content", () => {
    // Node: _actors/MaliciousSpecAuthor (actor)
    // Action: submits a spec.md containing prompt injection or adversarial content
    const step = steps[0];
    expect(step.node).toBe('_actors/MaliciousSpecAuthor');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('injection');
    // MaliciousSpecAuthor is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    // Followed by ReadSpec in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
  });

  it("step 2: convergence/ReadSpec reads the potentially malicious spec from disk", () => {
    // Node: convergence/ReadSpec (process)
    // Action: reads the potentially malicious spec from disk
    const step = steps[1];
    expect(step.node).toBe('convergence/ReadSpec');
    expect(step.step_number).toBe(2);

    const node = index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.module).toBe('convergence');
    // Preceded by MaliciousSpecAuthor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/MaliciousSpecAuthor'])
    );
    // Followed by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
  });

  it("step 3: actors/DiscoverFromActivities processes the spec through LLM which may encounter injected prompts", () => {
    // Node: actors/DiscoverFromActivities (process)
    // Action: processes the spec through LLM which may encounter injected prompts
    const step = steps[2];
    expect(step.node).toBe('actors/DiscoverFromActivities');
    expect(step.step_number).toBe(3);

    const node = index.nodes['actors/DiscoverFromActivities'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('activities');
    // Preceded by ReadSpec in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    // Followed by LLMWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
  });

  it("step 4: _actors/LLMWorker receives the spec content including any adversarial payloads", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: receives the spec content including any adversarial payloads
    const step = steps[3];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(4);

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Preceded by DiscoverFromActivities in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/DiscoverFromActivities'])
    );
    // Followed by WriteActorsFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
  });

  it("step 5: actors/WriteActorsFile writes whatever actors the LLM discovered including any injected entries", () => {
    // Node: actors/WriteActorsFile (process)
    // Action: writes whatever actors the LLM discovered including any injected entries
    const step = steps[4];
    expect(step.node).toBe('actors/WriteActorsFile');
    expect(step.step_number).toBe(5);

    const node = index.nodes['actors/WriteActorsFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('_actors.yaml');
    // Preceded by LLMWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
  });

  it("step 6: _actors/Compiler validates the resulting _actors.yaml for structural correctness", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates the resulting _actors.yaml for structural correctness
    const step = steps[5];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(6);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // Preceded by WriteActorsFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['actors/WriteActorsFile'])
    );
    // Followed by DuplicateDetection in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/DuplicateDetection'])
    );
  });

  it("step 7: compilation/DuplicateDetection catches any duplicate actor names injected by the adversarial content", () => {
    // Node: compilation/DuplicateDetection (process)
    // Action: catches any duplicate actor names injected by the adversarial content
    const step = steps[6];
    expect(step.node).toBe('compilation/DuplicateDetection');
    expect(step.step_number).toBe(7);

    const node = index.nodes['compilation/DuplicateDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('duplicate');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by DanglingRefDetection in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/DanglingRefDetection'])
    );
  });

  it("step 8: compilation/DanglingRefDetection catches any phantom references injected through the adversarial spec", () => {
    // Node: compilation/DanglingRefDetection (process)
    // Action: catches any phantom references injected through the adversarial spec
    const step = steps[7];
    expect(step.node).toBe('compilation/DanglingRefDetection');
    expect(step.step_number).toBe(8);

    const node = index.nodes['compilation/DanglingRefDetection'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('no known node');
    expect(node.module).toBe('compilation');
    // Preceded by DuplicateDetection in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/DuplicateDetection'])
    );
  });

  it("journey forms the full attack-then-defense sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/MaliciousSpecAuthor',
      'convergence/ReadSpec',
      'actors/DiscoverFromActivities',
      '_actors/LLMWorker',
      'actors/WriteActorsFile',
      '_actors/Compiler',
      'compilation/DuplicateDetection',
      'compilation/DanglingRefDetection',
    ]);
  });

  it("attack path (steps 1-5) leads into defense path (steps 6-8)", () => {
    // Attack: malicious input flows through pipeline unchecked
    const attackSteps = steps.slice(0, 5);
    expect(attackSteps.map(s => s.node)).toEqual([
      '_actors/MaliciousSpecAuthor',
      'convergence/ReadSpec',
      'actors/DiscoverFromActivities',
      '_actors/LLMWorker',
      'actors/WriteActorsFile',
    ]);
    // Defense: compiler detects structural violations
    const defenseSteps = steps.slice(5);
    expect(defenseSteps.map(s => s.node)).toEqual([
      '_actors/Compiler',
      'compilation/DuplicateDetection',
      'compilation/DanglingRefDetection',
    ]);
  });

  it("every consecutive step pair except the last crosses a module boundary", () => {
    const modules = steps.map(s => s.node.split('/')[0]);
    // _actors→convergence→actors→_actors→actors→_actors→compilation→compilation
    expect(modules[0]).not.toBe(modules[1]); // _actors → convergence
    expect(modules[1]).not.toBe(modules[2]); // convergence → actors
    expect(modules[2]).not.toBe(modules[3]); // actors → _actors
    expect(modules[3]).not.toBe(modules[4]); // _actors → actors
    expect(modules[4]).not.toBe(modules[5]); // actors → _actors
    expect(modules[5]).not.toBe(modules[6]); // _actors → compilation
    expect(modules[6]).toBe(modules[7]);     // compilation → compilation
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'convergence', 'actors', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("MaliciousSpecAuthor is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/MaliciousSpecAuthor');
    const node = index.nodes['_actors/MaliciousSpecAuthor'];
    expect(node.type).toBe('actor');
  });
});
