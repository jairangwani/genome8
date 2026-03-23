/**
 * convergence.ts — THE ORCHESTRATOR
 *
 * This is the product. Everything else is a library this calls.
 *
 * It runs the complete pipeline:
 *   Step 1: Organization (1 LLM call)
 *   Step 2: Actor discovery (3 LLM calls, sequential)
 *   Step 3: Module creation (1 LLM call per module)
 *   Step 4: Convergence loop (1 LLM call per round)
 *   Step 5: Publish interface
 *   Step 6: Code + test generation
 *
 * CODE decides: which module, which lens, when to compile, when to stop.
 * LLM decides: what actors exist, what's missing, how to implement code.
 *
 * LLM communication uses Claude Code's stream-json protocol (proven in crew3).
 * The LLM worker gets full tool access (Read, Write, Edit) — no hacks.
 *
 * Usage: npx tsx src/convergence.ts <project-dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { compile } from './compile.js';
import { generateExcerpt } from './excerpt.js';
import { publishInterface } from './publish.js';
import { checkDependencies, markModulesStale } from './sync.js';
import { generateTests } from './testgen.js';
import { generateCodeSkeletons } from './codegen.js';
import { LLMWorker } from './llm.js';
import type { CompileResult } from './compile.js';

// ── Configuration ──
// All values can be overridden via genome/config.json in the project directory.

interface ConvergenceConfig {
  maxRounds: number;         // Max convergence rounds before stopping (default: 100)
  watchIntervalMs: number;   // How often to check for changes when sleeping (default: 60000)
  sessionResetChars: number; // Reset LLM session after this many chars (default: 200000)
  model: string;             // LLM model to use (default: 'claude-opus-4-6')
  maxFixAttempts: number;    // Max test fix attempts in Step 6 (default: 3)
}

const DEFAULT_CONFIG: ConvergenceConfig = {
  maxRounds: Infinity,         // No artificial limit. Convergence check decides when to stop.
  watchIntervalMs: 60_000,
  sessionResetChars: Infinity, // DO NOT manage context. Claude Code handles its own compaction.
  model: 'claude-opus-4-6',   // ALWAYS use Opus 4.6 (1M context). Never downgrade.
  maxFixAttempts: 3,
};

const LENSES = [
  'happy paths (core flows that make the product work)',
  'failures (what breaks, error recovery, edge cases)',
  'threats (how each threat actor exploits each journey, and defenses)',
  'edge cases (race conditions, simultaneous actions, conflicts, weird combos)',
  'scale (what happens at 10x, 100x, 1000x users)',
  'completeness (walk spec line by line — every bullet should have a journey)',
  'simplicity (is anything unnecessary? prune bloat, merge duplicates)',
  'consistency (does part A contradict part B?)',
];

// ── Main ──

const projectDir = process.argv[2];
if (!projectDir) {
  console.log('Usage: npx tsx src/convergence.ts <project-dir> [--depth N]');
  console.log('The project dir must contain genome/spec.md');
  process.exit(1);
}

// Hierarchy depth tracking. No hardcoded limit — the LLM decides whether to split.
// Children get scoped specs, so they naturally stop splitting when scope is small enough.
const depthArg = process.argv.indexOf('--depth');
const currentDepth = depthArg >= 0 ? parseInt(process.argv[depthArg + 1]) || 0 : 0;

const absProjectDir = path.resolve(projectDir);
const genomeDir = path.join(absProjectDir, 'genome');
const modulesDir = path.join(genomeDir, 'modules');
const specPath = path.join(genomeDir, 'spec.md');
const orgPath = path.join(genomeDir, 'ORGANIZATION.md');
const compiledDir = path.join(genomeDir, 'compiled');
const publishedDir = path.join(genomeDir, 'published');

// Load project config (overrides defaults)
const configPath = path.join(genomeDir, 'config.json');
let config: ConvergenceConfig = { ...DEFAULT_CONFIG };
if (fs.existsSync(configPath)) {
  try {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config = { ...DEFAULT_CONFIG, ...userConfig };
    console.log(`Loaded config from ${configPath}`);
  } catch { /* use defaults */ }
}

if (!fs.existsSync(specPath)) {
  console.error(`No spec found at ${specPath}`);
  process.exit(1);
}

