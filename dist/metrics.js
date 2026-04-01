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
export function pipelineInvariantCheck() {
    const missing = [];
    for (const phase of REQUIRED_PHASES) {
        const timing = current.stepTimings[phase];
        // Missing entirely, or still a raw Date.now() timestamp (startStep called but endStep never was)
        if (timing === undefined) {
            missing.push(phase);
        }
        else if (timing > 1_000_000_000_000) {
            // Still a raw epoch timestamp — endStep was never called, phase didn't complete
            missing.push(phase);
        }
    }
    return { passed: missing.length === 0, missing };
}
//# sourceMappingURL=metrics.js.map