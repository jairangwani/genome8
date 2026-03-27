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
export {};