// Ensure directories exist
for (const dir of [modulesDir, compiledDir, publishedDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── LLM Worker ──
// Single persistent Claude Code process using stream-json protocol.
// The worker has full tool access — it reads files, writes files, edits files.
// No --print mode, no YAML extraction hacks, no regex parsing.

const worker = new LLMWorker({
  cwd: absProjectDir,
  systemPrompt: `You are a genome worker agent. You build project context graphs using YAML modules.

RULES:
- When asked to write a file, use the Write tool to write it. Do NOT output file contents as text.
- Write ONLY valid YAML in .yaml files. No explanations, no comments, no markdown.
- When asked to update a file, Read it first, then Write the complete updated file.
- When asked a question (audits, checks), respond with text only.
- Be GRANULAR — every system action is a separate journey step.

CRITICAL — YAML FORMAT FOR MODULES:

spec_sections: [1, 2]

nodes:
  ProcessName:
    type: process
    description: one line

journeys:
  JourneyName:
    steps:
      - node: _actors/ActorName
        action: does something
      - node: LocalProcess
        action: processes the request
      - node: other-module/ExternalNode
        action: stores the result

JOURNEY STEP FORMAT IS MANDATORY:
- Each step MUST have "node:" and "action:" fields
- "node:" is the node reference (NodeName, module/NodeName, or _actors/ActorName)
- "action:" is what happens at that step
- Do NOT write steps as flat strings. Always use node: + action: structure.`,
  model: config.model,
  sessionResetChars: config.sessionResetChars,
});

// ── Compile Helper ──

function doCompile(): CompileResult {
  const result = compile(modulesDir);
  const s = result.index._stats;
  const errors = result.issues.filter(i => i.severity === 'error').length;
  const warnings = result.issues.filter(i => i.severity === 'warning').length;
  console.log(`  COMPILE: ${s.total_nodes} nodes, ${s.total_journeys} journeys, ${s.total_connections} connections | ${errors} errors, ${warnings} warnings`);
  return result;
}

// ── Pipeline ──

async function run() {
  const spec = fs.readFileSync(specPath, 'utf-8');
  console.log(`\n=== GENOME CONVERGENCE: ${absProjectDir} ===`);
  writePidFile(); // Track this process for clean shutdown
  console.log(`Spec: ${spec.length} chars, ${spec.split('\n').length} lines\n`);

  // ═══ STEP 1 — Organization ═══
  console.log('═══ STEP 1: Organization ═══');

  if (!fs.existsSync(orgPath)) {
    console.log('  LLM CALL: organization decision...');
    await worker.call(`Read the project spec below and write an ORGANIZATION.md file to: ${orgPath}

The file MUST contain:

1. SCOPE: What is this project? (1-2 sentences)

2. MODULES: List EVERY independent concern as a module with a \`backtick-name\`.
   Each module = one area that could eventually be its own package/service.
   Example for a social network:
   - \`identity\` — user accounts, auth, keys
   - \`social\` — posts, follows, feeds
   - \`messaging\` — DMs, group chats
   - \`moderation\` — content filtering, reports
   - \`notifications\` — push, email, in-app

   For THIS project, identify ALL major subsystems. A project with a 1000-line spec
   should have 8-15+ modules, not 1-3. Each module name must be in \`backticks\`.

3. DEPENDENCIES: Which modules depend on which? (build order)

4. INDEPENDENCE: Which modules could live on their own as standalone services?

Use the Write tool to write the file.

SPEC:
${spec}`);

    if (!fs.existsSync(orgPath)) {
      console.error('  ERROR: LLM did not write ORGANIZATION.md. Stopping.');
      process.exit(1);
    }
    console.log('  Written: ORGANIZATION.md');
  } else {
    console.log('  ORGANIZATION.md already exists, skipping.');
  }

  const orgContent = fs.readFileSync(orgPath, 'utf-8');

  // ═══ STEP 2 — Actor Discovery (3 sequential calls) ═══
  // Actors are discovered BEFORE the hierarchy decision.
  // If we split, ALL children get the SAME actors. No duplicates.
  console.log('\n═══ STEP 2: Actor Discovery ═══');

  const actorsPath = path.join(modulesDir, '_actors.yaml');
  const existingActors = fs.existsSync(actorsPath) ? fs.readFileSync(actorsPath, 'utf-8') : '';
  const hasActors = existingActors.includes('type: actor');

  if (!hasActors) {
    // Round 1: Activities angle
    console.log('  LLM CALL 1: actors from ACTIVITIES angle...');
    const round1 = await worker.call(`Read this spec and find ALL actors from the ACTIVITIES perspective.
Who uses this system? Who contributes? Who operates? Who creates? Who governs? Who visits?

Respond with a list of actors in this format (text response, do NOT write a file yet):

ActorName:
  type: actor
  description: one line description

AnotherActor:
  type: actor
  description: one line description

SPEC:
${spec}`);

    // Round 2: Threats angle
    console.log('  LLM CALL 2: actors from THREATS angle...');
    const round2 = await worker.call(`Here's what Round 1 found:
${round1}

From the THREATS perspective, what actors are MISSING?
Every attacker, abuser, fraud type, failure scenario.

Respond with ONLY the NEW actors not already listed above. Same format:
ThreatActorName:
  type: actor
  description: one line

SPEC (for reference):
${spec}`);

    // Round 3: Lifecycle angle
    console.log('  LLM CALL 3: actors from LIFECYCLE angle...');
    const round3 = await worker.call(`Here's what Rounds 1+2 found:
${round1}
${round2}

From the LIFECYCLE perspective, what's STILL MISSING?
First visit, onboarding, power use, decline, exit, return.

Respond with ONLY the NEW actors. Same format.`);

    // Merge: LLM writes the final _actors.yaml
    console.log('  LLM CALL: merge and write _actors.yaml...');
    await worker.call(`Merge these three lists of actors into ONE deduplicated _actors.yaml file.
Remove duplicates. Keep the best description for each.

Write the file to: ${actorsPath}

The file format MUST be:
spec_sections: [1]

nodes:
  ActorName:
    type: actor
    description: one line

Round 1:
${round1}

Round 2:
${round2}

Round 3:
${round3}

Use the Write tool to write the file NOW.`);

    if (!fs.existsSync(actorsPath) || fs.statSync(actorsPath).size < 50) {
      console.error('  ERROR: LLM did not write _actors.yaml properly. Stopping.');
      process.exit(1);
    }

    const result = doCompile();
    const actorCount = Object.values(result.index.nodes).filter(n => n.type === 'actor').length;
    console.log(`  Actors discovered: ${actorCount}`);
  } else {
    console.log('  _actors.yaml already has actors, skipping discovery.');
    doCompile();
  }

  // ═══ STEP 2b — Hierarchy Decision (after actors, before modules) ═══
  // Now that we have shared actors, decide whether to split.
  // If split: children get the SAME _actors.yaml. No duplicate actor problem.
  const shouldSplit = await checkIfShouldSplit(orgContent, spec);
  if (shouldSplit.split) {
    console.log(`\n  HIERARCHY: Splitting into ${shouldSplit.engines.length} child engines (depth ${currentDepth})`);
    console.log('  Actors will be shared across all children (no duplicates)');
    await runAsParent(shouldSplit.engines, spec, orgContent);
    return;
  } else {
    console.log('  HIERARCHY: Managing as single engine (LLM decided no split needed)');
  }

  // ═══ STEP 3 — Module Creation (1 LLM call per module) ═══
  console.log('\n═══ STEP 3: Module Creation ═══');

  const moduleNames = extractModuleNames(orgContent);
  console.log(`  Modules to create: ${moduleNames.join(', ')}`);

  for (const modName of moduleNames) {
    const modPath = path.join(modulesDir, `${modName}.yaml`);
    if (fs.existsSync(modPath) && fs.statSync(modPath).size > 100) {
      console.log(`  ${modName}: already exists, skipping.`);
      continue;
    }

    const currentResult = doCompile();
    const excerpt = generateModuleExcerpt(modName, currentResult);

    console.log(`  LLM CALL: creating ${modName}.yaml...`);
    await worker.call(`You are creating a module for a project.

Current compiled state:
${excerpt}

Organization:
${orgContent}

Spec:
${spec}

Write the file ${modPath} using the Write tool. The YAML content must have:
- spec_sections: [relevant section numbers from the spec]
- nodes: (type: process, artifact, interface, or rule) with descriptions
- journeys: with GRANULAR steps (every system action is a step)
- Cross-module references to existing modules (use module/NodeName)
- Reference actors as _actors/ActorName

DO NOT create actor nodes (they're in _actors.yaml — reference as _actors/ActorName).
DO NOT duplicate nodes that already exist in other modules (check the excerpt above).

Write the file NOW using the Write tool.`);

    // Retry up to 3 times if file wasn't written
    let writeAttempts = 0;
    while ((!fs.existsSync(modPath) || fs.statSync(modPath).size < 50) && writeAttempts < 3) {
      writeAttempts++;
      console.log(`  ⚠️ ${modName}.yaml not written (attempt ${writeAttempts}/3). Retrying...`);
      await worker.call(`Write the YAML module file to ${modPath} using the Write tool. The file must contain spec_sections, nodes, and journeys. Follow the format in the system prompt.`);
    }
    if (!fs.existsSync(modPath) || fs.statSync(modPath).size < 50) {
      console.error(`  ERROR: Failed to create ${modName}.yaml after 3 attempts.`);
      continue;
    }

    const afterCompile = doCompile();
    const errors = afterCompile.issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      console.log(`  ⚠️ ${errors.length} errors after creating ${modName}. Will fix in convergence rounds.`);
    }
  }

  // ═══ STEP 4 — Convergence (creation + validation + audit) ═══
  // Creation is BOUNDED (modules × relevant lenses). Not an infinite loop.
  // Convergence is CODE (compile). Instant, deterministic.
  // Audit is TARGETED (fix specific gaps, not "what's missing?").
  console.log('\n═══ STEP 4: Convergence ═══');

  // ── 4a: Discover domain-specific lenses ──
  console.log('\n  ── Step 4a: Discover Lenses ──');
  const lensResponse = await worker.call(`Given this project, what perspectives should we examine each module from?

For software: happy paths, failures, threats, edge cases, scale, completeness, simplicity, consistency.
For a hospital: patient safety, compliance, emergencies, staff workflows, billing, privacy.
For a game: gameplay loops, balance, monetization, cheating, onboarding.

What perspectives matter for THIS project? Return a simple list.

PROJECT SPEC (first 2000 chars):
${spec.substring(0, 2000)}

ORGANIZATION:
${orgContent}

Return ONLY a numbered list of perspectives. No explanations.`);

  const lenses = lensResponse.split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 3 && l.length < 200);
  console.log(`  Discovered ${lenses.length} lenses: ${lenses.map(l => l.substring(0, 40)).join(', ')}`);

  // Use defaults if LLM returned garbage
  const effectiveLenses = lenses.length >= 3 ? lenses : LENSES;

  // ── 4a: Lens relevance matrix ──
  const allModuleNames = extractModuleNames(orgContent);
  console.log(`  Building lens relevance matrix (${allModuleNames.length} modules × ${effectiveLenses.length} lenses)...`);
  const matrixResponse = await worker.call(`Given these modules and perspectives, which perspectives are RELEVANT for each module?
Not all perspectives apply to all modules. A data store doesn't need "threats." A policy doesn't need "scale."

MODULES: ${allModuleNames.join(', ')}

PERSPECTIVES:
${effectiveLenses.map((l, i) => `${i + 1}. ${l}`).join('\n')}

For each module, list the NUMBERS of relevant perspectives.
Format: module_name: 1, 3, 5, 7
One line per module. Only include relevant numbers.`);

  // Parse matrix
  const relevanceMatrix = new Map<string, number[]>();
  for (const line of matrixResponse.split('\n')) {
    const match = line.match(/^[\s-]*(\w[\w-]*)[\s:]+(.+)/);
    if (match) {
      const mod = match[1];
      const nums = match[2].match(/\d+/g)?.map(n => parseInt(n) - 1).filter(n => n >= 0 && n < effectiveLenses.length) || [];
      if (allModuleNames.includes(mod) && nums.length > 0) {
        relevanceMatrix.set(mod, nums);
      }
    }
  }

  // Fallback: if matrix parsing failed, use all lenses for all modules
  for (const mod of allModuleNames) {
    if (!relevanceMatrix.has(mod)) {
      relevanceMatrix.set(mod, effectiveLenses.map((_, i) => i));
    }
  }

  const totalPairs = [...relevanceMatrix.values()].reduce((sum, lenses) => sum + lenses.length, 0);
  console.log(`  Relevance matrix: ${totalPairs} module-lens pairs (vs ${allModuleNames.length * effectiveLenses.length} if all)`);

  // ── 4a: Creation passes (bounded) ──
  console.log('\n  ── Step 4a: Creation Passes ──');
  let passCount = 0;

  for (const modName of allModuleNames) {
    const modLenses = relevanceMatrix.get(modName) || [];
    for (const lensIdx of modLenses) {
      const lens = effectiveLenses[lensIdx];
      const result = doCompile();
      const excerpt = generateModuleExcerpt(modName, result);
      const modFilePath = path.join(modulesDir, `${modName}.yaml`);

      console.log(`  [${passCount + 1}/${totalPairs}] ${modName} | ${lens.substring(0, 40)}`);

      await worker.call(`Current state of ${modName} module:

${excerpt}

Perspective: ${lens}

From this perspective, what nodes and journeys are MISSING from ${modName}.yaml?

1. Read the current file at ${modFilePath}
2. Add what's missing
3. Be GRANULAR — every system action is a separate step
4. Don't duplicate what exists (check the excerpt above)
5. Write the COMPLETE updated file back to ${modFilePath} using the Write tool`);

      passCount++;
    }
  }

  console.log(`  Creation complete: ${passCount} passes done.`);

  // ── 4b: Compile convergence (code, instant) ──
  console.log('\n  ── Step 4b: Compile Convergence ──');
  let prevErrorCount = Infinity;

  while (true) {
    const result = doCompile();
    const errors = result.issues.filter(i => i.severity === 'error');
    const orphans = Object.entries(result.index.nodes).filter(([, n]) =>
      n.in_journeys.length === 0 && n.preceded_by.length === 0 && n.followed_by.length === 0
    );

    console.log(`  Compile: ${result.index._stats.total_nodes}n, ${result.index._stats.total_journeys}j, ${result.index._stats.total_connections}c | ${errors.length} errors, ${orphans.length} orphans`);

    if (errors.length === 0) {
      console.log('  0 errors — structurally converged.');
      break;
    }

    // Safety: if errors increasing, stop
    if (errors.length >= prevErrorCount) {
      console.log(`  Errors not decreasing (${prevErrorCount} → ${errors.length}). Stopping fixes.`);
      break;
    }
    prevErrorCount = errors.length;

    // Fix errors (one LLM call per batch)
    console.log(`  Fixing ${errors.length} errors...`);
    const errorList = errors.slice(0, 10).map(e => `- ${e.message}`).join('\n');
    await worker.call(`Fix these compile errors by updating the relevant YAML module files:

${errorList}

Read each affected file, fix the broken references, and write it back using the Write tool.`);
  }

  // ── 4c: Audit (targeted, stops at 0 gaps) ──
  console.log('\n  ── Step 4c: Audit ──');
  let prevGapCount = Infinity;

  while (true) {
    const auditResult = await depthCheck(doCompile(), spec);

    if (auditResult.converged) {
      console.log('  AUDIT PASSED — 0 gaps found. CONVERGED.');
      break;
    }

    const gapCount = auditResult.gaps.length;
    console.log(`  Audit found ${gapCount} gaps.`);

    // Safety: if gaps increasing, stop
    if (gapCount >= prevGapCount) {
      console.log(`  Gaps not decreasing (${prevGapCount} → ${gapCount}). Accepting current state.`);
      break;
    }
    prevGapCount = gapCount;

    // Fix specific gaps
    for (const gap of auditResult.gaps) {
      console.log(`    Fixing: ${gap.substring(0, 100)}...`);
      await worker.call(`The audit found this specific gap in the project:

${gap}

Fix it by adding the missing journeys or nodes to the appropriate YAML module file.
Read the file, add what's needed, write it back using the Write tool.`);
    }

    // Re-compile after fixes
    doCompile();
  }

  // ═══ STEP 5 — Publish + Notify ═══
  console.log('\n═══ STEP 5: Publish ═══');
  const finalResult = doCompile();
  const { interface_ } = publishInterface(publishedDir, finalResult.index, path.basename(absProjectDir));
  console.log(`  Published: ${Object.keys(interface_.provides).length} nodes | Hash: ${interface_.version_hash}`);

  // Write event file so dependents can detect the change (event-driven, not polling)
  const eventsDir = path.join(publishedDir, 'events');
  if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });
  const eventFile = path.join(eventsDir, `${Date.now()}_${interface_.version_hash.substring(7, 19)}.event`);
  fs.writeFileSync(eventFile, JSON.stringify({
    engine: path.basename(absProjectDir),
    hash: interface_.version_hash,
    timestamp: new Date().toISOString(),
    nodes: Object.keys(interface_.provides).length,
    journeys: finalResult.index._stats.total_journeys,
  }, null, 2));
  console.log(`  Event written: ${path.basename(eventFile)}`);

  // ═══ STEP 6 — Code + Test Generation ═══
  console.log('\n═══ STEP 6: Code + Test Generation ═══');

  // 6a: Generate code skeletons
  const codeResult = generateCodeSkeletons(finalResult.index, absProjectDir);
  console.log(`  Code skeletons: ${codeResult.generated.length} generated, ${codeResult.skipped.length} skipped`);

  // 6b: LLM fills in code implementations
  if (codeResult.generated.length > 0) {
    console.log('  Filling code implementations...');
    for (const filePath of codeResult.generated) {
      if (!fs.existsSync(filePath)) continue;
      const skeleton = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const nodeName = fileName.replace(/\.ts$/, '');

      // Get journey context for this node
      const nodeKey = Object.keys(finalResult.index.nodes).find(k => k.endsWith('/' + nodeName));
      const node = nodeKey ? finalResult.index.nodes[nodeKey] : null;

      console.log(`    LLM CALL: implementing ${fileName}...`);
      await worker.call(`Fill in this TypeScript code skeleton with a real implementation.

SKELETON:
${skeleton}

${node ? `CONTEXT:
- Node: ${nodeKey}
- Type: ${node.type}
- Description: ${node.description}
- Used in journeys: ${node.in_journeys.join(', ')}
- Preceded by: ${node.preceded_by.join(', ')}
- Followed by: ${node.followed_by.join(', ')}` : ''}

Write the complete implementation to: ${filePath}
Keep the class structure. Fill in method bodies with real logic.
Use the Write tool.`);
    }
  }

  // 6c: Generate test skeletons
  const testDir = path.join(absProjectDir, 'test');
  const testFiles = generateTests(finalResult.index, testDir);
  console.log(`  Test skeletons: ${testFiles.length} generated`);

  // 6d: LLM fills in test assertions
  if (testFiles.length > 0) {
    console.log('  Filling test assertions...');
    for (const testPath of testFiles) {
      if (!fs.existsSync(testPath)) continue;
      const testSkeleton = fs.readFileSync(testPath, 'utf-8');

      console.log(`    LLM CALL: filling tests in ${path.basename(testPath)}...`);
      await worker.call(`Fill in the test assertions for this test file.

TEST SKELETON:
${testSkeleton}

Write meaningful assertions that test the described behavior.
Use the Write tool to write the complete test file to: ${testPath}`);
    }
  }

  // 6e: Run tests and fix failures
  console.log('  Running tests...');
  const { execSync: execSyncLocal } = await import('node:child_process');
  let testsPassed = false;
  let fixAttempts = 0;
  const MAX_FIX_ATTEMPTS = config.maxFixAttempts;

  while (!testsPassed && fixAttempts < MAX_FIX_ATTEMPTS) {
    try {
      const testOutput = execSyncLocal('npx vitest run --reporter=verbose 2>&1', {
        cwd: absProjectDir,
        encoding: 'utf-8',
        timeout: 120_000,
      });
      console.log(`  Tests PASSED`);
      testsPassed = true;
    } catch (err: any) {
      fixAttempts++;
      const output = err.stdout || err.message || '';
      const failures = output.substring(0, 5000); // OK to truncate error output for logging

      console.log(`  Tests FAILED (attempt ${fixAttempts}/${MAX_FIX_ATTEMPTS})`);

      if (fixAttempts < MAX_FIX_ATTEMPTS) {
        console.log(`    LLM CALL: fixing test failures...`);
        await worker.call(`These tests failed. Fix the code so they pass.

TEST OUTPUT:
${failures}

Read the failing test files and the implementation files they test.
Fix the issues. Write the corrected files using the Write tool.`);
      }
    }
  }

  if (!testsPassed) {
    console.log(`  WARNING: Tests still failing after ${MAX_FIX_ATTEMPTS} attempts. Interface will be marked as UNSTABLE.`);
  }

  console.log('\n═══ CONVERGED ═══');
  console.log(`Final: ${finalResult.index._stats.total_nodes} nodes, ${finalResult.index._stats.total_journeys} journeys, ${finalResult.index._stats.total_connections} connections`);

  // Auto-create dependencies.yaml if external refs exist and no deps file yet
  {
    const autoDepsPath = path.join(genomeDir, 'dependencies.yaml');
    if (!fs.existsSync(autoDepsPath)) {
      const localModules = new Set(Object.keys(finalResult.coverage.modules));
      const externalDeps = new Set<string>();
      for (const journey of Object.values(finalResult.index.journeys)) {
        for (const step of journey.steps) {
          if (step.node.includes('/')) {
            const depModule = step.node.split('/')[0];
            if (!localModules.has(depModule) && depModule !== '_actors') {
              externalDeps.add(depModule);
            }
          }
        }
      }
      if (externalDeps.size > 0) {
        const depsYaml = `# Auto-generated: external dependencies detected\ndependencies:\n${[...externalDeps].map(d =>
          `  ${d}:\n    pin: latest\n    alert_on_update: true`
        ).join('\n')}\n`;
        fs.writeFileSync(autoDepsPath, depsYaml);
        console.log(`  Auto-created dependencies.yaml (${externalDeps.size} external deps: ${[...externalDeps].join(', ')})`);
      }
    }
  }

  // ═══ STEP 7 — Sleep / Watch / Reconverge ═══
  // Write state file so runner/parent knows we converged
  const statePath = path.join(genomeDir, 'convergence-state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    status: testsPassed ? 'sleeping' : 'unstable',
    tests_passed: testsPassed,
    converged_at: new Date().toISOString(),
    stats: finalResult.index._stats,
    interface_hash: interface_.version_hash,
  }, null, 2));

  // If --once flag, exit after first convergence (for testing)
  if (process.argv.includes('--once')) {
    console.log('  --once flag: exiting after first convergence.');
    return;
  }

  // Event-driven watch — NO POLLING.
  // Watch dependency event directories with fs.watch.
  // Zero cost when nothing changes. Only wake when an event file appears.
  console.log('\n═══ STEP 7: Event-Driven Watch ═══');

  const depsPath = path.join(genomeDir, 'dependencies.yaml');
  const syncStatePath = path.join(genomeDir, 'sync-state.json');
  const recentHashes = new Map<string, number>();
  const OSCILLATION_COOLDOWN = 10 * 60 * 1000;

  // Resolve dependency event directories to watch
  const depEventDirs: Array<{ name: string; eventsDir: string }> = [];
  if (fs.existsSync(depsPath)) {
    const yaml = await import('js-yaml');
    const deps = yaml.load(fs.readFileSync(depsPath, 'utf-8')) as any;
    if (deps?.dependencies) {
      for (const depName of Object.keys(deps.dependencies)) {
        // Find sibling or parent engine's events dir
        for (const candidate of [
          path.join(absProjectDir, '..', depName, 'genome', 'published', 'events'),
          path.join(absProjectDir, '..', '..', 'engines', depName, 'genome', 'published', 'events'),
        ]) {
          if (fs.existsSync(candidate)) {
            depEventDirs.push({ name: depName, eventsDir: candidate });
            break;
          }
        }
      }
    }
  }

  if (depEventDirs.length === 0) {
    console.log('  No dependencies to watch. Sleeping permanently.');
    // Keep process alive but doing nothing
    await new Promise(() => {}); // Block forever
    return;
  }

  console.log(`  Watching ${depEventDirs.length} dependency event dirs:`);
  for (const dep of depEventDirs) {
    console.log(`    ${dep.name}: ${dep.eventsDir}`);
  }

  // Set up fs.watch on each dependency's events directory
  const handleEvent = async (depName: string, eventFile: string) => {
    if (!eventFile.endsWith('.event')) return;

    const fullPath = path.join(depEventDirs.find(d => d.name === depName)!.eventsDir, eventFile);
    if (!fs.existsSync(fullPath)) return;

    try {
      const event = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const hashKey = `${depName}:${event.hash}`;
      const now = Date.now();

      // Oscillation protection
      const lastSeen = recentHashes.get(hashKey);
      if (lastSeen && (now - lastSeen) < OSCILLATION_COOLDOWN) {
        console.log(`  SKIP: ${depName} hash seen recently (oscillation cooldown)`);
        return;
      }
      recentHashes.set(hashKey, now);

      console.log(`\n  EVENT: ${depName} changed (hash: ${event.hash.substring(7, 19)})`);

      // Find affected local modules
      const currentResult = doCompile();
      const changes = checkDependencies(depsPath, currentResult.index, syncStatePath, (name) => {
        const dep = depEventDirs.find(d => d.name === name);
        return dep ? path.dirname(dep.eventsDir) : null;
      });

      if (changes.length === 0) {
        console.log('  No local modules affected. Staying asleep.');
        return;
      }

      // Mark affected modules stale
      for (const change of changes) {
        markModulesStale(modulesDir, change.affected_modules, `dependency ${change.dependency} changed`);
        console.log(`    Stale: ${change.affected_modules.join(', ')}`);
      }

      // TARGETED reconvergence: compile + audit only (skip creation)
      fs.writeFileSync(statePath, JSON.stringify({ status: 'reconverging', reason: `${depName} changed` }, null, 2));
      console.log('  Targeted reconvergence (compile + audit)...');

      // Step 4b: fix compile errors
      let prevErrors = Infinity;
      while (true) {
        const result = doCompile();
        const errors = result.issues.filter(i => i.severity === 'error');
        if (errors.length === 0 || errors.length >= prevErrors) break;
        prevErrors = errors.length;
        const errorList = errors.slice(0, 10).map(e => `- ${e.message}`).join('\n');
        await worker.call(`Fix these compile errors:\n${errorList}\nRead affected files, fix refs, write back.`);
      }

      // Step 4c: audit
      const auditResult = await depthCheck(doCompile(), spec);
      if (!auditResult.converged) {
        for (const gap of auditResult.gaps) {
          await worker.call(`Fix this gap: ${gap}\nAdd missing journeys to the appropriate module file.`);
        }
      }

      // Re-publish + write event for downstream ripple
      const reconvergedResult = doCompile();
      const { interface_: newInterface } = publishInterface(publishedDir, reconvergedResult.index, path.basename(absProjectDir));
      const newEventFile = path.join(eventsDir, `${Date.now()}_${newInterface.version_hash.substring(7, 19)}.event`);
      fs.writeFileSync(newEventFile, JSON.stringify({
        engine: path.basename(absProjectDir),
        hash: newInterface.version_hash,
        timestamp: new Date().toISOString(),
        triggered_by: depName,
      }, null, 2));

      console.log(`  Reconverged. Hash: ${newInterface.version_hash.substring(7, 19)}. Event written.`);
      fs.writeFileSync(statePath, JSON.stringify({
        status: 'sleeping',
        converged_at: new Date().toISOString(),
        stats: reconvergedResult.index._stats,
        interface_hash: newInterface.version_hash,
      }, null, 2));
    } catch (err: any) {
      console.error(`  Event handling error: ${err.message}`);
    }
  };

  // Watch each dependency's events directory
  for (const dep of depEventDirs) {
    fs.watch(dep.eventsDir, (eventType, filename) => {
      if (filename && eventType === 'rename') {
        // 'rename' fires when a new file is created
        handleEvent(dep.name, filename);
      }
    });
  }

  // Keep process alive — fs.watch callbacks handle everything
  console.log('  Sleeping. Will wake on dependency events only.');
  await new Promise(() => {}); // Block forever — fs.watch handles events
}

