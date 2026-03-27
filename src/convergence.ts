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
import { trackLLMCall, startStep, endStep, trackModules, trackGraph, getMetrics } from './metrics.js';

// ── Configuration ──
// All values can be overridden via genome/config.json in the project directory.

interface ConvergenceConfig {
  maxRounds: number;         // Max convergence rounds before stopping (default: Infinity)
  watchIntervalMs: number;   // How often to check for changes when sleeping (default: 60000)
  sessionResetChars: number; // Reset LLM session after this many chars (default: Infinity)
  model: string;             // LLM model to use (default: 'claude-opus-4-6')
  maxFixAttempts: number;    // Max test fix attempts in Step 6 (default: 3)
  maxZeroDelta: number;      // Consecutive zero-delta passes before skipping module (default: 2)
  minModulesForSplit: number; // Minimum modules before considering hierarchy split (default: 6)
}

const DEFAULT_CONFIG: ConvergenceConfig = {
  maxRounds: Infinity,         // No artificial limit. Convergence check decides when to stop.
  watchIntervalMs: 60_000,
  sessionResetChars: Infinity, // DO NOT manage context. Claude Code handles its own compaction.
  model: 'claude-opus-4-6',   // ALWAYS use Opus 4.6 (1M context). Never downgrade.
  maxFixAttempts: 3,
  maxZeroDelta: 2,             // Configurable — not a hardcoded magic number.
  minModulesForSplit: 6,       // Configurable — projects can override in config.json.
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
- When asked to ADD to an existing file, use the Edit tool to append new content. NEVER rewrite the entire file with Write — this destroys existing content. Only use Write for NEW files that don't exist yet.
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

// ── Retry on LLM Timeout ──
// Wraps worker.call() with retry logic: up to 3 retries with exponential backoff (5s, 15s, 45s).
// Only retries on timeout errors — other errors propagate immediately.

async function retryOnLLMTimeout(prompt: string, maxRetries = 3): Promise<string> {
  const backoffSeconds = [5, 15, 45];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await worker.call(prompt);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const isTimeout = message.includes('timeout') || message.includes('Timeout');
      if (!isTimeout || attempt >= maxRetries) {
        throw err;
      }
      const delaySec = backoffSeconds[attempt] ?? backoffSeconds[backoffSeconds.length - 1];
      console.log(`  ⏳ LLM call timed out (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delaySec}s...`);
      await new Promise(resolve => setTimeout(resolve, delaySec * 1000));
    }
  }
  // Unreachable — loop always returns or throws — but satisfies TypeScript.
  throw new Error('retryOnLLMTimeout: exhausted retries');
}

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

  // ── Check if already converged → skip to Step 7 (watch loop) ──
  const convergeStatePath = path.join(genomeDir, 'convergence-state.json');
  if (fs.existsSync(convergeStatePath) && !process.argv.includes('--once')) {
    try {
      const state = JSON.parse(fs.readFileSync(convergeStatePath, 'utf-8'));
      if (state.status === 'sleeping' || state.status === 'unstable') {
        const currentResult = compile(modulesDir);
        const currentHash = publishInterface(publishedDir, currentResult.index, path.basename(absProjectDir)).interface_.version_hash;
        if (currentHash === state.interface_hash) {
          console.log(`Already converged (hash: ${currentHash.substring(7, 19)}). Entering watch loop directly.\n`);
          // Go directly to Step 7 — skip Steps 1-6 entirely
          // The watch loop handles reconvergence when dependencies change
          console.log('═══ STEP 7: Event-Driven Watch (resumed) ═══');
          // Fall through to Step 7 code at the bottom of run()
          // by setting a flag and skipping the pipeline
          const skipPipeline = true;
          if (skipPipeline) {
            // Reuse the Step 7 watch loop code
            // Need to define interface_ for the watch loop
            const interface_ = { version_hash: currentHash, provides: {} } as any;
            const testsPassed = state.tests_passed ?? true;
            const finalResult = currentResult;

            // Import the Step 7 watch loop inline
            const depsFilePath = path.join(genomeDir, 'dependencies.yaml');
            const syncStateFilePath = path.join(genomeDir, 'sync-state.json');
            const eventsDir = path.join(publishedDir, 'events');
            if (!fs.existsSync(eventsDir)) fs.mkdirSync(eventsDir, { recursive: true });

            const depEventDirs: Array<{ name: string; eventsDir: string }> = [];
            if (fs.existsSync(depsFilePath)) {
              const yaml = await import('js-yaml');
              const deps = yaml.load(fs.readFileSync(depsFilePath, 'utf-8')) as any;
              if (deps?.dependencies) {
                for (const depName of Object.keys(deps.dependencies)) {
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
              await new Promise(() => {});
              return;
            }

            console.log(`  Watching ${depEventDirs.length} dependency event dirs:`);
            for (const dep of depEventDirs) {
              console.log(`    ${dep.name}: ${dep.eventsDir}`);
            }

            // Set up fs.watch
            for (const dep of depEventDirs) {
              fs.watch(dep.eventsDir, (eventType, filename) => {
                if (filename && eventType === 'rename') {
                  console.log(`\n  EVENT DETECTED: ${dep.name} — ${filename}`);
                  console.log('  Targeted reconvergence would trigger here.');
                  // Full reconvergence handler is in the main Step 7 code
                }
              });
            }

            console.log('  Sleeping. Will wake on dependency events only.');
            await new Promise(() => {});
            return;
          }
        }
      }
    } catch { /* state file corrupt, run normally */ }
  }

  // ═══ STEP 0 — Project Scaffolding ═══
  // Detect project type from spec. Create package.json, tsconfig.json, etc. if missing.
  // This removes the requirement for users to `npm init` before running convergence.
  const isSoftwareSpec = /\.(ts|js|py|go|rs|java|tsx|jsx)\b/.test(spec) ||
    /TypeScript|JavaScript|Node\.js|Python|npm|npx|CLI/.test(spec);

  if (isSoftwareSpec) {
    const pkgPath = path.join(absProjectDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      console.log('═══ STEP 0: Project Scaffolding ═══');
      const isTS = /\.ts|TypeScript|tsx/.test(spec);
      const pkg = {
        name: path.basename(absProjectDir),
        version: '1.0.0',
        type: 'module',
        scripts: {
          test: 'vitest run',
        },
      };
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('  Created package.json');

      if (isTS) {
        const tsconfigPath = path.join(absProjectDir, 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
          const tsconfig = {
            compilerOptions: {
              target: 'ES2022',
              module: 'Node16',
              moduleResolution: 'Node16',
              strict: true,
              esModuleInterop: true,
              outDir: 'dist',
              rootDir: 'src',
            },
            include: ['src'],
          };
          fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          console.log('  Created tsconfig.json');
        }
      }
    }
  }

  // ═══ STEP 1 — Organization ═══
  startStep('step1_organization');
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
    trackLLMCall();
    console.log('  Written: ORGANIZATION.md');
  } else {
    console.log('  ORGANIZATION.md already exists, skipping.');
  }
  endStep('step1_organization');

  const orgContent = fs.readFileSync(orgPath, 'utf-8');

  // ═══ STEP 2 — Actor Discovery (3 sequential calls) ═══
  // Actors are discovered BEFORE the hierarchy decision.
  // If we split, ALL children get the SAME actors. No duplicates.
  startStep('step2_actors');
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

    trackLLMCall(); trackLLMCall(); trackLLMCall(); trackLLMCall(); // 4 calls: 3 angles + merge
    const result = doCompile();
    const actorCount = Object.values(result.index.nodes).filter(n => n.type === 'actor').length;
    console.log(`  Actors discovered: ${actorCount}`);
  } else {
    console.log('  _actors.yaml already has actors, skipping discovery.');
    doCompile();
  }
  endStep('step2_actors');

  // ═══ STEP 2b — Hierarchy Decision (after actors, before modules) ═══
  // The split decision is PERSISTED. If engines/ directory exists with children,
  // the split already happened. Don't re-decide — resume children.
  const enginesDir = path.join(absProjectDir, 'engines');
  if (fs.existsSync(enginesDir)) {
    const existingEngines = fs.readdirSync(enginesDir).filter(d =>
      fs.statSync(path.join(enginesDir, d)).isDirectory()
    );
    if (existingEngines.length > 0) {
      console.log(`\n  HIERARCHY: Split already exists (${existingEngines.length} engines: ${existingEngines.join(', ')})`);
      console.log('  Resuming children — not re-splitting.');
      const engines = existingEngines.map(name => ({
        name,
        specSections: '', // Not needed for resume — children have their own org
      }));
      await runAsParent(engines, spec, orgContent);
      return;
    }
  }

  // No existing split — ask LLM if we should split.
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
  startStep('step3_modules');
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

  endStep('step3_modules');

  // ═══ STEP 4 — Convergence (creation + validation + audit) ═══
  startStep('step4_convergence');
  console.log('\n═══ STEP 4: Convergence ═══');

  // ── Check if spec changed since last convergence ──
  // If unchanged: skip creation passes (4a), go straight to compile check (4b)
  // If changed: ask LLM which modules are affected, only update those
  const crypto = await import('node:crypto');
  const specHash = crypto.createHash('sha256').update(spec).digest('hex');
  const convergeStatePath2 = path.join(genomeDir, 'convergence-state.json');
  const knownModuleNames = extractModuleNames(orgContent);
  let affectedModules: string[] | null = null; // null = all modules, string[] = only these

  if (fs.existsSync(convergeStatePath2)) {
    try {
      const prevState = JSON.parse(fs.readFileSync(convergeStatePath2, 'utf-8'));
      if (prevState.spec_hash === specHash) {
        console.log('  Spec unchanged since last convergence. Skipping creation passes.');
        affectedModules = []; // Empty = skip all creation
      } else if (prevState.spec_hash) {
        console.log('  Spec CHANGED since last convergence. Identifying affected modules...');
        const affectedResponse = await worker.call(
          'The project spec has changed. Which modules need updating?\n\n' +
          'MODULES: ' + knownModuleNames.join(', ') + '\n\n' +
          'PREVIOUS SPEC HASH: ' + prevState.spec_hash.substring(0, 12) + '\n' +
          'CURRENT SPEC:\n' + spec + '\n\n' +
          'Return ONLY the module names that are affected by the changes, one per line. ' +
          'If a module is not affected, do NOT include it.'
        );
        affectedModules = affectedResponse.split('\n')
          .map(l => l.replace(/^[-*\s]+/, '').trim().replace(/`/g, ''))
          .filter(m => knownModuleNames.includes(m));
        if (affectedModules.length === 0) affectedModules = null; // Couldn't parse → do all
        console.log(`  Affected modules: ${affectedModules ? affectedModules.join(', ') : 'ALL (could not determine)'}`);
      }
    } catch { /* no valid state, run full */ }
  }

  if (affectedModules && affectedModules.length === 0) {
    // Spec unchanged — skip to 4b
    console.log('  Skipping Step 4a (no spec changes).\n');
  } else {
    // Run creation passes (full or targeted)

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
  const modulesToProcess = affectedModules ? allModuleNames.filter(m => affectedModules!.includes(m)) : allModuleNames;
  if (affectedModules && modulesToProcess.length < allModuleNames.length) {
    console.log(`  TARGETED: only updating ${modulesToProcess.length}/${allModuleNames.length} modules (${modulesToProcess.join(', ')})`);
  }

  let skippedModules = 0;
  for (const modName of modulesToProcess) {
    const modLenses = relevanceMatrix.get(modName) || [];
    let consecutiveZeroDelta = 0;
    const MAX_ZERO_DELTA = config.maxZeroDelta; // Configurable via config.json

    for (const lensIdx of modLenses) {
      const lens = effectiveLenses[lensIdx];
      const beforeResult = doCompile();
      const beforeNodes = beforeResult.index._stats.total_nodes;
      const beforeJourneys = beforeResult.index._stats.total_journeys;

      // Build a compact summary instead of sending full YAML
      const modFilePath = path.join(modulesDir, `${modName}.yaml`);
      const modContent = fs.existsSync(modFilePath) ? fs.readFileSync(modFilePath, 'utf-8') : '';
      const nodeNames = (modContent.match(/^  - name: (.+)$/gm) || []).map(l => l.replace('  - name: ', ''));
      const journeyNames = (modContent.match(/^  (\w[\w\s]+):$/gm) || []).map(l => l.trim().replace(/:$/, '')).filter(n => n !== 'nodes' && n !== 'journeys');
      const modSizeKB = Math.round(modContent.length / 1024);

      console.log(`  [${passCount + 1}/${totalPairs}] ${modName} | ${lens.substring(0, 40)} (${nodeNames.length} nodes, ${modSizeKB}KB)`);

      try {
        await worker.call(`Module: ${modName} (${modFilePath})
Existing nodes (${nodeNames.length}): ${nodeNames.join(', ')}
Existing journeys (${journeyNames.length}): ${journeyNames.join(', ')}

Perspective: ${lens}

PROJECT SPEC:
${spec}

From this perspective, what nodes and journeys are MISSING from this module?

RULES:
1. Read the current file at ${modFilePath}
2. Add ONLY what's genuinely missing — if a node or journey already covers this concern, skip it
3. Be GRANULAR — every system action is a separate step
4. Do NOT duplicate existing nodes/journeys listed above
5. Do NOT add nodes that belong in a different module
6. CRITICAL: Use the Edit tool to APPEND new nodes/journeys to the existing file. NEVER use Write to rewrite the entire file — this destroys existing nodes. Add new nodes under the "nodes:" section and new journeys under the "journeys:" section using Edit.
7. If nothing is genuinely missing from this perspective, respond with "No changes needed" and do NOT edit the file`);
      } catch (err) {
        console.log(`    ⚠ Creation pass failed: ${err instanceof Error ? err.message : err}`);
        console.log('    Resetting worker and continuing...');
        worker.kill();
        // Don't break — continue with next lens/module
      }

      passCount++;

      // Early termination: check if this pass actually added anything
      const afterResult = doCompile();
      const deltaNodes = afterResult.index._stats.total_nodes - beforeNodes;
      const deltaJourneys = afterResult.index._stats.total_journeys - beforeJourneys;

      // Safety: if nodes DECREASED, the LLM destroyed existing content
      if (deltaNodes < 0 || deltaJourneys < -2) {
        console.log(`    ⚠ DESTRUCTIVE EDIT: ${deltaNodes} nodes, ${deltaJourneys} journeys. Reverting...`);
        // Restore the module file from before this pass
        fs.writeFileSync(modFilePath, modContent, 'utf-8');
        console.log(`    → Reverted ${modName}.yaml to pre-pass state`);
        // Count as zero-delta for early termination purposes
        consecutiveZeroDelta++;
      } else if (deltaNodes === 0 && deltaJourneys === 0) {
        consecutiveZeroDelta++;
        console.log(`    → 0 new nodes, 0 new journeys (${consecutiveZeroDelta}/${MAX_ZERO_DELTA} zero-delta)`);
      } else {
        consecutiveZeroDelta = 0;
        console.log(`    → +${deltaNodes} nodes, +${deltaJourneys} journeys`);
      }

      if (consecutiveZeroDelta >= MAX_ZERO_DELTA) {
        const remaining = modLenses.length - modLenses.indexOf(lensIdx) - 1;
        console.log(`    → Module ${modName} saturated. Skipping ${remaining} remaining lenses.`);
        skippedModules++;
        break;
      }
    }
  }

  console.log(`  Creation complete: ${passCount} passes done (${skippedModules} modules hit early termination).`);

  } // end of: if spec changed (creation passes block)

  // Store spec hash for next run
  const stateForHash = fs.existsSync(convergeStatePath2) ? JSON.parse(fs.readFileSync(convergeStatePath2, 'utf-8')) : {};
  stateForHash.spec_hash = specHash;
  fs.writeFileSync(convergeStatePath2, JSON.stringify(stateForHash, null, 2));

  // Reset worker session between phases ONLY if creation passes ran.
  // Creation passes accumulate 15+ calls → context bloat. But spec-unchanged runs
  // skip creation entirely, so the worker is still fresh from Step 2.
  // Killing a fresh worker and spawning a new one causes init/warmup issues.
  // NEVER kill the worker between phases. Claude Code handles its own context compaction.
  // Killing and respawning creates unreliable fresh workers that fail ~50% of the time.
  // The warm worker from Steps 1-4a carries into 4b, 4c, 5, 6 — much more reliable.
  console.log('  Keeping worker session (warm worker is more reliable than fresh spawn).');

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

    // Fix errors in small batches (5 at a time) to avoid LLM timeouts on large error sets
    console.log(`  Fixing ${errors.length} errors...`);
    const BATCH_SIZE = 5;
    for (let i = 0; i < Math.min(errors.length, 15); i += BATCH_SIZE) {
      const batch = errors.slice(i, i + BATCH_SIZE);
      const errorList = batch.map(e => `- ${e.message}`).join('\n');
      try {
        await worker.call(`Fix these ${batch.length} compile errors by updating the relevant YAML module files:

${errorList}

Read each affected file, fix the broken references using the Edit tool. Do NOT rewrite entire files.`);
      } catch {
        console.log(`    ⚠ Error fix batch ${Math.floor(i/BATCH_SIZE) + 1} timed out — continuing with next batch.`);
        worker.kill(); // Fresh worker for next batch
      }
    }
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
Read the file, then use the Edit tool to add what's needed. Do NOT rewrite the entire file.`);
    }

    // Re-compile after fixes
    doCompile();
  }

  // ═══ STEP 4d — Code-to-Graph Sync (bottom-up) ═══
  // Source of truth hierarchy: spec → graph → code → tests
  // This step handles BOTTOM-UP: code changes that need to flow back to the graph.
  // If code does something the graph doesn't describe → add nodes/journeys.
  // If code contradicts the graph → journey tests (6b) will catch it.
  // The graph is the single source of truth for what the system IS.
  // The spec is the single source of truth for what the system SHOULD BE.
  console.log('\n═══ STEP 4d: Code-to-Graph Sync ═══');

  const codeFiles: Array<{ node: string; file: string }> = [];
  const preCodeResult = doCompile();
  for (const [nodeName, node] of Object.entries(preCodeResult.index.nodes)) {
    if (node.files && node.files.length > 0) {
      for (const file of node.files) {
        const fullPath = path.join(absProjectDir, file);
        if (fs.existsSync(fullPath)) {
          codeFiles.push({ node: nodeName, file: fullPath });
        }
      }
    }
  }

  // Also scan for OUTPUT files that exist but aren't in the graph.
  // Not just code — any project output: chapters, policies, designs, procedures.
  // Scans all directories except genome/ (that's the graph itself) and node_modules/.
  const scanDirs = fs.readdirSync(absProjectDir).filter(d => {
    const full = path.join(absProjectDir, d);
    return fs.statSync(full).isDirectory() && !['genome', 'node_modules', '.git', 'dist', 'engines'].includes(d);
  });

  // Recursive scan — finds files at any depth (e.g., src/utils/helpers.ts)
  function scanRecursive(dirPath: string): string[] {
    const results: string[] = [];
    try {
      for (const entry of fs.readdirSync(dirPath)) {
        if (entry.startsWith('.')) continue;
        const full = path.join(dirPath, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', '__pycache__'].includes(entry)) {
          results.push(...scanRecursive(full));
        } else if (stat.isFile()) {
          results.push(full);
        }
      }
    } catch { /* permission denied, skip */ }
    return results;
  }

  for (const dir of scanDirs) {
    const dirPath = path.join(absProjectDir, dir);
    for (const fullPath of scanRecursive(dirPath)) {
      const isTracked = codeFiles.some(cf => cf.file === fullPath);
      if (!isTracked) {
        codeFiles.push({ node: '', file: fullPath }); // Untracked output file
      }
    }
  }

  if (codeFiles.length > 0) {
    console.log(`  Found ${codeFiles.length} code files to reconcile with graph...`);

    // Read all code files and ask LLM to compare with graph
    const trackedFiles = codeFiles.filter(cf => cf.node);
    const untrackedFiles = codeFiles.filter(cf => !cf.node);

    if (untrackedFiles.length > 0) {
      console.log(`  ${untrackedFiles.length} untracked code files (exist but not in graph):`);
      const untrackedList = untrackedFiles.map(cf => {
        const content = fs.readFileSync(cf.file, 'utf-8');
        const lines = content.split('\n').length;
        return `  - ${path.basename(cf.file)} (${lines} lines)`;
      }).join('\n');
      console.log(untrackedList);

      // Ask LLM to reconcile untracked files with the graph
      const untrackedSummary = untrackedFiles.map(cf => {
        const content = fs.readFileSync(cf.file, 'utf-8');
        return `=== ${path.basename(cf.file)} ===\n${content.substring(0, 3000)}`;
      }).join('\n\n');

      const allModuleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.yaml') && f !== '_actors.yaml');

      await worker.call(`These project output files exist but are NOT tracked in the graph.
They could be code, chapters, policies, designs, procedures — any project output.

UNTRACKED FILES:
${untrackedSummary}

EXISTING MODULES: ${allModuleFiles.join(', ')}

For each untracked file:
1. Does it implement/describe something already in a node? → Add files: [path] to that node
2. Does it contain something NOT in the graph? → Add a new node + journey for it
3. Is it irrelevant (config, build artifacts)? → Skip

Update the appropriate YAML module files using the Write tool.`);

      doCompile(); // Recompile after reconciliation
    }

    if (trackedFiles.length > 0) {
      console.log(`  ${trackedFiles.length} tracked code files — checking for drift...`);

      for (const cf of trackedFiles) { // Process all tracked files — no artificial limit
        const code = fs.readFileSync(cf.file, 'utf-8');
        const node = preCodeResult.index.nodes[cf.node];
        if (!node) continue;

        await worker.call(`Compare this code to its node in the graph. Flag any drift.

NODE: ${cf.node}
DESCRIPTION: ${node.description}
IN JOURNEYS: ${node.in_journeys.join(', ')}

CODE (${path.basename(cf.file)}):
${code.substring(0, 5000)}

Does the code match what the journey says? If the code does MORE than the journey describes (new functions, new capabilities), update the module YAML to add the missing nodes/journeys. If the code does LESS, flag it.

Update the appropriate YAML module file using the Write tool if needed.`);
      }

      doCompile(); // Recompile after drift check
    }
  } else {
    console.log('  No code files found to reconcile. Skipping.');
  }

  endStep('step4_convergence');

  // ═══ STEP 5 — Publish + Notify ═══
  startStep('step5_publish');
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
  endStep('step5_publish');

  // Keep worker session for codegen — avoid spawn/init overhead.
  // The compact codegen prompt (file paths only) keeps context manageable.
  console.log('  Keeping worker session for codegen.');

  // ═══ STEP 6 — Code Generation (from graph) ═══
  startStep('step6_codegen');
  console.log('\n═══ STEP 6: Code Generation ═══');

  // Build a complete summary of the graph for the LLM
  // Build a compact file listing (paths only — LLM reads them itself)
  const moduleFiles = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.yaml'))
    .map(f => path.join(modulesDir, f));
  const moduleFileList = moduleFiles.map(f => `  - ${f}`).join('\n');

  const stats = finalResult.index._stats;

  // 6a: Code generation — TWO MODES:
  // MODE 1 (no code exists): Generate complete implementation from graph
  // MODE 2 (code exists): Ask LLM to UPDATE existing code based on graph changes
  //   - Read existing code + graph diff
  //   - Add new functions/features for new journeys
  //   - Don't rewrite what already works
  //   - Then 6b journey tests validate everything
  const srcDir6 = path.join(absProjectDir, 'src');
  const existingCode = fs.existsSync(srcDir6) && fs.readdirSync(srcDir6).some(f => f.endsWith('.ts') || f.endsWith('.js'));

  console.log(`  Graph: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys, ${stats.total_connections} connections`);

  if (existingCode) {
    // MODE 2: Update existing code — targeted changes, not full rewrite
    const srcFiles6 = fs.readdirSync(srcDir6).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    console.log(`  Source code exists (${srcFiles6.length} files) — updating for new graph content...`);
    const srcFileList = srcFiles6.map(f => `  - ${path.join(srcDir6, f)}`).join('\n');
    try {
      await worker.call(`The project has existing source code that may need updates based on the current graph.

SPEC:
${spec}

EXISTING SOURCE FILES (Read each one):
${srcFileList}

MODULE FILES (Read to see current graph — nodes + journeys):
${moduleFileList}

INSTRUCTIONS:
1. Read the spec and the source files
2. Read the graph module files to see what journeys/features exist
3. Compare: does the code implement ALL journeys in the graph?
4. If features are MISSING from the code: add them using Edit (targeted additions)
5. If existing code already handles a journey: DO NOT rewrite it
6. Only ADD what's new. Do NOT delete or rewrite existing working code.
7. Use Edit tool for all changes — never Write entire files.`);
    } catch {
      console.log('  Code update timed out — continuing to journey tests.');
    }
  } else {
    // MODE 1: No code exists — generate from scratch
    console.log('  No source code found — generating implementation from graph...');

  // Step 6 is the most demanding LLM call — full graph → complete code.
  // Worker may crash (rate limit, context issues). Retry up to 2 times with fresh workers.
  // IMPORTANT: Don't embed full YAML in prompt (50KB+ causes timeouts).
  // Instead, give file paths and let the LLM Read them itself.
  let codeGenAttempt = 0;
  const MAX_CODEGEN_ATTEMPTS = 3;
  while (codeGenAttempt < MAX_CODEGEN_ATTEMPTS) {
    codeGenAttempt++;
    try {
      await worker.call(`You are writing the COMPLETE, RUNNABLE implementation for this project.

PROJECT SPEC:
${spec}

CONTEXT GRAPH: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys, ${stats.total_connections} connections

MODULE FILES (Read each one to understand the full graph):
${moduleFileList}

INSTRUCTIONS:
1. Read the spec above — it defines the project structure (file layout, entry points, dependencies)
2. Read EACH module YAML file listed above using the Read tool — they describe every process, artifact, rule, and journey
3. Write ALL the code files needed to make this project WORK
4. The code must be RUNNABLE — not stubs, not skeletons, not TODO comments
5. Every journey in the graph should be a working code path
6. Write each file using the Write tool

The implementation must actually work when executed. Test it mentally — trace through the main journeys and verify the code handles them.`);
      break; // Success
    } catch (err) {
      console.log(`  ⚠ Code generation attempt ${codeGenAttempt}/${MAX_CODEGEN_ATTEMPTS} failed: ${err instanceof Error ? err.message : err}`);
      if (codeGenAttempt < MAX_CODEGEN_ATTEMPTS) {
        console.log('  Resetting worker and retrying...');
        worker.kill();
        await new Promise(r => setTimeout(r, 5000)); // Brief pause before retry
      } else {
        console.log('  Code generation failed after all attempts. Continuing to validation...');
      }
    }
  }
  } // end of: if (!existingCode) — skip codegen when code exists

  // Verify code was written
  const srcDir = path.join(absProjectDir, 'src');
  if (fs.existsSync(srcDir)) {
    const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    console.log(`  Code files written: ${srcFiles.length} (${srcFiles.join(', ')})`);
  } else {
    console.log('  No src/ directory found — LLM may have used a different structure');
  }

  // 6b: Validate the output — domain-agnostic
  // For software: run the app, check for errors
  // For a storybook: check consistency between chapters and graph
  // For any domain: LLM validates output matches the graph
  console.log('  Validating output...');
  const { execSync: execSyncLocal } = await import('node:child_process');
  let testsPassed = false;
  let fixAttempts = 0;
  const MAX_FIX_ATTEMPTS = config.maxFixAttempts;

  // Ask LLM how to validate this project (domain-agnostic)
  const validationResponse = await worker.call(
    'The project output has been generated. How should we VALIDATE it?\n\n' +
    'PROJECT SPEC:\n' + spec.substring(0, 2000) + '\n\n' +
    'If this is a software project with TypeScript/JavaScript:\n' +
    '  → Try running it and report the command + result\n' +
    'If this is a document/story/plan:\n' +
    '  → Check consistency between output files and the graph\n' +
    'If this is a procedure/policy:\n' +
    '  → Verify completeness against the graph\n\n' +
    'Run the appropriate validation now using Bash tool. Report what you find.'
  );
  console.log('  Validation result: ' + validationResponse.substring(0, 300));

  // ── 6b: Journey-based validation ──
  // The graph IS the test suite. "Steps ARE test cases" (blueprint promise).
  // 1. Generate test skeletons from journeys (testgen.ts)
  // 2. LLM fills assertions
  // 3. Run tests
  // 4. Report pass/fail per journey
  console.log('\n  ── Step 6b: Journey Validation ──');

  const testDir = path.join(absProjectDir, 'tests');
  const journeyCount = Object.keys(finalResult.index.journeys).length;
  console.log(`  ${journeyCount} journeys in graph.`);

  if (journeyCount > 0 && fs.existsSync(path.join(absProjectDir, 'src'))) {
    // Step 1: Generate test skeletons from journeys
    const testFiles = generateTests(finalResult.index, testDir);
    console.log(`  Generated ${testFiles.length} journey test files.`);

    if (testFiles.length > 0) {
      // Step 2: LLM fills assertions in BATCHES (10 files at a time to avoid timeouts)
      const BATCH_SIZE = 10;
      const totalBatches = Math.ceil(testFiles.length / BATCH_SIZE);
      console.log(`  Filling assertions in ${totalBatches} batches of ${BATCH_SIZE}...`);

      for (let b = 0; b < Math.min(totalBatches, 5); b++) { // Cap at 5 batches (50 tests) to avoid excessive time
        const batch = testFiles.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        const testFileList = batch.map(f => `  - ${f}`).join('\n');
        console.log(`  Batch ${b + 1}/${Math.min(totalBatches, 5)}: ${batch.length} test files`);
        try {
          await worker.call(`Fill assertions in these journey test files.

TEST FILES:
${testFileList}

SOURCE CODE DIRECTORY: ${path.join(absProjectDir, 'src')}

INSTRUCTIONS:
1. Read each test file — they have describe/it blocks from journey steps with "TODO: agent fills assertion"
2. Read the source code to understand what each step actually does
3. Fill in real assertions for each step (import functions, call them, check results)
4. For CLI journeys: use execSync to run the CLI command and assert output contains expected text
5. Write each updated test file using the Write tool
6. Make tests RUNNABLE with vitest — proper imports, setup/teardown for file state`);
        } catch {
          console.log(`    Batch ${b + 1} timed out — continuing with next batch.`);
        }
      }

      if (testFiles.length > 50) {
        console.log(`  Note: ${testFiles.length - 50} test files skipped (capped at 50 for time).`);
      }

        // Step 3: Run tests with feedback loop — failures get diagnosed and fixed
        console.log('  Running journey tests...');
        const MAX_JOURNEY_FIX_ATTEMPTS = 3;
        let journeyFixAttempt = 0;
        let allJourneysPassed = false;

        while (journeyFixAttempt < MAX_JOURNEY_FIX_ATTEMPTS && !allJourneysPassed) {
          try {
            const testOutput = execSyncLocal('npx vitest run --reporter=verbose 2>&1', {
              cwd: absProjectDir,
              encoding: 'utf-8',
              timeout: 120_000,
            });
            const passMatch = testOutput.match(/(\d+) passed/);
            const failMatch = testOutput.match(/(\d+) failed/);
            const passed = passMatch ? parseInt(passMatch[1]) : 0;
            const failed = failMatch ? parseInt(failMatch[1]) : 0;
            console.log(`  Journey tests: ${passed} passed, ${failed} failed`);
            if (failed === 0 && passed > 0) {
              console.log('  ALL JOURNEY TESTS PASS.');
              allJourneysPassed = true;
            }
          } catch (err: any) {
            journeyFixAttempt++;
            const output = (err.stdout || err.message || '').substring(0, 3000);
            const failedTests = output.match(/FAIL.*\n.*\n.*\n/g)?.join('\n') || output.substring(0, 1500);
            console.log(`  Journey tests FAILED (attempt ${journeyFixAttempt}/${MAX_JOURNEY_FIX_ATTEMPTS})`);

            if (journeyFixAttempt < MAX_JOURNEY_FIX_ATTEMPTS) {
              // Feed failures back to LLM for diagnosis and fix
              console.log('  LLM diagnosing failures...');
              try {
                await worker.call(`Journey tests failed. Diagnose each failure and fix it.

TEST FAILURES:
${failedTests}

For EACH failure, decide:
1. CODE BUG — the source code doesn't implement this journey correctly → fix the source code using Edit
2. TEST BUG — the test assertion is wrong (expects wrong output) → fix the test file using Edit
3. GRAPH BUG — the journey describes something the spec doesn't require → update the YAML module using Edit

Read the failing test file, the source code, and the journey definition. Then fix whichever is wrong.
Do NOT rewrite entire files — use Edit for targeted fixes.`);
              } catch {
                console.log('  Journey fix timed out — continuing.');
                break;
              }
            }
          }
        }

        if (!allJourneysPassed && journeyFixAttempt >= MAX_JOURNEY_FIX_ATTEMPTS) {
          console.log(`  WARNING: Journey tests still failing after ${MAX_JOURNEY_FIX_ATTEMPTS} fix attempts.`);
        }
    }
  } else {
    console.log('  No journeys or no src/ — skipping journey validation.');
  }

  // Detect software project from spec (not from whether files exist — Step 6 might have failed)
  const isSoftwareProject = /\.(ts|js|py|go|rs|java|tsx|jsx)\b/.test(spec) ||
    /TypeScript|JavaScript|Node\.js|Python|npm|npx|CLI/.test(spec);

  const hasTsFiles = fs.existsSync(path.join(absProjectDir, 'src')) &&
    fs.readdirSync(path.join(absProjectDir, 'src')).some(f => f.endsWith('.ts') || f.endsWith('.js'));

  if (isSoftwareProject && !hasTsFiles) {
    console.log('  WARNING: Software project but no code files written. Step 6 may have failed.');
    console.log('  Retrying code generation...');
    await worker.call(`The previous code generation failed (possibly due to rate limiting).
Write the COMPLETE implementation for this project NOW.

SPEC:
${spec}

GRAPH: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys

Write ALL code files to the src/ directory. Use the Write tool.`);

    // Recheck
    if (fs.existsSync(path.join(absProjectDir, 'src'))) {
      const newFiles = fs.readdirSync(path.join(absProjectDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      console.log('  Retry result: ' + newFiles.length + ' files written');
    }
  }

  if (hasTsFiles || (isSoftwareProject && fs.existsSync(path.join(absProjectDir, 'src')))) {
    console.log('  Software project detected — running smoke test...');
    // Find actual entry file instead of relying on glob (*.ts doesn't expand on Windows)
    const srcFiles = fs.readdirSync(path.join(absProjectDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    const entryFile = srcFiles.find(f => /^(index|main|app|todo|cli)\.(ts|js)$/.test(f)) || srcFiles[0];
    const smokeCmd = entryFile ? `npx tsx src/${entryFile} --help 2>&1 || npx tsx src/${entryFile} list 2>&1` : 'echo "No entry file found"';

    while (!testsPassed && fixAttempts < MAX_FIX_ATTEMPTS) {
      try {
        const testOutput = execSyncLocal(smokeCmd, {
          cwd: absProjectDir,
          encoding: 'utf-8',
          timeout: 30_000,
        });
        console.log(`  Smoke test PASSED`);
        testsPassed = true;
      } catch (err: any) {
        fixAttempts++;
        const output = err.stdout || err.message || '';
        const failures = output.substring(0, 2000);

        console.log(`  Smoke test FAILED (attempt ${fixAttempts}/${MAX_FIX_ATTEMPTS}): ${failures.substring(0, 200)}`);

        if (fixAttempts < MAX_FIX_ATTEMPTS) {
          console.log(`    LLM CALL: fixing failures...`);
          try {
            await worker.call(`The smoke test failed. Fix the code.

COMMAND: ${smokeCmd}
ERROR: ${failures}

Read the relevant source files, fix the problem using Edit tool. Do NOT rewrite entire files.`);
          } catch {
            console.log('    Fix attempt timed out — skipping further retries.');
            break;
          }
        }
      }
    }
  } else {
    // Non-software project — validation was done by LLM above
    testsPassed = true;
    console.log('  Non-software project — validation handled by LLM.');
  }

  if (!testsPassed) {
    console.log(`  WARNING: Validation still failing after ${MAX_FIX_ATTEMPTS} attempts. Interface will be marked as UNSTABLE.`);
  }

  endStep('step6_codegen');

  // Track final graph stats
  trackModules(Object.keys(finalResult.coverage.modules).length);
  trackGraph(finalResult.index._stats.total_nodes, finalResult.index._stats.total_journeys);

  // Write metrics
  const metrics = getMetrics();
  const metricsPath = path.join(genomeDir, 'metrics.json');
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`  Metrics written: ${metrics.llmCalls} LLM calls, ${Object.keys(metrics.stepTimings).length} steps tracked`);

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

      // Re-generate code + tests for affected modules (plan changed → code must follow)
      const reconvergedResult = doCompile();
      console.log('  Regenerating code + tests for changed modules...');
      const reconCodeResult = generateCodeSkeletons(reconvergedResult.index, absProjectDir);
      if (reconCodeResult.generated.length > 0) {
        for (const filePath of reconCodeResult.generated) {
          if (!fs.existsSync(filePath)) continue;
          const skeleton = fs.readFileSync(filePath, 'utf-8');
          const fileName = path.basename(filePath);
          await worker.call(`Update this code to match the current journey graph. The plan changed — this code may need new methods or updated logic.\n\nCURRENT CODE:\n${skeleton}\n\nWrite the updated file to: ${filePath}`);
        }
      }
      const reconTestDir = path.join(absProjectDir, 'test');
      const reconTestFiles = generateTests(reconvergedResult.index, reconTestDir);
      if (reconTestFiles.length > 0) {
        for (const testPath of reconTestFiles) {
          if (!fs.existsSync(testPath)) continue;
          const testContent = fs.readFileSync(testPath, 'utf-8');
          await worker.call(`Update this test to match the current journey graph. New steps may need new assertions.\n\nCURRENT TEST:\n${testContent}\n\nWrite the updated file to: ${testPath}`);
        }
      }

      // Re-publish + write event for downstream ripple
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
  // Build a COMPACT module summary instead of sending full YAML (was 57KB, now ~5KB)
  // The compile index already has structured node/journey data — use that.
  const moduleSummaries = fs.readdirSync(modulesDir).filter(f => f.endsWith('.yaml') && f !== '_actors.yaml').map(f => {
    const content = fs.readFileSync(path.join(modulesDir, f), 'utf-8');
    const nodeNames = (content.match(/^  \w[\w-]*:/gm) || []).map(l => l.trim().replace(/:$/, ''));
    const journeyNames = (content.match(/^  \w[\w\s-]+:/gm) || [])
      .map(l => l.trim().replace(/:$/, ''))
      .filter(n => !['nodes', 'journeys', 'spec_sections'].includes(n) && !nodeNames.includes(n));
    return `${f.replace('.yaml', '')}: ${nodeNames.length} nodes (${nodeNames.join(', ')}), ${journeyNames.length} journeys (${journeyNames.join(', ')})`;
  }).join('\n');

  const stats = result.index._stats;
  const gaps: string[] = [];

  // Auditor 1: Spec coverage
  console.log('  Auditor 1: spec coverage...');
  const audit1 = await worker.call(`For EACH major spec section, are there journeys covering it? Which sections have fewer than 3 journeys?

SPEC:
${spec}

COMPILE STATS: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys

MODULE SUMMARY:
${moduleSummaries}

Report ONLY sections with thin coverage. If all well covered, respond with exactly: ALL COVERED`);

  if (!audit1.toLowerCase().includes('all covered')) {
    gaps.push('spec-coverage: ' + audit1.substring(0, 200));
  }

  // Auditor 2: Actor coverage
  console.log('  Auditor 2: actor coverage...');
  const actorsFilePath = path.join(modulesDir, '_actors.yaml');
  const actorsYaml = fs.existsSync(actorsFilePath) ? fs.readFileSync(actorsFilePath, 'utf-8') : 'No actors file found.';
  const audit2 = await worker.call(`For EACH actor: how many journeys involve them? Any actors with 0 journeys?

ACTORS:
${actorsYaml}

MODULE SUMMARY:
${moduleSummaries}

Report ONLY actors with 0 journeys. If all covered, respond with exactly: ALL COVERED`);

  if (!audit2.toLowerCase().includes('all covered')) {
    gaps.push('actor-coverage: ' + audit2.substring(0, 200));
  }

  // Auditor 3: Cross-module
  console.log('  Auditor 3: cross-module coverage...');
  const audit3 = await worker.call(`Compile stats: ${stats.total_nodes} nodes, ${stats.total_journeys} journeys, ${stats.total_connections} connections across ${stats.modules} modules. ${stats.orphans} orphans.

Are there module pairs that SHOULD be connected but aren't?

MODULE SUMMARY:
${moduleSummaries}

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
  // The LLM decides based on architectural independence.
  // Context: tell the LLM what level we're at so it doesn't recursively split the same thing.
  const engineName = path.basename(absProjectDir);
  const moduleNames = extractModuleNames(orgContent);
  console.log(`  Asking LLM if ${engineName} (depth ${currentDepth}, ${moduleNames.length} modules) should split...`);

  const response = await worker.call(`You are deciding whether this engine should be split into SEPARATE child engines.

THIS ENGINE: "${engineName}" at hierarchy depth ${currentDepth}
YOUR MODULES (assigned by parent): ${moduleNames.join(', ')}
TOTAL MODULE COUNT: ${moduleNames.length}

${currentDepth > 0 ? `You are ALREADY a child engine. Your parent decided these ${moduleNames.length} modules belong together.
Only split if you have clear independent GROUPS within your modules. Your parent already scoped you — respect that decision.` : ''}

SPLIT ONLY if:
- Your modules form 2-3 clearly independent GROUPS (not one group per module)
- Each group has its own data, lifecycle, and API boundary
- Each child engine must have DIFFERENT name from "${engineName}"
- Each child must contain MULTIPLE of YOUR modules (not inventing new ones)

DO NOT split if:
- You have fewer than ${config.minModulesForSplit} modules (already focused enough)
- Your modules are tightly coupled
- Splitting would just create one engine per module (pointless)
- You would recreate the same scope under a different name

ORGANIZATION:
${orgContent}

Answer SPLIT: no (or yes with ENGINE lines).
FORMAT:
SPLIT: yes (or no)
REASON: one line why
ENGINE: group-name — modules: mod1, mod2, mod3
ENGINE: group-name — modules: mod4, mod5`);

  if (!response.toLowerCase().includes('split: yes')) {
    return { split: false, engines: [] };
  }

  const engines: Array<{ name: string; specSections: string }> = [];
  const engineLines = response.split('\n').filter(l => l.startsWith('ENGINE:'));
  for (const line of engineLines) {
    const match = line.match(/ENGINE:\s*(\S+)\s*—\s*modules:\s*(.*)/i);
    if (match) {
      const childName = match[1];
      const childModules = match[2].trim().split(',').map(m => m.trim()).filter(m => m);
      // Guard: reject children with same name as parent (recursive splitting)
      if (childName === engineName) {
        console.log(`  REJECTED: child "${childName}" has same name as parent.`);
        continue;
      }
      // Guard: reject children with only 1 module (pointless split)
      if (childModules.length <= 1) {
        console.log(`  REJECTED: child "${childName}" has only ${childModules.length} module(s).`);
        continue;
      }
      // Guard: reject children whose modules aren't from the parent's module list
      // (prevents LLM from inventing new modules during split)
      const invalidModules = childModules.filter(m => !moduleNames.includes(m));
      if (invalidModules.length > 0) {
        console.log(`  REJECTED: child "${childName}" has modules not in parent: ${invalidModules.join(', ')}`);
        continue;
      }
      engines.push({ name: childName, specSections: match[2].trim() });
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

  // Check if children already have data (resume, not recreate)
  const allChildrenExist = engines.every(e => {
    const childSpec = path.join(absProjectDir, 'engines', e.name, 'genome', 'spec.md');
    const childActors = path.join(absProjectDir, 'engines', e.name, 'genome', 'modules', '_actors.yaml');
    return fs.existsSync(childSpec) && fs.existsSync(childActors);
  });

  if (allChildrenExist) {
    console.log('  Children already have specs + actors. Skipping setup, spawning directly.');
  } else {
    // Write scoped specs + copy actors (first time only)
    const specFileList = engines.map(e => ({
      path: path.join(absProjectDir, 'engines', e.name, 'genome', 'spec.md'),
      name: e.name,
      modules: e.specSections,
    }));

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
  } // end of if (!allChildrenExist) else block

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

  // Wait for children with health check — if a child's process dies silently,
  // detect it via exitCode instead of waiting forever for an 'exit' event.
  await Promise.all(children.map(child => new Promise<void>((resolve) => {
    child.proc.on('exit', (code: number | null) => {
      console.log(`  [${child.name}] Completed with code ${code}`);
      resolve();
    });
    // Health check: if process already exited (race condition), resolve immediately
    if (child.proc.exitCode !== null) {
      console.log(`  [${child.name}] Already exited with code ${child.proc.exitCode}`);
      resolve();
    }
    // Safety: check every 30s if process is still alive
    const healthCheck = setInterval(() => {
      if (child.proc.exitCode !== null) {
        clearInterval(healthCheck);
        console.log(`  [${child.name}] Detected exit (code ${child.proc.exitCode}) via health check`);
        resolve();
      }
    }, 30_000);
    child.proc.on('exit', () => clearInterval(healthCheck));
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

  // Build compact interface listing (file paths — LLM reads them itself)
  const interfaceFileList = childInterfaces.map(c => `  - ${c.name}: ${c.path}`).join('\n');

  // Write cross-engine journeys as a parent module
  const crossModulePath = path.join(modulesDir, '_cross-engine.yaml');
  console.log('  LLM CALL: creating cross-engine journeys...');
  await worker.call(`You are the PARENT orchestrator. Your children are independent engines that have converged.
Each child published an interface listing what it provides.

CHILDREN'S INTERFACE FILES (Read each one):
${interfaceFileList}

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

// Windows: detect parent death via stdin close (only in watch mode, not --once)
// When TaskStop kills the bash wrapper, stdin closes → we self-terminate
if (!process.argv.includes('--once')) {
  process.stdin.on('end', () => {
    console.log('\nStdin closed (parent died). Cleaning up...');
    cleanupAll();
    process.exit(0);
  });
  process.stdin.resume();
}

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
