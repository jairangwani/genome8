# Genome8 — Blueprint

> The complete HOW. Read GOALPOST.md for WHY.
> Everything an agent needs to build, run, and maintain genome.
> ✅ = tested/proven. 📋 = planned/needs testing.

---

## 1. What This Document Covers

This blueprint contains everything needed to:
1. Build the genome engine (compile, excerpt, publish, sync, testgen, codegen, convergence)
2. Run a project (convergence.ts — the code orchestrator that calls LLM workers)
3. Manage hierarchy (same convergence.ts at every level, different scope)
4. Sync across engines and projects (published interfaces + hash watching)
5. Generate code and tests from the journey graph
6. Maintain genome itself (agents can modify engine code)

**The key insight:** convergence.ts (CODE) orchestrates the loop — compile, pick module, pick lens, generate excerpt, check convergence. LLM is called as a WORKER for creative tasks only — "what's missing?" The LLM never decides when to act. The code does.

An agent reading this document should understand: what genome is, how it works, what's code vs what's LLM, and how to build/run everything.

---

## 2. Node Types (5 universal types) ✅ TESTED

| Type | What it is | Examples |
|------|-----------|---------|
| **actor** | Who does things | User, Attacker, Character, Manager |
| **process** | Something that happens | AuthService, BuildPipeline, HiringFlow |
| **artifact** | Something that exists | WalletStore, ChapterDraft, Decision, Mandate |
| **interface** | Something users interact with | LoginPage, Chapter, Dashboard |
| **rule** | Something that governs | RateLimitPolicy, NarrativeRule, VPMandate |

**Any context can be a node.** Decisions, political mandates, historical lessons, design rationale — all captured as artifact or rule nodes with descriptions. The engine compiles them into connections just like any other node.

**TypeScript definition** (in types.ts):
```typescript
export interface ModuleNode {
  type: 'actor' | 'process' | 'artifact' | 'interface' | 'rule';
  description: string;
  properties?: Record<string, unknown>;
  files?: string[];          // code files implementing this node
  [key: string]: unknown;    // open for domain-specific fields
}
```

**Current status:** types.ts exists but still uses old names (persona, service, store, component, policy). Needs renaming to match universal types.

---

## 3. Journeys ✅ TESTED

A journey IS a use case. Consecutive steps ARE connections. Steps ARE test cases.

```yaml
journeys:
  PlayerLogin:
    steps:
      - node: _actors/Player                         # local actor
        action: clicks Login
      - node: pando-identity/LoginService             # EXTERNAL project ref
        action: authenticates with 2FA
      - node: game/SessionManager                     # local process
        action: creates game session
      - node: game/Lobby                              # local interface
        action: shows available matches
```

### Reference syntax

| Syntax | Meaning | Example |
|--------|---------|---------|
| `NodeName` | Same module | `KeyManager` |
| `module/NodeName` | Different module, same engine | `identity/KeyManager` |
| `project/NodeName` | Different PROJECT (external) | `pando-identity/LoginService` |

### What engine computes from journeys ✅ TESTED (11 unit tests)

```
step N → step N+1                     = connection (preceded_by / followed_by)
step in module A → step in module B   = cross-module connection
step referencing project/Node         = external dependency
first actor-type node                 = journey trigger (triggered_by_actors)
all steps referencing a node          = in_journeys list
```

### TypeScript definition (in types.ts):
```typescript
export interface ModuleJourney {
  description?: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  node: string;    // "NodeName" or "module/NodeName" or "project/NodeName"
  action: string;
}
```

---

## 4. Data Structure ✅ TESTED

```
project/
  genome/
    spec.md                       ← user input (any format)
    dependencies.yaml             ← 📋 external project dependencies
    modules/                      ← agents EDIT
      _actors.yaml                ← actor nodes
      identity.yaml               ← nodes + journeys
      gateway.yaml
      ...
    compiled/                     ← engine GENERATES (read-only)
      index.yaml                  ← all nodes with connections from journeys
      coverage.yaml               ← orphans, isolated modules, gaps
    published/                    ← 📋 engine GENERATES (for other engines/projects)
      interface.yaml              ← what this engine provides + requires
      changelog.yaml              ← what changed since last version
```

### Module file format ✅ TESTED

```yaml
# modules/identity.yaml
spec_sections: [9]

nodes:
  KeyManager:
    type: process
    description: Generates Ed25519 keypairs for all entity types
    properties:
      algorithm: Ed25519
    files:
      - src/identity/KeyManager.ts

journeys:
  RegisterAccount:
    steps:
      - node: _actors/AnonymousUser
        action: clicks Create Account
      - node: KeyManager
        action: generates Ed25519 keypair
      - node: JWTService
        action: issues access + refresh tokens
      - node: ledger/WalletStore
        action: creates Lux wallet
```

### Dependencies file 📋 PLANNED

```yaml
# genome/dependencies.yaml
dependencies:
  pando-identity:
    pin: sha256:abc123          # locked to specific interface version
    alert_on_update: true       # notify when new version available
    fallback: last_known_good   # if removed, keep running on this version
  pando-ledger:
    pin: latest                 # always track newest
```

---

## 5. The Engine

### 5.1 compile.ts — THE HEART ✅ TESTED (11 unit tests)

**What it does:** Reads ALL module YAML files → computes ALL connections from journey steps → writes compiled index.

