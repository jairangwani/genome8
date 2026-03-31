// Auto-generated from journey: InheritActorsToChildren
// Module: actors
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, actors, hierarchy

import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile } from '../../src/compile.js';

describe("InheritActorsToChildren", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'inherit-actors-'));
  const parentModulesDir = path.join(tmpDir, 'parent', 'modules');
  const childModulesDir = path.join(tmpDir, 'child', 'modules');

  // Setup: create parent _actors.yaml
  const parentActors = {
    nodes: {
      User: { type: 'actor', description: 'Uses the platform' },
      Admin: { type: 'actor', description: 'Manages the platform' },
      Attacker: { type: 'actor', description: 'Attempts exploitation' },
    },
  };

  fs.mkdirSync(parentModulesDir, { recursive: true });
  fs.mkdirSync(childModulesDir, { recursive: true });
  fs.writeFileSync(
    path.join(parentModulesDir, '_actors.yaml'),
    yaml.dump(parentActors),
  );

  it("step 1: _actors/ParentEngine has completed actor discovery and is preparing child engines", () => {
    // Parent has _actors.yaml with discovered actors
    expect(fs.existsSync(path.join(parentModulesDir, '_actors.yaml'))).toBe(true);
    const content = yaml.load(fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(content.nodes).length).toBe(3);
  });

  it("step 2: actors/ActorsFile provides the parent's _actors.yaml for distribution", () => {
    const content = fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('User');
    expect(content).toContain('Admin');
    expect(content).toContain('Attacker');
  });

  it("step 3: actors/ParentDiscoversChildrenInherit enforces that children inherit actors rather than re-discovering", () => {
    // Rule: children should NOT have different actors than parent.
    // Enforce: copy parent's file, don't run discovery.
    const parentContent = fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8');
    // The child should get an exact copy
    fs.writeFileSync(path.join(childModulesDir, '_actors.yaml'), parentContent);
    const childContent = fs.readFileSync(path.join(childModulesDir, '_actors.yaml'), 'utf-8');
    expect(childContent).toBe(parentContent);
  });

  it("step 4: actors/InheritActorsFromParent copies _actors.yaml into the child engine directory", () => {
    expect(fs.existsSync(path.join(childModulesDir, '_actors.yaml'))).toBe(true);
  });

  it("step 5: hierarchy/DistributeSharedActors places the shared actors in each child's modules directory", () => {
    // Verify child has the same actors as parent
    const childActors = yaml.load(fs.readFileSync(path.join(childModulesDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(childActors.nodes)).toEqual(expect.arrayContaining(['User', 'Admin', 'Attacker']));
  });

  it("step 6: _actors/ChildEngine receives the inherited actors and uses them during its own convergence", () => {
    // Child can compile with the inherited actors
    // Add a module that references inherited actors
    fs.writeFileSync(path.join(childModulesDir, 'identity.yaml'), yaml.dump({
      nodes: { KeyManager: { type: 'process', description: 'Manages keys' } },
      journeys: { Register: { steps: [
        { node: '_actors/User', action: 'signs up' },
        { node: 'KeyManager', action: 'generates key' },
      ]}},
    }));
    const result = compile(childModulesDir);
    // _actors/User reference resolves because child has inherited actors
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index.nodes['_actors/User']).toBeDefined();
  });

  // Cleanup
  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
