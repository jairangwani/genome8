# Genome8 — The Context Protocol

> This is genome8's own spec. Genome managing itself.
> convergence.ts reads this to build genome8's context graph.

## 1. What is Genome8?

A protocol that solves the context problem for any complex system. No single brain can hold all context of a large system. Genome breaks it into scoped pieces (boxes), deeply maps how pieces connect (journeys), and keeps everything in sync when things change (ripple).

## 2. Core Concepts

### Nodes (5 universal types)
Everything in any system can be described as one of 5 types:
- **Actor**: who does things (User, Agent, Attacker, NodeOperator)
- **Process**: something that happens (Compile, Converge, Publish)
- **Artifact**: something that exists (ModuleFile, CompiledIndex, PublishedInterface)
- **Interface**: something users interact with (CLI, StreamJSON, EventFile)
- **Rule**: something that governs (ConvergenceCheck, OscillationCooldown, LensRelevance)

### Journeys
A journey is a use case. Consecutive steps are connections. Steps are test cases.
Each step has `node:` (what) and `action:` (what happens).
Journeys connect nodes into a living graph.

### Published Interfaces
Each box publishes what it provides. Other boxes reference these.
Hash-based change detection. Event-driven ripple on change.

### Convergence — Event-Driven, Not Batch

Every box is sleeping. Always. A box wakes ONLY when something it cares about changes:
1. **Spec changed** → diff old vs new → identify affected modules → update only those → compile → audit → update code → test → sleep
2. **Code changed** → reconcile changed file with graph → update one module → compile → sleep
3. **Dependency published** → check which modules reference it → update only those → compile → sleep

After ANY wake-up: did my interface change? If yes → publish → write event → dependents wake. If no → sleep. Ripple stops when no interface changes.

There is NO batch mode. There is NO "run everything." The first run bootstraps (everything is new). Every subsequent action is targeted to the change that triggered it. Zero wasted work.

Creation is bounded (modules × relevant lenses). Not an infinite loop.
Compile convergence is CODE (0 errors). Instant.
Audit checks coverage from 4 angles (spec, actors, cross-module, goals).

### Hierarchy
Same convergence.ts at every level. Parent splits into children.
Each child gets scoped spec + shared actors. Children converge independently.
Parent creates cross-engine journeys connecting children's interfaces.

## 3. The Engine (what genome8 IS)

### compile.ts
Reads YAML modules. Computes connections from journey steps.
Validates: duplicates, dangling refs, YAML errors, orphans, isolated modules.
External refs to sibling engines = warnings (parent validates later).

### excerpt.ts
Generates ~200 lines of focused context per module.
Shows: your nodes, your journeys, cross-module connections, actors, warnings.

### convergence.ts
THE PRODUCT. The orchestrator. Lifecycle:

**First run (bootstrap):**
Step 0: Scaffolding (detect language, create config files)
Step 1: Organization (LLM reads spec, writes org)
Step 1b: Goal extraction (derive goals from spec as rule nodes)
Step 2: Actor discovery (3 angles: activities, threats, lifecycle)
Step 2b: Hierarchy decision (LLM-based, split if needed)
Step 3: Module creation (1 LLM call per module, compile between each)
Step 4a: Creation passes (modules × relevant lenses, early termination)
Step 4b: Compile convergence (0 errors)
Step 4c: Audit (4 auditors: spec, actors, cross-module, goals)
Step 4d: Code-to-graph sync (reconcile existing code with graph)
Step 5: Publish interface + write event file
Step 6a: Code generation (Mode 1: new code from graph, Mode 2: update existing)
Step 6b: Journey tests (generate, fill, run, feedback loop on failures)
Step 7: Sleep. Watch spec.md + src/ files + dependency events. Zero cost at rest.
        Wake on ANY change. Process ONLY the change. Sleep again.

**On spec change (targeted):**
→ Wake → diff spec → identify affected modules → run Steps 4a-6b on ONLY those → publish if changed → sleep