**Algorithm:**
```
1. loadAllModules(modulesDir)
   → reads every .yaml file in modules/
   → parses YAML (surfaces errors, never silently swallows)
   → returns Map<moduleName, ModuleFile>

2. collectNodes(modules)
   → extracts all nodes across all modules
   → detects duplicate names → ERROR
   → returns Record<fullName, CompiledNode>

3. resolveJourneys(modules, nodes)
   → for each journey step, resolves node reference:
     "KeyManager" → "identity/KeyManager" (same module)
     "ledger/WalletStore" → "ledger/WalletStore" (cross-module)
     "pando-identity/LoginService" → external ref (📋 validate against published interface)
   → detects dangling refs (node doesn't exist) → ERROR
   → returns CompiledJourney[]

4. computeConnections(journeys, nodes)
   → for each journey:
     step[i] → step[i+1] = connection
     node.preceded_by.push(prev step's node)
     node.followed_by.push(next step's node)
     if different modules → cross_module_connections
     if first actor → triggered_by_actors
     node.in_journeys.push("JourneyName (step N)")

5. validate(nodes)
   → orphan nodes (not in any journey) → WARNING
   → process nodes without files: field → WARNING
   → code files that don't exist on disk → WARNING

6. Return { index, issues, coverage }
```

**Per compiled node:**
```typescript
export interface CompiledNode {
  module: string;
  type: string;
  description: string;
  preceded_by: string[];              // nodes before this in journeys
  followed_by: string[];              // nodes after this in journeys
  in_journeys: string[];              // "JourneyName (step N)"
  triggered_by_actors: string[];      // actors that start journeys containing this
  cross_module_connections: string[];  // nodes in other modules adjacent in journeys
  referenced_in_modules: string[];    // which modules reference this node
  properties?: Record<string, unknown>;
  files?: string[];
}
```

**Validation rules:**

| Check | Type | Action |
|-------|------|--------|
| Duplicate node name across modules | ERROR | Reject |
| Journey step → non-existent node | ERROR | Reject |
| YAML parse failure | ERROR | Surface error with line number |
| Orphan node (not in any journey) | WARNING | Show in excerpt |
| Isolated module (no cross-module steps) | WARNING | Show in excerpt |
| Process node without files: field | WARNING | Show in excerpt |
| Code file doesn't exist on disk | WARNING | Show in excerpt |

### 5.2 excerpt.ts — Smart Context ✅ TESTED

**What it does:** Takes compiled index + focus module → generates ~200 lines of context for an agent.

**Algorithm:**
```
1. Module status: node count by type, journey count, connection count
2. Your nodes: each node with journey count and connection count
3. Your journeys: brief flow (persona → node → node → ...)
4. Cross-module connections:
   - BEFORE YOU: other modules' nodes that precede yours in journeys
   - AFTER YOU: other modules' nodes that follow yours in journeys
5. Triggered by: which actors start journeys through this module
6. Warnings/errors for this module
7. All modules overview (name, nodes, journeys, cross-module count)
8. Global stats
9. Spec sections (if provided)
10. The module's YAML file content
```

**Example output:**
```
ROUND 5 — Focus: identity

YOUR NODES:
  KeyManager (process) — in 4 journeys, 6 connections, code: exists ✓
  JWTService (process) — in 6 journeys, 8 connections, code: exists ✓

YOUR JOURNEYS:
  RegisterAccount: AnonymousUser → KeyManager → JWTService → ledger/WalletStore
  RotateKeys: RegisteredUser → KeyManager → JWTService

CROSS-MODULE:
  BEFORE YOU: _actors/AnonymousUser, gateway/Doorman
  AFTER YOU: ledger/WalletStore, web/Dashboard

TRIGGERED BY: AnonymousUser, RegisteredUser
WARNINGS: 0
GLOBAL: 166 nodes, 80 journeys, 387 connections, 0 duplicates

YOUR MODULE FILE (identity.yaml):
```yaml
[file contents]
```
```

### 5.3 publish.ts — Published Interface 📋 PLANNED

**What it does:** After each compile, auto-generates `published/interface.yaml` and `published/changelog.yaml`.

**Algorithm:**
```
1. Read compiled index
2. For each node:
   - Add to "provides" list with type, description, journey count
3. Scan all journey steps for external references (project/NodeName)
   - Add to "requires" list
4. Compute hash of the provides + requires content
5. If hash differs from previous → generate changelog:
   - Diff previous interface vs current
   - For each change: node name, type (added/modified/removed), what changed, impact
6. Write published/interface.yaml
7. Write published/changelog.yaml
```

**Output format:**
```yaml
# published/interface.yaml
engine: identity
version_hash: sha256:abc123

provides:
  KeyManager:
    type: process
    description: Generates Ed25519 keypairs
    in_journeys: 4
  JWTService:
    type: process
    description: Issues JWT tokens
    in_journeys: 6

requires:
  ledger/WalletStore: "RegisterAccount step 4"

# published/changelog.yaml
previous_hash: sha256:old
current_hash: sha256:new
changes:
  - node: JWTService
    type: modified
    field: requires_2fa
    was: false
    now: true
    impact: "All dependents calling JWTService must handle 2FA"
```

### 5.4 sync.ts — Cross-Engine/Project Sync 📋 PLANNED

**What it does:** Checks if any dependency's published interface has changed. If yes, marks affected modules stale.

**Algorithm:**
```
1. Read genome/dependencies.yaml
   → list of external dependencies with pinned hashes

2. For each dependency:
   a. Read the dependency's published/interface.yaml
      (file path: resolved from dependency name → known directory structure)
   b. Compare current hash vs pinned hash (or vs last-seen hash if pin: latest)
   c. If hash changed:
      - Read the dependency's published/changelog.yaml
      - Find which of OUR journey steps reference the dependency's nodes
      - Mark those modules stale
      - Return list: { dependency, changed_nodes, affected_modules, changelog }

3. For "pin: latest" dependencies:
   - Update the stored hash to the new one
   - Trigger reconvergence on affected modules

4. For "pin: sha256:XXX" dependencies:
   - Do NOT update hash (stay on pinned version)
   - If alert_on_update: true → add to alerts list
   - Project keeps running on pinned version

5. If dependency's interface is missing (project removed):
   - If fallback: last_known_good → keep using cached interface
   - Add CRITICAL alert: "dependency X is unavailable"
```

