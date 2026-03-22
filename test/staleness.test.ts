import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../src/compile.js';
import { generateInterface, generateChangelog } from '../src/publish.js';
import type { ModuleFile } from '../src/types.js';

describe('staleness — change detection via interface hashing', () => {
  it('interface hash changes when a node is added', () => {
    const modulesV1 = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Generates keys' },
        },
        journeys: { Register: { steps: [{ node: 'KeyManager', action: 'generates key' }] } },
      }],
    ]);

    const modulesV2 = new Map<string, ModuleFile>([
      ['identity', {
        nodes: {
          KeyManager: { type: 'process', description: 'Generates keys' },
          NewService: { type: 'process', description: 'Brand new service' },
        },
        journeys: {
          Register: { steps: [{ node: 'KeyManager', action: 'generates key' }] },
          NewFlow: { steps: [{ node: 'NewService', action: 'does something new' }] },
        },
      }],
    ]);

    const r1 = compileFromModules(modulesV1);
    const iface1 = generateInterface(r1.index, 'test');

    const r2 = compileFromModules(modulesV2);
    const iface2 = generateInterface(r2.index, 'test');

    // Hashes must differ
    expect(iface1.version_hash).not.toBe(iface2.version_hash);

    // Changelog shows the addition
    const changelog = generateChangelog(iface1, iface2);
    expect(changelog.changes.length).toBeGreaterThan(0);
    expect(changelog.changes.some(c => c.type === 'added' && c.node.includes('NewService'))).toBe(true);

    console.log(`V1 hash: ${iface1.version_hash}`);
    console.log(`V2 hash: ${iface2.version_hash}`);
    console.log(`Changes: ${changelog.changes.map(c => `${c.type}: ${c.node}`).join(', ')}`);
  });

  it('interface hash changes when a node is removed', () => {
    const modulesV1 = new Map<string, ModuleFile>([
      ['mod', {
        nodes: {
          A: { type: 'process', description: 'Service A' },
          B: { type: 'process', description: 'Service B' },
        },
        journeys: {
          Flow: { steps: [
            { node: 'A', action: 'step 1' },
            { node: 'B', action: 'step 2' },
          ]},
        },
      }],
    ]);

    const modulesV2 = new Map<string, ModuleFile>([
      ['mod', {
        nodes: {
          A: { type: 'process', description: 'Service A' },
        },
        journeys: {
          Flow: { steps: [{ node: 'A', action: 'step 1' }] },
        },
      }],
    ]);

    const r1 = compileFromModules(modulesV1);
    const iface1 = generateInterface(r1.index, 'test');

    const r2 = compileFromModules(modulesV2);
    const iface2 = generateInterface(r2.index, 'test');

    expect(iface1.version_hash).not.toBe(iface2.version_hash);

    const changelog = generateChangelog(iface1, iface2);
    expect(changelog.changes.some(c => c.type === 'removed' && c.node.includes('B'))).toBe(true);
    console.log(`Removed node detected: ✓`);
  });

  it('same modules = same hash (deterministic)', () => {
    const modules = new Map<string, ModuleFile>([
      ['mod', {
        nodes: { A: { type: 'process', description: 'A' } },
        journeys: { Flow: { steps: [{ node: 'A', action: 'does A' }] } },
      }],
    ]);

    const r1 = compileFromModules(modules);
    const r2 = compileFromModules(modules);
    const iface1 = generateInterface(r1.index, 'test');
    const iface2 = generateInterface(r2.index, 'test');

    expect(iface1.version_hash).toBe(iface2.version_hash);
    console.log(`Deterministic hash: ✓`);
  });
});
