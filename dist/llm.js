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
import { spawn, execSync } from 'node:child_process';
import { platform } from 'node:os';
// ── Configuration ──
// Default 10 min. Projects can override via genome/config.json: { "messageTimeoutMs": 1200000 }
const DEFAULT_MESSAGE_TIMEOUT_MS = 10 * 60 * 1000;
// DO NOT manage context manually. Claude Code handles its own context compaction.
// Session reset disabled (Infinity). The persistent process lives until killed.
const SESSION_RESET_CHARS = Infinity;
// ── Resolve claude binary path once ──
let claudeBin = 'claude';
if (platform() === 'win32') {
    try {
        claudeBin = execSync('where claude', { encoding: 'utf-8', stdio: 'pipe', windowsHide: true })
            .trim().split('\n')[0].trim();
    }
    catch {
        // Fall back to bare name
    }
}
// ── Windows process kill ──
function killProcessTree(proc) {
    if (!proc.pid)
        return;
    if (platform() === 'win32') {
        try {
            execSync(`taskkill /T /F /PID ${proc.pid}`, { stdio: 'pipe', windowsHide: true });
        }
        catch { /* already dead */ }
    }
    else {
        try {
            proc.kill('SIGTERM');
        }
        catch { /* already dead */ }
        setTimeout(() => {
            try {
                proc.kill('SIGKILL');
            }
            catch { /* already dead */ }
        }, 5000);
    }
}
// ── LLM Worker ──
export class LLMWorker {
    worker = null;
    cwd;
    systemPrompt;
    model;
    sessionResetChars;
    messageTimeoutMs;
    constructor(options) {
        this.cwd = options.cwd;
        this.systemPrompt = options.systemPrompt || '';
        this.model = options.model || 'claude-opus-4-6';
        this.sessionResetChars = options.sessionResetChars || SESSION_RESET_CHARS;
        this.messageTimeoutMs = options.messageTimeoutMs || DEFAULT_MESSAGE_TIMEOUT_MS;
    }
    /**
     * Spawn or reuse the persistent Claude Code process.
     * Like crew3: spawn and send immediately. No waiting for init.
     */
    ensureProcess() {
        if (this.worker && this.worker.process.exitCode === null) {
            if (this.worker.charsSent > this.sessionResetChars) {
                console.log(`  [llm] Session at ${this.worker.charsSent} chars, resetting`);
                this.kill();
            }
            else {
                return;
            }
        }
        // Kill any leftover worker
        if (this.worker) {
            this.kill();
        }
        const args = [
            '-p',
            '--verbose',
            '--input-format', 'stream-json',
            '--output-format', 'stream-json',
            '--dangerously-skip-permissions',
            '--model', this.model,
        ];
        if (this.systemPrompt) {
            args.push('--append-system-prompt', this.systemPrompt);
        }
        // Remove nesting-detection env vars
        const env = { ...process.env };
        delete env.CLAUDECODE;
        delete env.CLAUDE_CODE_ENTRYPOINT;
        delete env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS;
        const proc = spawn(claudeBin, args, {
            cwd: this.cwd,
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
            windowsHide: true,
        });
        const w = {
            process: proc,
            buffer: '',
            charsSent: 0,
            initialized: false,
            initResolve: null,
            responseResolve: null,
            responseReject: null,
            responseTimeout: null,
            resultText: '',
        };
        this.worker = w;
        // ── stdout handler ──
        proc.stdout.on('data', (data) => {
            w.buffer += data.toString();
            const lines = w.buffer.split('\n');
            w.buffer = lines.pop() || '';
            for (const line of lines) {
                if (!line.trim())
                    continue;
                try {
                    const msg = JSON.parse(line);
                    // Mark initialized when we see the init message (informational only)
                    if (msg.type === 'system' && msg.subtype === 'init') {
                        w.initialized = true;
                    }
                    this.processMessage(msg);
                }
                catch {
                    // Not valid JSON — ignore
                }
            }
        });
        // ── stderr handler ──
        proc.stderr.on('data', (data) => {
            const text = data.toString().trim();
            if (text) {
                console.error(`  [llm stderr] ${text.substring(0, 500)}`);
            }
        });
        // ── Process death ──
        proc.on('close', (code) => {
            if (w.buffer.trim()) {
                try {
                    this.processMessage(JSON.parse(w.buffer.trim()));
                }
                catch { /* ignore */ }
            }
            if (w.responseReject) {
                w.responseReject(new Error(`Process exited with code ${code}`));
                if (w.responseTimeout)
                    clearTimeout(w.responseTimeout);
                w.responseResolve = null;
                w.responseReject = null;
                w.responseTimeout = null;
            }
            this.worker = null;
        });
        proc.on('error', (err) => {
            if (w.responseReject) {
                w.responseReject(err);
                if (w.responseTimeout)
                    clearTimeout(w.responseTimeout);
                w.responseResolve = null;
                w.responseReject = null;
                w.responseTimeout = null;
            }
            this.worker = null;
        });
        console.log(`  [llm] Spawned Claude Code process (pid: ${proc.pid}, model: ${this.model})`);
    }
    /**
     * Process a single NDJSON message from stdout.
     */
    processMessage(msg) {
        if (!this.worker)
            return;
        // "result" message = response complete
        if (msg.type === 'result') {
            const resultText = msg.result || '';
            this.worker.resultText = resultText;
            if (this.worker.responseResolve) {
                if (this.worker.responseTimeout)
                    clearTimeout(this.worker.responseTimeout);
                const resolve = this.worker.responseResolve;
                this.worker.responseResolve = null;
                this.worker.responseReject = null;
                this.worker.responseTimeout = null;
                resolve(resultText);
            }
            // Detect rate limiting
            const isError = msg.subtype !== 'success';
            if (isError && /hit your limit|rate.?limit|too many requests|429/i.test(resultText)) {
                console.log(`  [llm] Rate limited — killing process, will retry after pause`);
                this.kill();
            }
            // Detect session errors
            if (msg.subtype === 'error_during_execution') {
                console.log(`  [llm] Session error — killing process for fresh start`);
                setTimeout(() => this.kill(), 100);
            }
        }
        // Log tool calls for visibility
        if (msg.type === 'assistant') {
            const content = msg.message?.content || [];
            for (const block of content) {
                if (block.type === 'tool_use') {
                    const name = block.name;
                    const input = block.input || {};
                    if (name === 'Write') {
                        console.log(`    [tool] Write: ${input.file_path || '?'}`);
                    }
                    else if (name === 'Edit') {
                        console.log(`    [tool] Edit: ${input.file_path || '?'}`);
                    }
                    else if (name === 'Read') {
                        // Don't log reads — too noisy
                    }
                    else {
                        console.log(`    [tool] ${name}`);
                    }
                }
            }
        }
    }
    /**
     * Send a prompt to the Claude Code worker and wait for its response.
     * The worker has full tool access — it can Read, Write, Edit files.
     * Returns the text result from the agent.
     */
    async call(prompt) {
        this.ensureProcess();
        const w = this.worker;
        // Brief delay for fresh process to start accepting stdin.
        // Claude Code doesn't send an init message we can detect.
        // 2 seconds is enough for process spawn + stdin ready.
        if (!w.initialized) {
            await new Promise(r => setTimeout(r, 2000));
            w.initialized = true;
        }
        if (w.responseResolve) {
            throw new Error('A message is already in flight');
        }
        w.charsSent += prompt.length;
        w.resultText = '';
        // Build the JSON message
        const jsonLine = JSON.stringify({
            type: 'user',
            message: { role: 'user', content: prompt },
        });
        // Handle backpressure: large prompts (30KB+) can overflow stdin buffer.
        // write() returns false when buffer is full — must wait for 'drain' before continuing.
        const canWrite = w.process.stdin.write(jsonLine + '\n');
        if (!canWrite) {
            console.log(`  [llm] Backpressure detected (${Math.round(jsonLine.length / 1024)}KB) — waiting for drain...`);
            // Drain wait with timeout — if worker dies during drain, don't hang forever
            await new Promise((resolve) => {
                const drainTimeout = setTimeout(() => {
                    console.log('  [llm] Drain timeout (60s) — worker may be dead. Continuing.');
                    resolve();
                }, 60_000);
                w.process.stdin.once('drain', () => { clearTimeout(drainTimeout); resolve(); });
                // Also resolve if process dies
                if (w.process.exitCode !== null) {
                    clearTimeout(drainTimeout);
                    resolve();
                }
                w.process.once('exit', () => { clearTimeout(drainTimeout); resolve(); });
            });
            console.log(`  [llm] Drain complete, message sent.`);
        }
        return new Promise((resolve, reject) => {
            w.responseResolve = resolve;
            w.responseReject = reject;
            // Timeout
            w.responseTimeout = setTimeout(() => {
                console.error(`  [llm] Message timed out after ${this.messageTimeoutMs / 1000}s`);
                w.responseResolve = null;
                w.responseReject = null;
                w.responseTimeout = null;
                this.kill();
                reject(new Error('LLM call timeout'));
            }, this.messageTimeoutMs);
        });
    }
    /**
     * Kill the worker process.
     */
    kill() {
        if (this.worker) {
            if (this.worker.responseReject) {
                this.worker.responseReject(new Error('Worker killed'));
            }
            if (this.worker.responseTimeout)
                clearTimeout(this.worker.responseTimeout);
            killProcessTree(this.worker.process);
            this.worker = null;
        }
    }
    /**
     * Check if the worker process is alive.
     */
    isAlive() {
        return this.worker !== null && this.worker.process.exitCode === null;
    }
    /**
     * Health check: verify worker is alive and not stuck.
     * Returns 'healthy', 'dead', or 'busy' (message in flight).
     * Enables HealthCheckBeforeTaskDispatch journey.
     */
    healthCheck() {
        if (!this.worker || this.worker.process.exitCode !== null)
            return 'dead';
        if (this.worker.responseResolve)
            return 'busy';
        return 'healthy';
    }
    /**
     * Get worker stats for diagnostics.
     */
    getStats() {
        if (!this.worker)
            return null;
        return {
            pid: this.worker.process.pid,
            charsSent: this.worker.charsSent,
            initialized: this.worker.initialized,
        };
    }
}
// ── Worker Output Validation ──
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
/**
 * Validate that expected output files from a worker task exist, are non-empty,
 * and — for YAML module files — have valid syntax and required schema fields.
 */