// ── Helpers ──

function extractModuleNames(orgContent: string): string[] {
  const names: string[] = [];
  const lines = orgContent.split('\n');
  for (const line of lines) {
    const match = line.match(/`([a-z][\w-]*)`/);
    if (match && !['_actors', 'spec', 'genome'].includes(match[1])) {
      if (!names.includes(match[1])) names.push(match[1]);
    }
  }
  if (names.length === 0) {
    console.error('  ERROR: No module names found in ORGANIZATION.md. The org must list modules with `backtick-names`.');
    process.exit(1);
  }
  return names;
}

function findThinnestModule(result: CompileResult): string {
  let thinnest = '';
  let minJourneys = Infinity;

  for (const [mod, cov] of Object.entries(result.coverage.modules)) {
    if (mod === '_actors') continue;
    if (cov.journeys < minJourneys) {
      minJourneys = cov.journeys;
      thinnest = mod;
    }
  }

  return thinnest || Object.keys(result.coverage.modules)[0];
}

function generateModuleExcerpt(moduleName: string, result: CompileResult): string {
  const modPath = path.join(modulesDir, `${moduleName}.yaml`);
  const content = fs.existsSync(modPath) ? fs.readFileSync(modPath, 'utf-8') : 'Module does not exist yet.';

  return generateExcerpt({
    round: 0,
    focusModule: moduleName,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: content,
  });
}

