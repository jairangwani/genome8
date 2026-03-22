import { describe, it, expect } from 'vitest';
import { generateInterface, generateChangelog } from '../src/publish.js';
import { compileFromModules } from '../src/compile.js';
import type { ModuleFile } from '../src/types.js';

describe('publish — interface generation', () => {
  it('generates interface from compiled index', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'A user' } } }],
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Generates keypairs' } },
        journeys: { Register: { steps: [
          { node: '_actors/User', action: 'signs up' },
          { node: 'KeyManager', action: 'generates key' },
        ]}},
      }],
    ]);
    const result = compileFromModules(modules);
    const iface = generateInterface(result.index, 'identity');

    expect(iface.engine).toBe('identity');
    expect(iface.version_hash).toMatch(/^sha256:/);
    expect(iface.provides['identity/KeyManager']).toBeDefined();
    expect(iface.provides['identity/KeyManager'].type).toBe('process');
    expect(iface.provides['identity/KeyManager'].in_journeys).toBe(1);
  });

  it('generates changelog for added nodes', () => {
    const prev = {
      engine: 'test', version_hash: 'sha256:old',
      provides: { 'test/A': { type: 'process', description: 'old A', in_journeys: 1 } },
      requires: {},
    };
    const curr = {
      engine: 'test', version_hash: 'sha256:new',
      provides: {
        'test/A': { type: 'process', description: 'old A', in_journeys: 1 },
        'test/B': { type: 'process', description: 'new B', in_journeys: 2 },
      },
      requires: {},
    };

    const changelog = generateChangelog(prev, curr);
    expect(changelog.changes.length).toBe(1);
    expect(changelog.changes[0].type).toBe('added');
    expect(changelog.changes[0].node).toBe('test/B');
  });

  it('generates changelog for removed nodes', () => {
    const prev = {
      engine: 'test', version_hash: 'sha256:old',
      provides: {
        'test/A': { type: 'process', description: 'A', in_journeys: 1 },
        'test/B': { type: 'process', description: 'B', in_journeys: 1 },
      },
      requires: {},
    };
    const curr = {
      engine: 'test', version_hash: 'sha256:new',
      provides: { 'test/A': { type: 'process', description: 'A', in_journeys: 1 } },
      requires: {},
    };

    const changelog = generateChangelog(prev, curr);
    expect(changelog.changes.length).toBe(1);
    expect(changelog.changes[0].type).toBe('removed');
    expect(changelog.changes[0].node).toBe('test/B');
  });

  it('generates changelog for modified descriptions', () => {
    const prev = {
      engine: 'test', version_hash: 'sha256:old',
      provides: { 'test/A': { type: 'process', description: 'old desc', in_journeys: 1 } },
      requires: {},
    };
    const curr = {
      engine: 'test', version_hash: 'sha256:new',
      provides: { 'test/A': { type: 'process', description: 'new desc', in_journeys: 1 } },
      requires: {},
    };

    const changelog = generateChangelog(prev, curr);
    expect(changelog.changes.length).toBe(1);
    expect(changelog.changes[0].type).toBe('modified');
    expect(changelog.changes[0].was).toBe('old desc');
    expect(changelog.changes[0].now).toBe('new desc');
  });

  it('empty changelog when nothing changed', () => {
    const iface = {
      engine: 'test', version_hash: 'sha256:same',
      provides: { 'test/A': { type: 'process', description: 'A', in_journeys: 1 } },
      requires: {},
    };
    const changelog = generateChangelog(iface, iface);
    expect(changelog.changes.length).toBe(0);
  });
});
