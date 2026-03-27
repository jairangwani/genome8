// Auto-generated from journey: ComputeConnections
// Module: graph
// Modules touched: graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("ComputeConnections", () => {
  // Two modules with a cross-module journey to test connection computation
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        User: { type: 'actor', description: 'End user of the system' },
      },
      journeys: {},
    }],
    ['auth', {
      nodes: {
        LoginForm: { type: 'interface', description: 'Login form UI' },
        AuthProcess: { type: 'process', description: 'Authenticates credentials' },
        SessionToken: { type: 'artifact', description: 'JWT session token' },
      },
      journeys: {
        UserLogin: {
          steps: [
            { node: '_actors/User', action: 'submits credentials via login form' },
            { node: 'LoginForm', action: 'captures and forwards credentials' },
            { node: 'AuthProcess', action: 'validates credentials against store' },
            { node: 'SessionToken', action: 'issues a session token on success' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: graph/JourneyRegistry provides all journeys with their ordered steps", () => {
    const journey = result.index.journeys['UserLogin'];
    expect(journey).toBeDefined();
    expect(journey.steps).toHaveLength(4);
    expect(journey.steps[0].node).toBe('_actors/User');
    expect(journey.steps[1].node).toBe('auth/LoginForm');
    expect(journey.steps[2].node).toBe('auth/AuthProcess');
    expect(journey.steps[3].node).toBe('auth/SessionToken');
  });

  it("step 2: graph/ConnectionComputation walks consecutive step pairs and derives a directed edge for each", () => {
    // LoginForm is preceded by User and followed by AuthProcess
    const loginForm = result.index.nodes['auth/LoginForm'];
    expect(loginForm.preceded_by).toContain('_actors/User');
    expect(loginForm.followed_by).toContain('auth/AuthProcess');

    // AuthProcess is preceded by LoginForm and followed by SessionToken
    const authProc = result.index.nodes['auth/AuthProcess'];
    expect(authProc.preceded_by).toContain('auth/LoginForm');
    expect(authProc.followed_by).toContain('auth/SessionToken');

    // Total connections: User->LoginForm, LoginForm->AuthProcess, AuthProcess->SessionToken = 3
    expect(result.index._stats.total_connections).toBe(3);
  });

  it("step 3: graph/CrossModuleRefResolution resolves module/NodeName references to nodes in other modules", () => {
    // resolveNodeRef parses cross-module references
    const ref = resolveNodeRef('_actors/User', 'auth');
    expect(ref.module).toBe('_actors');
    expect(ref.name).toBe('User');

    // The LoginForm has a cross-module connection to _actors/User
    const loginForm = result.index.nodes['auth/LoginForm'];
    expect(loginForm.cross_module_connections).toContain('_actors/User');

    // The User node also has a cross-module connection to auth/LoginForm
    const user = result.index.nodes['_actors/User'];
    expect(user.cross_module_connections).toContain('auth/LoginForm');
  });

  it("step 4: graph/ActorRefResolution resolves _actors/ActorName references to shared actor definitions", () => {
    // The User actor is the journey's actor
    const journey = result.index.journeys['UserLogin'];
    expect(journey.actor).toBe('_actors/User');

    // All nodes in the journey are triggered by the User actor
    const loginForm = result.index.nodes['auth/LoginForm'];
    expect(loginForm.triggered_by_actors).toContain('_actors/User');

    const sessionToken = result.index.nodes['auth/SessionToken'];
    expect(sessionToken.triggered_by_actors).toContain('_actors/User');
  });

  it("step 5: graph/ConnectionSet stores the complete set of directed edges for the graph", () => {
    // Verify the full edge set via followed_by across all nodes
    const user = result.index.nodes['_actors/User'];
    expect(user.followed_by).toEqual(['auth/LoginForm']);
    expect(user.preceded_by).toEqual([]);

    const sessionToken = result.index.nodes['auth/SessionToken'];
    expect(sessionToken.preceded_by).toEqual(['auth/AuthProcess']);
    expect(sessionToken.followed_by).toEqual([]);

    // Every node participates in the journey
    for (const node of Object.values(result.index.nodes)) {
      expect(node.in_journeys.length).toBeGreaterThan(0);
    }
  });
});
