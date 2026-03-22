import { describe, it, expect } from 'vitest';
import { generateJourneyTestString } from '../src/testgen.js';
import { compileFromModules } from '../src/compile.js';
import type { ModuleFile } from '../src/types.js';

describe('testgen — journey to test generation', () => {
  it('generates test with one test per journey step', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { User: { type: 'actor', description: 'A user' } } }],
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Keys', files: ['src/KeyManager.ts'] },
          JWTService: { type: 'process', description: 'JWT' },
        },
        journeys: { Register: { steps: [
          { node: '_actors/User', action: 'signs up' },
          { node: 'KeyManager', action: 'generates keypair' },
          { node: 'JWTService', action: 'issues token' },
        ]}},
      }],
    ]);

    const result = compileFromModules(modules);
    const journey = result.index.journeys['Register'];
    const test = generateJourneyTestString('Register', journey, result.index);

    expect(test).toContain('describe("Register"');
    expect(test).toContain('step 1: _actors/User signs up');
    expect(test).toContain('step 2: identity/KeyManager generates keypair');
    expect(test).toContain('step 3: identity/JWTService issues token');
    expect(test).toContain('TODO: agent fills assertion');
    expect(test).toContain('Implementation: src/KeyManager.ts');
  });

  it('includes actor trigger in header', () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', { nodes: { Player: { type: 'actor', description: 'Player' } } }],
      ['game', {
        nodes: { Lobby: { type: 'interface', description: 'Game lobby' } },
        journeys: { JoinGame: { steps: [
          { node: '_actors/Player', action: 'clicks Join' },
          { node: 'Lobby', action: 'shows matches' },
        ]}},
      }],
    ]);

    const result = compileFromModules(modules);
    const journey = result.index.journeys['JoinGame'];
    const test = generateJourneyTestString('JoinGame', journey, result.index);

    expect(test).toContain('Triggered by: _actors/Player');
    expect(test).toContain('Module: game');
  });

  it('shows cross-module journeys', () => {
    const modules = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Keys' } },
        journeys: { Register: { steps: [
          { node: 'KeyManager', action: 'generates key' },
          { node: 'ledger/Wallet', action: 'creates wallet' },
        ]}},
      }],
      ['ledger', { nodes: { Wallet: { type: 'artifact', description: 'Wallet' } } }],
    ]);

    const result = compileFromModules(modules);
    const journey = result.index.journeys['Register'];
    const test = generateJourneyTestString('Register', journey, result.index);

    expect(test).toContain('Modules touched: identity, ledger');
    expect(test).toContain('identity/KeyManager');
    expect(test).toContain('ledger/Wallet');
  });
});
