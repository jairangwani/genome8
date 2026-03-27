// Auto-generated from journey: FinalizeAndPersistMetrics
// Module: metrics
// Triggered by: _actors/HumanDeveloper
// Modules touched: convergence, metrics, _actors

import { describe, it, expect } from 'vitest';
import * as metricsModule from '../../src/metrics.js';

// Implementation: src/metrics.ts

describe("FinalizeAndPersistMetrics", () => {
  it("step 1: convergence/TriggerPublish signals that convergence has completed and metrics can be finalized", () => {
    // Node: convergence/TriggerPublish (process)
    // Convergence is complete; we simulate by ensuring metrics exist before finalization
    metricsModule.trackLLMCall(100);
    const metrics = metricsModule.getMetrics();
    expect(metrics.llmCalls).toBeGreaterThan(0);
  });

  it("step 2: metrics/FinalizeMetrics stamps completedAt and returns a frozen metrics snapshot", () => {
    // Node: metrics/FinalizeMetrics (process) — has code: src/metrics.ts
    // getMetrics() stamps completedAt each time it is called
    const snapshot = metricsModule.getMetrics();
    expect(snapshot.completedAt).toBeTruthy();
    expect(typeof snapshot.completedAt).toBe('string');
    // completedAt should be a valid ISO timestamp
    expect(new Date(snapshot.completedAt).toISOString()).toBe(snapshot.completedAt);
  });

  it("step 3: metrics/ConvergenceMetricsRecord provides the accumulated data for the snapshot", () => {
    // Node: metrics/ConvergenceMetricsRecord (artifact) — has code: src/metrics.ts
    const snapshot = metricsModule.getMetrics();
    expect(snapshot).toHaveProperty('llmCalls');
    expect(snapshot).toHaveProperty('totalTokens');
    expect(snapshot).toHaveProperty('stepTimings');
    expect(snapshot).toHaveProperty('startedAt');
    expect(snapshot).toHaveProperty('completedAt');
    expect(snapshot).toHaveProperty('modulesProcessed');
    expect(snapshot).toHaveProperty('nodesCreated');
    expect(snapshot).toHaveProperty('journeysCreated');
  });

  it("step 4: metrics/WriteMetricsToDisk serializes the snapshot to JSON", () => {
    // Node: metrics/WriteMetricsToDisk (process) — has code: src/metrics.ts
    // Verify the metrics snapshot can be serialized to JSON without errors
    const snapshot = metricsModule.getMetrics();
    const json = JSON.stringify(snapshot);
    expect(json).toBeTruthy();
    const parsed = JSON.parse(json);
    expect(parsed.llmCalls).toBe(snapshot.llmCalls);
    expect(parsed.totalTokens).toBe(snapshot.totalTokens);
  });

  it("step 5: metrics/MetricsJsonFile receives the written metrics at genome/metrics.json", () => {
    // Node: metrics/MetricsJsonFile (artifact) — has code: src/metrics.ts
    // The metrics snapshot has the correct structure for persisting to disk
    const snapshot = metricsModule.getMetrics();
    expect(typeof snapshot.startedAt).toBe('string');
    expect(typeof snapshot.completedAt).toBe('string');
    expect(typeof snapshot.stepTimings).toBe('object');
  });

  it("step 6: _actors/HumanDeveloper reads genome/metrics.json to review pipeline performance", () => {
    // Node: _actors/HumanDeveloper (actor)
    // The metrics record is readable and contains all performance fields
    const snapshot = metricsModule.getMetrics();
    expect(snapshot.llmCalls).toBeGreaterThanOrEqual(0);
    expect(snapshot.totalTokens).toBeGreaterThanOrEqual(0);
    expect(snapshot.modulesProcessed).toBeGreaterThanOrEqual(0);
    expect(snapshot.nodesCreated).toBeGreaterThanOrEqual(0);
    expect(snapshot.journeysCreated).toBeGreaterThanOrEqual(0);
  });
});