**How the runner calls this:**
```
Every 60 seconds (configurable):
  changes = sync.checkDependencies(dependenciesPath, publishedDir)
  if changes.length > 0:
    for each change:
      mark affected modules stale in modules/ (add _stale: true)
    wake convergence.ts (trigger reconvergence loop)
```

### 5.5 testgen.ts — Journey-to-Test Generation 📋 PLANNED

**What it does:** Reads compiled journeys → generates test skeleton files.

**Algorithm:**
```
1. Read compiled index (all journeys)
2. For each journey:
   a. Create test file: test/journeys/{journeyName}.test.ts
   b. For each step:
      - Generate: it("step {N}: {nodeName} {action}", () => { /* TODO */ })
   c. If the step's node has files: field:
      - Add import for the implementation file
      - Add comment: "// Implementation: {filePath}"
3. Write all test files
```

**Output example:**
```typescript
// test/journeys/RegisterAccount.test.ts
// Auto-generated from journey: RegisterAccount
import { describe, it, expect } from 'vitest';

describe("RegisterAccount", () => {
  it("step 1: _actors/AnonymousUser clicks Create Account", () => {
    // TODO: agent fills assertion
  });

  it("step 2: identity/KeyManager generates Ed25519 keypair", () => {
    // Implementation: src/identity/KeyManager.ts
    // TODO: agent fills assertion
  });

  it("step 3: identity/JWTService issues access + refresh tokens", () => {
    // Implementation: src/identity/JWTService.ts
    // TODO: agent fills assertion
  });

  it("step 4: ledger/WalletStore creates Lux wallet", () => {
    // Implementation: src/ledger/WalletStore.ts
    // TODO: agent fills assertion
  });
});
```

**Agent fills assertions by:** reading the journey step description + the implementation code → writing meaningful expects.

### 5.6 cli.ts — Entry Point ✅ EXISTS (needs more commands)

**Commands:**
```
genome compile <modules-dir>                    ✅ exists
genome excerpt <modules-dir> <module> [round]   ✅ exists
genome status <modules-dir>                     ✅ exists
genome publish <modules-dir>                    📋 planned (calls publish.ts)
genome test-gen <modules-dir>                   📋 planned (calls testgen.ts)
genome check-deps <modules-dir>                 📋 planned (calls sync.ts)
```

---

## 6. The Convergence Pipeline — How Genome Runs a Project

This is the COMPLETE pipeline. convergence.ts IS the orchestrator (code). It calls Claude agents (LLM) only for creative work. Every step is marked CODE or LLM so you know exactly what runs where.

### The core insight: 80% code, 20% LLM ✅ PROVEN

When we tested genome, the orchestration was done by a human (Claude Code session) manually. It worked because:
- CODE decisions: compile, pick thinnest module, rotate lens, generate excerpt, check convergence
- LLM decisions: "given this excerpt and this lens, what actors/nodes/journeys are missing?"

When we tried replacing the human orchestrator with a single LLM agent (Lead), it failed 5 times because:
- The LLM skipped compilation between writes
- The LLM didn't spawn fresh sub-agents (did everything in one context)
- The LLM stopped at structural convergence (no enforcement)
- The LLM forgot steps because it was managing too many things

**The fix: convergence.ts is CODE that runs the loop. LLM is a WORKER called at specific points.**

### LLM Communication Protocol ✅ PROVEN (stream-json from crew3)

convergence.ts communicates with Claude Code using the **stream-json protocol** — the same proven approach from crew3. NOT `--print` mode, NOT the Anthropic API SDK, NOT spawning one-shot CLI processes.

**Architecture:**
```
convergence.ts (CODE orchestrator)
  └── llm.ts (LLMWorker class)
        └── Claude Code process (persistent, stream-json protocol)
              └── Uses native tools: Read, Write, Edit, Bash
```

**How it works:**
1. `LLMWorker` spawns ONE persistent Claude Code process using:
   ```
   claude -p --verbose --input-format stream-json --output-format stream-json
          --dangerously-skip-permissions --model sonnet
          --append-system-prompt "..."
   ```
2. Prompts are sent via NDJSON on stdin:
   ```json
   {"type":"user","message":{"role":"user","content":"Write this YAML file..."}}\n
   ```
3. Claude Code processes the request using its native tools (Write for files, Read for reading)
4. A `{"type":"result",...}` message on stdout signals the response is complete
5. convergence.ts reads the files the worker wrote, compiles, continues pipeline

**Why this approach (not alternatives):**

| Approach | Problem |
|----------|---------|
| `claude --print` (one-shot) | Can't write files. Returns text, not tool actions. Needs YAML extraction regex hacks. |
| Anthropic API SDK | Requires API key (separate from Claude Code subscription). No tool access. |
| Spawning new process per call | Slow (process spawn overhead). No session reuse. |
| **stream-json (persistent)** ✅ | Worker uses native tools. Writes files properly. Session persists across calls. Proven in crew3. |

**Key rules for workers:**
- Workers write files using Claude Code's Write tool — code never extracts YAML from text
- Workers respond to audit questions with plain text — code parses the text
- System prompt tells worker the YAML format (node:/action: step structure)
- **ALWAYS use Claude Opus 4.6** (1M token context). Never downgrade to smaller models.
- **DO NOT manage context manually.** Claude Code handles its own context compaction. No session reset limits. The persistent process lives until explicitly killed.
- 10-minute timeout per call, process killed and respawned if exceeded

**The YAML format workers must follow:**
```yaml
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
```

Each journey step MUST have `node:` and `action:` fields. Flat string steps (without these fields) are silently skipped by the compiler and produce 0 connections.

### The pipeline (step by step)

