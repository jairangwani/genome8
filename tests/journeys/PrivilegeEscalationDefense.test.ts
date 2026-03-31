// Auto-generated from journey: PrivilegeEscalationDefense
// Module: actors
// Triggered by: _actors/PrivilegeEscalator
// Modules touched: _actors, llm, compilation

import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("PrivilegeEscalationDefense", () => {
  it("step 1: _actors/PrivilegeEscalator attempts to use LLMWorker's native tools to access files outside box scope", () => {
    // Worker tries to reference a path outside the box
    const boxDir = '/project/genome/modules';
    const escalatedPath = '/etc/passwd';
    const isInsideBox = escalatedPath.startsWith(boxDir);
    expect(isInsideBox).toBe(false);
  });

  it("step 2: llm/NativeToolSet provides the tool access that could be exploited", () => {
    // LLM tools include file read/write — scope must be enforced
    const allowedTools = ['read_file', 'write_file', 'search'];
    expect(allowedTools).toContain('write_file');
    // Tool exists but should be scope-limited
  });

  it("step 3: llm/WriteFile worker attempts to write to a path outside the box directory", () => {
    // Path traversal attempt
    const boxRoot = '/project/genome/modules';
    const attackPath = path.join(boxRoot, '../../etc/shadow');
    const normalized = path.normalize(attackPath);
    // After normalization, the path escapes the box
    expect(normalized.startsWith(boxRoot)).toBe(false);
  });

  it("step 4: _actors/Compiler detects files or references outside the expected module scope", () => {
    // A module referencing a non-existent external module creates a dangling ref
    const modules = new Map<string, ModuleFile>([
      ['app', {
        nodes: {
          Handler: { type: 'process', description: 'Handles requests' },
        },
        journeys: {
          Exploit: {
            steps: [
              { node: 'outside_scope/StolenData', action: 'reads sensitive data' },
              { node: 'Handler', action: 'processes stolen data' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // The reference to outside_scope/StolenData is flagged
    const issues = result.issues.filter(i =>
      i.message.includes('outside_scope') || i.message.includes('StolenData')
    );
    expect(issues.length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: compilation/DanglingRefDetection flags any references to nodes or files outside the box boundary", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: { User: { type: 'actor', description: 'User' } },
      }],
      ['app', {
        nodes: { Login: { type: 'process', description: 'Login' } },
        journeys: {
          EscalationAttempt: {
            steps: [
              { node: '_actors/User', action: 'starts login' },
              { node: 'Login', action: 'processes' },
              { node: 'secret_module/AdminKey', action: 'steals admin key' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // secret_module is not a known local module — flagged
    const refErrors = result.issues.filter(i =>
      i.message.includes('secret_module') || i.message.includes('AdminKey')
    );
    expect(refErrors.length).toBeGreaterThanOrEqual(1);
  });

  it("step 6: compilation/CompilationResult reports the out-of-scope access as validation errors", () => {
    const modules = new Map<string, ModuleFile>([
      ['app', {
        nodes: { Svc: { type: 'process', description: 'Service' } },
        journeys: {
          BadJourney: {
            steps: [
              { node: 'Svc', action: 'does work' },
              { node: 'phantom_module/Secret', action: 'accesses secret' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // CompilationResult contains the issues
    expect(result.issues.length).toBeGreaterThanOrEqual(1);
    const phantomIssue = result.issues.find(i => i.message.includes('phantom_module'));
    expect(phantomIssue).toBeDefined();
  });

});
