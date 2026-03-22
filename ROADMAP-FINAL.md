# Genome8 Final Roadmap — Production Ready

> This is the ONLY file to follow. Read every 5 minutes.
> No shortcuts. No hacks. No hardcoded band-aids. Fix root causes.
> You are the CEO. Full autonomy. Unlimited time. Quality only.

---

## Phase 1: Code Audit + Fix All Issues

### 1.1 Logical Issues

| # | Issue | File | Root Cause | Fix |
|---|-------|------|-----------|-----|
| L1 | Children get FULL 52K spec instead of scoped sections | convergence.ts:728 | `fs.copyFileSync(specPath, ...)` copies everything | Parent should extract relevant spec sections per child using ORGANIZATION.md's module list |
| L2 | Cross-engine refs don't validate at parent level | convergence.ts runAsParent | `compile(modulesDir)` only knows local modules | Load children's published interfaces as externalInterfaces for compile |
| L3 | Step 6 generates empty skeletons, never fills them | convergence.ts:424-430 | Only calls generateCodeSkeletons() + generateTests() | Add LLM calls to fill implementations + assertions, then run tests, then fix failures |
| L4 | Watch loop (Step 7) does nothing for single-engine projects | convergence.ts:435+ | No dependencies.yaml exists unless parent creates it | Auto-create dependencies.yaml from cross-module external refs found during compile |
| L5 | Actor merge prompt could produce invalid YAML | convergence.ts runAsParent P0 | LLM merges actors but no compile validation after | Compile after actor merge, fix if errors |

### 1.2 Hacks / Hardcoded Values

| # | Issue | File | Fix |
|---|-------|------|-----|
| H1 | `--max-depth` band-aid for cascade splits | convergence.ts:60 | Remove. Fix root cause (L1 — scoped specs) so children don't over-split |
| H2 | `spec.substring(0, 30000)` truncates large specs | convergence.ts:164 | Send full spec or intelligent summary. LLM can handle large context. |
| H3 | `spec.substring(0, 15000)` in actor prompts | convergence.ts:225,242 | Same — send more spec or summarize properly |
| H4 | `allModules.substring(0, 15000)` in depth check | convergence.ts:471+ | If modules are large, auditors see truncated data and miss gaps |
| H5 | `orgContent.substring(0, 3000)` in module creation | convergence.ts:321 | Send full org, not truncated |
| H6 | `100` max rounds hardcoded | convergence.ts:412 | Make configurable or remove — convergence check should decide |
| H7 | `60_000` watch interval hardcoded | convergence.ts:455 | Make configurable via convergence-state.json |
| H8 | `200_000` session reset chars hardcoded | llm.ts:24 | Make configurable. Different models have different context windows. |

### 1.3 Incomplete Code

| # | What | Where | What's missing |
|---|------|-------|---------------|
| I1 | Step 6: Code implementation | convergence.ts | LLM call per code skeleton to fill in implementation |
| I2 | Step 6: Test assertions | convergence.ts | LLM call per test skeleton to fill in assertions |
| I3 | Step 6: Run tests | convergence.ts | Execute tests, collect failures |
| I4 | Step 6: Fix failures | convergence.ts | LLM call per failure to fix code, re-run until pass |
| I5 | Parent cross-engine validation | convergence.ts runAsParent | Load child interfaces into compile as externalInterfaces |
| I6 | Scoped spec for children | convergence.ts runAsParent | Extract relevant spec sections per child's module scope |
| I7 | Convergence state for hierarchy | convergence.ts | Parent should read children's convergence-state.json for monitoring |

### 1.4 Legacy Code to Remove

