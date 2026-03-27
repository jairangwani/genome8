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

### Convergence
Creation is bounded (modules × relevant lenses). Not an infinite loop.
Convergence is CODE (compile: 0 errors, 0 orphans). Instant.
Audit is targeted (3 auditors check specific coverage gaps).

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
THE PRODUCT. The orchestrator.
Step 1: Organization (LLM reads spec, writes org)
Step 2: Actor discovery (3 angles: activities, threats, lifecycle)
Step 2b: Hierarchy decision (LLM-based, no hardcoded threshold)
Step 3: Module creation (1 LLM call per module, compile between each)
Step 4: Convergence (bounded creation → compile check → targeted audit)
Step 5: Publish interface + write event file
Step 6: Code + test generation, LLM fills, run tests, fix failures
Step 7: Event-driven sleep/wake (fs.watch, zero cost at rest)

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

## 6. Rules

- **No hardcoded limits.** Data decides when to stop.
- **CODE orchestrates, LLM creates.** LLM never decides WHEN to act.
- **Never ask LLM open-ended questions in a loop.** Bounded creation + targeted fixes.
- **Event-driven, not polling.** Zero cost when nothing changes.
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

## 12. What Genome Must NOT Do

- Do not maintain separate documentation files. The graph IS the documentation.
- Do not hardcode limits. Data decides when to stop. (maxZeroDelta, minModulesForSplit are configurable)
- Do not ask LLM open-ended questions in a loop. Bounded creation + targeted fixes.
- Do not rewrite files that already work. Update what's needed, leave the rest.
- Do not ignore test failures. Diagnose and fix, or mark unstable.
- Do not let code, graph, and spec drift apart. The hierarchy resolves all conflicts.
