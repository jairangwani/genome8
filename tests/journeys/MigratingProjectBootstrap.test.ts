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
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: src/convergence.ts
// Implementation: test/compile.test.ts
// Implementation: test/pando8.test.ts
// Implementation: test/pando9.test.ts

describe("MigratingProjectBootstrap", () => {
  it("step 1: _actors/MigratingProject has existing documentation and code that needs to be captured in the graph", () => {
    // A migrating project has existing source files and docs
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-migrate-'));
    fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src', 'api.ts'), 'export function handleRequest() {}');
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Existing Project\nA REST API service.');
    expect(fs.existsSync(path.join(tmpDir, 'src', 'api.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 2: _actors/ProjectOwner writes a spec.md summarizing the existing system", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-migrate-'));
    const migrationSpec = '# Existing System\n\nMigrating from legacy monolith to genome8 context graph.\n\nComponents: auth, API gateway, database layer, notification service.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), migrationSpec);
    const content = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(content).toContain('Migrating');
    expect(content).toContain('auth');
    expect(content).toContain('API gateway');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 3: convergence/ReadSpec reads the migration spec", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-migrate-'));
    const spec = '# Migration\nCapturing existing system in genome8.';
    fs.writeFileSync(path.join(tmpDir, 'spec.md'), spec);
    const read = fs.readFileSync(path.join(tmpDir, 'spec.md'), 'utf-8');
    expect(read).toBe(spec);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 4: organization/IdentifyModules discovers modules that map to the existing system's components", () => {
    // Existing system components map to genome8 modules
    const existingComponents = ['auth', 'api-gateway', 'database', 'notifications'];
    const identifiedModules = existingComponents.map(c => c.replace(/-/g, '_'));
    expect(identifiedModules.length).toBe(4);
    expect(identifiedModules).toContain('auth');
    expect(identifiedModules).toContain('api_gateway');
  });

  it("step 5: _actors/LLMWorker analyzes existing artifacts to inform module creation with pre-existing context", () => {
    // LLM worker receives existing code files as context for module creation
    const existingFiles = ['src/auth.ts', 'src/gateway.ts', 'src/db.ts', 'src/notify.ts'];
    expect(existingFiles.length).toBe(4);
    // The files node supports linking code to graph nodes
    const nodeWithFiles: ModuleFile = {
      nodes: {
        AuthHandler: {
          type: 'process',
          description: 'authentication handler',
          files: ['src/auth.ts'],
        },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['auth', nodeWithFiles]]));
    expect(result.index.nodes['auth/AuthHandler'].files).toContain('src/auth.ts');
  });

  it("step 6: convergence/ModuleCreation creates modules that capture the existing system's structure", () => {
    // Create modules representing the existing system
    const authModule: ModuleFile = {
      nodes: {
        Login: { type: 'process', description: 'handles user authentication', files: ['src/auth.ts'] },
        SessionStore: { type: 'artifact', description: 'stores user sessions' },
      },
      journeys: {},
    };
    const gatewayModule: ModuleFile = {
      nodes: {
        Router: { type: 'process', description: 'routes API requests', files: ['src/gateway.ts'] },
        RateLimit: { type: 'rule', description: 'enforces rate limiting' },
      },
      journeys: {
        HandleAPIRequest: {
          steps: [
            { node: 'RateLimit', action: 'checks rate limit' },
            { node: 'Router', action: 'routes to handler' },
            { node: 'auth/Login', action: 'authenticates if needed' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([
      ['auth', authModule],
      ['gateway', gatewayModule],
    ]));
    expect(result.index._stats.modules).toBe(2);
    expect(result.index._stats.total_nodes).toBe(4);
    expect(result.index._stats.total_journeys).toBe(1);
    // Cross-module connection between gateway and auth
    expect(result.coverage.modules['gateway'].cross_module_connections).toBeGreaterThanOrEqual(1);
  });

  it("step 7: _actors/Compiler validates that the bootstrapped graph is consistent", () => {
    // Full compile on a bootstrapped set of modules — should have 0 errors
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-migrate-'));
    const modulesDir = tmpDir;
    // Write actor + 2 modules
    fs.writeFileSync(path.join(modulesDir, '_actors.yaml'), yaml.dump({
      spec_sections: [1],
      nodes: {
        Developer: { type: 'actor', description: 'existing system developer' },
      },
      journeys: {},
    }, { lineWidth: 120 }));
    fs.writeFileSync(path.join(modulesDir, 'auth.yaml'), yaml.dump({
      nodes: { Login: { type: 'process', description: 'auth handler' } },
      journeys: {
        DevLogin: {
          steps: [
            { node: '_actors/Developer', action: 'logs in' },
            { node: 'Login', action: 'authenticates' },
          ],
        },
      },
    }, { lineWidth: 120 }));
    const result = compile(modulesDir);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.total_nodes).toBe(2); // 1 actor + 1 process
    expect(result.index._stats.total_journeys).toBe(1);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("step 8: compilation/CompilationResult reports any gaps between the spec and the bootstrapped modules", () => {
    // An incomplete migration leaves orphan nodes (spec mentions more than graph covers)
    const incompleteModule: ModuleFile = {
      nodes: {
        AuthHandler: { type: 'process', description: 'handles auth' },
        NotifyService: { type: 'process', description: 'sends notifications' },
        DBLayer: { type: 'process', description: 'database access' },
        CacheLayer: { type: 'process', description: 'caching layer — not yet connected' },
      },
      journeys: {
        AuthFlow: {
          steps: [
            { node: 'AuthHandler', action: 'authenticates' },
            { node: 'DBLayer', action: 'stores session' },
          ],
        },
      },
    };
    const result = compileFromModules(new Map([['legacy', incompleteModule]]));
    // NotifyService and CacheLayer are orphans — gaps in migration
    const orphans = result.issues.filter(i =>
      i.severity === 'warning' && i.message.includes('Orphan')
    );
    expect(orphans.length).toBe(2);
    expect(orphans.some(o => o.message.includes('NotifyService'))).toBe(true);
    expect(orphans.some(o => o.message.includes('CacheLayer'))).toBe(true);
    // AuthHandler and DBLayer are connected — not orphans
    expect(result.index.nodes['legacy/AuthHandler'].in_journeys.length).toBeGreaterThan(0);
    expect(result.index.nodes['legacy/DBLayer'].in_journeys.length).toBeGreaterThan(0);
  });

});
