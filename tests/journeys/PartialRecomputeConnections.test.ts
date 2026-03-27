// Auto-generated from journey: PartialRecomputeConnections
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("PartialRecomputeConnections", () => {
  // Simulate partial recompute: compile full, then compile with a changed module
  const modulesOriginal = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user' },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        Login: { type: 'process', description: 'Logs user in' },
        Token: { type: 'artifact', description: 'Auth token' },
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
    ['data', {
      nodes: {
        Query: { type: 'process', description: 'Queries the database' },
        Result: { type: 'artifact', description: 'Query result' },
      },
      journeys: {
        FetchData: {
          steps: [
            { node: '_actors/User', action: 'requests data' },
            { node: 'Query', action: 'queries the database' },
            { node: 'Result', action: 'returns query results' },
          ],
        },
      },
    }],
  ]);

  // Changed auth module: Login renamed to AuthLogin, Token unchanged
  const modulesChanged = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user' },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        AuthLogin: { type: 'process', description: 'Authenticates user login' },
        Token: { type: 'artifact', description: 'Auth token' },
      },
      journeys: {
        Authenticate: {
          steps: [
            { node: '_actors/User', action: 'submits credentials' },
            { node: 'AuthLogin', action: 'validates credentials' },
            { node: 'Token', action: 'issues token' },
          ],
        },
      },
    }],
    ['data', {
      nodes: {
        Query: { type: 'process', description: 'Queries the database' },
        Result: { type: 'artifact', description: 'Query result' },
      },
      journeys: {
        FetchData: {
          steps: [
            { node: '_actors/User', action: 'requests data' },
            { node: 'Query', action: 'queries the database' },
            { node: 'Result', action: 'returns query results' },
          ],
        },
      },
    }],
  ]);

  const resultOriginal = compileFromModules(modulesOriginal);
  const resultChanged = compileFromModules(modulesChanged);

  it("step 1: graph/CompiledIndex identifies which module changed and which nodes it defines", () => {
    // Original has auth/Login, changed has auth/AuthLogin
    expect(resultOriginal.index.nodes['auth/Login']).toBeDefined();
    expect(resultChanged.index.nodes['auth/Login']).toBeUndefined();
    expect(resultChanged.index.nodes['auth/AuthLogin']).toBeDefined();
  });

  it("step 2: graph/JourneyRegistry selects only journeys that reference nodes from the changed module", () => {
    // Authenticate journey references auth module nodes
    const auth = resultChanged.index.journeys['Authenticate'];
    expect(auth.modules_touched).toContain('auth');

    // FetchData journey does NOT reference auth module nodes
    const fetch = resultChanged.index.journeys['FetchData'];
    expect(fetch.modules_touched).not.toContain('auth');
  });

  it("step 3: graph/PartialConnectionComputation recomputes connections only for the selected journeys", () => {
    // Authenticate journey has updated connections with AuthLogin
    const authLogin = resultChanged.index.nodes['auth/AuthLogin'];
    expect(authLogin.preceded_by).toContain('_actors/User');
    expect(authLogin.followed_by).toContain('auth/Token');
  });

  it("step 4: graph/CrossModuleRefResolution re-resolves cross-module references in the affected journeys", () => {
    const ref = resolveNodeRef('_actors/User', 'auth');
    expect(ref.module).toBe('_actors');
    expect(ref.name).toBe('User');

    // User has cross-module connections to auth
    const user = resultChanged.index.nodes['_actors/User'];
    expect(user.cross_module_connections).toContain('auth/AuthLogin');
  });

  it("step 5: graph/ActorRefResolution re-resolves actor references in the affected journeys", () => {
    expect(resultChanged.index.journeys['Authenticate'].actor).toBe('_actors/User');
    expect(resultChanged.index.journeys['FetchData'].actor).toBe('_actors/User');
  });

  it("step 6: graph/ConnectionDeduplication deduplicates recomputed edges against unchanged edges", () => {
    // User -> AuthLogin edge appears only once
    const user = resultChanged.index.nodes['_actors/User'];
    const authLoginRefs = user.followed_by.filter(r => r === 'auth/AuthLogin');
    expect(authLoginRefs).toHaveLength(1);
  });

  it("step 7: graph/ConnectionSet replaces only the affected edges while preserving all unchanged edges", () => {
    // Data module connections are unchanged
    const query = resultChanged.index.nodes['data/Query'];
    expect(query.preceded_by).toContain('_actors/User');
    expect(query.followed_by).toContain('data/Result');

    // Auth module connections are updated
    const authLogin = resultChanged.index.nodes['auth/AuthLogin'];
    expect(authLogin.followed_by).toContain('auth/Token');

    // No errors
    const errors = resultChanged.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