export function validateWorkerOutput(expectedFiles, projectDir) {
    const valid = [];
    const missing = [];
    const empty = [];
    const malformed = [];
    for (const file of expectedFiles) {
        const absPath = path.resolve(projectDir, file);
        if (!fs.existsSync(absPath)) {
            missing.push(file);
            continue;
        }
        const stat = fs.statSync(absPath);
        if (stat.size === 0) {
            empty.push(file);
            continue;
        }
        // YAML module files: validate syntax + schema
        if (/\.ya?ml$/.test(file)) {
            try {
                const content = fs.readFileSync(absPath, 'utf-8');
                const parsed = yaml.load(content);
                if (!parsed || typeof parsed !== 'object') {
                    malformed.push(`${file}: YAML parsed to non-object`);
                    continue;
                }
                // Module schema check: nodes and journeys must be maps if present
                if (parsed.nodes !== undefined && (typeof parsed.nodes !== 'object' || Array.isArray(parsed.nodes))) {
                    malformed.push(`${file}: nodes must be a map, got ${Array.isArray(parsed.nodes) ? 'array' : typeof parsed.nodes}`);
                    continue;
                }
                if (parsed.journeys !== undefined && (typeof parsed.journeys !== 'object' || Array.isArray(parsed.journeys))) {
                    malformed.push(`${file}: journeys must be a map, got ${Array.isArray(parsed.journeys) ? 'array' : typeof parsed.journeys}`);
                    continue;
                }
                valid.push(file);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message.split('\n')[0] : 'unknown parse error';
                malformed.push(`${file}: ${msg}`);
            }
        }
        else {
            valid.push(file);
        }
    }
    return { valid, missing, empty, malformed };
}
/**
 * Scan expected output paths for any files the worker wrote before crashing.
 * Returns paths of files that exist (partial work that may be recoverable).
 */
