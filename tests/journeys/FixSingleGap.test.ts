// Auto-generated from journey: FixSingleGap
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, llm, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

function buildModules(): Map<string, ModuleFile> {
  const modules = new Map<string, ModuleFile>();

  modules.set('_actors', {
    nodes: {
      LLMWorker: { type: 'actor', description: 'persistent Claude Code process that creates module content, fills code, and fills test assertions when asked' },
      Compiler: { type: 'actor', description: 'the compilation process that validates graph structure' },
      Auditor: { type: 'actor', description: 'the LLM-based auditor that checks coverage from multiple angles' },
    },
  });

  modules.set('llm', {
    nodes: {
      SendTask: { type: 'process', description: 'sends a task to the LLM worker via stream-JSON protocol' },
      ReceiveResult: { type: 'process', description: 'receives and parses the result from the LLM worker via stream-JSON protocol' },
    },
  });

  modules.set('graph', {
    nodes: {
      ModuleFile: { type: 'artifact', description: 'a single module YAML file on disk in the genome/modules directory' },
    },
  });

  modules.set('compilation', {
    nodes: {
      CompilationResult: { type: 'artifact', description: 'the output of compile.ts containing the compiled index, issues list, and coverage report' },
    },
  });

  modules.set('audit', {
    nodes: {
      AuditFindingsList: { type: 'artifact', description: 'the collected list of coverage gaps from all 4 auditors with gap type, location, and description' },
      SelectNextGapToFix: { type: 'process', description: 'picks the highest-priority unfixed gap from the prioritized list and advances the pointer to the next gap' },
      ProvideFixContext: { type: 'process', description: 'assembles the target module excerpt, the specific gap description, and surrounding graph context into a complete fix payload for the LLM worker' },
      BuildGapFixPrompt: { type: 'process', description: 'builds a targeted fix prompt for each gap specifying exactly which module to edit and what coverage to add' },
      ApplyFix: { type: 'process', description: 'delegates to LLM to edit the specific module YAML file to close the identified coverage gap' },
      VerifyFixCompiles: { type: 'process', description: 'runs compile.ts after each fix to ensure the edit did not introduce new errors' },
      DetectFixInducedErrors: { type: 'process', description: 'compares pre-fix and post-fix compilation results to detect new orphans, duplicates, or dangling refs' },
      VerifyGapClosed: { type: 'process', description: 're-runs the specific auditor that found the gap to confirm the fix actually closed it' },
      DetectFixInducedGaps: { type: 'process', description: 'compares pre-fix and post-fix audit findings to detect new coverage gaps opened by a fix' },
      TrackAuditRound: { type: 'artifact', description: 'records the current audit-fix-reaudit cycle number and cumulative gaps fixed for progress tracking and termination decisions' },
    },
    journeys: {
      FixSingleGap: {
        steps: [
          { node: 'AuditFindingsList', action: 'provides the prioritized list of gaps' },
          { node: 'SelectNextGapToFix', action: 'picks the next unfixed gap from the prioritized list' },
          { node: 'ProvideFixContext', action: 'assembles the module excerpt and gap description for the worker' },
          { node: 'BuildGapFixPrompt', action: 'builds the targeted fix prompt with module context and specific gap' },
          { node: 'llm/SendTask', action: 'sends the fix task to the LLM worker process' },
          { node: '_actors/LLMWorker', action: 'reads the fix prompt and understands which module and gap to address' },
          { node: 'llm/ReceiveResult', action: 'receives the worker edited YAML output' },
          { node: 'ApplyFix', action: 'writes the edited YAML content to the target module file' },
          { node: 'graph/ModuleFile', action: 'stores the updated module on disk' },
          { node: 'VerifyFixCompiles', action: 'triggers compilation on the updated module' },
          { node: '_actors/Compiler', action: 'validates the edit produced 0 new errors' },
          { node: 'compilation/CompilationResult', action: 'provides the post-fix compilation result' },
          { node: 'DetectFixInducedErrors', action: 'checks whether the fix introduced new orphans, duplicates, or dangling refs' },
          { node: 'VerifyGapClosed', action: 're-runs the auditor that originally found this gap' },
          { node: '_actors/Auditor', action: 'confirms the specific gap no longer appears in the coverage check' },
          { node: 'DetectFixInducedGaps', action: 'checks whether the fix opened new coverage gaps in other angles' },
          { node: 'TrackAuditRound', action: 'records that one more gap has been fixed in this round' },
        ],
      },
    },
  });

  return modules;
}

