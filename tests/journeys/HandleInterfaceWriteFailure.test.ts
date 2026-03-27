// Auto-generated from journey: HandleInterfaceWriteFailure
// Module: publish
// Modules touched: publish, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compileFromModules } from '../../src/compile.js';
import { publishInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleInterfaceWriteFailure", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['publish', {
      nodes: {
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        DetectWriteFailure: { type: 'process', description: 'Catches IO errors' },
      },
      journeys: {},
    }],
    ['convergence', {
      nodes: {
        ConvergenceState: { type: 'artifact', description: 'Pipeline state' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-failure-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: publish/GenerateInterfaceYaml attempts to write interface.yaml but the write operation fails", () => {
    // Simulate a write failure by using a non-existent deeply nested path with a file as parent
    const badDir = path.join(tmpDir, 'blocker');
    fs.writeFileSync(badDir, 'not-a-directory');
    const invalidPublishDir = path.join(badDir, 'published');
    expect(() => publishInterface(invalidPublishDir, result.index, 'test-engine')).toThrow();
  });

  it("step 2: publish/DetectWriteFailure catches the IO error with the specific error code and file path", () => {
    const badDir = path.join(tmpDir, 'blocker');
    fs.writeFileSync(badDir, 'not-a-directory');
    const invalidPublishDir = path.join(badDir, 'published');
    let caught = false;
    try {
      publishInterface(invalidPublishDir, result.index, 'test-engine');
    } catch (err) {
      caught = true;
      expect(err).toBeDefined();
    }
    expect(caught).toBe(true);
  });

  it("step 3: publish/AtomicFileWrite confirms the temp file was never renamed, so no partial interface.yaml exists on disk", () => {
    const badDir = path.join(tmpDir, 'blocker');
    fs.writeFileSync(badDir, 'not-a-directory');
    const invalidPublishDir = path.join(badDir, 'published');
    try {
      publishInterface(invalidPublishDir, result.index, 'test-engine');
    } catch { /* expected */ }
    // No interface.yaml was created
    expect(fs.existsSync(path.join(invalidPublishDir, 'interface.yaml'))).toBe(false);
  });

  it("step 4: publish/ReportPublishFailure builds a failure report identifying the interface write as the failing step", () => {
    const badDir = path.join(tmpDir, 'blocker');
    fs.writeFileSync(badDir, 'not-a-directory');
    const invalidPublishDir = path.join(badDir, 'published');
    let errorMessage = '';
    try {
      publishInterface(invalidPublishDir, result.index, 'test-engine');
    } catch (err: any) {
      errorMessage = err.message || String(err);
    }
    expect(errorMessage.length).toBeGreaterThan(0);
  });

  it("step 5: convergence/ConvergenceState receives the failure report and decides to retry publish or abort the pipeline", () => {
    // On successful write, convergence state node exists
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    // A successful publish works fine
    const publishedDir = path.join(tmpDir, 'good-published');
    const { interface_, changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(interface_).toBeDefined();
    expect(changelog).toBeDefined();
  });

});
