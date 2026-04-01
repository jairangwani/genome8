/**
 * metrics.ts — Tracks convergence pipeline performance.
 *
 * Counts LLM calls, tokens used, time per step.
 * Writes metrics to genome/metrics.json after each convergence.
 */
export interface ConvergenceMetrics {
    llmCalls: number;
    totalTokens: number;
    stepTimings: Record<string, number>;
    startedAt: string;
    completedAt: string;
    modulesProcessed: number;
    nodesCreated: number;
    journeysCreated: number;
}
export declare function trackLLMCall(tokens?: number): void;
export declare function startStep(name: string): void;
export declare function endStep(name: string): void;
export declare function trackModules(count: number): void;
export declare function trackGraph(nodes: number, journeys: number): void;
export declare function getMetrics(): ConvergenceMetrics;
export declare function pipelineInvariantCheck(): {
    passed: boolean;
    missing: string[];
};