```
HUMAN RUNS: genome converge /path/to/project

═══ STEP 1 — Organization (LLM call) ═══

  CODE: reads spec.md
  LLM CALL: "Read this spec. Answer:
    1. What is this project's scope?
    2. What parts are architecturally independent?
    3. What modules are needed?
    4. What's the dependency order?
    Write ORGANIZATION.md."
  CODE: reads ORGANIZATION.md → extracts module list + dependency order
  CODE: if ORGANIZATION.md doesn't exist → error, stop

═══ STEP 2 — Actor discovery (3 LLM calls, sequential) ═══

  LLM CALL 1: "Read spec. Find all actors from ACTIVITIES angle.
    Who uses, contributes, operates, creates, governs, visits, attacks?
    Output: list of actors with descriptions."

  LLM CALL 2: "Read spec. Here's what Round 1 found: [paste result 1].
    From THREATS angle: what actors are MISSING?
    Attackers, abusers, failure scenarios, legal/compliance."

  LLM CALL 3: "Read spec. Here's Rounds 1+2: [paste both].
    From LIFECYCLE angle: what's STILL MISSING?
    First visit, onboarding, power use, decline, exit, return."

  CODE: merge all 3 results → deduplicate → write _actors.yaml
  CODE: compile() → verify 0 errors

═══ STEP 3 — Module creation (1 LLM call per module, in dependency order) ═══

  CODE: read ORGANIZATION.md → get module list in dependency order

  For each module (foundational first):
    CODE: compile() → generate excerpt showing everything that exists so far

    LLM CALL: "Here's the current compiled state (excerpt):
      {excerpt}

      Here are the relevant spec sections:
      {spec sections for this module}

      Create {module}.yaml with:
      - Nodes (process, artifact, interface, rule types)
      - Journeys (actors + nodes + steps TOGETHER)
      - Cross-module references to existing modules (use module/NodeName)
      - Be GRANULAR — every system action is a separate step

      DO NOT create actors (they're in _actors.yaml — reference as _actors/Name).
      DO NOT duplicate nodes that already exist (check the excerpt)."

    CODE: compile() → check errors → if errors, ask LLM to fix → compile again
    CODE: next module (it sees everything before it in the excerpt)

═══ STEP 4 — Convergence loop (1 LLM call per round) ═══

  CODE: lenses = [happy, failure, threat, edge, scale, completeness, simplicity, consistency]
  CODE: round = 0, previousStats = null

  while true:
    CODE: stats = compile()
    CODE: thinnest = module with fewest journeys relative to spec_sections count
    CODE: lens = lenses[round % lenses.length]
    CODE: excerpt = generateExcerpt(thinnest)

    LLM CALL: "Current state (excerpt for {thinnest} module):
      {excerpt}

      Lens: {lens}

      From the {lens} perspective: what actors, nodes, and journeys are MISSING?
      Add them to {thinnest}.yaml.
      Actors + nodes + journeys can all be added in the same pass.
      Be GRANULAR — every system action is a step."

    CODE: newStats = compile()
    CODE: delta = newStats.nodes - stats.nodes + newStats.journeys - stats.journeys

    if delta == 0 for 3 consecutive rounds:
      → DEPTH CHECK (see below)

    round++

═══ STEP 4b — Depth check (3 LLM calls) ═══

  When activity stops, verify coverage is actually complete:

  LLM CALL (Auditor 1 — spec coverage):
    "Read the spec. Read all module files.
     For EACH spec section: count bullets vs journeys.
     Which sections have thin coverage? Which bullets have no journey?"

  LLM CALL (Auditor 2 — actor coverage):
    "Read _actors.yaml and all module files.
     For EACH actor: how many journeys involve them?
     For EACH threat actor: attack journey AND defense journey exist?
     Which actors have 0 journeys?"

  LLM CALL (Auditor 3 — cross-module coverage):
    "Read compiled stats and all module files.
     For EACH module: cross-module connection count?
     Which module pairs SHOULD connect but don't?
     Any isolated modules?"

  CODE: if all 3 auditors return nothing → CONVERGED
  CODE: if any find gaps → feed gaps into next convergence round → continue loop

═══ STEP 5 — Publish ═══

  CODE: publishInterface() → writes published/interface.yaml + changelog.yaml

═══ STEP 6 — Code generation (1 LLM call per process node) ═══

  CODE: generate code skeletons (codegen.ts) for all process nodes with files: field

  For each skeleton:
    LLM CALL: "Here's the journey context for {NodeName}:
      - Used in journeys: {list}
      - Preceded by: {nodes}
      - Followed by: {nodes}
      - Properties: {properties}
      Fill in the implementation. The class structure is already generated."

  CODE: generate test skeletons (testgen.ts) from all journeys

  For each test skeleton:
    LLM CALL: "Here's the journey step and the code implementation.
      Fill in meaningful test assertions."

  CODE: run all tests

  For each failure:
    LLM CALL: "This test fails: {error}. Fix the code."
    CODE: rerun tests → repeat until all pass

═══ DONE ═══

  Project is planned (nodes + journeys), coded (implementations), and tested (from journeys).
  Runner watches for spec changes or dependency changes → reconverge if needed.
```

### What CODE decides vs what LLM decides

| Decision | Who | Why |
|----------|-----|-----|
| Which module to work on | CODE | Sort by journey count — mechanical |
| Which lens to use | CODE | Rotate through list — mechanical |
| When to compile | CODE | After every write — mechanical |
| Whether to continue or stop | CODE | 3-level convergence check — mechanical |
| What excerpt to show | CODE | excerpt.ts — mechanical |
| When to do depth check | CODE | Activity stopped for 3 rounds — mechanical |
| | | |
| What actors exist | LLM | Requires reading spec, understanding domain |
| What journeys are missing | LLM | Requires creative thinking about flows |
| What nodes to create | LLM | Requires understanding what the journey needs |
| Whether coverage is adequate | LLM | Requires reading spec + modules + judging gaps |
| How to implement code | LLM | Requires writing actual code |
| How to fix a failing test | LLM | Requires debugging |