async function depthCheck(result: CompileResult, spec: string): Promise<{ converged: boolean; gaps: string[] }> {
  const allModules = fs.readdirSync(modulesDir).filter(f => f.endsWith('.yaml')).map(f => {
    return `=== ${f} ===\n${fs.readFileSync(path.join(modulesDir, f), 'utf-8')}`;
  }).join('\n\n');

  const stats = result.index._stats;
  const gaps: string[] = [];

  // Auditor 1: Spec coverage
  console.log('  Auditor 1: spec coverage...');
  const audit1 = await worker.call(`Read this spec and these module files. For EACH major spec section, count: how many journeys cover it? Which sections are thin (fewer than 3 journeys)?

SPEC (first 8000 chars):
${spec}

COMPILE STATS: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys

MODULES:
${allModules}

Report ONLY sections with thin coverage. If all sections are well covered, respond with exactly: ALL COVERED`);

  if (!audit1.toLowerCase().includes('all covered')) {
    gaps.push('spec-coverage: ' + audit1.substring(0, 200));
  }

  // Auditor 2: Actor coverage
  console.log('  Auditor 2: actor coverage...');
  const actorsFilePath = path.join(modulesDir, '_actors.yaml');
  const actorsYaml = fs.existsSync(actorsFilePath) ? fs.readFileSync(actorsFilePath, 'utf-8') : 'No actors file found.';
  const audit2 = await worker.call(`Read these actors and module files. For EACH actor: how many journeys involve them? Any actors with 0 journeys? Any THREAT actors without attack+defense journeys?

ACTORS:
${actorsYaml}

MODULES:
${allModules}

Report ONLY actors with 0 journeys or threats without defense. If all covered, respond with exactly: ALL COVERED`);

  if (!audit2.toLowerCase().includes('all covered')) {
    gaps.push('actor-coverage: ' + audit2.substring(0, 200));
  }

  // Auditor 3: Cross-module
  console.log('  Auditor 3: cross-module coverage...');
  const audit3 = await worker.call(`Compile stats: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys, ${stats.total_connections} connections across ${stats.modules} modules. ${stats.orphans} orphans. ${stats.isolated_modules} isolated modules.

Are there module pairs that SHOULD be connected but aren't? Any modules with suspiciously few cross-module connections?

MODULES:
${allModules}

Report ONLY missing connections. If all well-connected, respond with exactly: ALL COVERED`);

  if (!audit3.toLowerCase().includes('all covered')) {
    gaps.push('cross-module: ' + audit3.substring(0, 200));
  }

  return {
    converged: gaps.length === 0,
    gaps,
  };
}