describe("FixSingleGap", () => {
  const modules = buildModules();
  const result = compileFromModules(modules);
  const journey = result.index.journeys['FixSingleGap'];

  it("step 1: audit/AuditFindingsList provides the prioritized list of gaps", () => {
    const node = result.index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.in_journeys.some(j => j.startsWith('FixSingleGap'))).toBe(true);
  });

  it("step 2: audit/SelectNextGapToFix picks the next unfixed gap from the prioritized list", () => {
    const node = result.index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/AuditFindingsList');
  });

  it("connection: audit/AuditFindingsList → audit/SelectNextGapToFix", () => {
    const src = result.index.nodes['audit/AuditFindingsList'];
    expect(src.followed_by).toContain('audit/SelectNextGapToFix');
  });

  it("step 3: audit/ProvideFixContext assembles the module excerpt and gap description for the worker", () => {
    const node = result.index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/SelectNextGapToFix');
  });

  it("connection: audit/SelectNextGapToFix → audit/ProvideFixContext", () => {
    const src = result.index.nodes['audit/SelectNextGapToFix'];
    expect(src.followed_by).toContain('audit/ProvideFixContext');
  });

  it("step 4: audit/BuildGapFixPrompt builds the targeted fix prompt with module context and specific gap", () => {
    const node = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/ProvideFixContext');
  });

  it("connection: audit/ProvideFixContext → audit/BuildGapFixPrompt", () => {
    const src = result.index.nodes['audit/ProvideFixContext'];
    expect(src.followed_by).toContain('audit/BuildGapFixPrompt');
  });

  it("step 5: llm/SendTask sends the fix task to the LLM worker process", () => {
    const node = result.index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/BuildGapFixPrompt');
  });

  it("connection: audit/BuildGapFixPrompt → llm/SendTask", () => {
    const src = result.index.nodes['audit/BuildGapFixPrompt'];
    expect(src.followed_by).toContain('llm/SendTask');
  });

  it("step 6: _actors/LLMWorker reads the fix prompt and understands which module and gap to address", () => {
    const node = result.index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('llm/SendTask');
  });

  it("connection: llm/SendTask → _actors/LLMWorker", () => {
    const src = result.index.nodes['llm/SendTask'];
    expect(src.followed_by).toContain('_actors/LLMWorker');
  });

  it("step 7: llm/ReceiveResult receives the worker's edited YAML output", () => {
    const node = result.index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/LLMWorker');
  });

  it("connection: _actors/LLMWorker → llm/ReceiveResult", () => {
    const src = result.index.nodes['_actors/LLMWorker'];
    expect(src.followed_by).toContain('llm/ReceiveResult');
  });

  it("step 8: audit/ApplyFix writes the edited YAML content to the target module file", () => {
    const node = result.index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('llm/ReceiveResult');
  });

  it("connection: llm/ReceiveResult → audit/ApplyFix", () => {
    const src = result.index.nodes['llm/ReceiveResult'];
    expect(src.followed_by).toContain('audit/ApplyFix');
  });

  it("step 9: graph/ModuleFile stores the updated module on disk", () => {
    const node = result.index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/ApplyFix');
  });

  it("connection: audit/ApplyFix → graph/ModuleFile", () => {
    const src = result.index.nodes['audit/ApplyFix'];
    expect(src.followed_by).toContain('graph/ModuleFile');
  });

  it("step 10: audit/VerifyFixCompiles triggers compilation on the updated module", () => {
    const node = result.index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('graph/ModuleFile');
  });

  it("connection: graph/ModuleFile → audit/VerifyFixCompiles", () => {
    const src = result.index.nodes['graph/ModuleFile'];
    expect(src.followed_by).toContain('audit/VerifyFixCompiles');
  });

  it("step 11: _actors/Compiler validates the edit produced 0 new errors", () => {
    const node = result.index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyFixCompiles');
  });

  it("connection: audit/VerifyFixCompiles → _actors/Compiler", () => {
    const src = result.index.nodes['audit/VerifyFixCompiles'];
    expect(src.followed_by).toContain('_actors/Compiler');
  });

  it("step 12: compilation/CompilationResult provides the post-fix compilation result", () => {
    const node = result.index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('_actors/Compiler');
  });

  it("connection: _actors/Compiler → compilation/CompilationResult", () => {
    const src = result.index.nodes['_actors/Compiler'];
    expect(src.followed_by).toContain('compilation/CompilationResult');
  });

  it("step 13: audit/DetectFixInducedErrors checks whether the fix introduced new orphans, duplicates, or dangling refs", () => {
    const node = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('compilation/CompilationResult');
  });

  it("connection: compilation/CompilationResult → audit/DetectFixInducedErrors", () => {
    const src = result.index.nodes['compilation/CompilationResult'];
    expect(src.followed_by).toContain('audit/DetectFixInducedErrors');
  });

  it("step 14: audit/VerifyGapClosed re-runs the auditor that originally found this gap", () => {
    const node = result.index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('audit/DetectFixInducedErrors');
  });

  it("connection: audit/DetectFixInducedErrors → audit/VerifyGapClosed", () => {
    const src = result.index.nodes['audit/DetectFixInducedErrors'];
    expect(src.followed_by).toContain('audit/VerifyGapClosed');
  });

  it("step 15: _actors/Auditor confirms the specific gap no longer appears in the coverage check", () => {
    const node = result.index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.preceded_by).toContain('audit/VerifyGapClosed');
  });

  it("connection: audit/VerifyGapClosed → _actors/Auditor", () => {
    const src = result.index.nodes['audit/VerifyGapClosed'];
    expect(src.followed_by).toContain('_actors/Auditor');
  });

  it("step 16: audit/DetectFixInducedGaps checks whether the fix opened new coverage gaps in other angles", () => {
    const node = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.preceded_by).toContain('_actors/Auditor');
  });

  it("connection: _actors/Auditor → audit/DetectFixInducedGaps", () => {
    const src = result.index.nodes['_actors/Auditor'];
    expect(src.followed_by).toContain('audit/DetectFixInducedGaps');
  });

  it("step 17: audit/TrackAuditRound records that one more gap has been fixed in this round", () => {
    const node = result.index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.preceded_by).toContain('audit/DetectFixInducedGaps');
  });

  it("connection: audit/DetectFixInducedGaps → audit/TrackAuditRound", () => {
    const src = result.index.nodes['audit/DetectFixInducedGaps'];
    expect(src.followed_by).toContain('audit/TrackAuditRound');
  });

  it("journey has 17 steps and compiles without errors", () => {
    expect(journey.steps).toHaveLength(17);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
