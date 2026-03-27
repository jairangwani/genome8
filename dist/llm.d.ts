/**
 * llm.ts — Claude Code communication layer
 *
 * Uses the stream-json protocol (proven in crew3) to talk to Claude Code.
 * Claude Code gets its native tools (Read, Write, Edit, Bash) — no hacks.
 *
 * Wire format:
 *   Input:  {"type":"user","message":{"role":"user","content":"..."}}\n
 *   Output: NDJSON lines — init, assistant, user (tool_result), result
 *   "result" message signals response complete.
 *
 * Session management:
 *   - Auto-resets after SESSION_RESET_CHARS to prevent context overflow
 *   - Waits for init message before sending first user message
 *   - 10-minute timeout per call, process killed and respawned if exceeded
 */
export declare class LLMWorker {
    private worker;
    private cwd;
    private systemPrompt;
    private model;
    private sessionResetChars;
    private messageTimeoutMs;
    constructor(options: {
        cwd: string;
        systemPrompt?: string;
        model?: string;
        sessionResetChars?: number;
        messageTimeoutMs?: number;
    });
    /**
     * Spawn or reuse the persistent Claude Code process.
     * Like crew3: spawn and send immediately. No waiting for init.
     */
    private ensureProcess;
    /**
     * Process a single NDJSON message from stdout.
     */
    private processMessage;
    /**
     * Send a prompt to the Claude Code worker and wait for its response.
     * The worker has full tool access — it can Read, Write, Edit files.
     * Returns the text result from the agent.
     */
    call(prompt: string): Promise<string>;
    /**
     * Kill the worker process.
     */
    kill(): void;
    /**
     * Check if the worker process is alive.
     */
    isAlive(): boolean;
}
