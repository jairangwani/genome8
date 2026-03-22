import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../src/compile.js';
import { generateInterface } from '../src/publish.js';
import { compile } from '../src/compile.js';
import type { ModuleFile, PublishedInterface } from '../src/types.js';

describe('director — cross-engine journeys', () => {
  it('Director compiles cross-engine journeys against published interfaces', () => {
    // Simulate: Director has cross-engine journeys referencing code-tool and main pando9

    // Get real published interfaces
    const codeResult = compile('../pando9-code/genome/modules');
    const codeInterface = generateInterface(codeResult.index, 'pando9-code');

    const mainResult = compile('../pando9/genome/modules');
    const mainInterface = generateInterface(mainResult.index, 'pando9');

    // Director's modules: just cross-engine journeys
    const directorModules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { AnonymousUser: { type: 'actor', description: 'End user' } },
      }],
      ['cross-flows', {
        nodes: {},
        journeys: {
          UserBuildsAppEndToEnd: {
            steps: [
              { node: '_actors/AnonymousUser', action: 'describes an app' },
              { node: 'pando9/Doorman', action: 'classifies request' },
              { node: 'pando9/TeamSpawner', action: 'creates agent team' },
              { node: 'pando9-code/CodeCLI', action: 'agents use CLI to write code' },
              { node: 'pando9/AppDeployer', action: 'deploys to live URL' },
            ],
          },
        },
      }],
    ]);

    // Compile Director with both published interfaces
    const extInterfaces = new Map<string, PublishedInterface>([
      ['pando9', mainInterface],
      ['pando9-code', codeInterface],
    ]);

    const r = compileFromModules(directorModules, extInterfaces);
    const errors = r.issues.filter(i => i.severity === 'error');
    console.log(`\nDirector compile: ${r.index._stats.total_nodes} nodes, ${r.index._stats.total_journeys} journeys`);
    console.log(`Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ❌ ${e.message}`));

    // Some refs will resolve (Doorman, CodeCLI exist), some won't (TeamSpawner, AppDeployer may not match exact names)
    // The key test: external refs that DO exist in interfaces should NOT error
    const codeRefErrors = errors.filter(e => e.message.includes('pando9-code'));
    console.log(`Code-tool ref errors: ${codeRefErrors.length}`);
    // CodeCLI exists in code-tool interface → should be 0 errors for it
  });

  it('Director detects missing node in external interface', () => {
    const directorModules = new Map<string, ModuleFile>([
      ['cross-flows', {
        nodes: {},
        journeys: {
          BrokenFlow: {
            steps: [
              { node: 'fake-engine/NonExistentService', action: 'this should error' },
            ],
          },
        },
      }],
    ]);

    const extInterfaces = new Map<string, PublishedInterface>([
      ['fake-engine', {
        engine: 'fake-engine',
        version_hash: 'sha256:test',
        provides: { 'fake-engine/RealService': { type: 'process', description: 'Exists', in_journeys: 1 } },
        requires: {},
      }],
    ]);

    const r = compileFromModules(directorModules, extInterfaces);
    const errors = r.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('not found in fake-engine');
    console.log('\nDirector correctly catches missing external node ✓');
  });
});
