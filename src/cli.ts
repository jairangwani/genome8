#!/usr/bin/env node
/**
 * cli.ts — Entry point for genome8.
 *
 * Commands:
 *   genome compile <modules-dir>                — compile, write index + coverage, show stats
 *   genome excerpt <modules-dir> <module> [round] — generate excerpt for a module
 *   genome status <modules-dir>                 — convergence status
 *   genome publish <modules-dir> [engine-name]  — generate published interface + changelog
 *   genome test-gen <modules-dir> <test-dir>    — generate test skeletons from journeys
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { compile } from './compile.js';
import { generateExcerpt } from './excerpt.js';
import { publishInterface } from './publish.js';
import { generateTests } from './testgen.js';

const [,, command, modulesDir, ...rest] = process.argv;

if (!command || !modulesDir) {
  console.log('Genome8 — Context engine for AI agents\n');
  console.log('Usage:');
  console.log('  genome compile <modules-dir>');
  console.log('  genome excerpt <modules-dir> <module> [round]');
  console.log('  genome status <modules-dir>');
  console.log('  genome publish <modules-dir> [engine-name]');
  console.log('  genome test-gen <modules-dir> <test-dir>');
  console.log('  genome stop <project-dir>             — kill all convergence processes');
  console.log('  genome ps <project-dir>               — show running convergence processes');
  process.exit(1);
}

// ── Stop command (no compile needed) ──
if (command === 'stop') {
  const pidFile = path.join(modulesDir, 'genome', 'pids.json');
  if (!fs.existsSync(pidFile)) {
    // Try as project dir directly
    const altPidFile = path.join(modulesDir, 'pids.json');
    if (!fs.existsSync(altPidFile)) {
      console.log('No convergence processes found (no pids.json).');
      process.exit(0);
    }
  }
  const pidPath = fs.existsSync(path.join(modulesDir, 'genome', 'pids.json'))
    ? path.join(modulesDir, 'genome', 'pids.json')
    : path.join(modulesDir, 'pids.json');
  const pids = JSON.parse(fs.readFileSync(pidPath, 'utf-8'));
  console.log(`Killing convergence process tree (self: ${pids.self})...`);
  // Kill children first, then self
  for (const child of pids.children || []) {
    try {
      const { execSync: exec } = await import('node:child_process');
      if (process.platform === 'win32') {
        exec(`taskkill /T /F /PID ${child.pid}`, { stdio: 'pipe' });
      } else {
        process.kill(child.pid, 'SIGTERM');
      }
      console.log(`  Killed ${child.name} (pid: ${child.pid})`);
    } catch { console.log(`  ${child.name} (pid: ${child.pid}) already dead`); }
  }
  try {
    if (process.platform === 'win32') {
      const { execSync: exec } = await import('node:child_process');
      exec(`taskkill /T /F /PID ${pids.self}`, { stdio: 'pipe' });
    } else {
      process.kill(pids.self, 'SIGTERM');
    }
    console.log(`  Killed main process (pid: ${pids.self})`);
  } catch { console.log(`  Main process already dead`); }
  fs.unlinkSync(pidPath);
  console.log('All convergence processes stopped.');
  process.exit(0);
}

// ── Process status command (no compile needed) ──
if (command === 'ps') {
  const pidPath = fs.existsSync(path.join(modulesDir, 'genome', 'pids.json'))
    ? path.join(modulesDir, 'genome', 'pids.json')
    : path.join(modulesDir, 'pids.json');
  if (!fs.existsSync(pidPath)) {
    console.log('No convergence processes running (no pids.json).');
    process.exit(0);
  }
  const pids = JSON.parse(fs.readFileSync(pidPath, 'utf-8'));
  console.log(`Convergence running since: ${pids.started}`);
  console.log(`  Main: pid ${pids.self}, worker: ${pids.worker}`);
  for (const child of pids.children || []) {
    console.log(`  Child: ${child.name} (pid: ${child.pid})`);
  }
  // Also check convergence state
  const stateFile = path.join(path.dirname(pidPath), 'convergence-state.json');
  if (fs.existsSync(stateFile)) {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    console.log(`  Status: ${state.status}`);
    if (state.stats) console.log(`  Graph: ${state.stats.total_nodes}n, ${state.stats.total_journeys}j, ${state.stats.total_connections}c`);
  }
  process.exit(0);
}

const result = compile(modulesDir);

if (command === 'compile') {
  const compiledDir = path.join(path.dirname(modulesDir), 'compiled');
  if (!fs.existsSync(compiledDir)) fs.mkdirSync(compiledDir, { recursive: true });

  fs.writeFileSync(
    path.join(compiledDir, 'index.yaml'),
    yaml.dump(result.index, { lineWidth: 120, noRefs: true }),
  );
  fs.writeFileSync(
    path.join(compiledDir, 'coverage.yaml'),
    yaml.dump(result.coverage, { lineWidth: 120, noRefs: true }),
  );

  console.log(JSON.stringify(result.index._stats, null, 2));

  const errors = result.issues.filter(i => i.severity === 'error');
  const warnings = result.issues.filter(i => i.severity === 'warning');
  if (errors.length) console.log(`\n${errors.length} ERRORS:`);
  for (const e of errors) console.log(`  ❌ ${e.message}`);
  if (warnings.length) console.log(`\n${warnings.length} WARNINGS:`);
  for (const w of warnings.slice(0, 10)) console.log(`  ⚠️ ${w.message}`);
  if (warnings.length > 10) console.log(`  ... and ${warnings.length - 10} more`);
}

if (command === 'excerpt') {
  const moduleName = rest[0];
  const round = parseInt(rest[1] ?? '1');
  if (!moduleName) { console.error('Usage: genome excerpt <dir> <module> [round]'); process.exit(1); }

  const filePath = path.join(modulesDir, `${moduleName}.yaml`);
  if (!fs.existsSync(filePath)) { console.error(`Module file not found: ${filePath}`); process.exit(1); }
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(generateExcerpt({
    round, focusModule: moduleName,
    index: result.index, coverage: result.coverage,
    issues: result.issues, moduleFileContent: content,
  }));
}

if (command === 'status') {
  const s = result.index._stats;
  const errors = result.issues.filter(i => i.severity === 'error').length;
  const warnings = result.issues.filter(i => i.severity === 'warning').length;

  console.log(`Nodes: ${s.total_nodes} | Journeys: ${s.total_journeys} | Connections: ${s.total_connections}`);
  console.log(`Modules: ${s.modules} | Orphans: ${s.orphans} | Duplicates: ${s.duplicate_names} | Isolated: ${s.isolated_modules}`);
  console.log(`Errors: ${errors} | Warnings: ${warnings}`);

  const converged = errors === 0 && s.orphans === 0 && s.isolated_modules === 0 && s.duplicate_names === 0;
  console.log(`\nConvergence: ${converged ? '✅ STRUCTURALLY CONVERGED' : '❌ NOT CONVERGED'}`);
  if (!converged) {
    if (errors > 0) console.log(`  → Fix ${errors} errors`);
    if (s.orphans > 0) console.log(`  → Connect ${s.orphans} orphan nodes to journeys`);
    if (s.isolated_modules > 0) console.log(`  → Add cross-module journey steps for ${s.isolated_modules} isolated modules`);
    if (s.duplicate_names > 0) console.log(`  → Rename ${s.duplicate_names} duplicate nodes`);
  }
}

if (command === 'publish') {
  const engineName = rest[0] ?? path.basename(path.dirname(modulesDir));
  const publishedDir = path.join(path.dirname(modulesDir), 'published');

  const { interface_, changelog } = publishInterface(publishedDir, result.index, engineName);

  console.log(`Published interface for: ${interface_.engine}`);
  console.log(`Version hash: ${interface_.version_hash}`);
  console.log(`Provides: ${Object.keys(interface_.provides).length} nodes`);
  console.log(`Requires: ${Object.keys(interface_.requires).length} external refs`);
  console.log(`Changes: ${changelog.changes.length}`);
  if (changelog.changes.length > 0) {
    for (const c of changelog.changes) {
      console.log(`  ${c.type.toUpperCase()}: ${c.node} — ${c.impact}`);
    }
  }
  console.log(`\nWritten to: ${publishedDir}/`);
}

if (command === 'test-gen') {
  const testDir = rest[0];
  if (!testDir) { console.error('Usage: genome test-gen <modules-dir> <test-dir>'); process.exit(1); }

  const files = generateTests(result.index, testDir);
  console.log(`Generated ${files.length} test files in ${testDir}/journeys/`);
  for (const f of files) {
    console.log(`  ${path.basename(f)}`);
  }
}