// ── Hierarchy ──

async function checkIfShouldSplit(orgContent: string, spec: string): Promise<{ split: boolean; engines: Array<{ name: string; specSections: string }> }> {
  // No hardcoded threshold. The LLM decides based on architectural independence.
  // A module that could be its own package/service/standalone tool = its own engine.
  console.log(`  Asking LLM if project should be split into independent engines...`);

  const response = await worker.call(`Read this organization and spec. Decide: should this project be split into SEPARATE engines (independent boxes that each converge on their own)?

DECISION CRITERIA — split if a part:
- Could be its own npm package, microservice, or standalone tool
- Has its own data, its own API, its own lifecycle
- Could be imported by OTHER projects in the future
- Could live, grow, and be maintained independently

DO NOT split if:
- The project is simple (< 5 major concerns)
- Everything is tightly coupled and shares one data model
- Splitting would create more overhead than value

ORGANIZATION:
${orgContent}

SPEC:
${spec}

Answer in this EXACT format (text only, do NOT write any files):
SPLIT: yes (or no)
REASON: one line why
ENGINE: name1 — modules: mod1, mod2, mod3
ENGINE: name2 — modules: mod4, mod5
ENGINE: name3 — modules: mod6, mod7, mod8`);

  if (!response.toLowerCase().includes('split: yes')) {
    return { split: false, engines: [] };
  }

  const engines: Array<{ name: string; specSections: string }> = [];
  const engineLines = response.split('\n').filter(l => l.startsWith('ENGINE:'));
  for (const line of engineLines) {
    const match = line.match(/ENGINE:\s*(\S+)\s*—\s*modules:\s*(.*)/i);
    if (match) {
      engines.push({ name: match[1], specSections: match[2].trim() });
    }
  }

  return { split: engines.length > 1, engines };
}