**CODE orchestrates. LLM creates. The LLM never decides WHEN to act — the code does. The LLM only decides WHAT to create when asked.**

### For hierarchy (big projects) ✅ UPDATED

The pipeline order for hierarchy:
1. Parent reads spec → writes ORGANIZATION.md
2. Parent discovers ALL actors (3 rounds) → writes `_actors.yaml`
3. Parent asks LLM: "should we split?" based on architectural independence (NOT a hardcoded module count)
4. If split: parent creates child directories, copies SHARED `_actors.yaml` to each child
5. Each child skips actor discovery (actors already exist), creates its modules, converges
6. Parent waits for all children, validates interfaces

**Actors are shared.** The parent discovers actors ONCE. All children get the SAME `_actors.yaml`. "User" is one actor everywhere. No duplicates.

**Split decision is LLM-based.** No hardcoded thresholds. The LLM decides based on: "could this part be its own package/service/standalone tool?" A 3-module todo app stays flat. A 15-module platform splits into 3 engines.

```
convergence.ts (parent/Director):
  Step 1 → org says "11 modules needed"
  Step 2 → discovers 41 actors (shared across all children)
  Step 2b → LLM says "split into 3 engines"

  Creates child directories with:
    - SCOPED spec.md (CODE parses sections by ## headings, matches module keywords)
    - SHARED _actors.yaml (same actors everywhere, no duplicates)
    - Scoped ORGANIZATION.md (only this child's modules in backtick names)

  Spawns convergence.ts for each child engine (--once --depth N+1)

  Each child sees ONLY its relevant spec sections (not the full 50K)
  Each child skips Step 2 (actors exist), runs Steps 3-6
  Each child publishes interface when done
  External refs to sibling engines:
    - At child compile time (no interfaces loaded): treated as WARNINGS (not errors)
    - At parent compile time (interfaces loaded): validated against published interfaces (errors if not found)

  Parent watches all 3 published interfaces
  Parent maintains cross-engine journeys (its own "modules" are the interfaces)
  Parent detects conflicts → tells affected child to reconverge
```

Same code at every level. Parent's scope = children's interfaces. Children's scope = their YAML modules.

### For cross-project (network)

Same mechanism. Each project runs convergence.ts. Published interfaces connect projects. Runner watches dependency hashes. Changes cascade through any chain.

### Why fresh LLM calls matter ✅ PROVEN

| Approach | Result |
|----------|--------|
| One LLM session doing everything | 155 nodes (satisficed, stopped early) |
| Fresh LLM call per task | 300 nodes, 397 journeys, 1041 connections |
| 3 fresh calls from 3 angles | 130 actors found (spec listed ~20) |

Each fresh call has clean context — no anchoring to previous decisions, no stale memory. The code ensures freshness by spawning a new call each round.

---

## 7. Lifecycle — Sleep / Watch / Reconverge (Step 7) ✅ BUILT

### What it does

convergence.ts manages its own lifecycle. No separate runner.ts needed. After convergence (Steps 1-6), it enters a watch loop:

```
converge → publish → sleep → watch dependencies every 60s → detect change → wake → reconverge → publish → sleep → ...
```

### How it works (built into convergence.ts)

```
Step 7 (after convergence):
  1. Write convergence-state.json: { status: "sleeping", stats, interface_hash }
  2. Enter watch loop (every 60 seconds):
     a. checkDependencies() — reads dependencies.yaml, compares sibling hashes
     b. If hash changed:
        - Log which dependency changed and what modules are affected
        - markModulesStale() — adds _stale: true to affected YAML files
        - Re-enter convergence loop (Step 4) with stale modules
        - Re-publish when reconverged
     c. If local files changed (external edit):
        - Re-compile, re-publish with new hash
     d. If nothing changed: continue sleeping
```

### When to use --once

For testing or one-shot builds, pass `--once` to exit after first convergence instead of entering the watch loop:
```
npx tsx src/convergence.ts /path/to/project --once
```

### runner.ts (DEPRECATED)

The old runner.ts used `--print` mode and Lead agents — incompatible with convergence.ts.
It has been deprecated. convergence.ts handles everything itself.

---

## 8. Worker Agent Prompts

convergence.ts spawns fresh LLM calls for each task. Each call gets a SPECIFIC prompt. The worker doesn't need to know the pipeline — it just answers one question.

### Prompt templates used by convergence.ts

**Organization (Step 1):**
```
Read the spec at {specPath}. Answer:
1. What is this project's scope?
2. What parts are architecturally independent (could stand alone)?
3. What modules are needed?
4. What's the dependency order (what depends on what)?
Write your answers to {orgPath}.
```

**Actor discovery (Step 2, 3 calls):**
```
Call 1: "Read spec at {specPath}. Find all actors from ACTIVITIES angle."
Call 2: "Read spec. Here's Round 1: {result1}. From THREATS angle — what's MISSING?"
Call 3: "Read spec. Here's Rounds 1+2: {result12}. From LIFECYCLE angle — what's MISSING?"
```

**Module creation (Step 3, per module):**
```
Here's the compiled state: {excerpt}
Here are the spec sections for {module}: {specSections}
Create {module}.yaml with nodes + journeys.
Reference existing modules with module/NodeName.
Reference actors with _actors/Name.
Be GRANULAR — every system action is a step.
```

**Convergence round (Step 4, per round):**
```
Current state: {excerpt}
Lens: {lens}
From the {lens} perspective — what actors, nodes, journeys are MISSING?
```

**Depth audit (Step 4b, 3 calls):**
```
Auditor 1: "Read spec + all modules. Per section: count bullets vs journeys. What's thin?"
Auditor 2: "Read actors + all modules. Per actor: journey count? Threats have attack+defense?"
Auditor 3: "Read compiled stats + modules. Per module: cross-module connections? Missing links?"
```

