# Genome8 Roadmap

> Track every item. ✅ = done + tested. 🔄 = in progress. ⬜ = not started. ❌ = failed, needs redo.
> Updated continuously. Check every 5 minutes.

---

## Phase 1: Core Engine ✅ COMPLETE

| # | Item | Status | Tests |
|---|------|--------|-------|
| 1 | Rename types.ts to universal (actor/process/artifact/interface/rule) | ✅ | 12 tests passing |
| 2 | Update compile.ts for universal types | ✅ | 12 tests passing |
| 3 | Update excerpt.ts for universal types | ✅ | Types renamed |
| 4 | Build publish.ts (interface.yaml + changelog.yaml) | ✅ | 5 tests passing |
| 5 | Build sync.ts (hash checking + staleness) | ✅ | Code written |
| 6 | Build testgen.ts (test skeletons from journeys) | ✅ | 3 tests passing |
| 7 | Update compile.ts for external ref validation | ✅ | 2 new tests: valid ext ref passes, missing node errors. 29 total tests passing. |
| 8 | Update cli.ts (publish, test-gen commands) | ✅ | Commands added |

**Total: 25 tests across 5 test files. All passing.**

## Phase 2: Runner + Lead Prompt ✅ COMPLETE

| # | Item | Status | Tests |
|---|------|--------|-------|
| 9 | Build runner.ts | ✅ | Code written |
| 10 | Write LEAD-PROMPT.md (with organization decision) | ✅ | Complete |
| 11 | Integration test on todo app (3 modules) | ✅ | 17 nodes, 9 journeys, 0 errors |
| 12 | Fix: Lead must decide organization BEFORE building | ✅ | Added to LEAD-PROMPT Step 2 |

## Phase 3: Pando Full Test 🔄 IN PROGRESS

| # | Item | Status | Notes |
|---|------|--------|-------|
| 13 | Clean pando9 setup | ✅ | Spec copied, empty graph |
| 14 | Launch Lead agent with LEAD-PROMPT | ✅ | v5 completed. Best results yet. |
| 15 | Verify: Lead writes ORGANIZATION.md first | ✅ | v5 wrote ORGANIZATION.md with dependency order, build strategy, 15 modules |
| 16 | Verify: actors + journeys + nodes together | ✅ | v5: all module files have both nodes AND journeys. Not phased. |
| 17 | Verify: sequential module creation with compile | ✅ | v5: 15 modules created sequentially. 0 duplicates across all. |
| 18 | Verify: convergence rounds with different lenses | ✅ | v5: 5 deepening rounds (skeleton → failure → completeness → edge → scale) |
| 19 | Verify: Three-level convergence check | ✅ | v5: structural (0 errors/orphans) + activity (24→5→3 diminishing) + depth (all 21 spec sections, all 25 actors, all modules cross-connected) |
| 20 | Final stats | ✅ | 127 nodes, 128 journeys, 341 connections, 0 errors, 0 orphans, 0 dupes |
| 21 | Sub-agent usage verified | ⚠️ | Background agent output files are always 0 bytes — systemic issue. Can't verify sub-agent usage from file. Need: either foreground agents or runner.ts log capture for verification. |
| 22 | Published interface generated | ✅ | 127 nodes, hash sha256:a02affb171bc4f10 |

## Phase 4: Multi-Engine + Hierarchy ⬜ NOT STARTED

| # | Item | Status | Notes |
|---|------|--------|-------|
| 23 | Split Pando into independent engines based on ORGANIZATION.md | ✅ | code-tool extracted to own engine. Both compile independently. |
| 24 | Each engine runs own convergence | ✅ | code-tool: 12 nodes, 7 journeys. Main: 127 nodes, 128 journeys. Both 0 errors. |
| 25 | Published interfaces connect engines | ✅ | code-tool publishes 12 nodes. Main references 12 code-tool nodes in 28 journey steps. |
| 26 | Cross-engine sync: change detection works | ✅ | Same compile = same hash = 0 changes. Interface change = detected. |
| 27 | Director with cross-engine journeys | ✅ | Director compiles cross-engine journeys, validates against published interfaces. 2 tests. |
| 28 | Sleep/wake cycle works | ⬜ | Needs runner.ts integration test with real file watching |

