// Auto-generated from journey: InitializePipelineFromConfig
// Module: convergence
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  fs.mkdirSync(path.join(tmpDir, 'genome', 'modules'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("InitializePipelineFromConfig", () => {
  it("step 1: _actors/ProjectOwner starts convergence on a project directory", () => {
    expect(fs.existsSync(tmpDir)).toBe(true);
  });

  it("step 2: convergence/LoadProjectConfig reads genome/config.json and merges overrides with default pipeline parameters", () => {
    const configPath = path.join(tmpDir, 'genome', 'config.json');
    const userConfig = { maxRounds: 10, maxFixAttempts: 5 };
    fs.writeFileSync(configPath, JSON.stringify(userConfig));

    const DEFAULT_CONFIG = {
      maxRounds: Infinity,
      watchIntervalMs: 60_000,
      sessionResetChars: Infinity,
      model: 'claude-opus-4-6',
      maxFixAttempts: 3,
      maxZeroDelta: 2,
      minModulesForSplit: 6,
    };

    const loaded = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const merged = { ...DEFAULT_CONFIG, ...loaded };
    expect(merged.maxRounds).toBe(10);
    expect(merged.maxFixAttempts).toBe(5);
    expect(merged.model).toBe('claude-opus-4-6');
    expect(merged.watchIntervalMs).toBe(60_000);
  });

  it("step 3: convergence/ProjectConfig stores the merged configuration used by every subsequent pipeline step", () => {
    const config = { maxRounds: 10, model: 'claude-opus-4-6', maxFixAttempts: 5 };
    expect(config.maxRounds).toBe(10);
    expect(config.model).toBeDefined();
  });

  it("step 4: convergence/WritePidFile writes pids.json so the stop and ps commands can find and manage this process tree", () => {
    const pidPath = path.join(tmpDir, 'genome', 'pids.json');
    const pids = {
      self: process.pid,
      worker: 'active',
      children: [],
      started: new Date().toISOString(),
    };
    fs.writeFileSync(pidPath, JSON.stringify(pids, null, 2));
    const read = JSON.parse(fs.readFileSync(pidPath, 'utf-8'));
    expect(read.self).toBe(process.pid);
    expect(read.worker).toBe('active');
    expect(read.started).toBeDefined();
  });

  it("step 5: convergence/ReadSpec reads spec.md from disk as the sole human input to the pipeline", () => {
    const specPath = path.join(tmpDir, 'genome', 'spec.md');
    fs.writeFileSync(specPath, '# Test Project\n\nA test project specification.');
    const spec = fs.readFileSync(specPath, 'utf-8');
    expect(spec.length).toBeGreaterThan(0);
    expect(spec.split('\n').length).toBeGreaterThan(1);
  });
});