**Code implementation (Step 6, per node):**
```
Journey context: used in {journeys}, preceded by {nodes}, followed by {nodes}.
Properties: {properties}.
Fill in the implementation for {NodeName}.
```

Each prompt is SCOPED. The worker does ONE thing. convergence.ts handles the rest.

---

## 9. Multi-Angle Technique ✅ PROVEN (3x more findings)

The convergence pipeline uses this technique throughout: fresh LLM calls from different angles, each seeing previous results.

**Step 2** uses it: 3 calls for actor discovery (activities → threats → lifecycle).
**Step 4** uses it: rotating lenses each round (happy → failure → threat → edge → scale → completeness).
**Step 4b** uses it: 3 auditors from 3 angles for depth check.

**Why it works:** One brain has blind spots. Fresh calls from different angles find what one brain misses. Each call sees previous results and goes deeper.

**Evidence:** One agent alone = 155 nodes. 3 fresh calls from 3 angles = 934 raw findings. 3x more.

**Also used for:** auditing (5 angles: feasibility, simplicity, user, failure, prior art), code review, any task where completeness matters.

---

## 10. What Code Does vs What LLM Does ✅ CLEARLY DEFINED

**convergence.ts (CODE — the orchestrator):**
- Runs the pipeline loop (Steps 1-6)
- Calls compile() between every write
- Picks thinnest module (sort by journey count)
- Picks next lens (rotate through list)
- Generates excerpt for each worker
- Checks convergence (3 levels from compile output)
- Spawns fresh LLM calls for creative work
- Enforces the process (can't skip steps, can't stop early)

**Fresh LLM calls (WORKERS — called by convergence.ts):**
- "What actors exist?" (creative — reads spec, understands domain)
- "What journeys are missing?" (creative — reads excerpt + lens, thinks about gaps)
- "Fill in this code implementation" (creative — reads journey context, writes code)
- "Fix this failing test" (creative — reads error, debugs)

**The LLM never decides WHEN to act. The CODE decides. The LLM only decides WHAT to create when asked.**

---

## 11. Hierarchy — Same Box at Every Level

### The box = convergence.ts process

Every level of hierarchy runs the SAME code (convergence.ts). The difference is SCOPE — what its modules contain and what it watches.

```
convergence.ts (top — decides organization, watches all children)
  ├── convergence.ts (identity — runs pipeline on identity modules)
  ├── convergence.ts (code-tool — runs pipeline on code-tool modules)
  └── convergence.ts (network — runs pipeline on network modules)
        ├── convergence.ts (p2p — if network is split further)
        └── convergence.ts (hosting)
```

**Unlimited depth.** Each box is the same: code loop + LLM workers + compile + publish.

### What each scope level does