export function drainPartialOutput(expectedPaths, projectDir) {
    const found = [];
    for (const file of expectedPaths) {
        const absPath = path.resolve(projectDir, file);
        if (fs.existsSync(absPath) && fs.statSync(absPath).size > 0) {
            found.push(file);
        }
    }
    return found;
}
// ── Path Scoping (defense in depth) ──
/**
 * Check if a file path is within the allowed directory.
 * Defense-in-depth against path traversal — Claude Code also has its own checks.
 */
export function isPathWithinScope(filePath, allowedDir) {
    const resolved = path.resolve(filePath);
    const allowed = path.resolve(allowedDir);
    return resolved.startsWith(allowed + path.sep) || resolved === allowed;
}
/**
 * Scan task context for common prompt injection patterns.
 * Returns suspicious patterns found, empty array if clean.
 * Standalone export for the DetectPromptInjection node.
 */
export function detectPromptInjection(context) {
    const suspicious = [];
    const patterns = [
        { pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/i, label: 'instruction override' },
        { pattern: /you\s+are\s+now\s+(?:a|an)\s+/i, label: 'role reassignment' },
        { pattern: /system\s*:\s*/i, label: 'system prompt injection' },
        { pattern: /\<\/?system(?:-reminder)?\>/i, label: 'system tag injection' },
        { pattern: /do\s+not\s+follow\s+(?:the|your)\s+(?:original|initial)/i, label: 'instruction negation' },
    ];
    for (const { pattern, label } of patterns) {
        if (pattern.test(context)) {
            suspicious.push(label);
        }
    }
    return suspicious;
}
/**
 * Check if a bash command is dangerous and should be blocked.
 * Returns the reason for blocking, or null if safe.
 * Standalone export for the FilterBashCommands node.
 */
