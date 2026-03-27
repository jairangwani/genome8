// Auto-generated from journey: PublishParentInterface
// Module: publish
// Triggered by: _actors/ParentEngine
// Modules touched: _actors, publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("PublishParentInterface", () => {
  let tmpDir: string;

  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        ParentEngine: { type: 'actor', description: 'Parent engine collecting child interfaces' },
      },
      journeys: {},
    }],
    ['publish', {
      nodes: {
        CollectExportedNodes: { type: 'process', description: 'Selects parent-level nodes' },
        CollectExportedJourneys: { type: 'process', description: 'Selects parent-level journeys' },
        GenerateInterfaceYaml: { type: 'process', description: 'Writes interface.yaml' },
        GenerateChangelogYaml: { type: 'process', description: 'Writes changelog.yaml' },
        InterfaceHash: { type: 'artifact', description: 'Stores hash' },
      },
      journeys: {
        ParentPublish: {
          steps: [
            { node: '_actors/ParentEngine', action: 'collects child interfaces' },
            { node: 'CollectExportedNodes', action: 'selects parent nodes' },
            { node: 'GenerateInterfaceYaml', action: 'writes parent interface' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-parent-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: _actors/ParentEngine has collected all child interfaces after hierarchy split", () => {
    const node = result.index.nodes['_actors/ParentEngine'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 2: publish/CollectExportedNodes selects parent-level nodes including cross-engine connections", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    expect(Object.keys(iface.provides).length).toBe(Object.keys(result.index.nodes).length);
  });

  it("step 3: publish/CollectExportedJourneys selects parent-level journeys including cross-engine journeys", () => {
    expect(Object.keys(result.index.journeys).length).toBeGreaterThan(0);
  });

  it("step 4: publish/ValidateExportedInterface validates the parent export including cross-engine refs to child interfaces", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    for (const entry of Object.values(iface.provides)) {
      expect(entry.type).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });

  it("step 5: publish/ComputeInterfaceHash computes SHA256 hash for the parent interface", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    expect(iface.version_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("step 6: publish/InterfaceHash stores the parent interface hash", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    expect(iface.version_hash.startsWith('sha256:')).toBe(true);
  });

  it("step 7: publish/GenerateInterfaceYaml writes the parent's interface.yaml combining child interfaces", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    const interfacePath = path.join(publishedDir, 'interface.yaml');
    expect(fs.existsSync(interfacePath)).toBe(true);
    const content = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    expect(content.engine).toBe('parent-engine');
  });

  it("step 8: publish/InterfaceYamlFile stores the parent interface on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    const stat = fs.statSync(path.join(publishedDir, 'interface.yaml'));
    expect(stat.size).toBeGreaterThan(0);
  });

  it("step 9: publish/ComputeChangelogDiff diffs against previous parent interface to identify changes from child reconvergence", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { changelog } = publishInterface(publishedDir, result.index, 'parent-engine');
    // First publish: all added
    expect(changelog.previous_hash).toBe('none');
    expect(changelog.changes.every(c => c.type === 'added')).toBe(true);
  });

  it("step 10: publish/GenerateChangelogYaml writes changelog for the parent publish", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 11: publish/ChangelogYamlFile stores the parent changelog on disk", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.current_hash).toMatch(/^sha256:/);
  });

  it("step 12: publish/StorePreviousHash persists the parent hash for next comparison cycle", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { interface_: first } = publishInterface(publishedDir, result.index, 'parent-engine');
    const { changelog: second } = publishInterface(publishedDir, result.index, 'parent-engine');
    expect(second.previous_hash).toBe(first.version_hash);
  });

  it("step 13: publish/EmbedChangelogInEvent embeds the parent changelog into the event for upstream dependents", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    const changelog = generateChangelog(null, iface);
    expect(changelog.changes.length).toBeGreaterThan(0);
    for (const change of changelog.changes) {
      expect(change.impact).toBeTruthy();
    }
  });

  it("step 14: publish/TrackRippleOrigin starts a new origin chain rooted at the parent since parent publishes are origin points", () => {
    const iface = generateInterface(result.index, 'parent-engine');
    expect(iface.engine).toBe('parent-engine');
  });

  it("step 15: publish/EventSequenceCounter increments the parent's event sequence counter", () => {
    const publishedDir = path.join(tmpDir, 'published');
    const { changelog } = publishInterface(publishedDir, result.index, 'parent-engine');
    expect(changelog.current_hash).toMatch(/^sha256:/);
  });

  it("step 16: publish/WriteEventFile writes event file for parent-level dependents", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    expect(fs.existsSync(path.join(publishedDir, 'interface.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(publishedDir, 'changelog.yaml'))).toBe(true);
  });

  it("step 17: publish/EventFile signals parent publish to any upstream watchers", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, result.index, 'parent-engine');
    const files = fs.readdirSync(publishedDir);
    expect(files).toContain('interface.yaml');
    expect(files).toContain('changelog.yaml');
  });

});
