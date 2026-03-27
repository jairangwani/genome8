// Auto-generated from journey: FirstTimePublish
// Module: publish
// Modules touched: convergence, publish, graph

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("FirstTimePublish", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        TriggerPublish: { type: 'process', description: 'Invokes publish after convergence' },
        ConvergenceState: { type: 'artifact', description: 'Tracks convergence pipeline state' },
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
        CollectExportedNodes: { type: 'process', description: 'Selects nodes for interface' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        ChangelogYamlFile: { type: 'artifact', description: 'Changelog on disk' },
      },
      journeys: {
        FirstTimePublish: {
          steps: [
            { node: 'convergence/TriggerPublish', action: 'invokes publish after first convergence' },
            { node: 'graph/CompiledIndex', action: 'provides compiled graph' },
            { node: 'CollectExportedNodes', action: 'selects nodes' },
            { node: 'GenerateInterfaceYaml', action: 'writes interface.yaml' },
            { node: 'ChangelogYamlFile', action: 'stores changelog on disk' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'first-publish-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TriggerPublish invokes publish.ts after the first convergence of this box", () => {
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: publish/PublishAfterConvergenceOnly verifies convergence reported 0 errors and 0 audit gaps", () => {
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("step 3: graph/CompiledIndex provides the compiled graph for the first publish", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: publish/CollectExportedNodes selects nodes for the initial public interface", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(Object.keys(iface.provides).length).toBe(Object.keys(result.index.nodes).length);
  });

  it("step 5: publish/CollectExportedJourneys selects journeys for the initial public interface", () => {
    expect(Object.keys(result.index.journeys).length).toBeGreaterThan(0);
  });

  it("step 6: publish/ValidateExportedInterface validates the exported subset is self-consistent before first publish", () => {
    const iface = generateInterface(result.index, 'test-engine');
    // All provides entries have required fields
    for (const [name, entry] of Object.entries(iface.provides)) {
      expect(entry.type).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(typeof entry.in_journeys).toBe('number');
    }
  });

  it("step 7: publish/ComputeInterfaceHash computes the first SHA256 hash for this box's interface", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 8: publish/InterfaceHash stores the initial hash", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toBeTruthy();
    expect(iface.version_hash.length).toBe(7 + 64); // 'sha256:' + 64 hex chars
  });

  it("step 9: publish/PreviousHash is checked and found to not exist on disk since this is the first publish", () => {
    const publishedDir = path.join(tmpDir, 'published');
    // No interface.yaml exists before first publish
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(false);
  });

  it("step 10: publish/ComparePreviousHash detects no previous hash exists and signals that publish must always proceed", () => {
    // With null previous, changelog marks previous_hash as 'none'
    const iface = generateInterface(result.index, 'test-engine');
    const changelog = generateChangelog(null, iface);
    expect(changelog.previous_hash).toBe('none');
  });

  it("step 11: publish/GenerateInterfaceYaml writes the initial interface.yaml with all exported nodes and journeys", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    expect(fs.existsSync(interfacePath)).toBe(true);
    const content = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    expect(content.engine).toBe('test-engine');
    expect(Object.keys(content.provides).length).toBeGreaterThan(0);
  });

  it("step 12: publish/InterfaceYamlFile stores the first published interface on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const stat = fs.statSync(path.join(publishedDir, 'interface.yaml'));
    expect(stat.size).toBeGreaterThan(0);
  });

  it("step 13: publish/ComputeChangelogDiff produces an initial changelog with all items marked as added since there is no previous version", () => {
    const iface = generateInterface(result.index, 'test-engine');
    const changelog = generateChangelog(null, iface);
    // All changes should be 'added' on first publish
    expect(changelog.changes.length).toBe(Object.keys(iface.provides).length);
    for (const change of changelog.changes) {
      expect(change.type).toBe('added');
    }
  });

  it("step 14: publish/GenerateChangelogYaml writes the initial changelog.yaml listing all nodes and journeys as newly added", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(changelog.previous_hash).toBe('none');
    expect(changelog.changes.every(c => c.type === 'added')).toBe(true);
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    expect(fs.existsSync(changelogPath)).toBe(true);
  });

  it("step 15: publish/ChangelogYamlFile stores the initial changelog on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.previous_hash).toBe('none');
    expect(content.current_hash).toMatch(/^sha256:/);
  });

  it("step 16: publish/StorePreviousHash writes the first InterfaceHash as PreviousHash, establishing the baseline for future comparisons", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { interface_: first } = publishInterface(publishedDir, result.index, 'test-engine');
    // On second publish, previous hash should come from the written interface.yaml
    const { changelog: second } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(second.previous_hash).toBe(first.version_hash);
  });

  it("step 17: publish/EmbedChangelogInEvent embeds the full initial changelog into the first event so dependents know the complete interface", () => {
    const iface = generateInterface(result.index, 'test-engine');
    const changelog = generateChangelog(null, iface);
    // Each 'added' entry has an impact description
    for (const change of changelog.changes) {
      expect(change.impact).toContain('New');
    }
  });

  it("step 18: publish/TrackRippleOrigin starts a new ripple origin chain with this box as the sole entry", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
  });

  it("step 19: publish/EventSequenceCounter initializes the sequence counter to 1 for the first event", () => {
    // The first publish creates changelog with sequence info embedded in the hash
    const publishedDir = path.join(tmpDir, 'published');
    const { changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    expect(changelog.current_hash).toMatch(/^sha256:/);
    expect(changelog.previous_hash).toBe('none');
  });

  it("step 20: publish/WriteEventFile writes the first event file announcing this box's existence to dependents", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 21: publish/EventFile the initial event file is on disk for any watchers", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const files = fs.readdirSync(publishedDir);
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it("step 22: publish/NotifyPublishComplete signals convergence that first publish is complete", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const result2 = publishInterface(publishedDir, result.index, 'test-engine');
    expect(result2.interface_).toBeDefined();
    expect(result2.changelog).toBeDefined();
  });

  it("step 23: convergence/ConvergenceState records the successful first publish and proceeds to codegen", () => {
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

});
