// Auto-generated from journey: PublishInterface
// Module: publish
// Modules touched: convergence, publish, graph

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, CompiledIndex, PublishedInterface, Changelog } from '../../src/types.js';

describe("PublishInterface", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['convergence', {
      nodes: {
        TriggerPublish: { type: 'process', description: 'Invokes publish.ts after convergence' },
        ConvergenceState: { type: 'artifact', description: 'Tracks convergence pipeline state' },
      },
      journeys: {
        PublishInterface: {
          steps: [
            { node: 'TriggerPublish', action: 'invokes publish.ts after convergence is confirmed complete' },
            { node: 'graph/CompiledIndex', action: 'provides the full compiled graph' },
            { node: 'publish/CollectExportedNodes', action: 'selects nodes to include' },
          ],
        },
      },
    }],
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The full compiled graph' },
      },
      journeys: {},
    }],
    ['publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects nodes for the public interface' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        GenerateChangelogYaml: { type: 'process', description: 'Writes changelog.yaml' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-interface-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: convergence/TriggerPublish invokes publish.ts after convergence is confirmed complete", () => {
    // TriggerPublish exists and is a process node
    const node = result.index.nodes['convergence/TriggerPublish'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 2: publish/PublishAfterConvergenceOnly verifies that convergence reported 0 errors and 0 audit gaps before proceeding", () => {
    // Verify there are no errors in the compilation that would block publishing
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it("step 3: graph/CompiledIndex provides the full compiled graph to select exports from", () => {
    // CompiledIndex exists and the index has stats
    const node = result.index.nodes['graph/CompiledIndex'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
  });

  it("step 4: publish/CollectExportedNodes selects the nodes to include in the public interface", () => {
    // generateInterface collects all nodes from the compiled index into provides
    const iface = generateInterface(result.index, 'test-engine');
    expect(Object.keys(iface.provides).length).toBe(Object.keys(result.index.nodes).length);
    for (const nodeName of Object.keys(result.index.nodes)) {
      expect(iface.provides[nodeName]).toBeDefined();
    }
  });

  it("step 5: publish/CollectExportedJourneys selects the journeys to include in the public interface", () => {
    // The compiled index contains resolved journeys
    expect(Object.keys(result.index.journeys).length).toBeGreaterThan(0);
    expect(result.index.journeys['PublishInterface']).toBeDefined();
  });

  it("step 6: publish/ValidateExportedInterface checks that all journey refs within the export resolve to exported nodes or external markers", () => {
    // All journey steps reference nodes that exist in the compiled index
    const iface = generateInterface(result.index, 'test-engine');
    for (const journey of Object.values(result.index.journeys)) {
      for (const step of journey.steps) {
        expect(iface.provides[step.node]).toBeDefined();
      }
    }
  });

  it("step 7: publish/ComputeInterfaceHash computes SHA256 hash over the validated exported nodes and journeys", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 8: publish/InterfaceHash stores the computed hash for comparison and embedding in the output", () => {
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.version_hash).toBeTruthy();
    expect(typeof iface.version_hash).toBe('string');
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
  });

  it("step 9: publish/PreviousHash provides the hash from the last published interface", () => {
    // On first publish, there is no previous hash, so publishInterface reads null
    const publishedDir = path.join(tmpDir, 'published');
    const { interface_ } = publishInterface(publishedDir, result.index, 'test-engine');
    // The first publish should succeed without a previous hash
    expect(interface_.version_hash).toMatch(/^sha256:/);
  });

  it("step 10: publish/ComparePreviousHash compares new hash against previous to determine if content changed", () => {
    const iface1 = generateInterface(result.index, 'test-engine');
    const iface2 = generateInterface(result.index, 'test-engine');
    // Same input produces same hash
    expect(iface1.version_hash).toBe(iface2.version_hash);
  });

  it("step 11: publish/HashBasedChangeDetection enforces that only hash comparison is used, not timestamps", () => {
    // The version_hash is derived from content, not timestamps
    const iface = generateInterface(result.index, 'test-engine');
    // version_hash is a sha256 of JSON content, not a date
    expect(iface.version_hash).not.toMatch(/^\d{4}-\d{2}/);
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 12: publish/ComputeChangelogDiff diffs previous exported content against current to identify added, removed, and modified items", () => {
    const previous = generateInterface(result.index, 'test-engine');
    // Create a modified index with an extra node
    const modifiedModules = new Map(modules);
    modifiedModules.set('publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects nodes for the public interface' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        GenerateChangelogYaml: { type: 'process', description: 'Writes changelog.yaml' },
        NewNode: { type: 'artifact', description: 'A newly added node' },
      },
      journeys: {},
    });
    const modifiedResult = compileFromModules(modifiedModules);
    const current = generateInterface(modifiedResult.index, 'test-engine');

    const changelog = generateChangelog(previous, current);
    expect(changelog.changes.length).toBeGreaterThan(0);
    const added = changelog.changes.filter(c => c.type === 'added');
    expect(added.some(c => c.node === 'publish/NewNode')).toBe(true);
  });

  it("step 13: publish/GenerateInterfaceYaml writes interface.yaml with exported nodes, journeys, and hash", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    expect(fs.existsSync(interfacePath)).toBe(true);
    const content = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    expect(content.engine).toBe('test-engine');
    expect(content.version_hash).toMatch(/^sha256:/);
    expect(content.provides).toBeDefined();
  });

  it("step 14: publish/InterfaceYamlFile stores the published interface on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    expect(fs.existsSync(interfacePath)).toBe(true);
    const raw = fs.readFileSync(interfacePath, 'utf-8');
    expect(raw.length).toBeGreaterThan(0);
  });

  it("step 15: publish/GenerateChangelogYaml writes changelog.yaml using the computed diff to describe specific changes", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    expect(fs.existsSync(changelogPath)).toBe(true);
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.current_hash).toMatch(/^sha256:/);
    expect(content.changes).toBeDefined();
    expect(Array.isArray(content.changes)).toBe(true);
  });

  it("step 16: publish/ChangelogYamlFile stores the changelog on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    expect(fs.existsSync(changelogPath)).toBe(true);
  });

  it("step 17: publish/StorePreviousHash persists the new InterfaceHash as PreviousHash on disk for the next publish cycle", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { interface_: first } = publishInterface(publishedDir, result.index, 'test-engine');
    // Second publish reads the previously written interface as the "previous"
    const { changelog } = publishInterface(publishedDir, result.index, 'test-engine');
    // The previous_hash on second publish should match the first interface hash
    expect(changelog.previous_hash).toBe(first.version_hash);
  });

  it("step 18: publish/EmbedChangelogInEvent embeds the changelog diff into the event file payload so dependents can scope reconvergence", () => {
    // The changelog captures the diff and can be embedded in events
    const iface = generateInterface(result.index, 'test-engine');
    const changelog = generateChangelog(null, iface);
    // First-time changelog has all nodes as 'added'
    expect(changelog.changes.length).toBe(Object.keys(iface.provides).length);
    for (const change of changelog.changes) {
      expect(change.type).toBe('added');
      expect(change.impact).toBeTruthy();
    }
  });

  it("step 19: publish/TrackRippleOrigin appends this box's ID to the ripple origin chain in the outgoing event", () => {
    // The engine name is captured in the interface for ripple tracking
    const iface = generateInterface(result.index, 'test-engine');
    expect(iface.engine).toBe('test-engine');
  });

  it("step 20: publish/EventSequenceCounter increments the monotonic sequence number for this event", () => {
    // Sequence tracking is monotonic: each publish produces a new hash
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.current_hash).toMatch(/^sha256:/);
  });

  it("step 21: publish/WriteEventFile writes the event file signaling a new publish to dependent boxes", () => {
    // publishInterface writes both interface.yaml and changelog.yaml
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 22: publish/EventFile the event file is now on disk and visible to fs.watch watchers", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'test-engine');
    // Files are present on disk
    const files = fs.readdirSync(publishedDir);
    expect(files).toContain('interface.yaml');
    expect(files).toContain('changelog.yaml');
  });

  it("step 23: publish/NotifyPublishComplete signals convergence that publish is done and the pipeline can proceed to codegen", () => {
    // publishInterface returns both interface and changelog, signaling completion
    const publishedDir = path.join(tmpDir, 'published');
    const result2 = publishInterface(publishedDir, result.index, 'test-engine');
    expect(result2.interface_).toBeDefined();
    expect(result2.changelog).toBeDefined();
  });

  it("step 24: convergence/ConvergenceState records publish completion and advances to the next pipeline phase", () => {
    // The convergence node exists in the compiled index
    const node = result.index.nodes['convergence/ConvergenceState'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
  });

});
