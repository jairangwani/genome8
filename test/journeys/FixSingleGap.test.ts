// Auto-generated from journey: FixSingleGap
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, llm, _actors, graph, compilation

import { describe, it, expect } from 'vitest';
import { compile } from '../../src/compile.js';
import path from 'node:path';

const modulesDir = path.resolve(__dirname, '../../genome/modules');
const result = compile(modulesDir);
const { index } = result;

const journey = index.journeys['FixSingleGap'];
const steps = journey.steps;

describe("FixSingleGap", () => {
  it("journey exists with correct module, step count, and modules touched", () => {
    expect(journey).toBeDefined();
    expect(journey.module).toBe('audit');
    expect(steps).toHaveLength(17);
    expect(journey.modules_touched).toEqual(
      expect.arrayContaining(['audit', 'llm', '_actors', 'graph', 'compilation'])
    );
  });

  it("step 1: audit/AuditFindingsList provides the prioritized list of gaps", () => {
    // Node: audit/AuditFindingsList (artifact)
    // Action: provides the prioritized list of gaps
    const step = steps[0];
    expect(step.node).toBe('audit/AuditFindingsList');
    expect(step.step_number).toBe(1);

    const node = index.nodes['audit/AuditFindingsList'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('coverage gaps');
    expect(node.module).toBe('audit');
    // Followed by SelectNextGapToFix in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
  });

  it("step 2: audit/SelectNextGapToFix picks the next unfixed gap from the prioritized list", () => {
    // Node: audit/SelectNextGapToFix (process)
    // Action: picks the next unfixed gap from the prioritized list
    const step = steps[1];
    expect(step.node).toBe('audit/SelectNextGapToFix');
    expect(step.step_number).toBe(2);

    const node = index.nodes['audit/SelectNextGapToFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('highest-priority');
    expect(node.module).toBe('audit');
    // Preceded by AuditFindingsList in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/AuditFindingsList'])
    );
    // Followed by ProvideFixContext in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
  });

  it("step 3: audit/ProvideFixContext assembles the module excerpt and gap description for the worker", () => {
    // Node: audit/ProvideFixContext (process)
    // Action: assembles the module excerpt and gap description for the worker
    const step = steps[2];
    expect(step.node).toBe('audit/ProvideFixContext');
    expect(step.step_number).toBe(3);

    const node = index.nodes['audit/ProvideFixContext'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('fix payload');
    expect(node.module).toBe('audit');
    // Preceded by SelectNextGapToFix in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/SelectNextGapToFix'])
    );
    // Followed by BuildGapFixPrompt in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/BuildGapFixPrompt'])
    );
  });

  it("step 4: audit/BuildGapFixPrompt builds the targeted fix prompt with module context and specific gap", () => {
    // Node: audit/BuildGapFixPrompt (process)
    // Action: builds the targeted fix prompt with module context and specific gap
    const step = steps[3];
    expect(step.node).toBe('audit/BuildGapFixPrompt');
    expect(step.step_number).toBe(4);

    const node = index.nodes['audit/BuildGapFixPrompt'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('targeted fix prompt');
    expect(node.module).toBe('audit');
    // Preceded by ProvideFixContext in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ProvideFixContext'])
    );
    // Followed by SendTask in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['llm/SendTask'])
    );
  });

  it("step 5: llm/SendTask sends the fix task to the LLM worker process", () => {
    // Node: llm/SendTask (process)
    // Action: sends the fix task to the LLM worker process
    const step = steps[4];
    expect(step.node).toBe('llm/SendTask');
    expect(step.step_number).toBe(5);

    const node = index.nodes['llm/SendTask'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stream-json protocol');
    expect(node.module).toBe('llm');
    // Preceded by BuildGapFixPrompt in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/BuildGapFixPrompt'])
    );
    // Followed by LLMWorker in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 6: _actors/LLMWorker reads the fix prompt and understands which module and gap to address", () => {
    // Node: _actors/LLMWorker (actor)
    // Action: reads the fix prompt and understands which module and gap to address
    const step = steps[5];
    expect(step.node).toBe('_actors/LLMWorker');
    expect(step.step_number).toBe(6);

    const node = index.nodes['_actors/LLMWorker'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('Claude Code');
    expect(node.module).toBe('_actors');
    // Preceded by SendTask in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['llm/SendTask'])
    );
    // Followed by ReceiveResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['llm/ReceiveResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 7: llm/ReceiveResult receives the worker's edited YAML output", () => {
    // Node: llm/ReceiveResult (process)
    // Action: receives the worker's edited YAML output
    const step = steps[6];
    expect(step.node).toBe('llm/ReceiveResult');
    expect(step.step_number).toBe(7);

    const node = index.nodes['llm/ReceiveResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('stream-json output');
    expect(node.module).toBe('llm');
    // Preceded by LLMWorker in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/LLMWorker'])
    );
    // Followed by ApplyFix in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 8: audit/ApplyFix writes the edited YAML content to the target module file", () => {
    // Node: audit/ApplyFix (process)
    // Action: writes the edited YAML content to the target module file
    const step = steps[7];
    expect(step.node).toBe('audit/ApplyFix');
    expect(step.step_number).toBe(8);

    const node = index.nodes['audit/ApplyFix'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('module YAML');
    expect(node.module).toBe('audit');
    // Preceded by ReceiveResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['llm/ReceiveResult'])
    );
    // Followed by ModuleFile in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 9: graph/ModuleFile stores the updated module on disk", () => {
    // Node: graph/ModuleFile (artifact)
    // Action: stores the updated module on disk
    const step = steps[8];
    expect(step.node).toBe('graph/ModuleFile');
    expect(step.step_number).toBe(9);

    const node = index.nodes['graph/ModuleFile'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('YAML file');
    expect(node.module).toBe('graph');
    // Preceded by ApplyFix in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/ApplyFix'])
    );
    // Followed by VerifyFixCompiles in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 10: audit/VerifyFixCompiles triggers compilation on the updated module", () => {
    // Node: audit/VerifyFixCompiles (process)
    // Action: triggers compilation on the updated module
    const step = steps[9];
    expect(step.node).toBe('audit/VerifyFixCompiles');
    expect(step.step_number).toBe(10);

    const node = index.nodes['audit/VerifyFixCompiles'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('compile.ts');
    expect(node.module).toBe('audit');
    // Preceded by ModuleFile in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['graph/ModuleFile'])
    );
    // Followed by Compiler in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 11: _actors/Compiler validates the edit produced 0 new errors", () => {
    // Node: _actors/Compiler (actor)
    // Action: validates the edit produced 0 new errors
    const step = steps[10];
    expect(step.node).toBe('_actors/Compiler');
    expect(step.step_number).toBe(11);

    const node = index.nodes['_actors/Compiler'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('validates');
    expect(node.module).toBe('_actors');
    // Preceded by VerifyFixCompiles in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyFixCompiles'])
    );
    // Followed by CompilationResult in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 12: compilation/CompilationResult provides the post-fix compilation result", () => {
    // Node: compilation/CompilationResult (artifact)
    // Action: provides the post-fix compilation result
    const step = steps[11];
    expect(step.node).toBe('compilation/CompilationResult');
    expect(step.step_number).toBe(12);

    const node = index.nodes['compilation/CompilationResult'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('error count');
    expect(node.module).toBe('compilation');
    // Preceded by Compiler in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Compiler'])
    );
    // Followed by DetectFixInducedErrors in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 13: audit/DetectFixInducedErrors checks whether the fix introduced new orphans, duplicates, or dangling refs", () => {
    // Node: audit/DetectFixInducedErrors (process)
    // Action: checks whether the fix introduced new orphans, duplicates, or dangling refs
    const step = steps[12];
    expect(step.node).toBe('audit/DetectFixInducedErrors');
    expect(step.step_number).toBe(13);

    const node = index.nodes['audit/DetectFixInducedErrors'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix');
    expect(node.module).toBe('audit');
    // Preceded by CompilationResult in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['compilation/CompilationResult'])
    );
    // Followed by VerifyGapClosed in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 14: audit/VerifyGapClosed re-runs the auditor that originally found this gap", () => {
    // Node: audit/VerifyGapClosed (process)
    // Action: re-runs the auditor that originally found this gap
    const step = steps[13];
    expect(step.node).toBe('audit/VerifyGapClosed');
    expect(step.step_number).toBe(14);

    const node = index.nodes['audit/VerifyGapClosed'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('re-runs');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedErrors in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedErrors'])
    );
    // Followed by Auditor in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
  });

  it("step 15: _actors/Auditor confirms the specific gap no longer appears in the coverage check", () => {
    // Node: _actors/Auditor (actor)
    // Action: confirms the specific gap no longer appears in the coverage check
    const step = steps[14];
    expect(step.node).toBe('_actors/Auditor');
    expect(step.step_number).toBe(15);

    const node = index.nodes['_actors/Auditor'];
    expect(node).toBeDefined();
    expect(node.type).toBe('actor');
    expect(node.description).toContain('coverage');
    expect(node.module).toBe('_actors');
    // Preceded by VerifyGapClosed in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/VerifyGapClosed'])
    );
    // Followed by DetectFixInducedGaps in this journey (cross-module edge)
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 16: audit/DetectFixInducedGaps checks whether the fix opened new coverage gaps in other angles", () => {
    // Node: audit/DetectFixInducedGaps (process)
    // Action: checks whether the fix opened new coverage gaps in other angles
    const step = steps[15];
    expect(step.node).toBe('audit/DetectFixInducedGaps');
    expect(step.step_number).toBe(16);

    const node = index.nodes['audit/DetectFixInducedGaps'];
    expect(node).toBeDefined();
    expect(node.type).toBe('process');
    expect(node.description).toContain('pre-fix and post-fix audit findings');
    expect(node.module).toBe('audit');
    // Preceded by Auditor in this journey (cross-module edge)
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['_actors/Auditor'])
    );
    // Followed by TrackAuditRound in this journey
    expect(node.followed_by).toEqual(
      expect.arrayContaining(['audit/TrackAuditRound'])
    );
    expect(node.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 17: audit/TrackAuditRound records that one more gap has been fixed in this round", () => {
    // Node: audit/TrackAuditRound (artifact)
    // Action: records that one more gap has been fixed in this round
    const step = steps[16];
    expect(step.node).toBe('audit/TrackAuditRound');
    expect(step.step_number).toBe(17);

    const node = index.nodes['audit/TrackAuditRound'];
    expect(node).toBeDefined();
    expect(node.type).toBe('artifact');
    expect(node.description).toContain('cycle number');
    expect(node.module).toBe('audit');
    // Preceded by DetectFixInducedGaps in this journey
    expect(node.preceded_by).toEqual(
      expect.arrayContaining(['audit/DetectFixInducedGaps'])
    );
  });

  it("journey forms the full single-gap fix sequence", () => {
    const nodeSequence = steps.map(s => s.node);
    expect(nodeSequence).toEqual([
      'audit/AuditFindingsList',
      'audit/SelectNextGapToFix',
      'audit/ProvideFixContext',
      'audit/BuildGapFixPrompt',
      'llm/SendTask',
      '_actors/LLMWorker',
      'llm/ReceiveResult',
      'audit/ApplyFix',
      'graph/ModuleFile',
      'audit/VerifyFixCompiles',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
      '_actors/Auditor',
      'audit/DetectFixInducedGaps',
      'audit/TrackAuditRound',
    ]);
  });

  it("LLMWorker is the journey actor (first actor-type node)", () => {
    expect(journey.actor).toBe('_actors/LLMWorker');
  });

  it("audit module dominates with 10 of 17 steps", () => {
    const auditSteps = steps.filter(s => s.node.startsWith('audit/'));
    expect(auditSteps).toHaveLength(10);
  });

  it("fix phase (steps 1-8) prepares and applies, verification phase (steps 9-17) validates", () => {
    // Fix phase: gap selection → prompt → LLM → apply
    const fixPhase = steps.slice(0, 8).map(s => s.node);
    expect(fixPhase).toEqual([
      'audit/AuditFindingsList',
      'audit/SelectNextGapToFix',
      'audit/ProvideFixContext',
      'audit/BuildGapFixPrompt',
      'llm/SendTask',
      '_actors/LLMWorker',
      'llm/ReceiveResult',
      'audit/ApplyFix',
    ]);
    // Verification phase: compile check → error check → gap check → track
    const verifyPhase = steps.slice(8).map(s => s.node);
    expect(verifyPhase).toEqual([
      'graph/ModuleFile',
      'audit/VerifyFixCompiles',
      '_actors/Compiler',
      'compilation/CompilationResult',
      'audit/DetectFixInducedErrors',
      'audit/VerifyGapClosed',
      '_actors/Auditor',
      'audit/DetectFixInducedGaps',
      'audit/TrackAuditRound',
    ]);
  });

  it("crosses 5 module boundaries matching the modules_touched list", () => {
    const modulesInSteps = new Set(steps.map(s => s.node.split('/')[0]));
    expect(modulesInSteps).toEqual(new Set(['audit', 'llm', '_actors', 'graph', 'compilation']));
    expect(new Set(journey.modules_touched)).toEqual(modulesInSteps);
  });
});