**On code change (reconcile):**
→ Wake → reconcile changed file → update graph → compile → sleep

**On dependency event (ripple):**
→ Wake → find affected modules → targeted reconvergence → publish if changed → sleep

### llm.ts
LLMWorker class. Persistent Claude Code process via stream-json protocol.
Worker uses native tools (Read, Write, Edit, Bash). No --print mode.
Always Opus 4.6 (1M context). No session management — Claude handles compaction.

### publish.ts
Generates interface.yaml (what this box provides) + changelog.yaml (what changed).
Full SHA256 hash. Event file written after publish.

### sync.ts
Checks dependency hashes. Finds affected modules. Marks stale.
Used by Step 7 event handler for targeted reconvergence.

### testgen.ts + codegen.ts
Generate TypeScript skeletons from journey graph.
LLM fills implementations and test assertions.

## 4. Actors

- **ProjectOwner**: describes a project via spec.md, triggers convergence
- **LLMWorker**: Claude Code process that creates content when asked
- **Compiler**: code that validates the graph (compile.ts)
- **Auditor**: LLM that checks coverage from a specific angle
- **ParentEngine**: convergence.ts that splits into children and validates cross-engine
- **ChildEngine**: convergence.ts running at a scoped level
- **DependentBox**: box that watches another box's events for changes
- **HumanDeveloper**: person who reads/edits modules or spec

## 5. Key Journeys

### ProjectConvergence
ProjectOwner writes spec.md → convergence.ts reads it → writes ORGANIZATION.md → discovers actors → creates modules → LLMWorker fills each module from relevant lenses → Compiler validates (0 errors) → Auditor checks coverage → fixes gaps → Publish interface → write event

### HierarchySplit
convergence.ts reads org → finds many independent modules → LLMWorker decides split → creates child directories with scoped specs + shared actors → spawns ChildEngine processes → waits for all → collects interfaces → creates cross-engine journeys → validates → publishes parent interface

### EventDrivenRipple
ChildEngine changes → publishes new interface → writes event file → DependentBox's fs.watch detects event → reads event → marks stale modules → targeted reconvergence (compile + audit, skip creation) → re-publishes → writes its own event → ripple continues

### DepthAudit
Compiler says 0 errors → Auditor 1 checks spec coverage → Auditor 2 checks actor coverage → Auditor 3 checks cross-module coverage → if gaps found: targeted fix → re-compile → re-audit → if no gaps: CONVERGED

### CodeGeneration
convergence.ts converged → codegen.ts generates TypeScript skeletons → LLMWorker fills implementations → testgen.ts generates test skeletons → LLMWorker fills assertions → run tests → if failures: LLMWorker fixes → re-run → done

### SpecChangeWake
Engine sleeping → fs.watch detects spec.md modified → hash diff confirms change → identify affected modules via LLM → run Steps 4a-6b on ONLY affected modules → compile → audit → update code → test → publish if interface changed → sleep

### CodeChangeWake
Engine sleeping → fs.watch detects src/ file modified → Step 4d reconcile ONLY the changed file → update graph if drift detected → compile → if errors fix them → publish if interface changed → sleep

### DependencyWake
Engine sleeping → fs.watch detects event file from dependency → read event → find which local modules reference that dependency → targeted reconvergence on ONLY those modules → compile → audit → publish if changed → sleep → ripple continues only if interface changed

### SelfHealCycle
Engine converged → self-audit reads own code + own goals → asks "what prevents each goal from being achieved?" → if blocker found → creates journey + test for it → fixes code → re-tests → re-verifies goals → only CONVERGED when all goals actually proven

## 6. Rules

