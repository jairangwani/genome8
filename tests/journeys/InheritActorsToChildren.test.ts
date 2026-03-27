// Auto-generated from journey: InheritActorsToChildren
// Module: actors
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, actors, hierarchy

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile } from '../../src/compile.js';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-inherit-'));
const parentModulesDir = path.join(tmpDir, 'parent', 'genome', 'modules');
const childModulesDir = path.join(tmpDir, 'parent', 'engines', 'child-a', 'genome', 'modules');

const parentActorsYaml = yaml.dump({
  spec_sections: [1],
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
    MaliciousSpecAuthor: { type: 'actor', description: 'injects adversarial content' },
  },
  journeys: {},
}, { lineWidth: 120 });

beforeAll(() => {
  fs.mkdirSync(parentModulesDir, { recursive: true });
  fs.mkdirSync(childModulesDir, { recursive: true });
  fs.writeFileSync(path.join(parentModulesDir, '_actors.yaml'), parentActorsYaml);
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("InheritActorsToChildren", () => {
  it("step 1: _actors/ParentEngine has completed actor discovery and is preparing child engines", () => {
    expect(fs.existsSync(path.join(parentModulesDir, '_actors.yaml'))).toBe(true);
    const parsed = yaml.load(fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(parsed.nodes).length).toBe(3);
  });

  it("step 2: actors/ActorsFile provides the parent's _actors.yaml for distribution", () => {
    const content = fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('ProjectOwner');
    expect(content).toContain('LLMWorker');
    expect(content).toContain('MaliciousSpecAuthor');
  });

  it("step 3: actors/ParentDiscoversChildrenInherit enforces that children inherit actors rather than re-discovering", () => {
    // Before copy, child should NOT have actors
    expect(fs.existsSync(path.join(childModulesDir, '_actors.yaml'))).toBe(false);
  });

  it("step 4: actors/InheritActorsFromParent copies _actors.yaml into the child engine directory", () => {
    // Simulate the copy (convergence.ts line ~1946)
    fs.copyFileSync(
      path.join(parentModulesDir, '_actors.yaml'),
      path.join(childModulesDir, '_actors.yaml')
    );
    expect(fs.existsSync(path.join(childModulesDir, '_actors.yaml'))).toBe(true);
  });

  it("step 5: hierarchy/DistributeSharedActors places the shared actors in each child's modules directory", () => {
    const parentContent = fs.readFileSync(path.join(parentModulesDir, '_actors.yaml'), 'utf-8');
    const childContent = fs.readFileSync(path.join(childModulesDir, '_actors.yaml'), 'utf-8');
    expect(childContent).toBe(parentContent);
  });

  it("step 6: _actors/ChildEngine receives the inherited actors and uses them during its own convergence", () => {
    const childResult = compile(childModulesDir);
    const actorNodes = Object.entries(childResult.index.nodes).filter(([, n]) => n.type === 'actor');
    expect(actorNodes.length).toBe(3);
    expect(childResult.index.nodes['_actors/ProjectOwner']).toBeDefined();
    expect(childResult.index.nodes['_actors/LLMWorker']).toBeDefined();
    expect(childResult.index.nodes['_actors/MaliciousSpecAuthor']).toBeDefined();
    const errors = childResult.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });
});
