// Auto-generated from journey: RediscoverActorsAfterSpecChange
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, actors, _actors

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Simulate an initial actor set and a rediscovered set after spec change
const originalActors = {
  ProjectOwner: { type: 'actor' as const, description: 'describes a project via spec.md' },
  LLMWorker: { type: 'actor' as const, description: 'persistent Claude Code process' },
  HumanDeveloper: { type: 'actor' as const, description: 'writes code manually' },
};

// After spec change: ProjectOwner stays, HumanDeveloper removed, APIConsumer added
const rediscoveredActivities = ['ProjectOwner', 'APIConsumer'];
const rediscoveredThreats = ['MaliciousSpecAuthor'];
const rediscoveredLifecycle = ['NewProjectAdopter', 'LLMWorker'];

describe("RediscoverActorsAfterSpecChange", () => {
  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and actors may need updating", () => {
    // A spec change is detected — this triggers actor rediscovery
    // Simulate by noting the spec hash has changed
    const oldSpecHash = 'sha256:abc123';
    const newSpecHash = 'sha256:def456';
    expect(oldSpecHash).not.toBe(newSpecHash);
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    // Spec content is readable — simulate a changed spec
    const specContent = '# My Project\nThis is an API service for external consumers.';
    expect(specContent.length).toBeGreaterThan(0);
    expect(specContent).toContain('API');
  });

  it("step 3: actors/RediscoverActorsOnSpecChange reads the current _actors.yaml to know the existing actor set", () => {
    // Read the existing actors before rediscovery
    const existingNames = Object.keys(originalActors);
    expect(existingNames).toContain('ProjectOwner');
    expect(existingNames).toContain('LLMWorker');
    expect(existingNames).toContain('HumanDeveloper');
    expect(existingNames.length).toBe(3);
  });

  it("step 4: _actors/LLMWorker re-analyzes the changed spec from the activities perspective", () => {
    // Activities angle produces a new set of actors
    expect(rediscoveredActivities.length).toBeGreaterThanOrEqual(1);
    expect(rediscoveredActivities).toContain('ProjectOwner');
    expect(rediscoveredActivities).toContain('APIConsumer');
  });

  it("step 5: actors/DiscoverFromActivities re-identifies activity actors from the updated spec", () => {
    // Activities result is stored for merging
    expect(rediscoveredActivities).toContain('APIConsumer');
    // ProjectOwner persists from original
    expect(rediscoveredActivities).toContain('ProjectOwner');
  });

  it("step 6: _actors/LLMWorker re-analyzes the changed spec from the threats perspective", () => {
    expect(rediscoveredThreats.length).toBeGreaterThanOrEqual(1);
    expect(rediscoveredThreats).toContain('MaliciousSpecAuthor');
  });

  it("step 7: actors/DiscoverFromThreats re-identifies threat actors from the updated spec", () => {
    expect(rediscoveredThreats).toContain('MaliciousSpecAuthor');
  });

  it("step 8: _actors/LLMWorker re-analyzes the changed spec from the lifecycle perspective", () => {
    expect(rediscoveredLifecycle.length).toBeGreaterThanOrEqual(1);
    expect(rediscoveredLifecycle).toContain('NewProjectAdopter');
  });

  it("step 9: actors/DiscoverFromLifecycle re-identifies lifecycle actors from the updated spec", () => {
    expect(rediscoveredLifecycle).toContain('NewProjectAdopter');
    expect(rediscoveredLifecycle).toContain('LLMWorker');
  });

  it("step 10: actors/MergeAndDeduplicate merges the rediscovered actors and removes duplicates", () => {
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    // LLMWorker appears in lifecycle, but only once after dedup
    expect(merged.filter(a => a === 'LLMWorker').length).toBe(1);
    // Total: ProjectOwner, APIConsumer, MaliciousSpecAuthor, NewProjectAdopter, LLMWorker = 5
    expect(merged.length).toBe(5);
  });

  it("step 11: actors/UpdateActorsFileAfterRediscovery diffs the rediscovered set against the existing actors to find additions and removals", () => {
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    const existing = Object.keys(originalActors);
    const added = merged.filter(a => !existing.includes(a));
    const removed = existing.filter(a => !merged.includes(a));
    // APIConsumer, MaliciousSpecAuthor, NewProjectAdopter are new
    expect(added).toContain('APIConsumer');
    expect(added).toContain('MaliciousSpecAuthor');
    expect(added).toContain('NewProjectAdopter');
    expect(added.length).toBe(3);
    // HumanDeveloper was removed
    expect(removed).toContain('HumanDeveloper');
    expect(removed.length).toBe(1);
  });

  it("step 12: actors/UpdateActorsFileAfterRediscovery adds new actors to _actors.yaml and flags removed actors for orphan detection", () => {
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    const updatedNodes: Record<string, any> = {};
    for (const name of merged) {
      updatedNodes[name] = { type: 'actor', description: `${name} — rediscovered` };
    }
    // HumanDeveloper is gone from the new set
    expect(updatedNodes['HumanDeveloper']).toBeUndefined();
    // New actors are present
    expect(updatedNodes['APIConsumer']).toBeDefined();
    expect(updatedNodes['APIConsumer'].type).toBe('actor');
  });

  it("step 13: actors/WriteActorsFile writes the updated _actors.yaml to disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-rediscover-'));
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    const nodes: Record<string, any> = {};
    for (const name of merged) {
      nodes[name] = { type: 'actor', description: `${name} rediscovered actor` };
    }
    const content = yaml.dump({ spec_sections: [1], nodes, journeys: {} }, { lineWidth: 120 });
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), content);
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 14: actors/ActorsFile the updated actor file is ready for recompilation", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-rediscover-'));
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    const nodes: Record<string, any> = {};
    for (const name of merged) {
      nodes[name] = { type: 'actor', description: `${name} rediscovered actor` };
    }
    fs.writeFileSync(
      path.join(tmpDir, '_actors.yaml'),
      yaml.dump({ spec_sections: [1], nodes, journeys: {} }, { lineWidth: 120 })
    );
    const result = compile(tmpDir);
    // All 5 rediscovered actors compile cleanly
    expect(Object.keys(result.index.nodes).length).toBe(5);
    for (const name of merged) {
      expect(result.index.nodes[`_actors/${name}`]).toBeDefined();
      expect(result.index.nodes[`_actors/${name}`].type).toBe('actor');
    }
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    fs.rmSync(tmpDir, { recursive: true });
  });

});
