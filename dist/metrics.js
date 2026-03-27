/**
 * metrics.ts — Tracks convergence pipeline performance.
 *
 * Counts LLM calls, tokens used, time per step.
 * Writes metrics to genome/metrics.json after each convergence.
 */
const current = {
    llmCalls: 0,
    totalTokens: 0,
    stepTimings: {},
    startedAt: new Date().toISOString(),
    completedAt: '',
    modulesProcessed: 0,
    nodesCreated: 0,
    journeysCreated: 0,
};
export function trackLLMCall(tokens = 0) {
    current.llmCalls++;
    current.totalTokens += tokens;
}
export function startStep(name) {
    current.stepTimings[name] = Date.now();
}
export function endStep(name) {
    const start = current.stepTimings[name];
    if (start) {
        current.stepTimings[name] = Date.now() - start;
    }
}
export function trackModules(count) {
    current.modulesProcessed = count;
}
export function trackGraph(nodes, journeys) {
    current.nodesCreated = nodes;
    current.journeysCreated = journeys;
}
export function getMetrics() {
    current.completedAt = new Date().toISOString();
    return { ...current };
}
//# sourceMappingURL=metrics.js.map