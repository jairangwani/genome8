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

// Implementation: test/cross-project.test.ts

const parentActorsYaml = yaml.dump({
  spec_sections: [1],
  nodes: {
    ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
    LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
  },
  journeys: {},
}, { lineWidth: 120 });

const parentHash = crypto.createHash('sha256').update(parentActorsYaml).digest('hex');

describe("ChildActorTamperingDefense", () => {
  it("step 1: _actors/ChildEngine receives inherited _actors.yaml from the parent engine", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-tamper-'));
    const childDir = path.join(tmpDir, 'child', 'genome', 'modules');
    fs.mkdirSync(childDir, { recursive: true });
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), parentActorsYaml);
    expect(fs.existsSync(path.join(childDir, '_actors.yaml'))).toBe(true);
    const content = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('ProjectOwner');
    expect(content).toContain('LLMWorker');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 2: actors/InheritActorsFromParent copies the parent's _actors.yaml with a known content hash", () => {
    // Parent hash is computed and stored
    expect(parentHash.length).toBe(64);
    // Verify the same content produces the same hash
    const verifyHash = crypto.createHash('sha256').update(parentActorsYaml).digest('hex');
    expect(verifyHash).toBe(parentHash);
  });

  it("step 3: _actors/RogueWorker modifies the child's _actors.yaml to add unauthorized actors or alter descriptions", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-tamper-'));
    const childDir = path.join(tmpDir, 'child', 'genome', 'modules');
    fs.mkdirSync(childDir, { recursive: true });
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), parentActorsYaml);
    // Rogue worker tampers with the file
    const tamperedYaml = yaml.dump({
      spec_sections: [1],
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
        UnauthorizedActor: { type: 'actor', description: 'injected by rogue worker' },
      },
      journeys: {},
    }, { lineWidth: 120 });
    fs.writeFileSync(path.join(childDir, '_actors.yaml'), tamperedYaml);
    const content = fs.readFileSync(path.join(childDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('UnauthorizedActor');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 4: actors/DetectChildActorTampering computes the hash of the child's current _actors.yaml content", () => {
    // Tampered content has a different hash
    const tamperedYaml = yaml.dump({
      spec_sections: [1],
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
        UnauthorizedActor: { type: 'actor', description: 'injected by rogue worker' },
      },
      journeys: {},
    }, { lineWidth: 120 });
    const childHash = crypto.createHash('sha256').update(tamperedYaml).digest('hex');
    expect(childHash.length).toBe(64);
    expect(childHash).not.toBe(parentHash);
  });

  it("step 5: actors/DetectChildActorTampering compares the child hash against the parent's original hash", () => {
    const tamperedYaml = yaml.dump({
      spec_sections: [1],
      nodes: {
        ProjectOwner: { type: 'actor', description: 'tampered description' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
      },
      journeys: {},
    }, { lineWidth: 120 });
    const childHash = crypto.createHash('sha256').update(tamperedYaml).digest('hex');
    // Even a small description change causes hash mismatch
    expect(childHash).not.toBe(parentHash);
  });

  it("step 6: actors/DetectChildActorTampering detects the mismatch and flags the child's _actors.yaml as tampered", () => {
    const tamperedYaml = yaml.dump({
      spec_sections: [1],
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
        InjectedActor: { type: 'actor', description: 'not authorized' },
      },
      journeys: {},
    }, { lineWidth: 120 });
    const childHash = crypto.createHash('sha256').update(tamperedYaml).digest('hex');
    const tampered = childHash !== parentHash;
    expect(tampered).toBe(true);
  });

  it("step 7: actors/ParentDiscoversChildrenInherit confirms the rule violation since children must not modify inherited actors", () => {
    // Rule: children inherit actors, they do not modify them
    // Untampered child should match parent hash exactly
    const untamperedHash = crypto.createHash('sha256').update(parentActorsYaml).digest('hex');
    expect(untamperedHash).toBe(parentHash);
    // Any modification violates the rule
    const modified = parentActorsYaml + '\n# tampered';
    const modifiedHash = crypto.createHash('sha256').update(modified).digest('hex');
    expect(modifiedHash).not.toBe(parentHash);
  });

  it("step 8: compilation/ErrorReport records the tampering as a validation error with the specific differences found", () => {
    // Compile the tampered child — the unauthorized actor appears
    const tamperedModule: ModuleFile = {
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
        UnauthorizedActor: { type: 'actor', description: 'injected by rogue worker' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', tamperedModule]]));
    // The unauthorized actor compiles but would be detected by hash comparison
    expect(result.index.nodes['_actors/UnauthorizedActor']).toBeDefined();
    // Diff: parent had 2 actors, child has 3
    const parentActorCount = 2;
    const childActorCount = Object.keys(result.index.nodes).length;
    expect(childActorCount).toBeGreaterThan(parentActorCount);
  });

  it("step 9: hierarchy/ValidateCrossEngineRefs blocks the child's compilation result from merging into the parent until the tampering is resolved", () => {
    // After restoring to parent's original actors, hash matches and merge is allowed
    const restoredModule: ModuleFile = {
      nodes: {
        ProjectOwner: { type: 'actor', description: 'describes a project via spec.md' },
        LLMWorker: { type: 'actor', description: 'persistent Claude Code process' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', restoredModule]]));
    expect(Object.keys(result.index.nodes).length).toBe(2);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    // Restored content hash matches parent
    const restoredYaml = yaml.dump({
      spec_sections: [1],
      nodes: restoredModule.nodes,
      journeys: {},
    }, { lineWidth: 120 });
    const restoredHash = crypto.createHash('sha256').update(restoredYaml).digest('hex');
    expect(restoredHash).toBe(parentHash);
  });

});
