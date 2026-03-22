import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../src/compile.js';
import { generateJourneyTestString } from '../src/testgen.js';
import { generateInterface, generateChangelog } from '../src/publish.js';
import type { ModuleFile } from '../src/types.js';

describe('sync loop — journey change triggers test + interface update', () => {
  it('journey change regenerates different test skeleton', () => {
    // V1: KeyManager generates Ed25519
    const v1 = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Generates Ed25519 keypairs' } },
        journeys: { Register: { steps: [
          { node: 'KeyManager', action: 'generates Ed25519 keypair' },
        ]}},
      }],
    ]);

    // V2: KeyManager changed to RSA (journey step changed)
    const v2 = new Map<string, ModuleFile>([
      ['identity', {
        nodes: { KeyManager: { type: 'process', description: 'Generates RSA keypairs' } },
        journeys: { Register: { steps: [
          { node: 'KeyManager', action: 'generates RSA 4096-bit keypair' },
        ]}},
      }],
    ]);

    const r1 = compileFromModules(v1);
    const r2 = compileFromModules(v2);

    const test1 = generateJourneyTestString('Register', r1.index.journeys['Register'], r1.index);
    const test2 = generateJourneyTestString('Register', r2.index.journeys['Register'], r2.index);

    // Tests should be different
    expect(test1).toContain('Ed25519');
    expect(test2).toContain('RSA');
    expect(test1).not.toBe(test2);

    // Interface should change
    const iface1 = generateInterface(r1.index, 'identity');
    const iface2 = generateInterface(r2.index, 'identity');
    expect(iface1.version_hash).not.toBe(iface2.version_hash);

    // Changelog captures the modification
    const changelog = generateChangelog(iface1, iface2);
    expect(changelog.changes.some(c => c.type === 'modified')).toBe(true);

    console.log('Journey changed: Ed25519 → RSA');
    console.log('Test regenerated: ✓ (different content)');
    console.log('Interface hash changed: ✓');
    console.log('Changelog captured: ✓');
    console.log('\nFull sync chain: journey → test → interface → changelog → dependents detect');
  });
});
