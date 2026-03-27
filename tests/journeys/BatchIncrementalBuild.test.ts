// Auto-generated from journey: BatchIncrementalBuild
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("BatchIncrementalBuild", () => {
  // Existing compiled graph (base)
  const baseModules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user' },
      },
      journeys: {},
    }],
    ['core', {
      nodes: {
        Engine: { type: 'process', description: 'Core engine' },
      },
      journeys: {},
    }],
  ]);

  // Batch: two new modules added at once
  const batchModules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user' },
      },
      journeys: {},
    }],
    ['core', {
      nodes: {
        Engine: { type: 'process', description: 'Core engine' },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        Login: { type: 'process', description: 'Login process' },
        Token: { type: 'artifact', description: 'Session token' },
      },
      journeys: {
        Authenticate: {
          steps: [
            { node: '_actors/User', action: 'submits credentials' },
            { node: 'Login', action: 'validates credentials' },
            { node: 'Token', action: 'issues token' },
          ],
        },
      },
    }],
    ['billing', {
      nodes: {
        Invoice: { type: 'artifact', description: 'Invoice document' },
        PaymentProcess: { type: 'process', description: 'Processes payment' },
      },
      journeys: {
        Pay: {
          steps: [
            { node: '_actors/User', action: 'initiates payment' },
            { node: 'auth/Token', action: 'validates session' },
            { node: 'PaymentProcess', action: 'processes payment' },
            { node: 'Invoice', action: 'generates invoice' },
          ],
        },
      },
    }],
  ]);

  const baseResult = compileFromModules(baseModules);
  const batchResult = compileFromModules(batchModules);

  it("step 1: graph/CompiledIndex provides the existing compiled graph as the base for batch integration", () => {
    expect(baseResult.index._stats.total_nodes).toBe(2);
    expect(baseResult.index.nodes['_actors/User']).toBeDefined();
    expect(baseResult.index.nodes['core/Engine']).toBeDefined();
  });

  it("step 2: graph/ModuleFile provides multiple newly created modules queued for merge", () => {
    expect(batchResult.index._stats.modules).toBe(4);
  });

  it("step 3: graph/NodeDefinition parses nodes from all queued modules in a single pass", () => {
    expect(batchResult.index.nodes['auth/Login']).toBeDefined();
    expect(batchResult.index.nodes['auth/Token']).toBeDefined();
    expect(batchResult.index.nodes['billing/Invoice']).toBeDefined();
    expect(batchResult.index.nodes['billing/PaymentProcess']).toBeDefined();
  });

  it("step 4: graph/NodeRegistry adds all new nodes to the deduplicated map before any connection computation", () => {
    // 6 total nodes: User, Engine, Login, Token, Invoice, PaymentProcess
    expect(batchResult.index._stats.total_nodes).toBe(6);
    const keys = Object.keys(batchResult.index.nodes);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("step 5: graph/JourneyDefinition parses journeys from all queued modules", () => {
    expect(batchResult.index.journeys['Authenticate']).toBeDefined();
    expect(batchResult.index.journeys['Pay']).toBeDefined();
  });

  it("step 6: graph/JourneyRegistry adds all new journeys to the collection", () => {
    expect(batchResult.index._stats.total_journeys).toBe(2);
  });

  it("step 7: graph/ConnectionComputation computes connections for all new journeys in a single batch", () => {
    // Authenticate: User->Login->Token = 2 edges
    // Pay: User->Token->PaymentProcess->Invoice = 3 edges
    expect(batchResult.index._stats.total_connections).toBeGreaterThanOrEqual(5);
  });

  it("step 8: graph/CrossModuleRefResolution resolves cross-module references across all queued modules and existing modules", () => {
    // billing/Pay references auth/Token
    const token = batchResult.index.nodes['auth/Token'];
    expect(token.cross_module_connections.length).toBeGreaterThan(0);

    const ref = resolveNodeRef('auth/Token', 'billing');
    expect(ref.module).toBe('auth');
    expect(ref.name).toBe('Token');
  });

  it("step 9: graph/ActorRefResolution resolves actor references across all queued modules", () => {
    expect(batchResult.index.journeys['Authenticate'].actor).toBe('_actors/User');
    expect(batchResult.index.journeys['Pay'].actor).toBe('_actors/User');
  });

  it("step 10: graph/ConnectionDeduplication deduplicates edges produced by the batch of new journeys", () => {
    // User->auth/Token could come from both journeys but User only appears once in Token's preceded_by
    // Actually: Authenticate has User->Login, Pay has User->Token. So no actual overlap on edges.
    // But User's followed_by should have no duplicates.
    const user = batchResult.index.nodes['_actors/User'];
    const uniqueFollows = new Set(user.followed_by);
    expect(user.followed_by.length).toBe(uniqueFollows.size);
  });

  it("step 11: graph/ConnectionSet integrates all new edges into the existing connection set", () => {
    const login = batchResult.index.nodes['auth/Login'];
    expect(login.preceded_by).toContain('_actors/User');
    expect(login.followed_by).toContain('auth/Token');

    const payProc = batchResult.index.nodes['billing/PaymentProcess'];
    expect(payProc.preceded_by).toContain('auth/Token');
    expect(payProc.followed_by).toContain('billing/Invoice');
  });

  it("step 12: graph/BatchMerge merges all queued modules into the compiled index in a single atomic operation", () => {
    // All modules present in a single compilation
    expect(batchResult.coverage.modules['auth']).toBeDefined();
    expect(batchResult.coverage.modules['billing']).toBeDefined();
    expect(batchResult.coverage.modules['core']).toBeDefined();
  });

  it("step 13: graph/CompiledIndex updated with all new modules integrated without intermediate revalidation", () => {
    expect(batchResult.index._compiled).toBeTruthy();
    // core/Engine is an orphan (not in any journey)
    // so errors should only be orphan warnings
    const errors = batchResult.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