| Scope | Its modules contain | It watches | It publishes |
|-------|-------------------|------------|-------------|
| **Top** | Cross-engine journeys (referencing children's interfaces) | All children's interfaces | Top-level interface |
| **Division** | Domain module files (identity.yaml, gateway.yaml) | Parent + sibling interfaces | Division interface |
| **Module** | One module's files | Parent interface | Module interface |

### How cross-box connections work (at any time, any scale)

A box does not need to be in the same compile to create connections. It reads published interfaces of other boxes and references their nodes in journeys. compile() validates. Changes propagate via hash watching.

This works for: new projects, existing projects adding deps, projects connecting months later, planning at ANY stage.

The mechanism:
1. Box reads published interfaces of dependencies
2. LLM worker creates journeys referencing those interfaces
3. compile() validates references exist
4. Box publishes its own interface
5. Changes propagate via hash watching

No special plan-together phase required. Speed optimization for new projects: run all modules in ONE box first, then split for deepening.

### Who decides when to split?

convergence.ts CODE decides:
1. Phase A runs until structural convergence (all modules planned, cross-module journeys exist)
2. If org decision says "independent domains" AND node count > threshold → split into Phase B
3. Each child convergence.ts deepens independently
4. Parent watches children's interfaces

**No LLM manages the split.** The code reads ORGANIZATION.md and compile stats. If domains are independent and the project is large enough → split. Otherwise → stay as single box.

### The parent's role after split

The parent convergence.ts:
- Maintains its OWN modules with cross-engine journeys
- Watches all children's published interfaces (hash checking)
- If child A's interface changes → parent checks if child B references A's nodes → signals B to reconverge
- Catches conflicts that no single child can see

---

## 12. Cross-Engine Sync ✅ MECHANISM DESIGNED, 📋 CODE NOT BUILT

### Three levels of sync

**Level 1: Within one engine** ✅ TESTED
Node changes → engine recompiles → connections update → excerpt shows changes.

**Level 2: Direct dependencies** 📋 PLANNED
```
Box A compiles → interface.yaml updates (new hash)
Box B depends on A → B's runner detects hash change
→ B's convergence.ts wakes → marks affected modules stale → reconverges → sleeps
→ B's interface updates → cascade continues to any box depending on B
```

**Level 3: Parent catches cross-cutting conflicts** 📋 PLANNED
Parent convergence.ts watches ALL children's interfaces. Detects conflicts between children that don't directly depend on each other. Signals affected child to reconverge.

### Dependency removal

Projects keep running on LAST KNOWN WORKING version. Nothing crashes. Owner alerted. Graceful degradation.

---

## 13. Journey-to-Test Generation 📋 PLANNED

Engine generates test skeletons → agents fill assertions → code must pass.

Journey changes → skeleton regenerates → agent updates assertions → code must pass new test. Always in sync.

See Section 5.5 for algorithm and output format.

---

## 14. Genome Self-Modification 📋 PLANNED

Any agent who finds a limitation:
```
1. git checkout -b fix-description
2. Edit genome code
3. npx vitest run → all tests pass + new test for the fix
4. git merge
5. All engines benefit on next restart
```

If tests fail → discard branch → no damage. Runner falls back to previous version if restart fails.

---

## 15. Operational Details ✅ FROM REAL TESTING

### Module creation order matters
Foundational first: identity → gateway → ledger → code → ...
Each module sees previously-compiled modules via excerpt.

### Independent modules can batch
If modules don't reference each other: write in parallel.
But ALL must reference only previously-compiled modules.

### YAML gotcha: colons in action strings
```yaml
BAD:  action: issues warning — "flagged for: [reason]"
GOOD: action: issues warning with 24-hour deadline
```

### Round 1 = skeleton
First round creates ALL modules with basic journeys (~5-6 each). Deep multi-angle discovery starts Round 2+.

### Granular nodes = better context ✅ PROVEN
Every system action is its own node. More nodes = more connections = richer excerpts. "RegisterAccount" as 1 node gives 1 connection. As 6 steps gives 15+ connections.

### Brainstorm sequentially, write sequentially
Each brainstorm round SEES what previous rounds found → goes deeper. Each module write SEES what previous modules have → no duplicates. Engine in the loop at every step.

---

## 16. Engine Source Structure — ALL BUILT ✅

```
genome8/
  src/
    types.ts          ✅ universal types (actor, process, artifact, interface, rule)
    compile.ts        ✅ 14 tests — connections from journeys + external ref validation
    excerpt.ts        ✅ smart excerpt generation (~200 lines)
    publish.ts        ✅ 5 tests — interface.yaml + changelog.yaml generation
    sync.ts           ✅ cross-engine hash checking + staleness detection
    testgen.ts        ✅ 3 tests — test skeletons from journeys
    codegen.ts        ✅ 2 tests — code skeletons from journey graph
    cli.ts            ✅ commands: compile, excerpt, status, publish, test-gen
    convergence.ts    ✅ THE ORCHESTRATOR — runs complete pipeline (compile → LLM → convergence check)
    llm.ts            ✅ LLMWorker class — stream-json protocol, persistent Claude Code process
    runner.ts.deprecated  ❌ DEPRECATED — used old --print mode, incompatible with convergence.ts
  test/
    compile.test.ts       ✅ 14 tests (journey compilation + external refs)
    publish.test.ts       ✅ 5 tests (interface generation + changelog)
    testgen.test.ts       ✅ 3 tests (test skeleton generation)
    codegen.test.ts       ✅ 2 tests (code skeleton generation)
    integration.test.ts   ✅ 4 tests (full pipeline on todo-app)
    pando9.test.ts        ✅ 1 test (Pando compile)
    pando9-publish.test.ts ✅ 1 test (Pando interface publish)
    multi-engine.test.ts  ✅ 4 tests (engine split + interface + change detection)
    director.test.ts      ✅ 2 tests (cross-engine journey validation)
    cross-project.test.ts ✅ 2 tests (car-game depends on pando9)
  BLUEPRINT.md          this file
  GOALPOST.md           the vision
  LEAD-PROMPT.md        the agent prompt
  ROADMAP.md            progress tracking

TOTAL: 39 tests across 11 files. All passing.
```

---

## 17. What's Proven ✅

| Finding | How | Tests |
|---------|-----|-------|
| Journey compilation | 14 unit tests (connections, cross-module, actors, orphans, duplicates, external refs) | 14 |
| Published interface generation | Auto-generated from compiled index. Changelog diffs. | 5 |
| Test skeleton generation | One test per journey step. Actor triggers. Cross-module. | 3 |
| Code skeleton generation | TypeScript classes with journey context, method stubs, properties | 2 |
| Full pipeline on real project | Todo-app: 17 nodes, 9 journeys, 0 errors. Compile+excerpt+publish+testgen. | 4 |
| Multi-engine split | Code-tool extracted to own engine. Both compile. Interfaces connect. | 4 |
| Director cross-engine validation | Director compiles journeys against multiple published interfaces | 2 |
| Cross-project dependency | Car-game depends on pando9. External refs resolve. Change detection works. | 2 |
| Pando9 single-engine convergence | 300 nodes, 397 journeys, 1041 connections. 9 deepening rounds. 3-level convergence. | pando9+experiment |
| ORGANIZATION.md written first | V5 Lead wrote org decision before any modules (first Lead to do this) | experiment |
| Multi-angle finds 3x more | 130 actors from 3 angles vs 20 from spec. 934 use cases vs 155. | experiment |
| Sequential writing = 0 duplicates | Parallel = dupes. Sequential through engine = 0. | experiment |
| One agent > 3 rigid roles | Genome6: 3 agents = 7 use cases. 1 agent asked right question = 59. | experiment |
| Fresh sub-agents > one brain | Lead alone: 155 nodes. Fresh sub-agents: 934 findings. | experiment |
| Stream-json protocol for LLM calls | Persistent Claude Code process with native tools. Worker writes files via Write tool. No YAML extraction hacks. 0 errors on todo app (66+ nodes, 172+ connections). | convergence test 1 |
| **TOTAL** | | **39 tests + convergence experiment** |

## 18. Roadmap — What's Built, What's Next

### ✅ BUILT AND TESTED (46 tests passing)

| Component | What it does | Tests |
|-----------|-------------|-------|
| compile.ts | Connections from journey steps + external ref validation | 14 |
| excerpt.ts | ~200 line smart context per module | integration |
| publish.ts | Published interface + changelog generation | 5 |
| sync.ts | Cross-engine hash checking + staleness detection | integration |
| testgen.ts | Test skeletons from journey steps | 3 |
| codegen.ts | Code skeletons from journey graph | 2 |
| types.ts | Universal types + utility functions | 3 |
| cli.ts | compile, excerpt, status, publish, test-gen commands | integration |
| runner.ts | Spawns process, keeps alive, checks hashes | written, not integration tested |
| Multi-engine split | Code-tool extracted, both compile, interfaces connect | 4 |
| Director cross-engine | Validates journeys against published interfaces | 2 |
| Cross-project sync | Car-game depends on pando9, refs resolve, changes detected | 2 |
| Staleness detection | Hash-based add/remove/modify detection | 3 |
| Full sync chain | Journey change → test → interface → changelog | 1 |
| Self-modification | Agent modified genome code, 0 regressions | 3 |
| Pando9 project | 300 nodes, 397 journeys, 1041 connections, 0 errors | 1+experiment |

### ✅ BUILT — convergence.ts (the orchestrator)

| Component | What it does | Status |
|-----------|-------------|--------|
| **convergence.ts** | The CODE loop: compile → pick module → pick lens → LLM call → compile → check convergence → repeat | BUILT. Uses stream-json protocol via llm.ts. |
| **llm.ts** | LLMWorker class — manages persistent Claude Code process via stream-json protocol | BUILT. Proven on todo app. |

**Test 1+2 results (todo app):** 88 nodes, 120 journeys, 290 connections, 0 errors, 0 warnings. PASSED.

**Test 3 results (Pando hierarchy):** 17 modules → split into 3 engines (pando-code, pando-genome, pando-network) → pando-network split further into 5 grandchildren. 49 shared actors. ~763 nodes, ~284 journeys, ~1293 connections across 7 parallel boxes. RUNNING.

**What's built in convergence.ts:**
- Step 1-6: Complete pipeline (org → actors → modules → convergence → publish → codegen)
- Step 7: Sleep/watch/reconverge cycle — detects dependency changes, re-enters convergence loop
- Hierarchy: LLM-based split (no hardcoded threshold), shared actors, depth limit
- Parent: cross-engine journey creation, sibling dependency files, actor sync
- Change cascade: sync.ts wired into watch loop, stale module marking

### ⬜ REMAINING TESTS

| Item | What it tests | Status |
|------|--------------|--------|
| Test 1+2: Todo app convergence | 0 errors, 15+ nodes | ✅ PASSED (88 nodes, 0 errors) |
| Test 3: Pando hierarchy | Parent splits, children converge, interfaces published | 🔄 RUNNING (~763 nodes across 7 boxes) |
| Test 4: Cross-project cascade | Change in pando → car-game detects → reconverges | ⬜ (sync wired, needs integration test) |
| Test 5: Code generation | convergence.ts runs Step 6 (code from journeys) | ⬜ |
| Test 6: Full E2E | Pando built from spec to running code | ⬜ |

## 19. Lessons Learned (don't repeat)

| Mistake | What happened | Fix |
|---------|-------------|-----|
| LLM as orchestrator | Spawned "Lead agents" to manage the loop. Failed 5 times. Skipped steps, stopped early, didn't spawn sub-agents. | convergence.ts IS the orchestrator (code). LLM is a worker called at specific points. |
| One brain doing everything | Single LLM session found 155 nodes. Fresh calls found 934. | Fresh LLM call per task. No shared context between calls. |
| Structural convergence = done | 0 errors + 0 orphans ≠ complete. A graph can be valid but shallow. | 3-level convergence: structural + activity + depth audit (3 fresh calls). |
| Hardcoding round counts | "Minimum 25 rounds" was a hack. | Convergence check decides. No hardcoded numbers. |
| Parallel writing | Multiple agents writing modules simultaneously → duplicates. | Sequential through engine. Compile between every write. |
| Rushing to test before foundation is solid | Launched 5 Lead versions, each with different issues. | Fix the architecture first. Build convergence.ts. Then test. |
| Scattered documentation | Knowledge in 5+ files. Agents read one and miss the rest. | Blueprint is THE source of truth. Everything in one place. |
| Action bias | Rush to "build it" instead of thinking about what to build. | Think first. Be transparent about what's known vs unknown. Then build. |
| `--print` mode for LLM calls | `claude --print` outputs text only — can't use Write/Edit tools. Led to 5-pattern YAML extraction regex hack, interactive vs print mode toggle, and unreliable file writing. | Use stream-json protocol: persistent Claude Code process with full tool access. Worker writes files via Write tool. Code reads files after. No extraction. |
| Journey steps as flat strings | LLM wrote steps like `- Guest submits form to API` instead of `- node: Guest\n  action: submits form`. Compile saw undefined `step.node`, produced 0 connections. | System prompt must show the exact `node:` + `action:` step format. Compiler guards against undefined refs. |
| Hardcoded split threshold (8 modules) | `if (moduleCount < 8)` was a hack. A project with 5 architecturally independent modules should still split. A project with 10 tightly-coupled modules should not. | LLM decides based on architectural independence: "could this be its own package/service?" No hardcoded numbers. |
| Children discovered actors independently | Each child ran actor discovery separately → duplicate "User" in every box, different descriptions, no sync. | Parent discovers actors FIRST (Step 2), then copies SHARED `_actors.yaml` to all children. After convergence, parent merges all children's actors and redistributes. |
| Parent skipped actor discovery | `runAsParent()` was called from Step 1b, before Step 2 ran. Parent never discovered actors, wrote empty `_actors.yaml` to children. | Moved hierarchy decision to Step 2b (after actor discovery). Parent always has actors before splitting. |
| Generic fallback module names | `extractModuleNames()` fell back to `['identity', 'gateway', 'storage']` when no backtick names found. Every child engine built the same generic modules. | Removed fallback. Exit with error if org has no backtick names. Child org now written with proper `\`backtick-names\`` so extraction works. |
| Actor bubbling was a stub | Code found new actors in children but never merged or redistributed. Just logged and moved on. | Parent now calls LLM to merge all actors from all children, writes merged file, redistributes to all children. |
| runner.ts incompatible | runner.ts used `--print` mode and spawned Lead agents. Completely incompatible with convergence.ts stream-json protocol. | Deprecated runner.ts. convergence.ts handles its own lifecycle (Step 7 sleep/watch/reconverge). |