| # | What | Where | Action |
|---|------|-------|--------|
| X1 | runner.ts.deprecated | src/ | Delete entirely after confirming Step 7 works |
| X2 | LEAD-PROMPT.md | genome8/ root | Delete if exists — convergence.ts replaced Lead agents |
| X3 | Old genome3 references in spec.md | pando spec | Already partially updated. Do full pass. |
| X4 | "genome3" mentions in any .ts file | src/*.ts | Grep and remove |
| X5 | Old test data referencing genome3 patterns | test/ | Check and clean |

---

## Phase 2: Fix All Issues (in order)

### Pass 1: Root cause fixes

- [x] **L1+H1**: Scope child specs. Remove --max-depth band-aid.
  - LLM writes scoped spec per child (only relevant sections)
  - --max-depth removed entirely. LLM decides based on scope.

- [x] **L2+I5**: Parent cross-engine validation
  - Loads children's published interfaces as externalInterfaces
  - compile() validates cross-engine refs properly

- [x] **I6**: Child scoped spec (merged with L1)
  - LLM extracts relevant spec sections per child's module list

- [x] **H2-H5**: Remove all substring truncation hacks
  - All spec/org/module/actor content sent in full. No truncation.

### Pass 2: Complete Step 6

- [ ] **I1**: After generating code skeletons, LLM fills implementations
  - For each skeleton file: read it, send to LLM with journey context, write back
- [x] **I1-I4**: Step 6 complete (code fill + test fill + run tests + fix failures loop)
  - LLM fills code skeletons with journey context
  - LLM fills test assertions
  - Runs vitest, captures failures
  - LLM fixes failures, re-runs (max 3 attempts)

### Pass 3: Clean up

- [x] **X1-X5**: Remove all legacy
  - runner.ts.deprecated deleted
  - LEAD-PROMPT.md deleted
  - No genome3/validate()/regression.py/Lead agent/--print references in any .ts file
  - All test files clean
- [x] **H6-H8**: Made all values configurable via genome/config.json
  - maxRounds, watchIntervalMs, sessionResetChars, model, maxFixAttempts
- [x] **L4**: Auto-create dependencies.yaml from external refs after convergence
- [x] **L5**: Compile validation after actor merge in runAsParent

---

## Phase 3: Audit (run 2 separate audits)

### Audit 1: Code completeness ✅ COMPLETE
- [x] 22/22 exported functions used (removed 1 dead code: nodeTypeLabel)
- [x] All 7 steps + parent steps verified complete
- [x] Fixed: _actors.yaml crash, module retry, hash truncation

### Audit 2: Logic flow ✅ COMPLETE
- [x] Single-engine trace: all steps work, Step 7 needs --once for testing
- [x] Hierarchy trace: scoped specs, shared actors, cross-engine validation verified
- [x] Change cascade trace: works for 1-way deps, oscillation cooldown added for 2-way
- [x] Race conditions: separate dirs = no file contention
- [x] Infinite loops: maxRounds + oscillation cooldown + child timeout prevent all cases

### Audit findings fixed:
- [x] _actors.yaml existence guard in depthCheck
- [x] Module creation retry (3 attempts)
- [x] Circular dependency oscillation cooldown (10 min)
- [x] Test failures → "unstable" status
- [x] Spec scoping fallback warning
- [x] Dead code nodeTypeLabel removed
- [x] Full SHA256 hash (no truncation)
- [x] Child process timeout (30 min)

---

## Phase 4: Update Pando Spec ✅ COMPLETE

- [x] Full pass: replaced ALL genome3 references with genome8
- [x] Updated Layer 2 description with genome8 pipeline
- [x] Replaced convergence cycle with genome8 7-step pipeline
- [x] Replaced Section 15 (Planning System) with genome8 YAML/compile architecture
- [x] Replaced context.yaml with spec.md throughout
- [x] Removed Python node/validate()/regression.py references
- [x] Copied updated spec to pando12 for clean production test
- [x] Verified: 0 old patterns remaining

---

## Phase 5: Production Test

- [ ] Clean pando directory (fresh, only spec.md)
- [ ] Run convergence.ts with `--once`
- [ ] Verify: org written with proper modules
- [ ] Verify: 40+ actors discovered
- [ ] Verify: hierarchy split triggered (architecturally independent engines)
- [ ] Verify: children get SCOPED spec (not full 52K)
- [ ] Verify: children create correct modules (not generic fallbacks)
- [ ] Verify: children converge with 0 errors
- [ ] Verify: children publish interfaces
- [ ] Verify: parent creates cross-engine journeys
- [ ] Verify: cross-engine refs validate against child interfaces
- [ ] Verify: actor merge works (parent + children = unified set)
- [ ] Verify: code skeletons generated and filled
- [ ] Verify: test skeletons generated and filled
- [ ] Verify: tests run and pass (or failures are fixed)
- [ ] Verify: published interface has correct hash

---

## Phase 6: Legacy Removal (3 passes)

### Pass 1: Grep for old patterns ✅ CLEAN
- [x] `genome3` — none found
- [x] `validate()` — none found
- [x] `regression.py` — none found
- [x] `Lead agent` / `Lead prompt` — none found
- [x] `--print` — only in comment explaining what we DON'T do
- [x] `runner.ts` — none found (file deleted)

### Pass 2: Check logic flow ✅ CLEAN
- [x] 58 if/else branches in convergence.ts — all reviewed
- [x] 18 LLM prompts — all clear and specific
- [x] File writes use Write tool correctly
- [x] Compile calls at correct positions (after every module write, before convergence check)

### Pass 3: Final verification (partial)
- [x] Run full test suite: 44/44 pass
- [x] Type check: 0 errors
- [x] Run todo app: converged (88 nodes, 0 errors) ✅
- [ ] Run Pando: hierarchy + convergence + publish — 🔄 TWO TESTS RUNNING (v7 single-engine + pando18 hierarchy)
- [x] No TODOs, no stubs in genome code (only in generated skeleton output — intentional)
- [ ] BLUEPRINT matches code — pending final review after tests
- [ ] GOALPOST matches BLUEPRINT — pending final review

---

## Phase 7: Genome Manages Itself (after Phase 6)

- [ ] Write `genome8/genome/spec.md` — genome's own spec (derived from BLUEPRINT.md)
- [ ] Run `convergence.ts` on genome8 itself — genome builds its own context graph
- [ ] Verify: genome's actors, processes, interfaces, rules are all captured as nodes
- [ ] Verify: journeys describe how compilation, convergence, publishing, hierarchy work
- [ ] Deprecate BLUEPRINT.md — the living graph IS the documentation
- [ ] Any future change to genome code → reconvergence of genome's own graph

This is the ultimate test: genome understanding and managing its own complexity.

---

## Rules (remind yourself every 5 minutes)

1. No hacks. Fix root causes.
2. No hardcoded values that should be configurable or LLM-decided.
3. No substring truncation — handle large content properly.
4. No band-aids (--max-depth) — fix the real problem (spec scoping).
5. No stubs — if a feature is in BLUEPRINT, it must be coded and working.
6. Test after every change. 46 tests must always pass.
7. Update BLUEPRINT when you change code.
8. Update this ROADMAP when you complete items.
9. Be honest about what works and what doesn't.
10. Quality over speed. Always.
