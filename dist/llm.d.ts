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
    /**
     * Health check: verify worker is alive and not stuck.
     * Returns 'healthy', 'dead', or 'busy' (message in flight).
     * Enables HealthCheckBeforeTaskDispatch journey.
     */
    healthCheck(): 'healthy' | 'dead' | 'busy';
    /**
     * Get worker stats for diagnostics.
     */
    getStats(): {
        pid: number | undefined;
        charsSent: number;
        initialized: boolean;
    } | null;
}
/**
 * Validate that expected output files from a worker task exist, are non-empty,
 * and — for YAML module files — have valid syntax and required schema fields.
 */
export declare function validateWorkerOutput(expectedFiles: string[], projectDir: string): {
    valid: string[];
    missing: string[];
    empty: string[];
    malformed: string[];
};
export interface CrashReport {
    exitCode: number | null;
    signal: string | null;
    lastTask: string;
    partialOutput: string[];
    timestamp: string;
    type: 'crash' | 'timeout' | 'stream_failure';
}
/**
 * Scan expected output paths for any files the worker wrote before crashing.
 * Returns paths of files that exist (partial work that may be recoverable).
 */
export declare function drainPartialOutput(expectedPaths: string[], projectDir: string): string[];
/**
 * Check if a file path is within the allowed directory.
 * Defense-in-depth against path traversal — Claude Code also has its own checks.
 */
export declare function isPathWithinScope(filePath: string, allowedDir: string): boolean;
/**
 * Scan task context for common prompt injection patterns.
 * Returns suspicious patterns found, empty array if clean.
 * Standalone export for the DetectPromptInjection node.
 */
export declare function detectPromptInjection(context: string): string[];
/**
 * Check if a bash command is dangerous and should be blocked.
 * Returns the reason for blocking, or null if safe.
 * Standalone export for the FilterBashCommands node.
 */
export declare function filterBashCommand(command: string): string | null;
/**
 * Classify a worker failure into a category for routing to the correct
 * recovery handler.
 * Standalone export for the ClassifyFailureType node.
 */
export declare function classifyFailureType(report: CrashReport): 'crash' | 'timeout' | 'stream_failure' | 'rate_limit' | 'unknown';
/**
 * Detect when a worker process is unresponsive by checking if the process
 * is still running and how long since last output.
 * Standalone export for the DetectStaleWorkerProcess node.
 */
export declare function detectStaleWorkerProcess(pid: number, lastActivityMs: number, maxIdleMs?: number): boolean;
/**
 * Scan for leftover worker subprocesses from a previous run.
 * Returns PIDs of orphan processes found.
 * Standalone export for the DetectOrphanWorkerProcess node.
 */
export declare function detectOrphanWorkerProcesses(expectedPids: number[]): number[];
