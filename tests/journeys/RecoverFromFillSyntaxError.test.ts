// Auto-generated from journey: RecoverFromFillSyntaxError
// Module: codegen
// Triggered by: _actors/LLMWorker
// Modules touched: codegen, llm, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RecoverFromFillSyntaxError", () => {
  const modules = new Map<string, ModuleFile>([
    ['_actors', {
      nodes: {
        LLMWorker: { type: 'actor', description: 'Reads the error feedback and re-fills the skeleton' },
      },
      journeys: {},
    }],
    ['llm', {
      nodes: {
        SendTask: { type: 'process', description: 'Sends the retry task with skeleton plus error feedback' },
        ReceiveResult: { type: 'process', description: 'Receives the corrected filled source code' },
      },
      journeys: {},
    }],
    ['codegen', {
      nodes: {
        FillImplementation: { type: 'process', description: 'LLM produces a filled file' },
        FilledSourceFile: { type: 'artifact', description: 'The filled TypeScript content' },
        ValidateFilledSyntax: { type: 'process', description: 'Runs syntax checking and detects errors' },
        RetryFillWithErrorFeedback: { type: 'process', description: 'Packages syntax errors as feedback context' },
        SkeletonFile: { type: 'artifact', description: 'Original skeleton for re-fill' },
      },
      journeys: {
        RecoverFromFillSyntaxError: {
          steps: [
            { node: 'FillImplementation', action: 'has produced a filled file from the LLM worker' },
            { node: 'FilledSourceFile', action: 'provides the filled TypeScript content' },
            { node: 'ValidateFilledSyntax', action: 'runs syntax checking and detects errors in the filled output' },
            { node: 'ValidateFilledSyntax', action: 'collects the specific error messages with line numbers and error types' },
            { node: 'RetryFillWithErrorFeedback', action: 'reads the original skeleton file as the base for the retry' },
            { node: 'SkeletonFile', action: 'provides the original empty skeleton that the LLM will re-fill' },
            { node: 'RetryFillWithErrorFeedback', action: 'packages the syntax errors as feedback context for the retry attempt' },
            { node: 'llm/SendTask', action: 'sends the retry task with the skeleton plus error feedback to the worker' },
            { node: '_actors/LLMWorker', action: 'reads the error feedback and re-fills the skeleton avoiding the previous mistakes' },
            { node: 'FillImplementation', action: 'LLM produces a corrected fill addressing the specific syntax errors' },
            { node: 'llm/ReceiveResult', action: 'receives the corrected filled source code' },
            { node: 'FilledSourceFile', action: 'stores the corrected implementation' },
            { node: 'ValidateFilledSyntax', action: 're-checks the corrected fill for syntax and type errors' },
          ],
        },
      },
    }],
  ]);

  const result = compileFromModules(modules);

  it("step 1: codegen/FillImplementation has produced a filled file from the LLM worker", () => {
    const node = result.index.nodes['codegen/FillImplementation'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    expect(journey.steps[0].node).toBe('codegen/FillImplementation');
  });

  it("step 2: codegen/FilledSourceFile provides the filled TypeScript content", () => {
    const node = result.index.nodes['codegen/FilledSourceFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/FillImplementation');
  });

  it("step 3: codegen/ValidateFilledSyntax runs syntax checking and detects errors in the filled output", () => {
    const node = result.index.nodes['codegen/ValidateFilledSyntax'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/FilledSourceFile');
  });

  it("step 4: codegen/ValidateFilledSyntax collects the specific error messages with line numbers and error types", () => {
    // ValidateFilledSyntax appears multiple times in the journey
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    const validateSteps = journey.steps.filter(s => s.node === 'codegen/ValidateFilledSyntax');
    expect(validateSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 5: codegen/RetryFillWithErrorFeedback reads the original skeleton file as the base for the retry", () => {
    const node = result.index.nodes['codegen/RetryFillWithErrorFeedback'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('codegen/ValidateFilledSyntax');
  });

  it("step 6: codegen/SkeletonFile provides the original empty skeleton that the LLM will re-fill", () => {
    const node = result.index.nodes['codegen/SkeletonFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('codegen/RetryFillWithErrorFeedback');
  });

  it("step 7: codegen/RetryFillWithErrorFeedback packages the syntax errors as feedback context for the retry attempt", () => {
    // RetryFillWithErrorFeedback appears multiple times in the journey
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    const retrySteps = journey.steps.filter(s => s.node === 'codegen/RetryFillWithErrorFeedback');
    expect(retrySteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 8: llm/SendTask sends the retry task with the skeleton plus error feedback to the worker", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    // Cross-module connection from codegen
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: _actors/LLMWorker reads the error feedback and re-fills the skeleton avoiding the previous mistakes", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
  });

  it("step 10: codegen/FillImplementation LLM produces a corrected fill addressing the specific syntax errors", () => {
    // FillImplementation appears at the beginning and later in the recovery cycle
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    const fillSteps = journey.steps.filter(s => s.node === 'codegen/FillImplementation');
    expect(fillSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 11: llm/ReceiveResult receives the corrected filled source code", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
  });

  it("step 12: codegen/FilledSourceFile stores the corrected implementation", () => {
    // FilledSourceFile appears multiple times in the journey
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    const filledSteps = journey.steps.filter(s => s.node === 'codegen/FilledSourceFile');
    expect(filledSteps.length).toBeGreaterThanOrEqual(2);
  });

  it("step 13: codegen/ValidateFilledSyntax re-checks the corrected fill for syntax and type errors", () => {
    // ValidateFilledSyntax is the last step, confirming the corrected fill is valid
    const journey = result.index.journeys['RecoverFromFillSyntaxError'];
    const lastStep = journey.steps[journey.steps.length - 1];
    expect(lastStep.node).toBe('codegen/ValidateFilledSyntax');
  });

});
