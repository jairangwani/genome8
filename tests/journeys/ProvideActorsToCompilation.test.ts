// Auto-generated from journey: ProvideActorsToCompilation
// Module: actors
// Triggered by: _actors/Compiler
// Modules touched: actors, _actors, compilation, graph

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const actorsModule: ModuleFile = {
  nodes: {
    User: { type: 'actor', description: 'Uses the platform' },
    Admin: { type: 'actor', description: 'Manages the platform' },
    Attacker: { type: 'actor', description: 'Attempts exploitation' },
  },
};

const appModule: ModuleFile = {
  nodes: {
    LoginProcess: { type: 'process', description: 'Handles login' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/User', action: 'submits credentials' },
        { node: 'LoginProcess', action: 'authenticates the user' },
      ],
    },
  },
};

describe("ProvideActorsToCompilation", () => {
  it("step 1: actors/ActorsFile provides the validated _actors.yaml file on disk", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'actors-compile-'));
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump(actorsModule));
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    const content = yaml.load(fs.readFileSync(path.join(tmpDir, '_actors.yaml'), 'utf-8')) as any;
    expect(Object.keys(content.nodes).length).toBe(3);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 2: _actors/Compiler includes _actors.yaml in the set of files to parse", () => {
    // compile() via loadAllModules picks up _actors.yaml as "_actors" module
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'actors-compile-'));
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump(actorsModule));
    fs.writeFileSync(path.join(tmpDir, 'app.yaml'), yaml.dump(appModule));
    const result = compile(tmpDir);
    // _actors module is loaded — its nodes exist in the index
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/Admin']).toBeDefined();
    expect(result.index.nodes['_actors/Attacker']).toBeDefined();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: compilation/YAMLParsing parses _actors.yaml into structured actor node definitions", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
    ]);
    const result = compileFromModules(modules);
    // Parsed correctly — no parse errors
    const parseErrors = result.issues.filter(i => i.message.includes('parse error'));
    expect(parseErrors.length).toBe(0);
    // Each node has its type and description preserved
    expect(result.index.nodes['_actors/User'].type).toBe('actor');
    expect(result.index.nodes['_actors/User'].description).toBe('Uses the platform');
  });

  it("step 4: graph/NodeDefinition creates a node definition for each discovered actor", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
    ]);
    const result = compileFromModules(modules);
    const actorNodes = Object.entries(result.index.nodes).filter(([k]) => k.startsWith('_actors/'));
    expect(actorNodes.length).toBe(3);
    for (const [, node] of actorNodes) {
      expect(node.type).toBe('actor');
      expect(node.module).toBe('_actors');
      expect(node.description.length).toBeGreaterThan(0);
    }
  });

  it("step 5: graph/NodeRegistry registers each actor node so _actors/ references in journeys can resolve", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['app', appModule],
    ]);
    const result = compileFromModules(modules);
    // The journey references _actors/User — should resolve without errors
    const danglingErrors = result.issues.filter(i =>
      i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBe(0);
    // User node appears in the UserLogin journey
    expect(result.index.nodes['_actors/User'].in_journeys.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: graph/CompiledIndex the compiled index now contains all actor nodes alongside module nodes", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', actorsModule],
      ['app', appModule],
    ]);
    const result = compileFromModules(modules);
    // Actor nodes + app nodes all present
    expect(result.index.nodes['_actors/User']).toBeDefined();
    expect(result.index.nodes['_actors/Admin']).toBeDefined();
    expect(result.index.nodes['_actors/Attacker']).toBeDefined();
    expect(result.index.nodes['app/LoginProcess']).toBeDefined();
    // Stats reflect both modules
    expect(result.index._stats.total_nodes).toBe(4);
    expect(result.index._stats.modules).toBe(2);
  });

});
