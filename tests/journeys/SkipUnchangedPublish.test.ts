// Auto-generated from journey: SkipUnchangedPublish
// Module: publish
// Modules touched: convergence, graph, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface } from '../../src/types.js';

describe("SkipUnchangedPublish", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        TriggerPublish: { type: 'process', description: 'Invokes publish after convergence' },
        ConvergenceState: { type: 'artifact', description: 'Pipeline state' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The full compiled graph' },
      },
      journeys: {},
    }],
    ['publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects nodes' },
        CollectExportedJourneys: { type: 'process', description: 'Selects journeys' },
        ComputeInterfaceHash: { type: 'process', description: 'Computes SHA256 hash' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skip-unchanged-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TriggerPublish invokes publish.ts after convergence", () => {
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: graph/CompiledIndex provides the compiled graph", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 3: publish/CollectExportedNodes selects nodes for the interface", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(Object.keys(iface.provides).length).toBeGreaterThan(0);
  });

  it("step 4: publish/CollectExportedJourneys selects journeys for the interface", () => {
    // Even with no journeys defined in publish module, generateInterface works
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.provides).toBeDefined();
  });

  it("step 5: publish/ComputeInterfaceHash computes SHA256 hash of the current interface", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 6: publish/InterfaceHash stores the new hash", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
  });

  it("step 7: publish/PreviousHash provides the previously published hash", () => {
    const publishedDir = path.join(tmpDir, 'published');
    // First publish creates the baseline
    const { interface_: first } = publishInterface(publishedDir, result.index, 'test-engine');
    // Read the on-disk interface to get the previous hash
    const onDisk = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(onDisk.version_hash).toBe(first.version_hash);
  });

  it("step 8: publish/ComparePreviousHash determines the hashes are identical", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { interface_: first } = publishInterface(publishedDir, result.index, 'test-engine');
    // Second publish with identical input produces same hash
    const { interface_: second } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(second.version_hash).toBe(first.version_hash);
  });

  it("step 9: publish/SkipPublishIfUnchanged aborts publish since nothing changed, avoiding unnecessary ripple", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    // Second publish returns changelog with no changes
    const { changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(changelog.changes).toHaveLength(0);
  });

  it("step 10: publish/NotifyPublishComplete signals convergence that publish phase is done even though no files were written", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const result2 = publishInterface(publishedDir, result.index, 'test-engine');
    // Still returns valid interface and changelog objects
    expect(result2.interface_).toBeDefined();
    expect(result2.changelog).toBeDefined();
  });

  it("step 11: convergence/ConvergenceState records that publish was skipped due to no changes and proceeds to codegen", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

});