export function filterBashCommand(command) {
    const dangerous = [
        { pattern: /rm\s+-rf\s+[\/~]/, reason: 'recursive delete of root or home' },
        { pattern: /:\(\)\s*\{/, reason: 'fork bomb' },
        { pattern: /mkfs\b/, reason: 'filesystem format' },
        { pattern: /dd\s+.*of=\/dev\//, reason: 'raw device write' },
        { pattern: />\s*\/dev\/sd/, reason: 'raw device redirect' },
        { pattern: /curl\s+.*\|\s*(?:bash|sh)/, reason: 'pipe remote script to shell' },
        { pattern: /wget\s+.*\|\s*(?:bash|sh)/, reason: 'pipe remote script to shell' },
    ];
    for (const { pattern, reason } of dangerous) {
        if (pattern.test(command))
            return reason;
    }
    return null;
}
/**
 * Classify a worker failure into a category for routing to the correct
 * recovery handler.
 * Standalone export for the ClassifyFailureType node.
 */
export function classifyFailureType(report) {
    if (report.type === 'timeout')
        return 'timeout';
    if (report.type === 'stream_failure')
        return 'stream_failure';
    if (report.type === 'crash') {
        // Check if it was a rate limit
        const partialText = report.partialOutput.join('\n').toLowerCase();
        if (partialText.includes('rate limit') || partialText.includes('429')) {
            return 'rate_limit';
        }
        return 'crash';
    }
    return 'unknown';
}
/**
 * Detect when a worker process is unresponsive by checking if the process
 * is still running and how long since last output.
 * Standalone export for the DetectStaleWorkerProcess node.
 */
export function detectStaleWorkerProcess(pid, lastActivityMs, maxIdleMs = 120_000) {
    const idleTime = Date.now() - lastActivityMs;
    if (idleTime < maxIdleMs)
        return false;
    // Check if process is still running
    try {
        process.kill(pid, 0); // Signal 0 = check existence
        return true; // Process exists but idle too long = stale
    }
    catch {
        return false; // Process doesn't exist = not stale, just dead
    }
}
/**
 * Scan for leftover worker subprocesses from a previous run.
 * Returns PIDs of orphan processes found.
 * Standalone export for the DetectOrphanWorkerProcess node.
 */
export function detectOrphanWorkerProcesses(expectedPids) {
    const orphans = [];
    for (const pid of expectedPids) {
        try {
            process.kill(pid, 0); // Check if still running
            orphans.push(pid);
        }
        catch {
            // Process already terminated — not an orphan
        }
    }
    return orphans;
}
//# sourceMappingURL=llm.js.map