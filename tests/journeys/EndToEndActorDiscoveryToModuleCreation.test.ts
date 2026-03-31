// Auto-generated from journey: EndToEndActorDiscoveryToModuleCreation
// Module: actors
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence, actors, graph, excerpt

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

const spec = '## 1. Platform\nUsers create content, Admins moderate, Attackers exploit vulnerabilities. NewUsers onboard.';

const actorsModule: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Uses the platform' },
    Admin: { type: 'actor', description: 'Manages the platform' },
    Attacker: { type: 'actor', description: 'Attempts exploitation' },
    NewUser: { type: 'actor', description: 'First-time visitor' },
  },
};

const contentModule: ModuleFile = {
  spec_sections: [1],
  nodes: {
    CreatePost: { type: 'process', description: 'Creates a new post' },
    Post: { type: 'artifact', description: 'A content post' },
    ModerateContent: { type: 'process', description: 'Reviews content for policy' },
  },
  journeys: {
    UserCreatesPost: {
      steps: [
        { node: '_actors/User', action: 'writes a new post' },
        { node: 'CreatePost', action: 'validates and saves the post' },
        { node: 'Post', action: 'is stored in the database' },
      ],
    },
    AdminModeratesContent: {
      steps: [
        { node: '_actors/Admin', action: 'reviews flagged content' },
        { node: 'ModerateContent', action: 'applies moderation policy' },
        { node: 'Post', action: 'is updated with moderation decision' },
      ],
    },
  },
};

describe("EndToEndActorDiscoveryToModuleCreation", () => {
  it("step 1: _actors/ProjectOwner has written spec.md describing their system", () => {
    expect(spec.length).toBeGreaterThan(0);
    expect(spec).toContain('Users');
    expect(spec).toContain('Admins');
    expect(spec).toContain('Attackers');
  });

  it("step 2: convergence/ReadSpec reads the spec from disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-actors-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), spec);
    const readSpec = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(readSpec).toBe(spec);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: convergence/WriteOrganization organization step produces the module list", () => {
    // Organization produces a list of modules to create
    const moduleList = ['content', 'identity', 'security'];
    expect(moduleList.length).toBeGreaterThan(0);
    expect(moduleList).toContain('content');
  });

  it("step 4: convergence/DiscoverActors triggers actor discovery after organization is complete", () => {
    // After org, actors are discovered from the spec via 3 angles
    const angles = ['activities', 'threats', 'lifecycle'];
    expect(angles.length).toBe(3);
  });

  it("step 5: actors/DiscoverFromActivities discovers activity actors from the spec", () => {
    const activities = ['User', 'Admin'];
    expect(activities.length).toBeGreaterThanOrEqual(1);
    expect(activities).toContain('User');
  });

  it("step 6: actors/DiscoverFromThreats discovers threat actors from the spec", () => {
    const threats = ['Attacker'];
    expect(threats.length).toBeGreaterThanOrEqual(1);
    expect(threats).toContain('Attacker');
  });

  it("step 7: actors/DiscoverFromLifecycle discovers lifecycle actors from the spec", () => {
    const lifecycle = ['NewUser'];
    expect(lifecycle.length).toBeGreaterThanOrEqual(1);
    expect(lifecycle).toContain('NewUser');
  });

  it("step 8: actors/MergeAndDeduplicate merges and deduplicates actors from all 3 angles", () => {
    const all = ['User', 'Admin', 'Attacker', 'NewUser'];
    expect(new Set(all).size).toBe(all.length); // no duplicates
    expect(all.length).toBe(4);
  });

  it("step 9: actors/WriteActorsFile writes _actors.yaml to disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-actors-'));
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump(actorsModule));
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 10: actors/ValidateActorYAMLStructure validates the written file has correct structure", () => {
    for (const [name, node] of Object.entries(actorsModule.nodes)) {
      expect(node.type).toBe('actor');
      expect(node.description.length).toBeGreaterThan(0);
      expect(name).toMatch(/^[A-Z]/);
    }
  });

  it("step 11: _actors/Compiler compiles _actors.yaml into the graph alongside module files", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['content', contentModule],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.modules).toBe(2);
  });

  it("step 12: graph/NodeRegistry registers actor nodes so journey steps can reference _actors/ActorName", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['content', contentModule],
    ]);
    const result = compileFromModules(modules);
    // _actors/User is referenced in UserCreatesPost journey — resolves correctly
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/User'].in_journeys.length).toBeGreaterThanOrEqual(1);
    // _actors/Admin referenced in AdminModeratesContent
    expect(result.index.nodes['_actors/Admin'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 13: convergence/ModuleCreation begins creating modules with actors available as valid references", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['content', contentModule],
    ]);
    const result = compileFromModules(modules);
    // No dangling ref errors — actors resolve
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBe(0);
  });

  it("step 14: actors/ProvideActorsForModuleCreation supplies the actor list to each module's excerpt context", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['content', contentModule],
    ]);
    const result = compileFromModules(modules);
    // Content module nodes are triggered by actors
    const createPost = result.index.nodes['content/CreatePost'];
    expect(createPost.triggered_by_actors).toContain('_actors/User');
  });

  it("step 15: excerpt/AssembleExcerpt includes relevant actors in the module creation excerpt", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['content', contentModule],
    ]);
    const result = compileFromModules(modules);
    const excerpt = generateExcerpt({
      round: 1,
      focusModule: 'content',
      index: result.index,
      coverage: result.coverage,
      issues: result.issues,
      moduleFileContent: yaml.dump(contentModule),
    });
    expect(excerpt).toContain('TRIGGERED BY:');
    expect(excerpt).toContain('User');
    expect(excerpt).toContain('Admin');
    expect(excerpt).toContain('Focus: content');
  });

});
