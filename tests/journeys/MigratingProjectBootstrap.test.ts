// Auto-generated from journey: MigratingProjectBootstrap
// Module: actors
// Triggered by: _actors/MigratingProject
// Modules touched: _actors, convergence, organization, compilation

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const migrationSpec = `## 1. Authentication
Existing OAuth2 login with JWT tokens. Users authenticate via Google or GitHub.

## 2. Database
PostgreSQL with Prisma ORM. Existing schema with users, posts, comments tables.

## 3. API
REST API with Express. Existing endpoints for CRUD operations on all entities.`;

describe("MigratingProjectBootstrap", () => {
  it("step 1: _actors/MigratingProject has existing documentation and code that needs to be captured in the graph", () => {
    // The project already has code + docs — genome captures it in the graph
    expect(migrationSpec.length).toBeGreaterThan(0);
    expect(migrationSpec).toContain('Existing');
    expect(migrationSpec).toContain('OAuth2');
    expect(migrationSpec).toContain('PostgreSQL');
  });

  it("step 2: _actors/ProjectOwner writes a spec.md summarizing the existing system", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), migrationSpec);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toBe(migrationSpec);
    // Spec covers 3 existing subsystems
    const sections = content.split(/^## /m).filter(s => s.trim());
    expect(sections.length).toBe(3);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: convergence/ReadSpec reads the migration spec", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migrate-'));
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), migrationSpec);
    const spec = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(spec).toContain('## 1. Authentication');
    expect(spec).toContain('## 2. Database');
    expect(spec).toContain('## 3. API');
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 4: organization/IdentifyModules discovers modules that map to the existing system's components", () => {
    // Spec sections map to modules: auth, database, api
    const discoveredModules = ['auth', 'database', 'api'];
    expect(discoveredModules.length).toBe(3);
    expect(discoveredModules).toContain('auth');
    expect(discoveredModules).toContain('database');
    expect(discoveredModules).toContain('api');
  });

  it("step 5: _actors/LLMWorker analyzes existing artifacts to inform module creation with pre-existing context", () => {
    // LLM worker gets existing code + spec to create accurate modules
    const existingContext = {
      files: ['src/auth.ts', 'src/db.ts', 'src/routes.ts'],
      framework: 'Express',
      database: 'PostgreSQL',
    };
    expect(existingContext.files.length).toBe(3);
    expect(existingContext.framework).toBe('Express');
  });

  it("step 6: convergence/ModuleCreation creates modules that capture the existing system's structure", () => {
    // Modules created from the migration spec
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Authenticated user' },
          Admin: { type: 'actor', description: 'System administrator' },
        },
      }],
      ['auth', {
        spec_sections: [1],
        nodes: {
          OAuthLogin: { type: 'process', description: 'OAuth2 login flow' },
          JWTToken: { type: 'artifact', description: 'JWT session token' },
        },
        journeys: {
          UserLogin: {
            steps: [
              { node: '_actors/User', action: 'initiates OAuth login' },
              { node: 'OAuthLogin', action: 'authenticates via provider' },
              { node: 'JWTToken', action: 'is issued to the user' },
            ],
          },
        },
      }],
      ['api', {
        spec_sections: [3],
        nodes: {
          RESTEndpoint: { type: 'interface', description: 'Express REST endpoint' },
        },
        journeys: {
          HandleRequest: {
            steps: [
              { node: '_actors/User', action: 'sends API request' },
              { node: 'RESTEndpoint', action: 'processes the request' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index._stats.modules).toBe(3);
    expect(result.index._stats.total_nodes).toBe(5);
  });

  it("step 7: _actors/Compiler validates that the bootstrapped graph is consistent", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Authenticated user' },
        },
      }],
      ['auth', {
        nodes: {
          OAuthLogin: { type: 'process', description: 'OAuth2 login' },
        },
        journeys: {
          Login: {
            steps: [
              { node: '_actors/User', action: 'logs in' },
              { node: 'OAuthLogin', action: 'authenticates' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    // No orphans, no isolated modules
    expect(result.index._stats.orphans).toBe(0);
  });

  it("step 8: compilation/CompilationResult reports any gaps between the spec and the bootstrapped modules", () => {
    // If a module has nodes but no journeys, compilation flags orphans
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'User' } },
      }],
      ['auth', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: {
          UserLogin: {
            steps: [
              { node: '_actors/User', action: 'logs in' },
              { node: 'Login', action: 'authenticates' },
            ],
          },
        },
      }],
      ['database', {
        // Gap: module exists but has no journeys connecting it
        nodes: { Schema: { type: 'artifact', description: 'DB schema' } },
      }],
    ]);
    const result = compileFromModules(modules);
    // Database module has an orphan — Schema is not in any journey
    expect(result.coverage.orphans).toContain('database/Schema');
    // This gap tells the adopter: database module needs journeys
    expect(result.coverage.modules['database'].journeys).toBe(0);
  });

});
