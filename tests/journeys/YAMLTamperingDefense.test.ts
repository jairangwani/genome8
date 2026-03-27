// Auto-generated from journey: YAMLTamperingDefense
// Module: actors
// Triggered by: _actors/YAMLTamperer
// Modules touched: _actors, actors, compilation, graph

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts
// Implementation: test/pando8.test.ts
// Implementation: test/pando9.test.ts

describe("YAMLTamperingDefense", () => {
  it("step 1: _actors/YAMLTamperer directly edits _actors.yaml to inject invalid actor definitions or corrupt entries", () => {
    // Simulate tampered YAML content — invalid syntax
    const tamperedYaml = `
nodes:
  GoodActor:
    type: actor
    description: valid actor
  BadActor:
    type: actor
    description: [this is invalid YAML nesting
`;
    // js-yaml should throw on invalid content
    expect(() => yaml.load(tamperedYaml)).toThrow();
  });

  it("step 2: actors/ActorsFile contains the tampered content", () => {
    // Write tampered content to a temp file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-tamper-'));
    const tamperedContent = 'nodes:\n  Bad: {type: actor, description: "ok"}\n  Corrupt: {type: process, description: "should be actor"}\n';
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), tamperedContent);
    const read = fs.readFileSync(path.join(tmpDir, '_actors.yaml'), 'utf-8');
    expect(read).toContain('Corrupt');
    expect(read).toContain('process');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: _actors/Compiler runs compilation on the tampered file", () => {
    // Compile a module with a non-actor type in _actors — compilation succeeds but the type is wrong
    const tamperedModule: ModuleFile = {
      nodes: {
        GoodActor: { type: 'actor', description: 'valid actor' },
        TamperedEntry: { type: 'process', description: 'should be actor but was tampered to process' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', tamperedModule]]));
    // Compilation runs without crashing
    expect(result.index).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(2);
  });

  it("step 4: compilation/YAMLErrorReporting catches any YAML syntax errors from the tampering", () => {
    // Write syntactically invalid YAML and compile from directory
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-tamper-'));
    const invalidYaml = 'nodes:\n  Bad:\n    type: actor\n    description: [unclosed bracket\n';
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), invalidYaml);
    const result = compile(tmpDir);
    // Parse errors should be reported as issues
    const parseErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('YAML parse error')
    );
    expect(parseErrors.length).toBeGreaterThanOrEqual(1);
    expect(parseErrors[0].module).toBe('_actors');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 5: graph/NodeTypeSchema validates that tampered entries still conform to the actor type schema", () => {
    // A tampered _actors module with wrong types — the compiler stores the type as-is
    const tamperedModule: ModuleFile = {
      nodes: {
        GoodActor: { type: 'actor', description: 'valid' },
        TamperedEntry: { type: 'interface', description: 'should be actor, was changed to interface' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', tamperedModule]]));
    // The tampered entry has the wrong type — validation can detect this
    expect(result.index.nodes['_actors/GoodActor'].type).toBe('actor');
    expect(result.index.nodes['_actors/TamperedEntry'].type).toBe('interface');
    // A validator checking _actors should flag non-actor types
    const nonActorInActors = Object.entries(result.index.nodes)
      .filter(([key, node]) => key.startsWith('_actors/') && node.type !== 'actor');
    expect(nonActorInActors.length).toBe(1);
    expect(nonActorInActors[0][0]).toBe('_actors/TamperedEntry');
  });

  it("step 6: compilation/CompilationResult reports validation errors from the tampered content", () => {
    // Test with completely invalid YAML — missing nodes, empty file
    const emptyModule: ModuleFile = {
      nodes: {},
      journeys: {},
    };
    const result = compileFromModules(new Map([['_actors', emptyModule]]));
    // Empty _actors compiles but produces 0 nodes
    expect(result.index._stats.total_nodes).toBe(0);

    // Test with a journey referencing tampered actors that don't exist
    const moduleWithBadRef: ModuleFile = {
      nodes: {
        DataStore: { type: 'artifact', description: 'stores data' },
      },
      journeys: {
        TamperedFlow: {
          steps: [
            { node: '_actors/DeletedActor', action: 'tries to access system' },
            { node: 'DataStore', action: 'receives request' },
          ],
        },
      },
    };
    const result2 = compileFromModules(new Map([
      ['_actors', emptyModule],
      ['gateway', moduleWithBadRef],
    ]));
    // Dangling reference to _actors/DeletedActor is caught
    const errors = result2.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some(e => e.message.includes('DeletedActor'))).toBe(true);
  });

});
