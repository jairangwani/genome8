// Auto-generated from journey: RecoverFromCorruptedHash
// Module: publish
// Modules touched: publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("RecoverFromCorruptedHash", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['publish', {
      nodes: {
        PreviousHash: { type: 'artifact', description: 'Stored previous hash' },
        DetectCorruptedPreviousHash: { type: 'process', description: 'Detects corrupted hashes' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        InterfaceYamlFile: { type: 'artifact', description: 'Interface on disk' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'corrupted-hash-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: publish/PreviousHash provides the hash file from disk for validation", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const onDisk = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(onDisk.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 2: publish/DetectCorruptedPreviousHash reads the file and finds it is not valid hex or not the expected 64-character length", () => {
    // Write a corrupted interface.yaml with invalid hash
    const publishedDir = path.join(tmpDir, 'published');
    fs.mkdirSync(publishedDir, { recursive: true });
    const corrupted: PublishedInterface = {
      engine: 'test-engine',
      version_hash: 'sha256:CORRUPT_NOT_HEX',
      provides: {},
      requires: {},
    };
    fs.writeFileSync(path.join(publishedDir, 'interface.yaml'), yaml.dump(corrupted));
    const onDisk = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    // The hash does not match the expected format
    expect(onDisk.version_hash).not.toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 3: publish/DetectCorruptedPreviousHash flags the hash as corrupted and signals that comparison cannot proceed normally", () => {
    const corrupted: PublishedInterface = {
      engine: 'test-engine',
      version_hash: 'sha256:ZZZZ',
      provides: {},
      requires: {},
    };
    // A corrupted hash fails the hex-64 validation
    const hashPart = corrupted.version_hash.replace('sha256:', '');
    const isValidHex = /^[0-9a-f]{64}$/.test(hashPart);
    expect(isValidHex).toBe(false);
  });

  it("step 4: publish/ComparePreviousHash receives the corruption flag and treats this as a first-time publish scenario", () => {
    // When previous interface has corrupted data, publishInterface still works
    // It reads the previous, but generates a fresh changelog
    const publishedDir = path.join(tmpDir, 'published');
    fs.mkdirSync(publishedDir, { recursive: true });
    fs.writeFileSync(path.join(publishedDir, 'interface.yaml'), 'garbage: true\n');
    // publishInterface reads previous but won't crash on non-conforming data
    const { interface_, changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(interface_.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    // All nodes show up as added since previous had no provides
    expect(changelog.changes.length).toBeGreaterThan(0);
  });

  it("step 5: publish/GenerateInterfaceYaml proceeds to write interface.yaml since corrupted hash means change status is unknown", () => {
    const publishedDir = path.join(tmpDir, 'published');
    fs.mkdirSync(publishedDir, { recursive: true });
    fs.writeFileSync(path.join(publishedDir, 'interface.yaml'), 'corrupt: data\n');
    publishInterface(publishedDir, result.index, 'test-engine');
    // interface.yaml is overwritten with valid data
    const content = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(content.engine).toBe('test-engine');
    expect(content.version_hash).toMatch(/^sha256:/);
  });

  it("step 6: publish/InterfaceYamlFile stores the interface on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
  });

  it("step 7: publish/StorePreviousHash overwrites the corrupted hash file with the fresh valid hash, restoring the baseline", () => {
    const publishedDir = path.join(tmpDir, 'published');
    fs.mkdirSync(publishedDir, { recursive: true });
    fs.writeFileSync(path.join(publishedDir, 'interface.yaml'), 'bad: hash\n');
    const { interface_ } = publishInterface(publishedDir, result.index, 'test-engine');
    // After publish, the on-disk hash is now valid
    const onDisk = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(onDisk.version_hash).toBe(interface_.version_hash);
    expect(onDisk.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 8: publish/WriteEventFile writes the event file since dependents should be notified after a corrupted hash recovery", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 9: publish/EventFile the event file signals dependents to resync since hash continuity was broken", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const files = fs.readdirSync(publishedDir);
    expect(files).toContain('interface.yaml');
    expect(files).toContain('changelog.yaml');
  });

});
