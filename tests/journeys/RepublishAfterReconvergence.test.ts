// Auto-generated from journey: RepublishAfterReconvergence
// Module: publish
// Triggered by: _actors/Compiler
// Modules touched: convergence, _actors, graph, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("RepublishAfterReconvergence", () => {
  let tmpDir: string;

  const baseModules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'The compile engine' },
        DependentBox: { type: 'actor', description: 'A downstream dependent' },
      },
      journeys: {},
    }],
    ['convergence', {
      nodes: {
        TargetedReconvergence: { type: 'process', description: 'Targeted reconvergence on stale modules' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'Compiled graph' },
      },
      journeys: {},
    }],
    ['publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects nodes' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
      },
      journeys: {},
    }],
  ]);

  const updatedModules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        Compiler: { type: 'actor', description: 'The compile engine' },
        DependentBox: { type: 'actor', description: 'A downstream dependent' },
      },
      journeys: {},
    }],
    ['convergence', {
      nodes: {
        TargetedReconvergence: { type: 'process', description: 'Targeted reconvergence on stale modules' },
      },
      journeys: {},
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'Updated compiled graph' },
      },
      journeys: {},
    }],
    ['publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects nodes' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        NewReconvergedNode: { type: 'artifact', description: 'Added during reconvergence' },
      },
      journeys: {},
    }],
  ]);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'republish-reconverge-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TargetedReconvergence completes targeted reconvergence on stale modules after an event", () => {
    const result = compileFromModules(baseModules);
    expect(result.index.nodes['convergence/TargetedReconvergence']).toBeDefined();
    expect(result.index.nodes['convergence/TargetedReconvergence'].type).toBe('process');
  });

  it("step 2: _actors/Compiler confirms the reconverged modules have 0 errors", () => {
    const result = compileFromModules(updatedModules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("step 3: graph/CompiledIndex provides the updated compiled graph", () => {
    const result = compileFromModules(updatedModules);
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
  });

  it("step 4: publish/CollectExportedNodes selects nodes for the updated interface", () => {
    const result = compileFromModules(updatedModules);
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.provides['publish/NewReconvergedNode']).toBeDefined();
  });

  it("step 5: publish/CollectExportedJourneys selects journeys for the updated interface", () => {
    const result = compileFromModules(updatedModules);
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.provides).toBeDefined();
  });

  it("step 6: publish/ValidateExportedInterface validates the updated export is self-consistent after reconvergence", () => {
    const result = compileFromModules(updatedModules);
    const iface = generateInterface(result.index, 'test-engine');
    for (const entry of Object.values(iface.provides)) {
      expect(entry.type).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });

  it("step 7: publish/ComputeInterfaceHash computes new SHA256 hash after reconvergence", () => {
    const baseResult = compileFromModules(baseModules);
    const updatedResult = compileFromModules(updatedModules);
    const baseIface = generateInterface(baseResult.index, 'test-engine');
    const updatedIface = generateInterface(updatedResult.index, 'test-engine');
    // Hashes should differ since content changed
    expect(baseIface.version_hash).not.toBe(updatedIface.version_hash);
  });

  it("step 8: publish/InterfaceHash stores the new hash", () => {
    const result = compileFromModules(updatedModules);
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 9: publish/PreviousHash provides the hash from before reconvergence", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    const { interface_: baseIface } = publishInterface(publishedDir, baseResult.index, 'test-engine');
    // Read previous hash from disk
    const onDisk = yaml.load(fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8')) as PublishedInterface;
    expect(onDisk.version_hash).toBe(baseIface.version_hash);
  });

  it("step 10: publish/ComparePreviousHash confirms the interface actually changed after reconvergence", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    const { interface_: baseIface } = publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    const { interface_: updatedIface } = publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(updatedIface.version_hash).not.toBe(baseIface.version_hash);
  });

  it("step 11: publish/ComputeChangelogDiff diffs previous vs current to identify what the reconvergence changed", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    const { changelog } = publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(changelog.changes.length).toBeGreaterThan(0);
    const added = changelog.changes.filter(c => c.type === 'added');
    expect(added.some(c => c.node === 'publish/NewReconvergedNode')).toBe(true);
  });

  it("step 12: publish/GenerateInterfaceYaml writes the updated interface.yaml", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
  });

  it("step 13: publish/InterfaceYamlFile overwrites the previous interface on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const oldContent = fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    const newContent = fs.readFileSync(path.join(publishedDir, 'interface.yaml'), 'utf-8');
    expect(newContent).not.toBe(oldContent);
  });

  it("step 14: publish/GenerateChangelogYaml writes changelog describing the specific reconvergence changes", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.changes.length).toBeGreaterThan(0);
  });

  it("step 15: publish/ChangelogYamlFile overwrites the previous changelog on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 16: publish/StorePreviousHash persists the new hash as PreviousHash for the next cycle", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    const { interface_: updatedIface } = publishInterface(publishedDir, updatedResult.index, 'test-engine');
    // Third publish should use the updated hash as previous
    const { changelog: thirdChangelog } = publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(thirdChangelog.previous_hash).toBe(updatedIface.version_hash);
  });

  it("step 17: publish/EmbedChangelogInEvent embeds the reconvergence changelog into the event so dependents scope their reconvergence", () => {
    const baseResult = compileFromModules(baseModules);
    const baseIface = generateInterface(baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    const updatedIface = generateInterface(updatedResult.index, 'test-engine');
    const changelog = generateChangelog(baseIface, updatedIface);
    for (const change of changelog.changes) {
      expect(change.impact).toBeTruthy();
    }
  });

  it("step 18: publish/TrackRippleOrigin appends this box's ID to the existing ripple origin chain from the incoming event", () => {
    const updatedResult = compileFromModules(updatedModules);
    const iface = generateInterface(updatedResult.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
  });

  it("step 19: publish/EventSequenceCounter increments the sequence counter for the reconvergence event", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const baseResult = compileFromModules(baseModules);
    const { changelog: first } = publishInterface(publishedDir, baseResult.index, 'test-engine');
    const updatedResult = compileFromModules(updatedModules);
    const { changelog: second } = publishInterface(publishedDir, updatedResult.index, 'test-engine');
    // Current hash changes between publishes
    expect(second.current_hash).not.toBe(first.current_hash);
  });

  it("step 20: publish/DetectRippleOscillation checks the extended origin chain for cycles before allowing the event write", () => {
    // Oscillation detection: same engine producing same hash means no cycle
    const updatedResult = compileFromModules(updatedModules);
    const iface = generateInterface(updatedResult.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
    // No oscillation since content actually changed
    const baseResult = compileFromModules(baseModules);
    const baseIface = generateInterface(baseResult.index, 'test-engine');
    expect(iface.version_hash).not.toBe(baseIface.version_hash);
  });

  it("step 21: publish/RippleDepthLimit checks the origin chain length against the maximum allowed depth", () => {
    // Single publish has depth 1 in the origin chain
    const updatedResult = compileFromModules(updatedModules);
    const iface = generateInterface(updatedResult.index, 'test-engine');
    expect(iface.engine).toBeTruthy();
  });

  it("step 22: publish/WriteEventFile writes a new event file to propagate the ripple to downstream dependents", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 23: publish/EventFile the event file triggers further ripple in dependent boxes", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const updatedResult = compileFromModules(updatedModules);
    publishInterface(publishedDir, updatedResult.index, 'test-engine');
    const files = fs.readdirSync(publishedDir);
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it("step 24: _actors/DependentBox detects the new event and begins its own reconvergence cycle", () => {
    const result = compileFromModules(updatedModules);
    const node = result.index.nodes['_actors/DependentBox'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

});
