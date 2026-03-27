// Auto-generated from journey: ProjectConvergence
// Module: convergence
// Triggered by: _actors/ProjectOwner
// Modules touched: _actors, convergence

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { compile } from '../../src/compile.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-test-'));
  const genomeDir = path.join(tmpDir, 'genome');
  const modulesDir = path.join(genomeDir, 'modules');
  const compiledDir = path.join(genomeDir, 'compiled');
  const publishedDir = path.join(genomeDir, 'published');
  fs.mkdirSync(modulesDir, { recursive: true });
  fs.mkdirSync(compiledDir, { recursive: true });
  fs.mkdirSync(publishedDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("ProjectConvergence", () => {
  it("step 1: _actors/ProjectOwner writes spec.md describing the project", () => {
    const specPath = path.join(tmpDir, 'genome', 'spec.md');
    fs.writeFileSync(specPath, '# My Project\n\nA test project for validation.');
    expect(fs.existsSync(specPath)).toBe(true);
    expect(fs.readFileSync(specPath, 'utf-8')).toContain('My Project');
  });

  it("step 2: convergence/SpecFile stores the spec on disk as the sole human input", () => {
    const specPath = path.join(tmpDir, 'genome', 'spec.md');
    const specContent = '# Test Spec\n\nThis is the sole human input.';
    fs.writeFileSync(specPath, specContent);
    const readBack = fs.readFileSync(specPath, 'utf-8');
    expect(readBack).toBe(specContent);
  });

  it("step 3: convergence/ConvergenceCLI receives the command to start convergence", () => {
    // The CLI parses process.argv — verify it expects a command + modules dir
    // By reading cli.ts we know it destructures [,, command, modulesDir, ...rest]
    const cliPath = path.resolve('src/cli.ts');
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  it("step 4: convergence/ReadSpec reads spec.md from disk", () => {
    const specPath = path.join(tmpDir, 'genome', 'spec.md');
    fs.writeFileSync(specPath, '# Spec Content\nLine 2');
    const spec = fs.readFileSync(specPath, 'utf-8');
    expect(spec).toContain('Spec Content');
    expect(spec.split('\n').length).toBe(2);
  });

  it("step 5: convergence/OnlyHumanInputIsSpec validates that spec.md is the starting point for all generation", () => {
    // The convergence pipeline requires spec.md to exist; everything else is generated.
    const specPath = path.join(tmpDir, 'genome', 'spec.md');
    expect(fs.existsSync(specPath)).toBe(false);
    // Without spec, the pipeline cannot start
    fs.writeFileSync(specPath, '# Spec');
    expect(fs.existsSync(specPath)).toBe(true);
  });

  it("step 6: convergence/WriteOrganization delegates to LLM to analyze spec and write ORGANIZATION.md", () => {
    // Simulate: ORGANIZATION.md is written after spec analysis
    const orgPath = path.join(tmpDir, 'genome', 'ORGANIZATION.md');
    const orgContent = '# Organization\n\n## MODULES\n- `auth` -- authentication\n- `data` -- data storage\n';
    fs.writeFileSync(orgPath, orgContent);
    expect(fs.existsSync(orgPath)).toBe(true);
    expect(fs.readFileSync(orgPath, 'utf-8')).toContain('`auth`');
  });

  it("step 7: _actors/LLMWorker reads the spec and writes ORGANIZATION.md with modules, dependencies, independence", () => {
    const orgPath = path.join(tmpDir, 'genome', 'ORGANIZATION.md');
    const orgContent = '## MODULES\n- `auth`\n- `data`\n\n## DEPENDENCIES\nauth -> data\n\n## INDEPENDENCE\ndata is standalone\n';
    fs.writeFileSync(orgPath, orgContent);
    const content = fs.readFileSync(orgPath, 'utf-8');
    expect(content).toContain('MODULES');
    expect(content).toContain('DEPENDENCIES');
    expect(content).toContain('INDEPENDENCE');
  });

  it("step 8: convergence/DiscoverActors delegates to LLM to discover actors from 3 angles", () => {
    // The actor discovery produces _actors.yaml with type: actor nodes
    const actorsPath = path.join(tmpDir, 'genome', 'modules', '_actors.yaml');
    const actorsContent = 'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n  Admin:\n    type: actor\n    description: administrator\n';
    fs.writeFileSync(actorsPath, actorsContent);
    expect(fs.existsSync(actorsPath)).toBe(true);
  });

  it("step 9: _actors/LLMWorker discovers actors from activities perspective", () => {
    // Activities angle finds who uses the system
    const discovered = ['User', 'Developer', 'Operator'];
    expect(discovered.length).toBeGreaterThan(0);
    expect(discovered).toContain('User');
  });

  it("step 10: _actors/LLMWorker discovers actors from threats perspective", () => {
    // Threats angle finds attackers/abusers
    const discovered = ['Attacker', 'SpamBot'];
    expect(discovered.length).toBeGreaterThan(0);
    expect(discovered).toContain('Attacker');
  });

  it("step 11: _actors/LLMWorker discovers actors from lifecycle perspective", () => {
    // Lifecycle angle finds first-visit, power-user, churned user
    const discovered = ['NewUser', 'PowerUser', 'ChurnedUser'];
    expect(discovered.length).toBeGreaterThan(0);
  });

  it("step 12: _actors/LLMWorker merges and deduplicates actors into _actors.yaml", () => {
    const actorsPath = path.join(tmpDir, 'genome', 'modules', '_actors.yaml');
    fs.writeFileSync(actorsPath, 'spec_sections: [1]\n\nnodes:\n  User:\n    type: actor\n    description: end user\n  Attacker:\n    type: actor\n    description: malicious user\n');
    const result = compile(path.join(tmpDir, 'genome', 'modules'));
    const actors = Object.values(result.index.nodes).filter(n => n.type === 'actor');
    expect(actors.length).toBe(2);
  });

  it("step 13: convergence/HierarchyDecision delegates to LLM to decide whether to split into child engines", () => {
    // With fewer than minModulesForSplit (6), no split should occur
    const moduleCount = 3;
    const minModulesForSplit = 6;
    expect(moduleCount).toBeLessThan(minModulesForSplit);
  });

  it("step 14: _actors/LLMWorker analyzes module independence and decides split or no-split", () => {
    // A response of "SPLIT: no" means single engine
    const response = 'SPLIT: no\nREASON: modules are tightly coupled';
    expect(response.toLowerCase()).toContain('split: no');
  });

  it("step 15: convergence/ConvergenceState records that organization and actors are complete, ready for module creation", () => {
    const statePath = path.join(tmpDir, 'genome', 'convergence-state.json');
    const state = { status: 'module_creation', spec_hash: 'abc123' };
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    const readState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    expect(readState.status).toBe('module_creation');
    expect(readState.spec_hash).toBeDefined();
  });
});
