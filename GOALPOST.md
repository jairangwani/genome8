# Genome8 — What We're Building

> The goal. The vision. What success looks like.

---

## The Problem

No single brain — human or AI — can hold all the context of a complex system.

A developer working on login doesn't know that the marketing team's analytics depends on their session token format. A writer editing chapter 12 doesn't know it contradicts a detail established in chapter 3. An AI agent fixing a bug in module A doesn't know it breaks module B's tests.

**This is the context problem.** It causes:
- Bugs (changed something without knowing what depends on it)
- Duplicated work (built something that already exists elsewhere)
- Broken integrations (two teams building incompatible interfaces)
- Stale documentation (reality moved, docs didn't)
- Projects that grow until nobody understands the whole thing

Every tool today solves a slice: Jira tracks tasks. npm tracks packages. Terraform tracks infrastructure. Git tracks code changes. But NONE of them track **how everything connects to everything else across all boundaries.**

---

## The Goal

**Solve the context problem. For anything. At any scale. Forever.**

Genome is a protocol that captures context as a graph of nodes + journeys. An engine compiles all connections from journey steps. Any agent (human or AI) working on any part gets exactly the context they need. When anything changes, everything connected to it knows.

It doesn't matter if it's:
- A codebase with 1 million lines
- An organization with 10,000 people
- A book connected to a technology project connected to a car game
- A network of 1,000 projects across different teams
- One person's todo app

If it follows the genome protocol, context is tracked, compiled, and always in sync.

---

## What Genome Actually Does

### 1. Captures context as nodes + journeys

Everything that exists is a **node** (5 types):

| Type | What it is | Examples |
|------|-----------|---------|
| **actor** | Who does things | User, Developer, Character, Manager, Attacker |
| **process** | Something that happens | AuthService, WritingProcess, HiringFlow, BuildPipeline |
| **artifact** | Something that exists | Database, ChapterDraft, PolicyDocument, ConfigFile |
| **interface** | Something users interact with | LoginPage, Chapter, Dashboard, APIEndpoint |
| **rule** | Something that governs | RateLimitPolicy, NarrativeRule, BudgetCap, StyleGuide |

Everything that connects is a **journey** (ordered steps):

```yaml
journeys:
  UserRegisters:
    steps:
      - node: _actors/NewUser
        action: clicks Create Account
      - node: identity/KeyManager
        action: generates keypair
      - node: identity/JWTService
        action: issues access token
      - node: ledger/WalletStore
        action: creates wallet
      - node: web/Dashboard
        action: shows account
```

**The journey captures the FULL context:** who does what, using what, in what order, crossing which boundaries. This is what no other tool captures.

### Granular nodes = richer context

Every system action is its own node. Not "RegisterAccount" (1 coarse node) but every step: GenerateKeypair, IssueJWT, CreateWallet, CreditBonus (4 granular nodes).

Why: 1 node = 1 connection. 4 nodes = 10+ connections. More connections = the engine knows more about what depends on what = each agent gets richer context in their excerpt = fewer bugs because nothing is hidden.

**The more granular the graph, the better the context engine works.**

### 2. Compiles all connections automatically

The engine reads ALL journeys across ALL modules and computes:

```
Step 2 → Step 3 = KeyManager connects to JWTService
Step 3 → Step 4 = identity module connects to ledger module (cross-boundary!)
NewUser triggers this flow
All 5 nodes are "not orphans" (they're in a journey)
If JWTService changes → WalletStore's context is stale
```

**This is pure code. No LLM. Just graph math.** The engine knows every connection in the entire system — within a module, across modules, across projects.

### 3. Gives each agent exactly what they need

An agent working on the identity module gets a ~200 line excerpt:

```
YOUR NODES: KeyManager (in 4 journeys), JWTService (in 6 journeys)
BEFORE YOU: _actors/NewUser, gateway/Doorman
AFTER YOU: ledger/WalletStore, web/Dashboard
TRIGGERED BY: NewUser, ExistingUser, AdminAgent
```

The agent sees: what they own, what depends on them, what they depend on, who triggers flows through them. **Not the whole system. Just their context.** Always current. Always complete for their scope.

### 4. Keeps everything in sync

Anything changes → everything connected knows.

```
identity/JWTService changes (adds 2FA requirement)
  → Engine recompiles → finds all journeys referencing JWTService
  → ledger module is stale (WalletStore's journey references JWTService)
  → web module is stale (Dashboard's journey references JWTService)
  → marketing project is stale (it imports identity/JWTService)
  → car-game project is stale (it imports identity/JWTService)
  → Each affected agent wakes up → reads updated context → adapts → sleeps
```

**Within a project. Across projects. Across a network. Any chain depth. Always eventually in sync.**

---

## Why This Is Different From Everything Else

| Tool | What it tracks | What it DOESN'T track |
|------|---------------|----------------------|
| **npm** | Package A depends on Package B | WHY it depends (which use case, which step) |
| **Jira** | Task assigned to person | How task connects to code, tests, other teams |
| **Terraform** | Infrastructure state | How infra connects to application logic |
| **Git** | What changed in which files | What ELSE is affected by that change |
| **GraphQL** | API schema fields | How those fields are used in end-to-end flows |
| **Cursor/Copilot** | Current file context | How current file connects to other teams' modules |
| **Genome** | **Everything.** Who does what, using what, in what order, connected to what, across all boundaries. | — |

Genome tracks the FULL context graph. Not just code. Not just tasks. Not just infrastructure. The journeys capture HOW things connect across every boundary — code to code, team to team, project to project, even book to technology project if they're somehow linked.

---

## The Protocol

Any system that follows the genome protocol gets context tracking:

1. **Store your context** as nodes + journeys in YAML
2. **Compile** — engine computes all connections from journey steps
3. **Excerpt** — each agent gets ~200 lines of their relevant context
4. **Sync** — when anything changes, connected things are flagged stale
5. **Converge** — agents read updated context → adapt → everything back in sync

That's it. Five steps. Works for a solo developer's todo app or a 10,000-person organization.

---

## How Projects Stay In Sync

### Within one project

Engine compiles journeys → knows all connections. Node A changes → engine knows Node B depends on A → flags B stale → agent updates B.

### Across projects

Each project publishes what it provides (auto-generated from compiled graph). Other projects list dependencies. When a dependency changes:

```
pando-identity changes LoginService
  → publishes updated interface (new hash)
  → car-game depends on pando-identity → detects hash change → reconverges
  → todo-app depends on pando-identity → detects → reconverges
  → multiplayer-addon depends on car-game → car-game's interface updated → detects → reconverges
  → cascade until stable
```

**Step by step. Async. Eventually consistent.** Not instant. But always catches up. Nothing stays stale permanently.

### When a dependency disappears

Projects keep running on the LAST KNOWN WORKING version. Owner is alerted. Nothing crashes. The system degrades gracefully, never catastrophically.

---

## Scaling Context — Same Box at Every Level

When context gets too big for one box, split into multiple boxes. Each box runs the same code (convergence.ts). Different scope.

```
convergence.ts (top scope — whole system)
  ├── convergence.ts (technology scope — auth, p2p, hosting modules)
  │     ├── convergence.ts (identity scope — if technology splits further)
  │     └── convergence.ts (p2p scope)
  ├── convergence.ts (business scope — ledger, marketplace modules)
  └── convergence.ts (code-tool scope — standalone)
```

**Unlimited depth.** Each box:
- Has its own modules directory (YAML files)
- Runs the convergence pipeline (compile → LLM calls → compile → converge)
- Publishes an interface (what it provides)
- Watches parent/sibling interfaces for changes

### How cross-box connections work (at any time, any scale)

A box doesn't need to be in the same compile to create connections to another box. It just needs to SEE what the other box provides — via published interfaces.

```
Box A (identity) converges → publishes interface: "I provide JWTService, KeyManager"

Box B (gateway) starts LATER:
  reads A's published interface
  creates journey: "User → identity/JWTService → Doorman"
  compile validates: does A's interface have JWTService? YES → valid

Box C (car-game) starts A YEAR LATER:
  reads A's published interface
  creates journey: "Player → identity/JWTService → GameSession"
  same mechanism. Works at any time.
```

**This works for:**
- New project starting fresh (reads existing interfaces)
- Existing project adding a module mid-development
- Two projects connecting for the first time
- Network growing from 1 to 1000 projects
- Planning at ANY stage, not just the start

**Within a project:** Same thing. Each module's nodes are visible in the compiled index. When a new module is created, it sees everything that was compiled before it. When a new journey references an existing node — compile validates it.

**The rule:** Any box, at any time, can reference any published interface. Compile validates. Changes propagate via hash watching. No special "plan together" phase needed.

**Optimization for new projects:** When creating a brand new project with 15 modules, running them in ONE box first is faster (one compile sees everything). Then split for deepening. But this is a speed optimization, not a requirement. You COULD create each module as its own box from the start — it would just be slower because each box needs to publish before the next can reference it.

**The box is CODE (convergence.ts).** It calls LLM workers for creative tasks ("what's missing?"). Workers don't need to understand genome — they just read an excerpt and answer the question. The code handles everything else.

### Two kinds of intelligence

1. **Code intelligence (convergence.ts):** The loop, compilation, picking modules, picking lenses, checking convergence, publishing interfaces, watching for changes. This is mechanical and reliable.

2. **LLM intelligence (fresh calls):** "What actors exist?", "What journeys are missing?", "Write this code." Creative work. Each call gets clean context — no shared memory between calls. The code ensures freshness.

---

## Multi-Angle Exploration — The Core Technique

This is genome's most powerful technique. It applies to EVERYTHING — not just discovery.

**The principle:** One brain has blind spots. Multiple perspectives find more. Each perspective SEES what previous ones found and goes DEEPER.

**How it works:** Sequential rounds, each from a different angle. Each round reads all previous findings before adding more.

```
Round 1: "Find what exists" → finds 40 things
Round 2: READS Round 1 → "Find what's MISSING from the failure perspective" → finds 30 more
Round 3: READS Round 1+2 → "Find what BOTH missed from the scale perspective" → finds 20 more
Round 4: READS all → "Find contradictions between what was found" → finds 10 issues
...each round builds on ALL previous rounds
```

**Proven:** 3 sequential angles found 130 actors vs 20 from a single pass. 3x more context discovered.

**Used for everything:**
| Use | How |
|-----|-----|
| Actor discovery | Activities → threats → lifecycle angles |
| Journey discovery | Happy paths → failures → edge cases → scale |
| Blueprint auditing | Feasibility → simplicity → user → failure → prior art |
| Goal validation | Same 5 perspectives |
| Code review | Correctness → security → performance → maintainability |
| Convergence depth checking | 3 audit agents verify nothing was missed |

**This is not just a discovery tool. It's how genome ensures COMPLETE context from EVERY angle.**

## Discovery (finding all context)

Multi-angle exploration applied to finding actors and journeys:

### Sequential rounds — each sees previous

Each round reads ALL previous findings, looks from a NEW angle, adds what was missed.

### 8 lenses, unlimited rounds, convergence decides

| Lens | Perspective |
|------|-----------|
| Happy paths | Core flows that make the product work |
| Failures | What breaks, error recovery, edge cases |
| Threats | How each threat actor exploits each journey |
| Edge cases | Race conditions, simultaneous actions, conflicts |
| Scale | What happens at 10x, 100x, 1000x |
| Completeness | Walk spec line by line — every bullet has a journey |
| Simplicity | Prune unnecessary, merge duplicates |
| Consistency | Does part A contradict part B? |

No hardcoded round count. Lenses rotate until 3 consecutive rounds find nothing new, then 3 auditors verify depth from independent angles. CONTEXT IS DEEP. A single pass finds the obvious. Round 20 finds the edge case that crashes production. Round 35 finds the contradiction between two teams.

### Convergence = creation + validation + audit

| Phase | What | Who | Bounded? |
|-------|------|-----|----------|
| Creation | Every module examined from every lens | LLM | Yes: modules × lenses |
| Validation | 0 errors, 0 orphans, all modules connected | CODE (compile) | Instant |
| Audit | 3 auditors check spec/actor/cross-module coverage | LLM | Yes: 3 calls × max 3 cycles |

Creation is bounded (not infinite). Validation is code (not LLM). Audit is targeted (fix specific gaps, not "what's missing?").

Boxes sleep after convergence. Wake ONLY when a dependency changes (event-driven ripple).
No polling. No periodic checks. When a box publishes a change, it notifies dependents directly.
1000 boxes sleeping = zero cost. One box changes = only its dependents wake up.

---

## Journeys = Use Cases = Connections = Tests

The journey is the universal format. It captures:
- **What happens** (the steps)
- **Who's involved** (actors in steps)
- **What's used** (processes, artifacts in steps)
- **What's connected** (consecutive steps = connections)
- **What to test** (each step = a test case)
- **What to sync** (change a step → everything referencing it is stale)

```yaml
PlayerLogin:
  steps:
    - node: _actors/Player
      action: clicks Login
    - node: pando-identity/LoginService       # external dependency!
      action: authenticates with 2FA
    - node: game/SessionManager
      action: creates game session
```

From this: connections computed, dependency tracked (car-game → pando-identity), test generated ("does LoginService authenticate with 2FA?"), sync trigger set (if pando-identity changes → this journey stale).

**One format. Everything derived from it.**

---

## Genome Evolves

Genome is itself a project managed by genome. Any agent that finds a limitation can fix the engine code, run genome's tests, and merge if they pass.

The engine that tracks context is itself tracked by the engine. It grows smarter as its users push its limits.

---

## Published Interfaces — The Cross-Project Contract

Each genome project auto-generates what it provides:

```yaml
# pando-identity/published/interface.yaml
project: pando-identity
version_hash: sha256:abc123

provides:
  LoginService:
    type: process
    description: Authenticates users with optional 2FA
    endpoints: [POST /auth/login]
  KeyManager:
    type: process
    description: Generates Ed25519 keypairs

requires:
  pando-ledger/WalletStore: "RegisterAccount journey step 4"
```

### Changelog (auto-generated on every change)

```yaml
# pando-identity/published/changelog.yaml
changes:
  - node: LoginService
    type: modified
    field: requires_2fa
    was: false
    now: true
    impact: "All projects calling LoginService must handle 2FA"
  - node: OldService
    type: removed
    impact: "Dependents must find alternative"
```

### Dependency versioning

```yaml
# car-game/genome/dependencies.yaml
dependencies:
  pando-identity:
    pin: sha256:abc123          # locked to specific version
    alert_on_update: true       # notify when new version exists
    fallback: last_known_good   # if removed, keep running on this
  pando-ledger:
    pin: latest                 # always track newest
```

### When a dependency is removed

Projects keep running on the LAST KNOWN WORKING version. Nothing crashes. Owner is alerted: "LoginService was removed. Find an alternative or build your own." The system degrades gracefully, never catastrophically.

### When a human should intervene

Agents handle 95% autonomously. Humans can subscribe to alerts for:
- Breaking changes affecting 10+ dependent projects
- Dependency removal with no obvious alternative
- Security vulnerabilities requiring cross-network action
- Unresolvable conflicts between engines

---

## The Parent Box — Cross-Boundary Context

When a project splits into multiple boxes, the parent box maintains cross-boundary journeys:

```yaml
# parent/genome/modules/cross-flows.yaml
journeys:
  UserBuildsAppEndToEnd:
    steps:
      - node: _actors/AnonymousUser
        action: describes an app
      - node: gateway-engine/Doorman
        action: classifies request
      - node: code-engine/ToolRunner
        action: agents write code
      - node: hosting-engine/DeployService
        action: deploys to live URL
```

The parent's convergence.ts compiles this → validates each reference against children's published interfaces → detects conflicts → signals affected children to reconverge.

**The parent is just another box.** Same code. Its modules happen to contain cross-boundary journeys instead of domain-specific ones.

### How this works at network scale (100+ projects)

The same pattern applies at every level:

```
WITHIN A PROJECT (planning phase):
  Single box plans all modules together → cross-module connections exist
  Then splits into child boxes for deepening
  Children see parent's compiled index

BETWEEN PROJECTS (same pattern):
  Project A publishes interface: "I provide JWTService, WalletService"
  Project B references A: "my PlayerLogin journey uses pando-identity/JWTService"

  This is the PLANNING connection — created when B first sets up its journeys.
  B's convergence.ts validates the ref against A's published interface.

WHEN A CHANGES:
  Project A changes JWTService → publishes new interface (new hash)
  Project B's runner detects hash change → B reconverges
  B's convergence.ts updates affected journeys (the LLM worker fixes them)
  B publishes new interface → cascade to projects depending on B

AT MASSIVE SCALE (1000 projects):
  Each project is a sleeping box (Node.js process, polling every 60s)
  Most are asleep → near-zero cost
  A change in a foundational project (like identity) cascades:
    identity changes → 50 projects detect → each reconverges → publishes
    → projects depending on THOSE 50 detect → reconverge
    → cascade settles when no more changes propagate

  Step by step. Async. Eventually consistent. Hours, not instant.
  But NO project stays stale permanently.
```

**The key insight:** Connections are created during PLANNING (when modules/projects are visible to each other). Changes propagate via published interfaces + hash watching. The "Plan Together" rule ensures connections EXIST. The sync mechanism ensures they STAY current.

---

## Unlimited Hierarchy Depth

There is NO limit to how deep the context hierarchy goes. Every level is the same: runner + engine + graph.

```
convergence.ts (top scope)
  └── convergence.ts (technology scope)
        └── convergence.ts (mobile scope)
              └── convergence.ts (identity scope)
                    └── convergence.ts (auth scope)
                          └── LLM workers write YAML
```

A Company Director and a Login Feature Owner follow the SAME process at different scope. Same code. Same excerpts. Same convergence.

---

## Starting From Any Point

| Input | What happens |
|-------|-------------|
| "Build me a car game" | convergence.ts reads input → LLM calls discover context → graph → converge → code |
| Full spec (1045 lines) | convergence.ts reads spec → LLM calls discover beyond → graph → converge |
| Existing code, bad docs | convergence.ts reads code → LLM calls reverse-engineer journeys → fills gaps |
| Mid-project | Lead reads compiled state → convergence rounds |
| Import external project | Add dependency → engine validates interface → agent writes journeys |
| First project on empty network | Build alone, publish interface, others join later |

### Bootstrap

Network starts with ONE project. No dependencies. Just build, converge, publish interface. Second project joins, depends on first. Network grows organically. No central authority needed.

---

## The Full Pipeline

```
INPUT → any form (one line, spec, code, nothing)

ORGANIZE (code + 1 LLM call)
  convergence.ts reads input → LLM call: "how to organize?" → ORGANIZATION.md
  If split needed → spawn child convergence.ts processes

DISCOVER (code + 3 LLM calls per box)
  LLM calls: activities → threats → lifecycle (sequential, each sees previous)
  Code: merge → deduplicate → write YAML → compile

BUILD GRAPH (code + 1 LLM call per module per box)
  Code: picks module order from ORGANIZATION.md
  LLM call per module: "here's excerpt, create nodes + journeys"
  Code: compile between each → no duplicates

CONVERGE (code loop + 1 LLM call per round per box)
  Code: picks thinnest module + rotates lens
  LLM call: "from this lens, what's missing?"
  Code: compile → check 3-level convergence
  When activity stops: 3 LLM audit calls for depth check

CONNECT (code — parent box only)
  Code: validates cross-engine journeys against children's published interfaces
  Code: detects conflicts → signals affected children

CODE (code + 1 LLM call per node per box)
  Code: generates code + test skeletons from graph
  LLM calls: fill in implementations and test assertions
  Code: runs tests → LLM calls fix failures

PUBLISH
  Each engine publishes interface
  Other projects can depend on this one

SYNC (forever)
  Context changes → connected things flagged stale → agents adapt
  Cross-project changes propagate via published interfaces
  Everything sleeps when stable, wakes on changes
  Genome itself upgrades when agents find limitations
```

---

## What's Proven

| Finding | Test |
|---------|------|
| Journey-based compilation computes correct connections | 11 unit tests |
| Cross-module connections from journey steps | 387 connections, 16 modules |
| Engine prevents duplicate nodes mechanically | 0 duplicates in all tests |
| Multi-angle discovery finds 3x more context | 130 actors from 3 angles vs 20 from spec |
| Sequential writing through engine prevents duplicates | Tested both ways |
| Smart excerpts give agents enough context to act correctly | Agents created cross-module refs from excerpts |
| Convergence curve: context discovery slows naturally | +101 → +0 → +18 nodes over 3 rounds |

## What's Not Proven (test next)

| Gap | What it needs |
|-----|--------------|
| **convergence.ts running autonomously** | Build the orchestrator code. This is THE missing piece. |
| Full pipeline: spec → graph → code → tests → running | convergence.ts does Steps 1-6 on Pando without human |
| Live hierarchy (parent spawns children) | convergence.ts spawns child processes |
| Live cross-project cascade | Change in pando → car-game reconverges automatically |
| 500+ node deep convergence | convergence.ts runs enough rounds |

**All of these become possible once convergence.ts is built.** The library code (46 tests) is done. The orchestrator is the one piece that turns the library into a product.

---

## What Success Looks Like

**For a developer:** You change a function. Genome tells you: "3 journeys reference this function. Module B and Project C depend on it. Here's what will break."

**For a team:** New member joins. They read the excerpt for their module. In 200 lines they understand: what they own, who depends on them, who they depend on, what flows through them. Full context. Day one.

**For an organization:** Marketing changes a campaign flow that depends on the tech team's user data API. Genome detects the connection (from journeys). Tech team is flagged. They update their API. Tests regenerate. Everything in sync. No meeting needed.

**For AI agents:** An agent fixing a bug in identity/KeyManager sees in its excerpt: "gateway/Doorman depends on you. ledger/WalletStore depends on you. 6 journeys flow through you." It knows exactly what its change might break. It doesn't introduce bugs because it has FULL CONTEXT for its scope.

**For a network:** 1000 projects, all connected through genome. A security fix in pando-identity ripples to every project that uses it. Each project's agents update their code and tests. The whole network stays secure without a single human coordinating it.

**That's the goal. Context solved. Everything connected. Always in sync.**