- **No hardcoded limits.** Data decides when to stop.
- **CODE orchestrates, LLM creates.** LLM never decides WHEN to act.
- **Never ask LLM open-ended questions in a loop.** Bounded creation + targeted fixes.
- **Event-driven, not polling.** Zero cost when nothing changes.
- **No batch mode.** No --once flag. Engine starts, bootstraps if needed, then watches forever. Every action after bootstrap is targeted to a specific change.
- **Same box at every level.** convergence.ts is the same code at parent, child, grandchild.
- **Shared actors.** Parent discovers, children inherit. No duplicates.
- **External refs are warnings in children, errors in parent.** Parent validates after children converge.
- **Nothing exists in isolation.** Every node connects through journeys. No standalone documents.
- **The graph IS the documentation.** Goals are rule nodes. Architecture is process nodes. Roadmap is process nodes with status. Tests come from journeys. Code comes from nodes.
- **Only human input: spec.md.** Everything else auto-generated, auto-connected, auto-synced.

## 7. The Grand Vision

Genome replaces all documentation with a living context graph.

Before genome: separate files for goals, architecture, roadmap, tests, code. They drift apart. Humans spend hours keeping them in sync. They fail.

After genome: ONE graph. Goals are rule nodes connected to the journeys they govern. Architecture is process nodes connected to the code that implements them. Tests are generated from journeys. Code is generated from nodes. When a goal changes, the journeys change, the tests change, the code changes. Automatically.

The only thing a human writes is spec.md — "here's what I want." Genome does the rest.

This applies to genome itself. Genome's own goals, architecture, and roadmap are nodes in genome's own context graph. Genome manages genome. The protocol is self-sustaining.

## 8. Goals (these should become rule nodes)

- **Goal 1: Solve the context problem** — for anything, at any scale, forever
- **Goal 2: Build Pando** — decentralized AI platform, first real test case
- **Goal 3: Genome IS the product** — a protocol, not just a tool
- **Goal 4: Production-ready** — no hacks, no shortcuts
- **Goal 5: Self-sustaining** — the system should run without humans

## 9. Architectural Decisions (learned through testing)

- **Never rewrite existing code** — Step 6 Mode 2: update via Edit, don't regenerate. Full rewrites mask bugs.
- **Never kill workers between phases** — warm workers are more reliable than fresh spawns. Claude Code handles its own compaction.
- **Journey tests ARE the validation** — don't rely on LLM-judged validation. Run real tests from real journeys.
- **Feedback loop on test failure** — when journey tests fail, diagnose: code bug, test bug, or graph bug. Fix the right thing.
- **Compact prompts** — never embed full YAML in prompts. Send file paths, let LLM read. Backpressure on large prompts.
- **Early termination** — 2 consecutive zero-delta passes = module saturated. Don't waste LLM calls.
- **Batch heavy operations** — error fixes in batches of 5, test fills in batches of 10. Single massive calls timeout.
- **Project scaffolding** — auto-create package.json + tsconfig.json. User writes ONLY spec.md.
- **Targeted reconvergence** — store spec hash. On change, ask LLM which modules affected. Only update those.
- **Destructive edit protection** — if a pass decreases node count, auto-revert. LLM sometimes destroys content.

## 10. Source of Truth Hierarchy

This is the most important rule in the protocol. When things conflict, this decides who wins:

```
spec.md (AUTHORITY — human intent, always right)
  ↓ derives
graph (nodes + journeys — the system's understanding)
  ↓ derives
code (implementation — what actually runs)
  ↓ derives
tests (journey tests — proof that code matches graph)
```

### Conflict Resolution Rules

| Conflict | Resolution | Mechanism |
|----------|-----------|-----------|
| Graph contradicts spec | Re-converge. Graph updates to match spec. | Steps 1-4a |
| Code contradicts graph | Journey tests catch it. Feedback loop fixes code. | Step 6b |
| Code contradicts spec | Graph should have caught this → audit finds gap → fix graph → fix code | Step 4c |
| Tests fail | Diagnose: code bug, test bug, or graph bug. Fix the right one. | Step 6b feedback loop |
| Someone edits code directly | Step 4d (code-to-graph sync) detects drift, updates graph | Step 4d |
| Someone edits graph directly | Next convergence re-validates against spec | Steps 4b-4c |