async function runAsParent(engines: Array<{ name: string; specSections: string }>, spec: string, orgContent: string) {
  console.log('\n═══ RUNNING AS PARENT (DIRECTOR) ═══');

  // Create ALL child engine directories first
  for (const engine of engines) {
    const engineDir = path.join(absProjectDir, 'engines', engine.name, 'genome');
    const engineModulesDir = path.join(engineDir, 'modules');
    if (!fs.existsSync(engineModulesDir)) {
      fs.mkdirSync(engineModulesDir, { recursive: true });
    }
  }

  // Write ALL scoped specs in ONE LLM call (not 7 separate calls)
  const specFileList = engines.map(e => ({
    path: path.join(absProjectDir, 'engines', e.name, 'genome', 'spec.md'),
    name: e.name,
    modules: e.specSections,
  }));

  // Write scoped specs using CODE — parse spec by ## headings, match to module keywords.
  // No LLM call needed. Fast and reliable.
  console.log(`  Writing scoped specs for ${engines.length} engines...`);

  // Parse spec into sections
  const specSections: Array<{ heading: string; content: string }> = [];
  const specLines = spec.split('\n');
  let currentHeading = 'PREAMBLE';
  let currentContent: string[] = [];
  for (const line of specLines) {
    if (line.startsWith('## ')) {
      if (currentContent.length > 0) {
        specSections.push({ heading: currentHeading, content: currentContent.join('\n') });
      }
      currentHeading = line;
      currentContent = [line];
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length > 0) {
    specSections.push({ heading: currentHeading, content: currentContent.join('\n') });
  }

  // For each engine, include sections that mention any of its module names
  for (const f of specFileList) {
    const moduleKeywords = f.modules.split(',').map(m => m.trim().toLowerCase());
    const relevantSections: string[] = [];

    // Always include preamble and first 2 sections (project overview)
    for (const section of specSections) {
      const isOverview = section.heading === 'PREAMBLE' ||
        section.heading.includes('What is') ||
        section.heading.includes('Three Products') ||
        section.heading.includes('Three Laws');
      const mentionsModule = moduleKeywords.some(kw =>
        section.content.toLowerCase().includes(kw) ||
        section.heading.toLowerCase().includes(kw)
      );
      if (isOverview || mentionsModule) {
        relevantSections.push(section.content);
      }
    }

    const scopedSpec = relevantSections.join('\n\n---\n\n');
    fs.writeFileSync(f.path, scopedSpec);
    const lineCount = scopedSpec.split('\n').length;
    console.log(`    ${f.name}: ${lineCount} lines (from ${specSections.length} sections, ${moduleKeywords.length} keywords)`);
  }

  // Set up each child engine
  for (const engine of engines) {
    const engineDir = path.join(absProjectDir, 'engines', engine.name, 'genome');

    // Write child org with proper backtick module names so extractModuleNames works
    const childModules = engine.specSections.split(',').map(m => m.trim());
    const childOrgContent = `# ${engine.name} Engine

## SCOPE
This engine handles: ${engine.specSections}
Part of the larger project at: ${absProjectDir}

## MODULES
${childModules.map(m => `- \`${m}\` — ${m} subsystem`).join('\n')}

## DEPENDENCIES
Build order: ${childModules.map((m, i) => `${i + 1}. \`${m}\``).join(', ')}
`;
    fs.writeFileSync(path.join(engineDir, 'ORGANIZATION.md'), childOrgContent);

    // Copy parent's actors to child — all children share the SAME actors
    const parentActors = path.join(modulesDir, '_actors.yaml');
    const childModulesDir = path.join(engineDir, 'modules');
    if (fs.existsSync(parentActors)) {
      fs.copyFileSync(parentActors, path.join(childModulesDir, '_actors.yaml'));
      console.log(`    Copied shared actors to ${engine.name}`);
    } else {
      fs.writeFileSync(path.join(childModulesDir, '_actors.yaml'),
        'spec_sections: []\n\nnodes: {}\n\njourneys: {}\n');
    }

    console.log(`  Created child engine: ${engine.name} (${engine.specSections})`);
  }

  // Spawn child convergence.ts processes
  const { spawn: spawnChild } = await import('node:child_process');
  const children: Array<{ name: string; proc: ReturnType<typeof spawnChild> }> = [];

  for (const engine of engines) {
    const childDir = path.join(absProjectDir, 'engines', engine.name);
    console.log(`  Spawning child: convergence.ts for ${engine.name}...`);

    const childArgs = ['tsx', path.join(import.meta.dirname!, 'convergence.ts'), childDir, '--depth', String(currentDepth + 1), '--once'];
    const proc = spawnChild('npx', childArgs, {
      cwd: path.resolve(import.meta.dirname!, '..'),
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true, // Required on Windows — npx is a cmd script, not a binary
    });

    proc.stdout?.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter((l: string) => l.trim());
      for (const line of lines) {
        console.log(`  [${engine.name}] ${line}`);
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      console.log(`  [${engine.name} ERR] ${chunk.toString().trim()}`);
    });

    children.push({ name: engine.name, proc });
    // Register in global process tree for clean shutdown
    if (proc.pid) {
      childProcesses.push({ name: engine.name, pid: proc.pid, proc });
      writePidFile();
    }
  }

  console.log(`\n  Waiting for ${children.length} children to converge...`);
  // No timeout. Children run until they converge. Convergence check decides when to stop.

  await Promise.all(children.map(child => new Promise<void>((resolve) => {
    child.proc.on('exit', (code) => {
      console.log(`  [${child.name}] Completed with code ${code}`);
      resolve();
    });
  })));

  console.log('\n  All children converged.');

  // ── Actor Bubbling: collect new actors from children, merge, redistribute ──
  console.log('\n═══ STEP P0: Actor Sync ═══');
  const parentActorsPath = path.join(modulesDir, '_actors.yaml');
  const parentActorsContent = fs.existsSync(parentActorsPath) ? fs.readFileSync(parentActorsPath, 'utf-8') : '';

  // Collect all children's actor files
  const childActorFiles: string[] = [];
  for (const engine of engines) {
    const childActorsPath = path.join(absProjectDir, 'engines', engine.name, 'genome', 'modules', '_actors.yaml');
    if (fs.existsSync(childActorsPath)) {
      childActorFiles.push(`=== ${engine.name} actors ===\n${fs.readFileSync(childActorsPath, 'utf-8')}`);
    }
  }

  // Ask LLM to merge all actor lists and deduplicate
  console.log('  LLM CALL: merging actors from all children...');
  await worker.call(`Merge these actor lists into ONE deduplicated _actors.yaml.
The parent had the original actors. Children may have added new ones during convergence.
Keep ALL unique actors. Remove exact duplicates. Keep the best description for each.

PARENT ACTORS:
${parentActorsContent}

CHILDREN ACTORS:
${childActorFiles.join('\n\n')}

Write the merged _actors.yaml to: ${parentActorsPath}
Use the Write tool. Format:
spec_sections: [all]

nodes:
  ActorName:
    type: actor
    description: one line`);

  if (fs.existsSync(parentActorsPath)) {
    const mergedActors = fs.readFileSync(parentActorsPath, 'utf-8');
    const actorCount = (mergedActors.match(/type: actor/g) || []).length;
    console.log(`  Merged actors: ${actorCount} total`);

    // Redistribute merged actors to ALL children
    for (const engine of engines) {
      const childActorsPath = path.join(absProjectDir, 'engines', engine.name, 'genome', 'modules', '_actors.yaml');
      fs.copyFileSync(parentActorsPath, childActorsPath);
    }
    console.log(`  Redistributed merged actors to ${engines.length} children`);

    // Validate merged actors compile correctly
    const actorCompile = compile(modulesDir);
    const actorErrors = actorCompile.issues.filter(i => i.severity === 'error').length;
    if (actorErrors > 0) {
      console.log(`  ⚠️ ${actorErrors} errors after actor merge. Actors may have invalid YAML.`);
      for (const issue of actorCompile.issues.filter(i => i.severity === 'error')) {
        console.log(`    ERROR: ${issue.message}`);
      }
    } else {
      console.log(`  Actor merge validated: 0 errors`);
    }
  }

  // ── Collect children's published interfaces ──
  console.log('\n═══ STEP P1: Validate Interfaces ═══');
  const childInterfaces: Array<{ name: string; path: string; exists: boolean }> = [];
  for (const engine of engines) {
    const ifacePath = path.join(absProjectDir, 'engines', engine.name, 'genome', 'published', 'interface.yaml');
    const exists = fs.existsSync(ifacePath);
    childInterfaces.push({ name: engine.name, path: ifacePath, exists });
    console.log(`  [${engine.name}] Published interface: ${exists ? 'YES' : 'NO'}`);
  }

  const allPublished = childInterfaces.every(c => c.exists);
  if (!allPublished) {
    console.log('  ⚠️ Not all children published interfaces. Skipping cross-box validation.');
    console.log('\n═══ PARENT CONVERGED (partial — some children failed) ═══');
    return;
  }

  // ── Write dependencies.yaml for each child (sibling awareness) ──
  // Each child gets a dependencies file listing its sibling engines.
  // This enables change detection: if identity changes, ledger detects it.
  console.log('  Writing sibling dependencies for change detection...');
  for (const engine of engines) {
    const childDepsPath = path.join(absProjectDir, 'engines', engine.name, 'genome', 'dependencies.yaml');
    const siblings = engines.filter(e => e.name !== engine.name);
    const depsYaml = `# Auto-generated by parent convergence.ts\n# Sibling engines this child can detect changes from\ndependencies:\n${siblings.map(s =>
      `  ${s.name}:\n    pin: latest\n    alert_on_update: true`
    ).join('\n')}\n`;
    fs.writeFileSync(childDepsPath, depsYaml);
  }

  // ── Create parent-level cross-box journeys ──
  // Parent's "modules" are the children's interfaces.
  // Parent asks LLM: "given these interfaces, what journeys CROSS engines?"
  console.log('\n═══ STEP P2: Cross-Engine Journeys ═══');

  const interfaceSummaries = childInterfaces.map(c => {
    const content = fs.readFileSync(c.path, 'utf-8');
    return `=== ${c.name} (published interface) ===\n${content}`;
  }).join('\n\n');

  // Write cross-engine journeys as a parent module
  const crossModulePath = path.join(modulesDir, '_cross-engine.yaml');
  console.log('  LLM CALL: creating cross-engine journeys...');
  await worker.call(`You are the PARENT orchestrator. Your children are independent engines that have converged.
