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
