/**
 * metrics.ts — Tracks convergence pipeline performance.
 *
 * Counts LLM calls, tokens used, time per step.
 * Writes metrics to genome/metrics.json after each convergence.
 */

export interface ConvergenceMetrics {
  llmCalls: number;
  totalTokens: number;
  stepTimings: Record<string, number>; // step name → ms
  startedAt: string;
  completedAt: string;
  modulesProcessed: number;
  nodesCreated: number;
  journeysCreated: number;
}

const current: ConvergenceMetrics = {
  llmCalls: 0,
  totalTokens: 0,
  stepTimings: {},
  startedAt: new Date().toISOString(),
  completedAt: '',
  modulesProcessed: 0,
  nodesCreated: 0,
  journeysCreated: 0,
};

export function trackLLMCall(tokens: number = 0): void {
  current.llmCalls++;
  current.totalTokens += tokens;
}

export function startStep(name: string): void {
  current.stepTimings[name] = Date.now();
}

export function endStep(name: string): void {
  const start = current.stepTimings[name];
  if (start) {
    current.stepTimings[name] = Date.now() - start;
  }
}

export function trackModules(count: number): void {
  current.modulesProcessed = count;
}

export function trackGraph(nodes: number, journeys: number): void {
  current.nodesCreated = nodes;
  current.journeysCreated = journeys;
}

export function getMetrics(): ConvergenceMetrics {
  current.completedAt = new Date().toISOString();
  return { ...current };
}

/**
 * PipelineInvariantCheck: verify all required phases completed before declaring convergence.
 * Returns list of phases that were never started or never finished.
 */
const REQUIRED_PHASES = [
  'step1_organization',
  'step2_actors',
  'step3_modules',
  'step4_convergence',
  'step5_publish',
  'step6_codegen',
];

export function pipelineInvariantCheck(): { passed: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const phase of REQUIRED_PHASES) {
    const timing = current.stepTimings[phase];
    // Missing entirely, or still a raw Date.now() timestamp (startStep called but endStep never was)
    if (timing === undefined) {
      missing.push(phase);
    } else if (timing > 1_000_000_000_000) {
      // Still a raw epoch timestamp — endStep was never called, phase didn't complete
      missing.push(phase);
    }
  }
  return { passed: missing.length === 0, missing };
}
