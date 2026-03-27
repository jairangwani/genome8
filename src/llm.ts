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

import { spawn, execSync, type ChildProcess } from 'node:child_process';
import { platform } from 'node:os';

// ── Configuration ──

const MESSAGE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes per call. Audit/codegen are the heaviest — 5-8min typical.
// DO NOT manage context manually. Claude Code handles its own context compaction.
// Session reset disabled (Infinity). The persistent process lives until killed.
const SESSION_RESET_CHARS = Infinity;

// ── Resolve claude binary path once ──

let claudeBin = 'claude';
if (platform() === 'win32') {
  try {
    claudeBin = execSync('where claude', { encoding: 'utf-8', stdio: 'pipe', windowsHide: true })
      .trim().split('\n')[0].trim();
  } catch {
    // Fall back to bare name
  }
}

// ── Types ──

interface WorkerProcess {
  process: ChildProcess;
  buffer: string;
  charsSent: number;
  initialized: boolean;
  initResolve: (() => void) | null;
  responseResolve: ((value: string) => void) | null;
  responseReject: ((err: Error) => void) | null;
  responseTimeout: ReturnType<typeof setTimeout> | null;
  resultText: string;
}

// ── Windows process kill ──

function killProcessTree(proc: ChildProcess) {
  if (!proc.pid) return;
  if (platform() === 'win32') {
    try {
      execSync(`taskkill /T /F /PID ${proc.pid}`, { stdio: 'pipe', windowsHide: true });
    } catch { /* already dead */ }
  } else {
    try { proc.kill('SIGTERM'); } catch { /* already dead */ }
    setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch { /* already dead */ }
    }, 5000);
  }
}

// ── LLM Worker ──

export class LLMWorker {
  private worker: WorkerProcess | null = null;
  private cwd: string;
  private systemPrompt: string;
  private model: string;
  private sessionResetChars: number;

  constructor(options: {
    cwd: string;
    systemPrompt?: string;
    model?: string;
    sessionResetChars?: number;
  }) {
    this.cwd = options.cwd;
    this.systemPrompt = options.systemPrompt || '';
    this.model = options.model || 'claude-opus-4-6'; // ALWAYS Opus 4.6 (1M context)
    this.sessionResetChars = options.sessionResetChars || SESSION_RESET_CHARS;
  }

  /**
   * Spawn or reuse the persistent Claude Code process.
   * Like crew3: spawn and send immediately. No waiting for init.
   */
  private ensureProcess(): void {
    if (this.worker && this.worker.process.exitCode === null) {
      if (this.worker.charsSent > this.sessionResetChars) {
        console.log(`  [llm] Session at ${this.worker.charsSent} chars, resetting`);
        this.kill();
      } else {
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

    const w: WorkerProcess = {
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
    proc.stdout!.on('data', (data: Buffer) => {
      w.buffer += data.toString();
      const lines = w.buffer.split('\n');
      w.buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          // Mark initialized when we see the init message (informational only)
          if (msg.type === 'system' && msg.subtype === 'init') {
            w.initialized = true;
          }
          this.processMessage(msg);
        } catch {
          // Not valid JSON — ignore
        }
      }
    });

    // ── stderr handler ──
    proc.stderr!.on('data', (data: Buffer) => {
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
        } catch { /* ignore */ }
      }

      if (w.responseReject) {
        w.responseReject(new Error(`Process exited with code ${code}`));
        if (w.responseTimeout) clearTimeout(w.responseTimeout);
        w.responseResolve = null;
        w.responseReject = null;
        w.responseTimeout = null;
      }

      this.worker = null;
    });

    proc.on('error', (err) => {
      if (w.responseReject) {
        w.responseReject(err);
        if (w.responseTimeout) clearTimeout(w.responseTimeout);
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
  private processMessage(msg: any): void {
    if (!this.worker) return;

    // "result" message = response complete
    if (msg.type === 'result') {
      const resultText = msg.result || '';
      this.worker.resultText = resultText;

      if (this.worker.responseResolve) {
        if (this.worker.responseTimeout) clearTimeout(this.worker.responseTimeout);
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
          } else if (name === 'Edit') {
            console.log(`    [tool] Edit: ${input.file_path || '?'}`);
          } else if (name === 'Read') {
            // Don't log reads — too noisy
          } else {
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
  async call(prompt: string): Promise<string> {
    this.ensureProcess();
    const w = this.worker!;

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
    const canWrite = w.process.stdin!.write(jsonLine + '\n');
    if (!canWrite) {
      console.log(`  [llm] Backpressure detected (${Math.round(jsonLine.length / 1024)}KB) — waiting for drain...`);
      // Drain wait with timeout — if worker dies during drain, don't hang forever
      await new Promise<void>((resolve) => {
        const drainTimeout = setTimeout(() => {
          console.log('  [llm] Drain timeout (60s) — worker may be dead. Continuing.');
          resolve();
        }, 60_000);
        w.process.stdin!.once('drain', () => { clearTimeout(drainTimeout); resolve(); });
        // Also resolve if process dies
        if (w.process.exitCode !== null) { clearTimeout(drainTimeout); resolve(); }
        w.process.once('exit', () => { clearTimeout(drainTimeout); resolve(); });
      });
      console.log(`  [llm] Drain complete, message sent.`);
    }

    return new Promise<string>((resolve, reject) => {
      w.responseResolve = resolve;
      w.responseReject = reject;

      // Timeout
      w.responseTimeout = setTimeout(() => {
        console.error(`  [llm] Message timed out after ${MESSAGE_TIMEOUT_MS / 1000}s`);
        w.responseResolve = null;
        w.responseReject = null;
        w.responseTimeout = null;
        this.kill();
        reject(new Error('LLM call timeout'));
      }, MESSAGE_TIMEOUT_MS);
    });
  }

  /**
   * Kill the worker process.
   */
  kill(): void {
    if (this.worker) {
      if (this.worker.responseReject) {
        this.worker.responseReject(new Error('Worker killed'));
      }
      if (this.worker.responseTimeout) clearTimeout(this.worker.responseTimeout);
      killProcessTree(this.worker.process);
      this.worker = null;
    }
  }

  /**
   * Check if the worker process is alive.
   */
  isAlive(): boolean {
    return this.worker !== null && this.worker.process.exitCode === null;
  }
}
