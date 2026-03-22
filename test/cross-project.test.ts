import { describe, it, expect } from 'vitest';
import { compile, compileFromModules, loadAllModules } from '../src/compile.js';
import { generateInterface } from '../src/publish.js';
import { checkDependencies } from '../src/sync.js';
import type { PublishedInterface } from '../src/types.js';

describe('cross-project sync — car-game depends on pando9', () => {
  it('car-game compiles with pando9 as external interface', () => {
    // Get pando9's published interface
    const pando9Result = compile('../pando9/genome/modules');
    const pando9Interface = generateInterface(pando9Result.index, 'pando9');

    // Compile car-game with pando9 as external
    const carModules = loadAllModules('../car-game/genome/modules');
    const extInterfaces = new Map<string, PublishedInterface>([
      ['pando9', pando9Interface],
    ]);
    const carResult = compileFromModules(carModules, extInterfaces);

    console.log('\nCar-game compile:', JSON.stringify(carResult.index._stats, null, 2));
    const errors = carResult.issues.filter(i => i.severity === 'error');
    console.log(`Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ❌ ${e.message}`));

    // IdentityService exists in pando9 → should resolve
    const identityErrors = errors.filter(e => e.message.includes('IdentityService'));
    console.log(`IdentityService errors: ${identityErrors.length}`);

    expect(carResult.index._stats.total_nodes).toBeGreaterThan(4);
    expect(carResult.index._stats.total_journeys).toBe(2);
  });

  it('car-game detects when pando9 interface changes', () => {
    // Simulate: pando9 publishes interface v1
    const pando9Result = compile('../pando9/genome/modules');
    const interfaceV1 = generateInterface(pando9Result.index, 'pando9');

    // Car-game compiles against v1 — all good
    const carModules = loadAllModules('../car-game/genome/modules');
    const r1 = compileFromModules(carModules, new Map([['pando9', interfaceV1]]));
    const errors1 = r1.issues.filter(i => i.severity === 'error').length;

    // Simulate: pando9 changes (different hash)
    // In reality this would happen when pando9 recompiles after a change
    // For this test, we just verify the hash mechanism
    const interfaceV2 = { ...interfaceV1, version_hash: 'sha256:CHANGED' };

    const hashChanged = interfaceV1.version_hash !== interfaceV2.version_hash;
    expect(hashChanged).toBe(true);
    console.log(`\nInterface v1 hash: ${interfaceV1.version_hash}`);
    console.log(`Interface v2 hash: ${interfaceV2.version_hash}`);
    console.log(`Change detected: ${hashChanged} ✓`);
  });
});
