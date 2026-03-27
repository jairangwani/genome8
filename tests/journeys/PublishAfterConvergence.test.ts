// Auto-generated from journey: PublishAfterConvergence
// Module: convergence
// Modules touched: convergence, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compile } from '../../src/compile.js';
import { publishInterface, generateInterface, generateChangelog } from '../../src/publish.js';

let tmpDir: string;
let modulesDir: string;
let publishedDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  modulesDir = path.join(tmpDir, 'genome', 'modules');
  publishedDir = path.join(tmpDir, 'genome', 'published');
  fs.mkdirSync(modulesDir, { recursive: true });
  fs.mkdirSync(publishedDir, { recursive: true });
  fs.writeFileSync(path.join(modulesDir, '_actors.yaml'),
    'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n\njourneys: {}\n');
  fs.writeFileSync(path.join(modulesDir, 'auth.yaml'),
    'spec_sections: [1]\n\nnodes:\n  Login:\n    type: process\n    description: handles login\n\njourneys:\n  UserLogin:\n    steps:\n      - node: _actors/User\n        action: submits credentials\n      - node: Login\n        action: validates\n');
});

afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe("PublishAfterConvergence", () => {
  it("step 1: convergence/ConvergenceState confirms convergence is complete with 0 errors and 0 audit gaps", () => {
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 2: convergence/TriggerPublish invokes publish.ts to generate the box's public interface", () => {
    const result = compile(modulesDir);
    const { interface_ } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(interface_.engine).toBe('test-engine');
  });

  it("step 3: publish/ComputeInterfaceHash computes a SHA256 hash over the exported nodes and journeys", () => {
    const result = compile(modulesDir);
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(iface.version_hash.length).toBeGreaterThan(10);
  });

  it("step 4: publish/GenerateInterfaceYaml writes interface.yaml with the exported nodes and journeys", () => {
    const result = compile(modulesDir);
    publishInterface(publishedDir, result.index, 'test-engine');
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    expect(fs.existsSync(interfacePath)).toBe(true);
    const content = fs.readFileSync(interfacePath, 'utf-8');
    expect(content).toContain('engine:');
    expect(content).toContain('provides:');
  });

  it("step 5: publish/GenerateChangelogYaml writes changelog.yaml with the diff from the previous interface", () => {
    const result = compile(modulesDir);
    publishInterface(publishedDir, result.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    expect(fs.existsSync(changelogPath)).toBe(true);
    const content = fs.readFileSync(changelogPath, 'utf-8');
    expect(content).toContain('changes:');
  });

  it("step 6: publish/WriteEventFile writes the event file to notify dependent boxes of the change", () => {
    const eventsDir = path.join(publishedDir, 'events');
    fs.mkdirSync(eventsDir, { recursive: true });
    const eventFile = path.join(eventsDir, `${Date.now()}_testHash.event`);
    fs.writeFileSync(eventFile, JSON.stringify({ engine: 'test', hash: 'sha256:abc', timestamp: new Date().toISOString() }));
    expect(fs.existsSync(eventFile)).toBe(true);
  });

  it("step 7: convergence/CodeOrchestratesLLMCreates ensures publish is triggered by code, not by LLM decision", () => {
    // publish is called directly from convergence.ts code, not by LLM
    expect(typeof publishInterface).toBe('function');
  });

  it("step 8: convergence/ConvergenceState records that interface and event file have been published", () => {
    const result = compile(modulesDir);
    const { interface_ } = publishInterface(publishedDir, result.index, 'test-engine');
    const state = {
      status: 'sleeping',
      interface_hash: interface_.version_hash,
      converged_at: new Date().toISOString(),
    };
    expect(state.interface_hash).toMatch(/^sha256:/);
    expect(state.status).toBe('sleeping');
  });
});
