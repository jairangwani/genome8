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

describe("YAMLTamperingDefense", () => {
  it("step 1: _actors/YAMLTamperer directly edits _actors.yaml to inject invalid actor definitions or corrupt entries", () => {
    // Simulate tampering: write invalid YAML to _actors.yaml
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tamper-'));
    const tamperedContent = `nodes:
  User:
    type: actor
    description: Valid actor
  BadEntry:
    type: weapon
    description: This is not a valid node type
  Broken:
    type: actor
    description:`;
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), tamperedContent);
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 2: actors/ActorsFile contains the tampered content", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tamper-'));
    const tamperedContent = `nodes:
  User:
    type: actor
    description: Valid
  BadEntry:
    type: weapon
    description: Not a valid type`;
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), tamperedContent);
    const content = fs.readFileSync(path.join(tmpDir, '_actors.yaml'), 'utf-8');
    expect(content).toContain('weapon');
    expect(content).toContain('BadEntry');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: _actors/Compiler runs compilation on the tampered file", () => {
    // Compile a module with an invalid node type
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Valid actor' },
          BadEntry: { type: 'weapon' as any, description: 'Not a valid type' },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // Compilation still runs — it reports errors, doesn't crash
    expect(result.index).toBeDefined();
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("step 4: compilation/YAMLErrorReporting catches any YAML syntax errors from the tampering", () => {
    // Write actually broken YAML (syntax error)
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tamper-'));
    const brokenYaml = `nodes:
  User:
    type: actor
    description: Valid
  BadEntry:
    type: actor
    description: [unterminated bracket`;
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), brokenYaml);
    const result = compile(tmpDir);
    // Parse error is surfaced as an issue
    const parseErrors = result.issues.filter(i => i.message.includes('parse error') || i.message.includes('YAML'));
    expect(parseErrors.length).toBeGreaterThanOrEqual(1);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 5: graph/NodeTypeSchema validates that tampered entries still conform to the actor type schema", () => {
    // Invalid type "weapon" is caught by node type validation
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Valid actor' },
          Tampered: { type: 'weapon' as any, description: 'Invalid type injected' },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const typeErrors = result.issues.filter(i =>
      i.message.includes('Invalid type') && i.message.includes('weapon')
    );
    expect(typeErrors.length).toBe(1);
    expect(typeErrors[0].severity).toBe('error');
  });

  it("step 6: compilation/CompilationResult reports validation errors from the tampered content", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Valid' },
          Bad1: { type: 'virus' as any, description: 'Injected' },
          Bad2: { type: 'exploit' as any, description: 'Injected' },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    // Two invalid types should produce two errors
    expect(errors.length).toBe(2);
    // Valid node still compiles
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/User'].type).toBe('actor');
  });

});
