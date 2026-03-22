import { describe, it, expect } from 'vitest';
import { compile } from '../src/compile.js';
import { generateExcerpt } from '../src/excerpt.js';
import { generateInterface, generateChangelog } from '../src/publish.js';
import { generateJourneyTestString } from '../src/testgen.js';
import fs from 'node:fs';
import path from 'node:path';

describe('integration — full pipeline on test project', () => {
  const MODULES = 'test-project/genome/modules';

  it('compile test-project', () => {
    const r = compile(MODULES);
    console.log('\n' + JSON.stringify(r.index._stats, null, 2));
    for (const [mod, c] of Object.entries(r.coverage.modules)) {
      console.log(`  ${mod}: ${c.nodes} nodes, ${c.journeys} journeys, ${c.cross_module_connections} cross`);
    }
    const errors = r.issues.filter(i => i.severity === 'error');
    const warnings = r.issues.filter(i => i.severity === 'warning');
    console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
    errors.forEach(e => console.log(`  ❌ ${e.message}`));
    warnings.forEach(w => console.log(`  ⚠️ ${w.message}`));

    expect(r.index._stats.duplicate_names).toBe(0);
    expect(r.index._stats.total_nodes).toBeGreaterThan(10);
    expect(r.index._stats.total_journeys).toBeGreaterThan(5);
  });

  it('generate excerpt for auth module', () => {
    const r = compile(MODULES);
    const content = fs.readFileSync(path.join(MODULES, 'auth.yaml'), 'utf-8');
    const excerpt = generateExcerpt({
      round: 1, focusModule: 'auth',
      index: r.index, coverage: r.coverage,
      issues: r.issues, moduleFileContent: content,
    });
    console.log('\n' + excerpt.substring(0, 500));
    expect(excerpt).toContain('auth');
    expect(excerpt).toContain('CROSS-MODULE');
  });

  it('generate published interface', () => {
    const r = compile(MODULES);
    const iface = generateInterface(r.index, 'todo-app');
    expect(iface.engine).toBe('todo-app');
    expect(Object.keys(iface.provides).length).toBeGreaterThan(10);
    console.log(`\nPublished: ${Object.keys(iface.provides).length} nodes, hash: ${iface.version_hash}`);
  });

  it('generate test from journey', () => {
    const r = compile(MODULES);
    const journeyNames = Object.keys(r.index.journeys);
    expect(journeyNames.length).toBeGreaterThan(0);
    const first = journeyNames[0];
    const test = generateJourneyTestString(first, r.index.journeys[first], r.index);
    expect(test).toContain('describe');
    expect(test).toContain('step 1');
    console.log(`\nGenerated test for ${first}:\n${test.substring(0, 300)}...`);
  });
});