### The Discipline

- **Every change starts in spec.md.** Update the spec first, then converge. The graph and code follow.
- **Never edit code to add features.** Edit the spec → converge → code updates automatically.
- **Code-only fixes are OK** for bugs that journey tests validate. Step 4d syncs them back to graph.
- **The graph is the single source of truth** for what the system IS. The spec is the single source of truth for what the system SHOULD BE.
- **GOALPOST.md and BLUEPRINT.md are deprecated.** Their content is in this spec (§7-10) and in the graph. They will be deleted when the graph fully represents them.

## 11. Goal Verification Must Be Real

Goals are not proven by journey coverage. They are proven by ACTUAL achievement.

- Goals that reference external projects (e.g., BuildPando) must be connected via dependencies.yaml
- When the external project converges, it publishes an event. Genome watches for it (Step 7).
- Goal status updates automatically: event → wake → re-verify → PROVEN/UNPROVEN
- Goals that reference internal capabilities (e.g., SolveContextProblem) are proven by running a fresh project and checking the output works
- The engine must NEVER report a goal as PROVEN unless it has actual evidence
- Journey coverage means "we have a plan for this goal." Achievement means "the plan worked."

## 12. Self-Healing: Genome Must Fix Itself

The engine must not require human intervention to fix its own bugs. This means:

### Self-Audit (new step after Step 6b)
- Read own source code + own goals
- Ask: "what's preventing each goal from being ACTUALLY achieved?"
- If a bug is found: create a journey for it, generate a test, fix the code
- If a spec gap is found: flag it (humans update spec, engine reconverges)

### Self-Improvement Loop
- After convergence: verify goals against REAL evidence (not journey coverage)
- If any goal is UNPROVEN: identify what's blocking it
- Create targeted journeys/tests for the blocker
- Fix the code via Mode 2 (update, not rewrite)
- Re-verify
- Only declare CONVERGED when goals are ACTUALLY achieved

### What This Enables
- No human fixes bugs in convergence.ts — the engine finds and fixes them itself
- No human adds missing features — the engine discovers them from goals
- The spec is still human-only, but everything else is self-managed

## 13. Self-Testing: Genome Must Verify Its Own Behavior

Journey tests verify CODE (functions return correct values). Self-testing verifies BEHAVIOR (the system responds correctly to events).

### Integration Self-Tests (run during self-heal cycle)
The engine must be able to test itself by:
1. Creating a temporary test project with a small spec (e.g., greeting app)
2. Running convergence on it → verify it produces working code
3. Editing the test spec → verify watch mode wakes and updates correctly
4. Editing test code → verify code-to-graph sync works
5. Cleaning up the test project

This proves: spec→code works, spec change→targeted update works, code change→sync works.

### Why This Matters
- Journey tests can pass while the ripple system is broken
- The only way to verify behavior is to observe it happening
- Each self-test is a mini end-to-end proof that the protocol works
- If a self-test fails, the self-heal cycle has a concrete bug to fix

### When To Run
- After every self-heal cycle that modifies convergence.ts
- The self-test uses a TEMPORARY project (created and deleted automatically)
- Result: PASS (behavior works) or FAIL (specific behavior broken)

## 14. What Genome Must NOT Do

- Do not maintain separate documentation files. The graph IS the documentation.
- Do not hardcode limits. Data decides when to stop. (maxZeroDelta, minModulesForSplit are configurable)
- Do not ask LLM open-ended questions in a loop. Bounded creation + targeted fixes.
- Do not rewrite files that already work. Update what's needed, leave the rest.
- Do not ignore test failures. Diagnose and fix, or mark unstable.
- Do not let code, graph, and spec drift apart. The hierarchy resolves all conflicts.
