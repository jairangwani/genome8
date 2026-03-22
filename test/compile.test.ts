import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../src/compile.js';
import type { ModuleFile } from '../src/types.js';

describe('compile — journey-based connections', () => {
  it('computes connections from consecutive steps', () => {
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Generates keys' },
          JWTService: { type: 'process', description: 'Issues tokens' },
        },
        journeys: {
          Register: { steps: [
            { node: 'KeyManager', action: 'generates keypair' },
            { node: 'JWTService', action: 'issues token' },
          ]},
        },
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index.nodes['identity/KeyManager'].followed_by).toContain('identity/JWTService');
    expect(r.index.nodes['identity/JWTService'].preceded_by).toContain('identity/KeyManager');
  });

  it('computes cross-module connections', () => {
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Keys' } },
        journeys: { Register: { steps: [
          { node: 'KeyManager', action: 'generates key' },
          { node: 'ledger/WalletService', action: 'creates wallet' },
        ]}},
      }],
      ['ledger', { nodes: { WalletService: { type: 'process', description: 'Wallets' } } }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index.nodes['identity/KeyManager'].cross_module_connections).toContain('ledger/WalletService');
    expect(r.index.nodes['ledger/WalletService'].cross_module_connections).toContain('identity/KeyManager');
  });

  it('detects actor trigger', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['gateway', {
        nodes: { Doorman: { type: 'process', description: 'Entry' } },
        journeys: { Build: { steps: [
          { node: '_actors/User', action: 'describes app' },
          { node: 'Doorman', action: 'classifies' },
        ]}},
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index.nodes['gateway/Doorman'].triggered_by_actors).toContain('_actors/User');
  });

  it('detects orphan nodes', () => {
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Keys' },
          Orphan: { type: 'process', description: 'Nobody uses me' },
        },
        journeys: { Register: { steps: [{ node: 'KeyManager', action: 'works' }] } },
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.issues.filter(i => i.message.includes('Orphan')).length).toBe(1);
  });

  it('detects dangling LOCAL journey refs as errors', () => {
    const modules = new Map<string, ModuleFile>([
      ['gateway', {
        nodes: { Doorman: { type: 'process', description: 'Entry' } },
        journeys: { Build: { steps: [
          { node: 'Doorman', action: 'ok' },
          { node: 'NonExistent', action: 'local ref to node that does not exist in gateway' },
        ]}},
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.issues.filter(i => i.severity === 'error').length).toBe(1);
  });

  it('treats external module refs as warnings (not errors) when no interfaces loaded', () => {
    const modules = new Map<string, ModuleFile>([
      ['gateway', {
        nodes: { Doorman: { type: 'process', description: 'Entry' } },
        journeys: { Build: { steps: [
          { node: 'Doorman', action: 'ok' },
          { node: 'identity/KeyManager', action: 'external ref to sibling engine' },
        ]}},
      }],
    ]);
    const r = compileFromModules(modules);
    // External refs without interfaces = warning, not error
    expect(r.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(r.issues.filter(i => i.severity === 'warning' && i.message.includes('external ref')).length).toBe(1);
  });

  it('detects duplicate names across modules', () => {
    const modules = new Map<string, ModuleFile>([
      ['a', { nodes: { Auth: { type: 'process', description: 'A' } } }],
      ['b', { nodes: { Auth: { type: 'process', description: 'B' } } }],
    ]);
    const r = compileFromModules(modules);
    expect(r.issues.filter(i => i.message.includes('Duplicate')).length).toBeGreaterThan(0);
  });

  it('handles multiple journeys sharing nodes', () => {
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Keys' },
          JWTService: { type: 'process', description: 'JWT' },
        },
        journeys: {
          Register: { steps: [
            { node: 'KeyManager', action: 'gen key' },
            { node: 'JWTService', action: 'issue token' },
          ]},
          Rotate: { steps: [
            { node: 'KeyManager', action: 'new key' },
            { node: 'JWTService', action: 'revoke old' },
          ]},
        },
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index.nodes['identity/KeyManager'].in_journeys.length).toBe(2);
  });

  it('compiles journey metadata with actor', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Keys' } },
        journeys: { Register: { steps: [
          { node: '_actors/User', action: 'signs up' },
          { node: 'KeyManager', action: 'generates key' },
        ]}},
      }],
    ]);
    const r = compileFromModules(modules);
    const j = r.index.journeys['Register'];
    expect(j.module).toBe('identity');
    expect(j.actor).toBe('_actors/User');
    expect(j.modules_touched).toContain('_actors');
    expect(j.modules_touched).toContain('identity');
  });

  it('handles empty modules', () => {
    const modules = new Map<string, ModuleFile>([['empty', { nodes: {} }]]);
    const r = compileFromModules(modules);
    expect(r.index._stats.total_nodes).toBe(0);
    expect(r.issues.length).toBe(0);
  });

  it('surfaces YAML parse errors', () => {
    const modules = new Map<string, ModuleFile>();
    const badModule = { nodes: {}, journeys: {}, _parseError: 'YAML parse error in bad.yaml: bad indentation' } as ModuleFile;
    modules.set('bad', badModule);
    const r = compileFromModules(modules);
    expect(r.issues.filter(i => i.message.includes('YAML parse error')).length).toBe(1);
  });

  it('computes convergence-ready stats', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'User' } } }],
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Keys' } },
        journeys: { Register: { steps: [
          { node: '_actors/User', action: 'signs up' },
          { node: 'KeyManager', action: 'generates key' },
        ]}},
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index._stats.total_nodes).toBe(2);
    expect(r.index._stats.total_journeys).toBe(1);
    expect(r.index._stats.orphans).toBe(0);
    expect(r.index._stats.duplicate_names).toBe(0);
    expect(r.index._stats.isolated_modules).toBe(0);
  });

  it('validates external refs against published interfaces', () => {
    const modules = new Map<string, ModuleFile>([
      ['game', {
        nodes: { Lobby: { type: 'interface', description: 'Game lobby' } },
        journeys: { Login: { steps: [
          { node: 'Lobby', action: 'shows login' },
          { node: 'auth-engine/LoginService', action: 'authenticates' },
        ]}},
      }],
    ]);

    // Without external interface → warning (expected external ref, not error)
    const r1 = compileFromModules(modules);
    expect(r1.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(r1.issues.filter(i => i.severity === 'warning' && i.message.includes('external ref')).length).toBe(1);

    // With external interface providing LoginService → no error
    const extInterfaces = new Map([
      ['auth-engine', {
        engine: 'auth-engine',
        version_hash: 'sha256:test',
        provides: { 'auth-engine/LoginService': { type: 'process', description: 'Auth', in_journeys: 3 } },
        requires: {},
      }],
    ]);
    const r2 = compileFromModules(modules, extInterfaces);
    const errors = r2.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it('errors when external interface lacks the referenced node', () => {
    const modules = new Map<string, ModuleFile>([
      ['game', {
        nodes: { Lobby: { type: 'interface', description: 'Lobby' } },
        journeys: { Login: { steps: [
          { node: 'Lobby', action: 'shows login' },
          { node: 'auth-engine/NonExistent', action: 'fails' },
        ]}},
      }],
    ]);
    const extInterfaces = new Map([
      ['auth-engine', {
        engine: 'auth-engine',
        version_hash: 'sha256:test',
        provides: { 'auth-engine/LoginService': { type: 'process', description: 'Auth', in_journeys: 1 } },
        requires: {},
      }],
    ]);
    const r = compileFromModules(modules, extInterfaces);
    const errors = r.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('not found in auth-engine');
  });

  it('uses universal node types', () => {
    const modules = new Map<string, ModuleFile>([
      ['test', {
        nodes: {
          User: { type: 'actor', description: 'A user' },
          AuthService: { type: 'process', description: 'Auth' },
          UserDB: { type: 'artifact', description: 'Database' },
          LoginPage: { type: 'interface', description: 'Login UI' },
          RateLimit: { type: 'rule', description: 'Rate limiting' },
        },
        journeys: {
          Login: { steps: [
            { node: 'User', action: 'visits site' },
            { node: 'LoginPage', action: 'shows form' },
            { node: 'AuthService', action: 'validates credentials' },
            { node: 'UserDB', action: 'checks user record' },
            { node: 'RateLimit', action: 'enforces limits' },
          ]},
        },
      }],
    ]);
    const r = compileFromModules(modules);
    expect(r.index._stats.total_nodes).toBe(5);
    expect(r.index._stats.orphans).toBe(0);
    expect(r.index.nodes['test/User'].type).toBe('actor');
    expect(r.index.nodes['test/AuthService'].type).toBe('process');
    expect(r.index.nodes['test/UserDB'].type).toBe('artifact');
    expect(r.index.nodes['test/LoginPage'].type).toBe('interface');
    expect(r.index.nodes['test/RateLimit'].type).toBe('rule');
  });
});
