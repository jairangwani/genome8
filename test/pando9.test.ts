import { describe, it } from 'vitest';
import { compile } from '../src/compile.js';

describe('compile pando9', () => {
  it('stats', () => {
    const r = compile('../pando9/genome/modules');
    console.log('\n' + JSON.stringify(r.index._stats, null, 2));
    console.log('\nModules:');
    for (const [mod, c] of Object.entries(r.coverage.modules)) {
      console.log(`  ${mod}: ${c.nodes} nodes, ${c.journeys} journeys, ${c.cross_module_connections} cross`);
    }
    const errors = r.issues.filter(i => i.severity === 'error');
    const warnings = r.issues.filter(i => i.severity === 'warning');
    if (errors.length) { console.log(`\n${errors.length} ERRORS:`); errors.slice(0, 10).forEach(e => console.log(`  ❌ ${e.message}`)); }
    if (warnings.length) { console.log(`\n${warnings.length} WARNINGS:`); warnings.forEach(w => console.log(`  ⚠️ ${w.message}`)); }
    const converged = errors.length === 0 && r.index._stats.orphans === 0 && r.index._stats.isolated_modules === 0;
    console.log(`\nConvergence: ${converged ? '✅ STRUCTURALLY CONVERGED' : '❌ NOT CONVERGED'}`);
  });
});
