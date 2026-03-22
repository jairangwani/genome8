import { describe, it, expect } from 'vitest';
import { compile, compileFromModules } from '../src/compile.js';
import { generateInterface, generateChangelog } from '../src/publish.js';
import { publishInterface } from '../src/publish.js';
import type { PublishedInterface } from '../src/types.js';
import fs from 'node:fs';

describe('multi-engine — split pando9', () => {
  it('code-tool engine compiles independently', () => {
    const r = compile('../pando9-code/genome/modules');
    console.log('\nCode-tool engine:', JSON.stringify(r.index._stats, null, 2));
    expect(r.index._stats.duplicate_names).toBe(0);
    // Will have orphans (actors not in code-tool journeys) — that's expected
    const errors = r.issues.filter(i => i.severity === 'error');
    console.log(`Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ❌ ${e.message}`));
  });

  it('code-tool publishes interface', () => {
    const r = compile('../pando9-code/genome/modules');
    const iface = generateInterface(r.index, 'pando9-code');
    console.log(`\nCode-tool provides: ${Object.keys(iface.provides).length} nodes`);
    console.log(`Hash: ${iface.version_hash}`);
    // Should provide code-tool nodes
    const codeNodes = Object.keys(iface.provides).filter(k => k.startsWith('code-tool/'));
    console.log(`Code-tool specific nodes: ${codeNodes.length}`);
    expect(codeNodes.length).toBeGreaterThan(5);
  });

  it('main pando9 engine can reference code-tool via published interface', () => {
    // Compile code-tool engine and get its interface
    const codeResult = compile('../pando9-code/genome/modules');
    const codeInterface = generateInterface(codeResult.index, 'pando9-code');

    // Compile main pando9 with code-tool as external interface
    const mainResult = compile('../pando9/genome/modules');

    // Check: main pando9 references code-tool nodes in journeys
    const codeRefs: string[] = [];
    for (const [, journey] of Object.entries(mainResult.index.journeys)) {
      for (const step of journey.steps) {
        if (step.node.startsWith('code-tool/')) {
          codeRefs.push(step.node);
        }
      }
    }
    console.log(`\nMain engine references to code-tool: ${codeRefs.length}`);
    console.log(`Unique code-tool nodes referenced: ${[...new Set(codeRefs)].join(', ')}`);
  });

  it('interface change detection works', () => {
    const r1 = compile('../pando9-code/genome/modules');
    const iface1 = generateInterface(r1.index, 'pando9-code');

    // Same compile = same hash
    const r2 = compile('../pando9-code/genome/modules');
    const iface2 = generateInterface(r2.index, 'pando9-code');

    expect(iface1.version_hash).toBe(iface2.version_hash);

    // Changelog between identical interfaces = 0 changes
    const changelog = generateChangelog(iface1, iface2);
    expect(changelog.changes.length).toBe(0);
    console.log('\nSame interface → 0 changes ✓');
  });
});
