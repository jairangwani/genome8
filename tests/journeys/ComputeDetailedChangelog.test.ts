// Auto-generated from journey: ComputeDetailedChangelog
// Module: publish
// Modules touched: publish

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface, generateChangelog, publishInterface } from '../../src/publish.js';
import type { ModuleFile, PublishedInterface, Changelog } from '../../src/types.js';

describe("ComputeDetailedChangelog", () => {
  let tmpDir: string;

  const baseModules = new Map<string, ModuleFile>([
    ['publish', {
      nodes: {
        NodeA: { type: 'process', description: 'Original node A' },
        NodeB: { type: 'artifact', description: 'Original node B' },
        NodeC: { type: 'rule', description: 'Original node C' },
      },
      journeys: {
        TestJourney: {
          steps: [
            { node: 'NodeA', action: 'does something first' },
            { node: 'NodeB', action: 'stores result' },
            { node: 'NodeC', action: 'validates the result' },
          ],
        },
      },
    }],
  ]);

  const baseResult = compileFromModules(baseModules);
  const previousInterface = generateInterface(baseResult.index, 'test-engine');

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'detailed-changelog-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 1: publish/InterfaceYamlFile provides the previously published interface content for diffing", () => {
    expect(previousInterface.provides['publish/NodeA']).toBeDefined();
    expect(previousInterface.provides['publish/NodeB']).toBeDefined();
    expect(previousInterface.provides['publish/NodeC']).toBeDefined();
  });

  it("step 2: publish/CollectExportedNodes provides the current set of exported nodes", () => {
    // Modify modules: add a node, remove one
    const modifiedModules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Modified node A' },
          NodeB: { type: 'artifact', description: 'Original node B' },
          NodeD: { type: 'interface', description: 'Newly added node D' },
        },
        journeys: {},
      }],
    ]);
    const modifiedResult = compileFromModules(modifiedModules);
    const currentInterface = generateInterface(modifiedResult.index, 'test-engine');
    expect(currentInterface.provides['publish/NodeD']).toBeDefined();
    expect(currentInterface.provides['publish/NodeC']).toBeUndefined();
  });

  it("step 3: publish/CollectExportedJourneys provides the current set of exported journeys", () => {
    expect(Object.keys(baseResult.index.journeys)).toContain('TestJourney');
  });

  it("step 4: publish/ComputeChangelogDiff compares previous exported nodes against current and identifies additions", () => {
    const modifiedModules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Original node A' },
          NodeB: { type: 'artifact', description: 'Original node B' },
          NodeC: { type: 'rule', description: 'Original node C' },
          NodeD: { type: 'interface', description: 'Newly added' },
        },
        journeys: {},
      }],
    ]);
    const modifiedResult = compileFromModules(modifiedModules);
    const currentInterface = generateInterface(modifiedResult.index, 'test-engine');
    const changelog = generateChangelog(previousInterface, currentInterface);
    const added = changelog.changes.filter(c => c.type === 'added');
    expect(added.length).toBe(1);
    expect(added[0].node).toBe('publish/NodeD');
    expect(added[0].impact).toContain('New');
  });

  it("step 5: publish/ComputeChangelogDiff compares previous exported nodes against current and identifies removals", () => {
    const modifiedModules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Original node A' },
          NodeB: { type: 'artifact', description: 'Original node B' },
        },
        journeys: {},
      }],
    ]);
    const modifiedResult = compileFromModules(modifiedModules);
    const currentInterface = generateInterface(modifiedResult.index, 'test-engine');
    const changelog = generateChangelog(previousInterface, currentInterface);
    const removed = changelog.changes.filter(c => c.type === 'removed');
    expect(removed.length).toBe(1);
    expect(removed[0].node).toBe('publish/NodeC');
    expect(removed[0].impact).toContain('Removed');
  });

  it("step 6: publish/ComputeChangelogDiff compares previous exported journeys against current and identifies modified step sequences", () => {
    const modifiedModules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Changed description for A' },
          NodeB: { type: 'artifact', description: 'Original node B' },
          NodeC: { type: 'rule', description: 'Original node C' },
        },
        journeys: {},
      }],
    ]);
    const modifiedResult = compileFromModules(modifiedModules);
    const currentInterface = generateInterface(modifiedResult.index, 'test-engine');
    const changelog = generateChangelog(previousInterface, currentInterface);
    const modified = changelog.changes.filter(c => c.type === 'modified');
    expect(modified.length).toBe(1);
    expect(modified[0].node).toBe('publish/NodeA');
    expect(modified[0].field).toBe('description');
    expect(modified[0].was).toBe('Original node A');
    expect(modified[0].now).toBe('Changed description for A');
  });

  it("step 7: publish/GenerateChangelogYaml formats the diff results into a structured changelog with added, removed, and modified sections", () => {
    const modifiedModules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Changed description for A' },
          NodeB: { type: 'artifact', description: 'Original node B' },
          NodeD: { type: 'interface', description: 'Newly added' },
        },
        journeys: {},
      }],
    ]);
    const modifiedResult = compileFromModules(modifiedModules);
    const currentInterface = generateInterface(modifiedResult.index, 'test-engine');
    const changelog = generateChangelog(previousInterface, currentInterface);

    const added = changelog.changes.filter(c => c.type === 'added');
    const removed = changelog.changes.filter(c => c.type === 'removed');
    const modified = changelog.changes.filter(c => c.type === 'modified');

    expect(added.length).toBe(1);
    expect(removed.length).toBe(1);
    expect(modified.length).toBe(1);
  });

  it("step 8: publish/ChangelogYamlFile stores the detailed changelog on disk for dependent boxes and human review", () => {
    const publishedDir = path.join(tmpDir, 'published');
    publishInterface(publishedDir, baseResult.index, 'test-engine');
    const changelogPath = path.join(publishedDir, 'changelog.yaml');
    expect(fs.existsSync(changelogPath)).toBe(true);
    const content = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
    expect(content.changes).toBeDefined();
    expect(Array.isArray(content.changes)).toBe(true);
  });

});
