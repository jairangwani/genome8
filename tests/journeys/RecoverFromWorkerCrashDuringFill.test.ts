// Auto-generated from journey: RecoverFromWorkerCrashDuringFill
// Module: codegen
// Triggered by: _actors/LLMWorker
// Modules touched: llm, _actors, codegen

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RecoverFromWorkerCrashDuringFill", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        LLMWorker: { type: 'actor', description: 'Processes the fill task' },
      },
      journeys: {},
    }],
    ['llm', {
      nodes: {
        SendTask: { type: 'process', description: 'Sends a fill task to the LLM worker', files: ['src/llm.ts'] },
        DetectProcessExit: { type: 'process', description: 'Confirms the worker process is no longer running' },
        DrainPartialOutput: { type: 'process', description: 'Reads any partial response before crashing' },
        SpawnWorkerProcess: { type: 'process', description: 'Launches a new worker process', files: ['src/llm.ts'] },
        InjectSystemPrompt: { type: 'process', description: 'Initializes the new worker with the codegen system prompt' },
        ReceiveResult: { type: 'process', description: 'Receives the complete filled source from the replacement worker' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        DetectWorkerCrashDuringFill: { type: 'process', description: 'Detects that the worker exited unexpectedly' },
        RollbackCorruptedFill: { type: 'process', description: 'Discards the partial output since it is incomplete' },
        SkeletonFile: { type: 'artifact', description: 'Provides original skeleton for fresh retry' },
        FillImplementation: { type: 'process', description: 'LLM fills the skeleton in the replacement worker' },
      },
      journeys: {
        RecoverFromWorkerCrashDuringFill: {
          steps: [
            { node: 'llm/SendTask', action: 'has sent a fill task to the LLM worker' },
            { node: '_actors/LLMWorker', action: 'begins processing the fill task' },
            { node: 'DetectWorkerCrashDuringFill', action: 'detects that the worker process exited unexpectedly' },
            { node: 'llm/DetectProcessExit', action: 'confirms the worker process is no longer running' },
            { node: 'DetectWorkerCrashDuringFill', action: 'checks whether any partial output was written before the crash' },
            { node: 'llm/DrainPartialOutput', action: 'reads any partial response the worker streamed before crashing' },
            { node: 'RollbackCorruptedFill', action: 'discards the partial output since it is incomplete' },
            { node: 'SkeletonFile', action: 'provides the original skeleton as the starting point for a fresh retry' },
            { node: 'llm/SpawnWorkerProcess', action: 'launches a new worker process to replace the crashed one' },
            { node: 'llm/InjectSystemPrompt', action: 'initializes the new worker with the codegen system prompt' },
            { node: 'llm/SendTask', action: 're-sends the fill task to the fresh worker' },
            { node: '_actors/LLMWorker', action: 'processes the fill task from scratch in the new session' },
            { node: 'FillImplementation', action: 'LLM fills the skeleton in the replacement worker' },
            { node: 'llm/ReceiveResult', action: 'receives the complete filled source from the replacement worker' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: llm/SendTask has sent a fill task to the LLM worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/llm.ts');
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    expect(journey.steps[0].node).toBe('llm/SendTask');
  });

  it("step 2: _actors/LLMWorker begins processing the fill task", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    // The journey actor is LLMWorker
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("step 3: codegen/DetectWorkerCrashDuringFill detects that the worker process exited unexpectedly or stopped responding", () => {
    const node = result.index.nodes['codegen/DetectWorkerCrashDuringFill'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("step 4: llm/DetectProcessExit confirms the worker process is no longer running", () => {
    const node = result.index.nodes['llm/DetectProcessExit'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/DetectWorkerCrashDuringFill');
  });

  it("step 5: codegen/DetectWorkerCrashDuringFill checks whether any partial output was written before the crash", () => {
    // DetectWorkerCrashDuringFill appears twice in the journey (detect + check partial)
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    const detectSteps = journey.steps.filter(s => s.node === 'codegen/DetectWorkerCrashDuringFill');
    expect(detectSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 6: llm/DrainPartialOutput reads any partial response the worker streamed before crashing", () => {
    const node = result.index.nodes['llm/DrainPartialOutput'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 7: codegen/RollbackCorruptedFill discards the partial output since it is incomplete and potentially corrupt", () => {
    const node = result.index.nodes['codegen/RollbackCorruptedFill'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/DrainPartialOutput');
  });

  it("step 8: codegen/SkeletonFile provides the original skeleton as the starting point for a fresh retry", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/RollbackCorruptedFill');
  });

  it("step 9: llm/SpawnWorkerProcess launches a new worker process to replace the crashed one", () => {
    const node = result.index.nodes['llm/SpawnWorkerProcess'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.files).toContain('src/llm.ts');
  });

  it("step 10: llm/InjectSystemPrompt initializes the new worker with the codegen system prompt", () => {
    const node = result.index.nodes['llm/InjectSystemPrompt'];
    expect(node).toBeDefined();
    expect(node.preceded_by).toContain('llm/SpawnWorkerProcess');
  });

  it("step 11: llm/SendTask re-sends the fill task to the fresh worker", () => {
    // SendTask appears twice: initial send and re-send after recovery
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    const sendSteps = journey.steps.filter(s => s.node === 'llm/SendTask');
    expect(sendSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 12: _actors/LLMWorker processes the fill task from scratch in the new session", () => {
    // LLMWorker appears twice in the journey
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    const workerSteps = journey.steps.filter(s => s.node === '_actors/LLMWorker');
    expect(workerSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 13: codegen/FillImplementation LLM fills the skeleton in the replacement worker", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 14: llm/ReceiveResult receives the complete filled source from the replacement worker", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // It is the last step in the journey
    const journey = result.index.journeys['RecoverFromWorkerCrashDuringFill'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('llm/ReceiveResult');
  });

});
