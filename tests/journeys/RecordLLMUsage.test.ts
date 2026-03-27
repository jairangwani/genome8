// Auto-generated from journey: RecordLLMUsage
// Module: metrics
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, metrics

import { describe, it, expect, beforeEach } from 'vitest';
import * as metricsModule from '../../src/metrics.js';

// We need fresh metrics state for each test, but metrics.ts uses module-level state.
// We re-import dynamically or test the functions as they are.

describe("RecordLLMUsage", () => {
  it("step 1: _actors/LLMWorker completes an LLM call and reports the token count", () => {
    // Node: _actors/LLMWorker (actor)
    // The LLMWorker reports token usage after a call completes
    const metricsBefore = metricsModule.getMetrics();
    const callsBefore = metricsBefore.llmCalls;
    // An LLM call has been completed; we simulate by calling trackLLMCall
    metricsModule.trackLLMCall(500);
    const metricsAfter = metricsModule.getMetrics();
    expect(metricsAfter.llmCalls).toBe(callsBefore + 1);
  });

  it("step 2: metrics/TrackLLMCall increments the call counter and adds tokens to the running total", () => {
    // Node: metrics/TrackLLMCall (process) — has code: src/metrics.ts
    const before = metricsModule.getMetrics();
    const callsBefore = before.llmCalls;
    const tokensBefore = before.totalTokens;
    metricsModule.trackLLMCall(1200);
    const after = metricsModule.getMetrics();
    expect(after.llmCalls).toBe(callsBefore + 1);
    expect(after.totalTokens).toBe(tokensBefore + 1200);
  });

  it("step 3: metrics/ConvergenceMetricsRecord stores the updated llmCalls and totalTokens fields", () => {
    // Node: metrics/ConvergenceMetricsRecord (artifact) — has code: src/metrics.ts
    const metrics = metricsModule.getMetrics();
    expect(metrics).toHaveProperty('llmCalls');
    expect(metrics).toHaveProperty('totalTokens');
    expect(typeof metrics.llmCalls).toBe('number');
    expect(typeof metrics.totalTokens).toBe('number');
    expect(metrics.llmCalls).toBeGreaterThan(0);
    expect(metrics.totalTokens).toBeGreaterThan(0);
  });
});
