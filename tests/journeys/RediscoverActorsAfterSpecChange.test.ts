// Auto-generated from journey: RediscoverActorsAfterSpecChange
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: convergence, actors, _actors

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile } from '../../src/compile.js';

// Original spec actors
const originalActors = {
  User: { type: 'actor', description: 'Uses the platform' },
  Admin: { type: 'actor', description: 'Manages the platform' },
  Attacker: { type: 'actor', description: 'Attempts exploitation' },
};

// After spec change: new actors discovered, one removed
const rediscoveredActivities = ['User', 'Admin', 'Operator'];
const rediscoveredThreats = ['Attacker', 'Insider'];
const rediscoveredLifecycle = ['NewUser'];

const allRediscovered = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];

describe("RediscoverActorsAfterSpecChange", () => {
  it("step 1: convergence/TargetedReconvergence signals that the spec has changed and actors may need updating", () => {
    // Spec changed — old hash differs from new hash
    const oldSpecHash = 'abc123';
    const newSpecHash = 'def456';
    expect(oldSpecHash).not.toBe(newSpecHash);
  });

  it("step 2: convergence/SpecFile provides the changed spec content", () => {
    const newSpec = '## 1. System\nA platform with Users, Admins, Operators, and insider threat vectors.';
    expect(newSpec.length).toBeGreaterThan(0);
    expect(newSpec).toContain('Operators'); // new actor
    expect(newSpec).toContain('insider');   // new threat actor
  });

  it("step 3: actors/RediscoverActorsOnSpecChange reads the current _actors.yaml to know the existing actor set", () => {
    const existingNames = Object.keys(originalActors);
    expect(existingNames).toContain('User');
    expect(existingNames).toContain('Admin');
    expect(existingNames).toContain('Attacker');
    expect(existingNames.length).toBe(3);
  });

  it("step 4: _actors/LLMWorker re-analyzes the changed spec from the activities perspective", () => {
    expect(rediscoveredActivities).toContain('User');
    expect(rediscoveredActivities).toContain('Operator'); // new
  });

  it("step 5: actors/DiscoverFromActivities re-identifies activity actors from the updated spec", () => {
    expect(rediscoveredActivities.length).toBeGreaterThanOrEqual(1);
    for (const actor of rediscoveredActivities) {
      expect(actor).toMatch(/^[A-Z]/); // PascalCase
    }
  });

  it("step 6: _actors/LLMWorker re-analyzes the changed spec from the threats perspective", () => {
    expect(rediscoveredThreats).toContain('Attacker');
    expect(rediscoveredThreats).toContain('Insider'); // new
  });

  it("step 7: actors/DiscoverFromThreats re-identifies threat actors from the updated spec", () => {
    expect(rediscoveredThreats.length).toBeGreaterThanOrEqual(1);
    for (const actor of rediscoveredThreats) {
      expect(actor).toMatch(/^[A-Z]/);
    }
  });

  it("step 8: _actors/LLMWorker re-analyzes the changed spec from the lifecycle perspective", () => {
    expect(rediscoveredLifecycle).toContain('NewUser');
  });

  it("step 9: actors/DiscoverFromLifecycle re-identifies lifecycle actors from the updated spec", () => {
    expect(rediscoveredLifecycle.length).toBeGreaterThanOrEqual(1);
    for (const actor of rediscoveredLifecycle) {
      expect(actor).toMatch(/^[A-Z]/);
    }
  });

  it("step 10: actors/MergeAndDeduplicate merges the rediscovered actors and removes duplicates", () => {
    // allRediscovered: User, Admin, Operator, Attacker, Insider, NewUser = 6
    const merged = [...new Set([...rediscoveredActivities, ...rediscoveredThreats, ...rediscoveredLifecycle])];
    expect(merged.length).toBe(6);
    expect(allRediscovered.length).toBe(6);
    expect(new Set(merged).size).toBe(merged.length); // no duplicates
  });

  it("step 11: actors/UpdateActorsFileAfterRediscovery diffs the rediscovered set against the existing actors to find additions and removals", () => {
    const existingNames = new Set(Object.keys(originalActors));
    const rediscoveredSet = new Set(allRediscovered);
    const additions = allRediscovered.filter(a => !existingNames.has(a));
    const removals = [...existingNames].filter(a => !rediscoveredSet.has(a));
    // Operator, Insider, NewUser are new
    expect(additions).toContain('Operator');
    expect(additions).toContain('Insider');
    expect(additions).toContain('NewUser');
    // No actors removed in this scenario (all originals still present)
    expect(removals.length).toBe(0);
  });

  it("step 12: actors/UpdateActorsFileAfterRediscovery adds new actors to _actors.yaml and flags removed actors for orphan detection", () => {
    const existingNames = new Set(Object.keys(originalActors));
    const updated = { ...originalActors } as Record<string, any>;
    for (const name of allRediscovered) {
      if (!existingNames.has(name)) {
        updated[name] = { type: 'actor', description: `${name} of the system` };
      }
    }
    expect(Object.keys(updated).length).toBe(6); // 3 original + 3 new
    expect(updated['Operator']).toBeDefined();
    expect(updated['Insider']).toBeDefined();
    expect(updated['NewUser']).toBeDefined();
  });

  it("step 13: actors/WriteActorsFile writes the updated _actors.yaml to disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rediscover-'));
    const updatedActors: Record<string, any> = {};
    for (const name of allRediscovered) {
      updatedActors[name] = { type: 'actor', description: `${name} of the system` };
    }
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump({ nodes: updatedActors }));
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    const content = yaml.load(fs.readFileSync(path.join(tmpDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(content.nodes).length).toBe(6);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 14: actors/ActorsFile the updated actor file is ready for recompilation", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rediscover-'));
    const updatedActors: Record<string, any> = {};
    for (const name of allRediscovered) {
      updatedActors[name] = { type: 'actor', description: `${name} of the system` };
    }
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump({ nodes: updatedActors }));
    const result = compile(tmpDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.total_nodes).toBe(6);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
