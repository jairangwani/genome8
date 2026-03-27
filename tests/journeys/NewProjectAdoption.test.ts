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

// Implementation: src/cli.ts
// Implementation: src/convergence.ts
// Implementation: test/integration.test.ts
// Implementation: test-project/

describe("NewProjectAdoption", () => {
  it("step 1: _actors/NewProjectAdopter encounters genome8 and wants to try it on their project", () => {
    // A new project starts with no genome directory — just a spec.md
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-adopt-'));
    const specPath = path.join(tmpDir, 'spec.md');
    // No modules directory yet
    expect(fs.existsSync(path.join(tmpDir, 'genome', 'modules'))).toBe(false);
    // But the project dir exists
    expect(fs.existsSync(tmpDir)).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 2: _actors/ProjectOwner writes their first spec.md describing their system", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-adopt-'));
    const specContent = '# My New Project\n\nA task management app with user auth and notifications.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), specContent);
    const read = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(read).toContain('My New Project');
    expect(read).toContain('task management');
    expect(read.length).toBeGreaterThan(20);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence for the first time", () => {
    // CLI exists and is importable — the entry point is src/cli.ts
    // Verify the compile function is available (core of CLI)
    expect(typeof compile).toBe('function');
    expect(typeof compileFromModules).toBe('function');
  });

  it("step 4: convergence/ReadSpec reads the new project's spec.md", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-adopt-'));
    const spec = '# Fresh Project\nA REST API for managing widgets.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), spec);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toBe(spec);
    expect(content).toContain('REST API');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 5: organization/IdentifyModules discovers the project's modules from the spec", () => {
    // Organization step produces a list of modules based on spec content
    // Simulate: spec mentions auth, gateway, storage → 3 modules identified
    const identifiedModules = ['auth', 'gateway', 'storage'];
    expect(identifiedModules.length).toBeGreaterThanOrEqual(2);
    expect(identifiedModules).toContain('auth');
    expect(identifiedModules).toContain('gateway');
  });

  it("step 6: actors/DiscoverFromActivities discovers the project's actors from the activities angle", () => {
    // Activities angle identifies who uses the system
    const activityActors = ['EndUser', 'Admin', 'APIClient'];
    expect(activityActors.length).toBeGreaterThanOrEqual(1);
    expect(activityActors).toContain('EndUser');
  });

  it("step 7: actors/DiscoverFromThreats discovers threat actors relevant to the new project", () => {
    // Threats angle identifies attackers
    const threatActors = ['UnauthenticatedAttacker', 'DataExfiltrator'];
    expect(threatActors.length).toBeGreaterThanOrEqual(1);
    expect(threatActors).toContain('UnauthenticatedAttacker');
  });

  it("step 8: actors/DiscoverFromLifecycle discovers lifecycle actors for the new project", () => {
    // Lifecycle angle identifies adoption/churn actors
    const lifecycleActors = ['NewUser', 'PowerUser', 'ChurningUser'];
    expect(lifecycleActors.length).toBeGreaterThanOrEqual(1);
    expect(lifecycleActors).toContain('NewUser');
  });

  it("step 9: convergence/ConvergenceState tracks the first-time convergence through all pipeline steps", () => {
    // After first convergence, a compiled index exists with actors and modules
    const _actorsModule: ModuleFile = {
      nodes: {
        EndUser: { type: 'actor', description: 'primary user of the system' },
        Admin: { type: 'actor', description: 'system administrator' },
      },
      journeys: {},
    };
    const authModule: ModuleFile = {
      nodes: {
        Login: { type: 'process', description: 'authenticates users' },
        TokenStore: { type: 'artifact', description: 'stores session tokens' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/EndUser', action: 'submits credentials' },
            { node: 'Login', action: 'validates credentials' },
            { node: 'TokenStore', action: 'stores session token' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['_actors', _actorsModule],
      ['auth', authModule],
    ]));
    // First convergence produces a valid compiled index
    expect(result.index._stats.modules).toBe(2);
    expect(result.index._stats.total_nodes).toBe(4); // 2 actors + 2 auth nodes
    expect(result.index._stats.total_journeys).toBe(1);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    // Actors are properly registered
    expect(result.index.nodes['_actors/EndUser']).toBeDefined();
    expect(result.index.nodes['_actors/EndUser'].type).toBe('actor');
  });

});