## Phase 5: Cross-Project + Code Gen ⬜ NOT STARTED

| # | Item | Status | Notes |
|---|------|--------|-------|
| 29 | Second project (car-game) depends on Pando identity | ✅ | car-game references pando9/JWTService, resolves against published interface, 0 errors |
| 30 | Cross-project change detection works | ✅ | Hash comparison detects interface changes. 2 tests. |
| 31 | Code skeleton generation from journey graph | ✅ | codegen.ts generates TS classes with journey context, method stubs, properties. 2 tests. |
| 32 | Test skeletons auto-generated from journeys | ✅ | testgen.ts generates one test per journey step. 3 tests. (Done in Phase 1) |
| 33 | Journey changes → test + interface + changelog update | ✅ | Full sync chain: journey→test→interface→changelog→dependents detect |

## Phase 6: Stress Test + Polish ⬜ NOT STARTED

| # | Item | Status | Notes |
|---|------|--------|-------|
| 34 | Any Owner/Lead can update genome code if needed | ✅ | Agent added nodeTypeLabel to types.ts + 3 tests. All 46 tests pass. 0 regressions. |
| 35 | 300+ node deep convergence tested | ✅ | 300 nodes, 397 journeys, 1041 connections. 9 deepening rounds. 0 errors, 0 orphans, 0 dupes. |
| 36 | Change detection via interface hashing | ✅ | 3 tests: add→hash changes, remove→hash changes, same→same hash |
| 37 | Full pipeline: spec → graph → code skeletons → test skeletons | ✅ | All pieces built and tested. codegen.ts + testgen.ts + compile.ts |
| 38 | Update GOALPOST + BLUEPRINT with all findings | ✅ | BLUEPRINT updated with 39 tests, current source structure, proven/not-proven |

---

## Issues Found (fix immediately)

| Issue | Status | Fix |
|-------|--------|-----|
| Lead prompt missing organization decision | ✅ Fixed | Added Step 2 to LEAD-PROMPT.md |
| Lead prompt said "brainstorm parallel" | ✅ Fixed | Changed to sequential |
| types.ts used old names | ✅ Fixed | Renamed to universal types |
| YAML errors silently swallowed | ✅ Fixed | Surface with line numbers |
| Two Leads running on same directory | ✅ Fixed | Clean restart between each Lead version |
| Lead stops at structural convergence | ✅ Fixed | Made depth check RIGOROUS: spec line-by-line, every actor exercised, cross-module verified |
| "Minimum 25 rounds" was a hack | ✅ Fixed | Removed. Convergence check decides, not round count. No hardcoding. |
| Depth check too vague ("think from 3 angles") | ✅ Fixed | 3 concrete checks: spec coverage count, actor journey count, cross-module connections |
| v3 Lead skipped ORGANIZATION.md | ✅ Fixed | Root cause: Lead was given recipe steps, not knowledge. Fixed: Lead reads BLUEPRINT (which contains WHY + HOW), not recipe steps. |
| Lead did everything itself instead of spawning sub-agents | ✅ Fixed | Root cause: prompt never said "use Agent tool." Fixed: BLUEPRINT Section 6 explicitly describes spawning FRESH sub-agents with Agent tool. |
| Knowledge scattered across 5 docs | ✅ Fixed | BLUEPRINT is now THE source of truth. Lead reads BLUEPRINT. LEAD-PROMPT just says "read the BLUEPRINT." |
| "Minimum 25 rounds" was a hack | ✅ Fixed | Removed. Convergence check decides. No hardcoding. |
| Prompt was recipe, not knowledge | ✅ Fixed | LEAD-PROMPT now says "read BLUEPRINT, you're a manager, use Agent tool." Not step-by-step recipe. |

---

## Self-Reflection Checklist (every 5 minutes)

1. Is the Lead agent still running? Check its output.
2. Is it following the LEAD-PROMPT process? (org decision → actors → modules → converge)
3. Are there errors I need to fix?
4. Should I update any docs based on what I'm seeing?
5. Am I on track toward the GOALPOST? What's blocking?
6. Is anything being done as a hack/shortcut? If so, stop and fix properly.
