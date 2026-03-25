// Auto-generated from journey: MigratingProjectBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, organization, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['MigratingProjectBootstrap'];
const steps = journey.steps;

describe("MigratingProjectBootstrap", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('actors');
    expect(steps).toHaveLength(8);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['_actors', 'convergence', 'organization', 'compilation'])
    );
  });

  it("step 1: _actors/MigratingProject has existing documentation and code that needs to be captured in the graph", () => {
    // Node: _actors/MigratingProject (actor)
    // Action: has existing documentation and code that needs to be captured in the graph
    const step = steps[0];
    expect(step.node).toBe('_actors/MigratingProject');
    expect(step.step_number).toBe(1);

    const node = index.nodes['_actors/MigratingProject'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('existing codebase');
    // MigratingProject is the journey trigger (first actor node)
    expect(journey.actor).toBe('_actors/MigratingProject');
    // Followed by ProjectOwner in this journey (same module)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/ProjectOwner'])
    );
  });

  it("step 2: _actors/ProjectOwner writes a spec.md summarizing the existing system", () => {
    // Node: _actors/ProjectOwner (actor)
    // Action: writes a spec.md summarizing the existing system
    const step = steps[1];
    expect(step.node).toBe('_actors/ProjectOwner');
    expect(step.step_number).toBe(2);

    const node = index.nodes['_actors/ProjectOwner'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('spec.md');
    // Preceded by MigratingProject in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/MigratingProject'])
    );
    // Followed by ReadSpec in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
  });

  it("step 3: convergence/ReadSpec reads the migration spec", () => {
    // Node: convergence/ReadSpec (process)
    // Action: reads the migration spec
    const step = steps[2];
    expect(step.node).toBe('convergence/ReadSpec');
    expect(step.step_number).toBe(3);

    const node = index.nodes['convergence/ReadSpec'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('spec.md');
    expect(node.module).toBe('convergence');
    // Preceded by ProjectOwner in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/ProjectOwner'])
    );
    // Followed by IdentifyModules in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 4: organization/IdentifyModules discovers modules that map to the existing system's components", () => {
    // Node: organization/IdentifyModules (process)
    // Action: discovers modules that map to the existing system's components
    const step = steps[3];
    expect(step.node).toBe('organization/IdentifyModules');
    expect(step.step_number).toBe(4);

    const node = index.nodes['organization/IdentifyModules'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('independent concerns');
    expect(node.module).toBe('organization');
    // Preceded by ReadSpec in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ReadSpec'])
    );
    // Followed by LLMWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 5: _actors/LLMWorker analyzes existing artifacts to inform module creation with pre-existing context", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: analyzes existing artifacts to inform module creation with pre-existing context
    const step = steps[4];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(5);

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('Claude Code');
    // Preceded by IdentifyModules in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['organization/IdentifyModules'])
    );
    // Followed by ModuleCreation in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['convergence/ModuleCreation'])
    );
  });

  it("step 6: convergence/ModuleCreation creates modules that capture the existing system's structure", () => {
    // Node: convergence/ModuleCreation (process)
    // Action: creates modules that capture the existing system's structure
    const step = steps[5];
    expect(step.node).toBe('convergence/ModuleCreation');
    expect(step.step_number).toBe(6);

    const node = index.nodes['convergence/ModuleCreation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('one LLM call per module');
    expect(node.module).toBe('convergence');
    // Preceded by LLMWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: _actors/Compiler validates that the bootstrapped graph is consistent", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates that the bootstrapped graph is consistent
    const step = steps[6];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(7);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    // Preceded by ModuleCreation in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['convergence/ModuleCreation'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
  });

  it("step 8: compilation/CompilationResult reports any gaps between the spec and the bootstrapped modules", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: reports any gaps between the spec and the bootstrapped modules
    const step = steps[7];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(8);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("journey forms the full migration bootstrap sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      '_actors/MigratingProject',
      '_actors/ProjectOwner',
      'convergence/ReadSpec',
      'organization/IdentifyModules',
      '_actors/LLMWorker',
      'convergence/ModuleCreation',
      '_actors/Compiler',
      'compilation/CompilationResult',
    ]);
  });

  it("bootstrap phase: spec → modules → creation (steps 1-6), validation phase (steps 7-8)", () => {
    // Bootstrap: migrating project writes spec, discovers modules, creates them
    const bootstrapSteps = steps.slice(0, 6);
    expect(bootstrapSteps.map(s => s.node)).toEqual([
      '_actors/MigratingProject',
      '_actors/ProjectOwner',
      'convergence/ReadSpec',
      'organization/IdentifyModules',
      '_actors/LLMWorker',
      'convergence/ModuleCreation',
    ]);
    // Validation: compiler checks and reports
    const validationSteps = steps.slice(6);
    expect(validationSteps.every(s =>
      s.node.startsWith('_actors/Compiler') || s.node.startsWith('compilation/')
    )).toBe(true);
  });

  it("crosses 4 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['_actors', 'convergence', 'organization', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });

  it("MigratingProject is the triggering actor", () => {
    expect(journey.actor).toBe('_actors/MigratingProject');
    const node = index.nodes['_actors/MigratingProject'];
    expect(node.type).toBe('actor');
  });
});
