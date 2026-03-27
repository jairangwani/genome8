// Auto-generated from journey: TrackPipelineStepPerformance
// Module: metrics
// Modules touched: convergence, metrics

import { describe, it, expect } from 'vitest';
import * as metricsModule from '../../src/metrics.js';

// Implementation: src/convergence.ts
// Implementation: src/metrics.ts

describe("TrackPipelineStepPerformance", () => {
  it("step 1: convergence/ReadSpec begins a pipeline step that needs timing", () => {
    // Node: convergence/ReadSpec (process) — has code: src/convergence.ts
    // A pipeline step starts — we record its start time
    metricsModule.startStep('ReadSpec');
    const metrics = metricsModule.getMetrics();
    // After startStep, stepTimings should have an entry for 'ReadSpec'
    expect(metrics.stepTimings).toHaveProperty('ReadSpec');
  });

  it("step 2: metrics/StartStepTimer records the wall-clock start time for the step", () => {
    // Node: metrics/StartStepTimer (process) — has code: src/metrics.ts
    metricsModule.startStep('TestStep');
    const metrics = metricsModule.getMetrics();
    // The stored value should be a number (the elapsed time or a timestamp)
    expect(typeof metrics.stepTimings['TestStep']).toBe('number');
  });

  it("step 3: metrics/ConvergenceMetricsRecord stores the start timestamp keyed by step name", () => {
    // Node: metrics/ConvergenceMetricsRecord (artifact) — has code: src/metrics.ts
    metricsModule.startStep('Organization');
    const metrics = metricsModule.getMetrics();
    expect('Organization' in metrics.stepTimings).toBe(true);
  });

  it("step 4: metrics/StepTimingInvariant ensures startStep was called before endStep resolves timing", () => {
    // Node: metrics/StepTimingInvariant (rule)
    // If endStep is called for a step that was never started, it should be a no-op
    metricsModule.endStep('NeverStarted');
    const metrics = metricsModule.getMetrics();
    // 'NeverStarted' should not appear in stepTimings since startStep was never called
    expect(metrics.stepTimings['NeverStarted']).toBeUndefined();
  });

  it("step 5: metrics/EndStepTimer computes elapsed ms when the step completes", () => {
    // Node: metrics/EndStepTimer (process) — has code: src/metrics.ts
    metricsModule.startStep('ElapsedTest');
    // Small delay to get non-zero elapsed time
    const start = Date.now();
    while (Date.now() - start < 5) { /* spin */ }
    metricsModule.endStep('ElapsedTest');
    const metrics = metricsModule.getMetrics();
    // After endStep, the value should be the elapsed duration (small number, not a large timestamp)
    expect(metrics.stepTimings['ElapsedTest']).toBeGreaterThanOrEqual(0);
    // It should be a reasonable duration, not a raw timestamp
    expect(metrics.stepTimings['ElapsedTest']).toBeLessThan(60000);
  });

  it("step 6: metrics/ConvergenceMetricsRecord replaces the start timestamp with the elapsed duration", () => {
    // Node: metrics/ConvergenceMetricsRecord (artifact) — has code: src/metrics.ts
    metricsModule.startStep('DurationReplace');
    metricsModule.endStep('DurationReplace');
    const metrics = metricsModule.getMetrics();
    // The value should be a small elapsed time, not a raw Date.now() timestamp
    expect(metrics.stepTimings['DurationReplace']).toBeGreaterThanOrEqual(0);
    expect(metrics.stepTimings['DurationReplace']).toBeLessThan(10000);
  });
});
