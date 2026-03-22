import { describe, it } from 'vitest';
import { compile } from '../src/compile.js';
import { publishInterface } from '../src/publish.js';

describe('publish pando9 interface', () => {
  it('generates interface', () => {
    const r = compile('../pando9/genome/modules');
    const { interface_, changelog } = publishInterface('../pando9/genome/published', r.index, 'pando9');
    console.log(`Published: ${Object.keys(interface_.provides).length} nodes`);
    console.log(`Requires: ${Object.keys(interface_.requires).length} external`);
    console.log(`Hash: ${interface_.version_hash}`);
    console.log(`Changes: ${changelog.changes.length}`);
  });
});
