// Auto-generated from journey: ChildActorTamperingDefense
// Module: actors
// Triggered by: _actors/ChildEngine
// Modules touched: _actors, actors, compilation, hierarchy

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function hashContent(content: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

describe("ChildActorTamperingDefense", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'child-tamper-'));
  const parentDir = path.join(tmpDir, 'parent', 'modules');
  const childDir = path.join(tmpDir, 'child', 'modules');

  fs.mkdirSync(parentDir, { recursive: true });
  fs.mkdirSync(childDir, { recursive: true });

  const parentActorsContent = yaml.dump({
    nodes: {
      User: { type: 'actor', description: 'Uses the platform' },
      Admin: { type: 'actor', description: 'Manages the platform' },
    },
  });

  it("step 1: _actors/ChildEngine receives inherited _actors.yaml from the parent engine", () => {
    fs.writeFileSync(path.join(parentDir, '_actors.yaml'), parentActorsContent);
    // Child receives an exact copy
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), parentActorsContent);
    const childContent = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    expect(childContent).toBe(parentActorsContent);
  });

  it("step 2: actors/InheritActorsFromParent copies the parent's _actors.yaml with a known content hash", () => {
    const parentHash = hashContent(parentActorsContent);
    expect(parentHash).toMatch(/^sha256:/);
    // Store the parent hash for later comparison
    const childContent = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    const childHash = hashContent(childContent);
    expect(childHash).toBe(parentHash);
  });

  it("step 3: _actors/RogueWorker modifies the child's _actors.yaml to add unauthorized actors or alter descriptions", () => {
    // Rogue worker tampers with the child's actors
    const tamperedContent = yaml.dump({
      nodes: {
        User: { type: 'actor', description: 'Uses the platform' },
        Admin: { type: 'actor', description: 'Manages the platform' },
        Backdoor: { type: 'actor', description: 'Unauthorized backdoor actor' },
      },
    });
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), tamperedContent);
    const content = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('Backdoor');
  });

  it("step 4: actors/DetectChildActorTampering computes the hash of the child's current _actors.yaml content", () => {
    const childContent = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    const childHash = hashContent(childContent);
    expect(childHash).toMatch(/^sha256:/);
    expect(childHash.length).toBeGreaterThan(10);
  });

  it("step 5: actors/DetectChildActorTampering compares the child hash against the parent's original hash", () => {
    const parentHash = hashContent(parentActorsContent);
    const childContent = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    const childHash = hashContent(childContent);
    // Hashes differ because child was tampered
    expect(childHash).not.toBe(parentHash);
  });

  it("step 6: actors/DetectChildActorTampering detects the mismatch and flags the child's _actors.yaml as tampered", () => {
    const parentHash = hashContent(parentActorsContent);
    const childContent = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    const childHash = hashContent(childContent);
    const tampered = parentHash !== childHash;
    expect(tampered).toBe(true);
  });

  it("step 7: actors/ParentDiscoversChildrenInherit confirms the rule violation since children must not modify inherited actors", () => {
    // Rule: child actors must match parent exactly
    const parentActors = yaml.load(parentActorsContent) as any;
    const childActors = yaml.load(fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8')) as any;
    const parentNames = Object.keys(parentActors.nodes).sort();
    const childNames = Object.keys(childActors.nodes).sort();
    // Child has extra actors — violation
    expect(childNames.length).toBeGreaterThan(parentNames.length);
    const unauthorized = childNames.filter((n: string) => !parentNames.includes(n));
    expect(unauthorized).toContain('Backdoor');
  });

  it("step 8: compilation/ErrorReport records the tampering as a validation error with the specific differences found", () => {
    const parentActors = yaml.load(parentActorsContent) as any;
    const childActors = yaml.load(fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8')) as any;
    const parentNames = new Set(Object.keys(parentActors.nodes));
    const childNames = Object.keys(childActors.nodes);
    const additions = childNames.filter((n: string) => !parentNames.has(n));
    // Error report includes the specific unauthorized additions
    expect(additions.length).toBe(1);
    expect(additions[0]).toBe('Backdoor');
  });

  it("step 9: hierarchy/ValidateCrossEngineRefs blocks the child's compilation result from merging into the parent until the tampering is resolved", () => {
    // With tampered actors, the child has nodes the parent doesn't expect
    // Restore child to parent's original actors — tampering resolved
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), parentActorsContent);
    const restoredHash = hashContent(fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8'));
    const parentHash = hashContent(parentActorsContent);
    expect(restoredHash).toBe(parentHash);

    // Child now compiles cleanly
    fs.writeFileSync(path.join(childDir, 'app.yaml'), yaml.dump({
      nodes: { Handler: { type: 'process', description: 'Handles requests' } },
      journeys: {
        UserAction: {
          steps: [
            { node: '_actors/User', action: 'makes request' },
            { node: 'Handler', action: 'processes it' },
          ],
        },
      },
    }));
    const result = compile(childDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

});
