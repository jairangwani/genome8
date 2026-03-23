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