Each child published an interface listing what it provides.

CHILDREN'S INTERFACES:
${interfaceSummaries}

SPEC (for context):
${spec}

Your job: write CROSS-ENGINE JOURNEYS — journeys where a user/actor flows ACROSS multiple engines.
Example: "User signs up" might touch identity-engine → ledger-engine → gateway-engine.

Write a file to ${crossModulePath} with:
- spec_sections: [all]
- nodes: {} (no new nodes — reference children's nodes via engine-name/NodeName)
- journeys: cross-engine flows with steps referencing children's published nodes

CRITICAL: Use the format engine-name/NodeName in journey steps to reference children's nodes.
Each step MUST have node: and action: fields.

Example:
journeys:
  UserSignup:
    steps:
      - node: _actors/NewUser
        action: initiates account creation
      - node: identity-engine/KeyManager
        action: generates Ed25519 keypair
      - node: ledger-engine/WalletStore
        action: creates Lux wallet

Write the file using the Write tool NOW.`);

  if (fs.existsSync(crossModulePath)) {
    console.log('  Written: _cross-engine.yaml');

    // Load children's published interfaces for cross-engine ref validation
    const { compileFromModules, loadAllModules } = await import('./compile.js');
    const yaml = await import('js-yaml');
    const externalInterfaces = new Map<string, any>();
    for (const child of childInterfaces) {
      try {
        const content = fs.readFileSync(child.path, 'utf-8');
        const iface = yaml.load(content) as any;
        if (iface) externalInterfaces.set(child.name, iface);
      } catch { /* skip unreadable interfaces */ }
    }

    // Compile with external interfaces — cross-engine refs will validate
    const parentModules = loadAllModules(modulesDir);
    const parentCompile = compileFromModules(parentModules, externalInterfaces);
    const pcs = parentCompile.index._stats;
    const parentErrors = parentCompile.issues.filter(i => i.severity === 'error').length;
    console.log(`  PARENT COMPILE: ${pcs.total_nodes} nodes, ${pcs.total_journeys} journeys, ${pcs.total_connections} connections | ${parentErrors} errors`);
    if (parentErrors > 0) {
      for (const issue of parentCompile.issues.filter(i => i.severity === 'error')) {
        console.log(`    ERROR: ${issue.message}`);
      }
    }
  } else {
    console.log('  LLM did not write cross-engine journeys.');
  }

  // ── Publish parent interface ──
  console.log('\n═══ STEP P2: Publish Parent Interface ═══');
  const parentResult = compile(modulesDir);
  const { interface_ } = publishInterface(publishedDir, parentResult.index, path.basename(absProjectDir));
  console.log(`  Published: ${Object.keys(interface_.provides).length} nodes | Hash: ${interface_.version_hash}`);

  console.log('\n═══ PARENT CONVERGED ═══');
  const ps = parentResult.index._stats;
  console.log(`  Children: ${engines.length} engines`);
  console.log(`  Cross-engine: ${ps.total_journeys} journeys, ${ps.total_connections} connections`);
  console.log('Done.');
}

// ── Process Tree Management ──
// Tracks ALL processes this convergence spawned (worker + children).
// PID file lets `genome stop` kill everything cleanly.

const childProcesses: Array<{ name: string; pid: number; proc: any }> = [];
const pidFilePath = path.join(genomeDir, 'pids.json');

function writePidFile() {
  const pids = {
    self: process.pid,
    worker: worker.isAlive() ? 'active' : 'none',
    children: childProcesses.map(c => ({ name: c.name, pid: c.pid })),
    started: new Date().toISOString(),
  };
  fs.writeFileSync(pidFilePath, JSON.stringify(pids, null, 2));
}

function cleanupAll() {
  console.log('\nShutting down all processes...');
  // Kill worker
  worker.kill();
  // Kill all child processes
  for (const child of childProcesses) {
    try {
      if (platform() === 'win32') {
        execSync(`taskkill /T /F /PID ${child.pid}`, { stdio: 'pipe', windowsHide: true });
      } else {
        process.kill(child.pid, 'SIGTERM');
      }
      console.log(`  Killed ${child.name} (pid: ${child.pid})`);
    } catch { /* already dead */ }
  }
  // Remove PID file
  try { fs.unlinkSync(pidFilePath); } catch { /* doesn't exist */ }
}

process.on('SIGINT', () => {
  cleanupAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanupAll();
  process.exit(0);
});

process.on('exit', () => {
  // Best-effort cleanup on any exit
  try { fs.unlinkSync(pidFilePath); } catch { /* ok */ }
});

// ── Run ──

run()
  .catch(err => {
    console.error('FATAL:', err.message);
    worker.kill();
    process.exit(1);
  })
  .finally(() => {
    worker.kill();
  });
