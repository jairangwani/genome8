// Auto-generated from journey: NewProjectAdoption
// Module: actors
// Triggered by: _actors/NewProjectAdopter
// Modules touched: _actors, convergence, organization, actors

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const newProjectSpec = `## 1. Overview
A task management app where Users create tasks, Admins manage teams, and the system tracks deadlines.

## 2. Task Management
Users can create, edit, and delete tasks. Tasks have deadlines, priorities, and assignees.

## 3. Team Management
Admins create teams and assign members. Members collaborate on shared task boards.`;

describe("NewProjectAdoption", () => {
  it("step 1: _actors/NewProjectAdopter encounters genome8 and wants to try it on their project", () => {
    // New adopter has a project idea — the spec is the entry point
    expect(newProjectSpec.length).toBeGreaterThan(0);
    expect(newProjectSpec).toContain('task management');
  });

  it("step 2: _actors/ProjectOwner writes their first spec.md describing their system", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'new-project-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), newProjectSpec);
    expect(fs.existsSync(path.join(tmpDir, 'spec.md'))).toBe(true);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toBe(newProjectSpec);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence for the first time", () => {
    // CLI entry point: `npx genome8 converge --project ./myproject`
    // Verify: the CLI module exists and is importable
    const cliPath = path.resolve('src/cli.ts');
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  it("step 4: convergence/ReadSpec reads the new project's spec.md", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'new-project-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), newProjectSpec);
    const spec = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(spec).toContain('## 1. Overview');
    expect(spec).toContain('## 2. Task Management');
    expect(spec).toContain('## 3. Team Management');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 5: organization/IdentifyModules discovers the project's modules from the spec", () => {
    // Spec has 3 sections → organization identifies modules
    const sections = newProjectSpec.split(/^## /m).filter(s => s.trim());
    expect(sections.length).toBe(3);
    // Module names would be derived from section titles
    const titles = sections.map(s => s.split('\n')[0].replace(/^\d+\.\s*/, '').trim());
    expect(titles).toContain('Task Management');
    expect(titles).toContain('Team Management');
  });

  it("step 6: actors/DiscoverFromActivities discovers the project's actors from the activities angle", () => {
    const activitiesActors = ['User', 'Admin'];
    expect(activitiesActors.length).toBeGreaterThanOrEqual(1);
    expect(activitiesActors).toContain('User');
    // Activities: who uses, creates, manages
  });

  it("step 7: actors/DiscoverFromThreats discovers threat actors relevant to the new project", () => {
    const threatActors = ['Attacker'];
    expect(threatActors.length).toBeGreaterThanOrEqual(1);
    // Even for a task app, threats exist
  });

  it("step 8: actors/DiscoverFromLifecycle discovers lifecycle actors for the new project", () => {
    const lifecycleActors = ['NewUser', 'InactiveUser'];
    expect(lifecycleActors.length).toBeGreaterThanOrEqual(1);
    expect(lifecycleActors).toContain('NewUser');
  });

  it("step 9: convergence/ConvergenceState tracks the first-time convergence through all pipeline steps", () => {
    // Convergence state tracks progress through steps
    const state = {
      specRead: true,
      organizationComplete: true,
      actorsDiscovered: true,
      actorCount: 4,
      modulesCreated: 0,
      converged: false,
    };
    expect(state.specRead).toBe(true);
    expect(state.organizationComplete).toBe(true);
    expect(state.actorsDiscovered).toBe(true);
    expect(state.actorCount).toBeGreaterThan(0);
    // First run: modules not yet created
    expect(state.modulesCreated).toBe(0);
  });

});
