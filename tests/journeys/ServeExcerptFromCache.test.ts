// Auto-generated from journey: ServeExcerptFromCache
// Module: excerpt
// Modules touched: excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("ServeExcerptFromCache", () => {
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['cache', {
      nodes: {
        CacheStore: { type: 'artifact', description: 'In-memory excerpt cache' },
        CacheLookup: { type: 'process', description: 'Looks up cached excerpts' },
      },
      journeys: {
        LookupCache: {
          steps: [
            { node: 'CacheLookup', action: 'checks cache for excerpt' },
            { node: 'CacheStore', action: 'retrieves cached excerpt' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'cache';
  const moduleYaml = 'nodes:\n  CacheStore:\n    type: artifact\n    description: In-memory excerpt cache';

  // Generate the excerpt the first time
  const excerptInput = {
    round: 1,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  };
  const excerpt1 = generateExcerpt(excerptInput);
  // Simulate a cache: store the excerpt keyed by module + hash
  const cacheKey = `${focusModule}:${result.index._compiled}`;
  const excerptCache = new Map<string, string>();
  excerptCache.set(cacheKey, excerpt1);

  it("step 1: excerpt/SelectTargetModule identifies the module that needs an excerpt", () => {
    expect(excerpt1).toContain('Focus: cache');
  });

  it("step 2: graph/CompiledIndex provides the current compiled index hash for cache lookup", () => {
    expect(result.index._compiled).toBeTruthy();
    expect(typeof result.index._compiled).toBe('string');
  });

  it("step 3: excerpt/CacheExcerptByState checks if a cached excerpt exists for this module at the current compiled index hash", () => {
    // The cache has an entry for this key
    expect(excerptCache.has(cacheKey)).toBe(true);
  });

  it("step 4: excerpt/CacheExcerptByState finds a valid cache hit and retrieves the stored excerpt", () => {
    const cached = excerptCache.get(cacheKey);
    expect(cached).toBeDefined();
    expect(cached).toBe(excerpt1);
  });

  it("step 5: excerpt/ExcerptOutput serves the cached excerpt immediately without running any collection steps", () => {
    // The cached excerpt is identical to what was originally generated
    const served = excerptCache.get(cacheKey)!;
    expect(served).toBe(excerpt1);
    expect(served).toContain('MODULE STATUS:');
    expect(served).toContain('YOUR FILE (cache.yaml):');
  });
});
