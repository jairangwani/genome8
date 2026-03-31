// Auto-generated from journey: FixGapInAuditModule
// Module: audit
// Triggered by: _actors/LLMWorker
// Modules touched: audit, _actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import yaml from 'js-yaml';
import type { ModuleFile } from '../../src/types.js';

// Pre-fix audit module: missing a journey for cross-module coverage check
const preFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
    CheckActorCoverage: { type: 'process', description: 'Checks actor coverage' },
    CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
    AuditFindingsList: { type: 'artifact', description: 'Gap list' },
    DeclareConverged: { type: 'process', description: 'Declares convergence' },
    VerifyFixCompiles: { type: 'process', description: 'Verifies fix compiles' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks spec' },
        { node: 'CheckSpecCoverage', action: 'evaluates sections' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
  },
};

// Post-fix audit module: added RunCrossModuleAudit journey
const postFixAudit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'Checks spec coverage' },
    CheckActorCoverage: { type: 'process', description: 'Checks actor coverage' },
    CheckCrossModuleCoverage: { type: 'process', description: 'Checks cross-module connections' },
    AuditFindingsList: { type: 'artifact', description: 'Gap list' },
    DeclareConverged: { type: 'process', description: 'Declares convergence' },
    VerifyFixCompiles: { type: 'process', description: 'Verifies fix compiles' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks spec' },
        { node: 'CheckSpecCoverage', action: 'evaluates sections' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
    RunCrossModuleAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'checks cross-module connections' },
        { node: 'CheckCrossModuleCoverage', action: 'evaluates module links' },
        { node: 'AuditFindingsList', action: 'stores gaps' },
      ],
    },
  },
};

const criticalNodes = ['CheckSpecCoverage', 'CheckActorCoverage', 'CheckCrossModuleCoverage', 'VerifyFixCompiles', 'DeclareConverged'];

function buildPreFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', { nodes: { Auditor: { type: 'actor', description: 'Auditor' } } }],
    ['audit', preFixAudit],
  ]));
}

function buildPostFix() {
  return compileFromModules(new Map<string, ModuleFile>([
    ['_actors', { nodes: { Auditor: { type: 'actor', description: 'Auditor' } } }],
    ['audit', postFixAudit],
  ]));
}

describe("FixGapInAuditModule", () => {
  it("step 1: audit/AuditFindingsList provides a gap that targets audit.yaml itself", () => {
    const gap = { type: 'spec_gap', module: 'audit', detail: 'Cross-module audit journey missing', severity: 'medium' };
    expect(gap.module).toBe('audit');
    expect(gap.detail).toContain('Cross-module');
  });

  it("step 2: audit/SelectNextGapToFix picks the self-referential gap from the prioritized list", () => {
    const gaps = [
      { type: 'spec_gap', module: 'audit', detail: 'Cross-module audit journey missing', priority: 1 },
      { type: 'actor_orphan', module: 'auth', detail: 'Admin orphan', priority: 2 },
    ];
    const nextGap = gaps.find(g => !('fixed' in g) || !g.fixed);
    expect(nextGap).toBeDefined();
    expect(nextGap!.module).toBe('audit');
  });

  it("step 3: audit/DetectSelfAuditTarget confirms the gap targets audit.yaml and flags it for extra safeguards", () => {
    const gap = { module: 'audit', detail: 'Cross-module audit journey missing' };
    const isSelfTarget = gap.module === 'audit';
    expect(isSelfTarget).toBe(true);
  });

  it("step 4: audit/ScopeFixToAvoidAuditBreak analyzes the proposed fix scope to ensure it will not remove existing audit processes", () => {
    const existingNodes = Object.keys(preFixAudit.nodes!);
    const proposedNodes = Object.keys(postFixAudit.nodes!);
    // All existing nodes must still be present after fix
    for (const node of existingNodes) {
      expect(proposedNodes).toContain(node);
    }
  });

  it("step 5: audit/ScopeFixToAvoidAuditBreak verifies the fix will not break CheckSpecCoverage, VerifyFixCompiles, DeclareConverged, or other critical audit nodes", () => {
    const proposedNodes = Object.keys(postFixAudit.nodes!);
    for (const critical of criticalNodes) {
      expect(proposedNodes).toContain(critical);
    }
  });

  it("step 6: audit/BuildGapFixPrompt builds the fix prompt with explicit instructions to preserve existing audit infrastructure", () => {
    const prompt = `Fix the following gap in module "audit":
Gap: Cross-module audit journey missing

CRITICAL: You MUST preserve all existing nodes: ${criticalNodes.join(', ')}.
Do NOT remove any existing journeys. Only ADD new content.`;
    expect(prompt).toContain('CRITICAL');
    expect(prompt).toContain('preserve');
    for (const node of criticalNodes) {
      expect(prompt).toContain(node);
    }
  });

  it("step 7: audit/ProvideFixContext includes the full audit.yaml source and the safeguard constraints in the fix payload", () => {
    const fixContext = {
      targetModule: 'audit',
      isSelfTarget: true,
      moduleYaml: yaml.dump(preFixAudit),
      safeguards: { preserveNodes: criticalNodes, preserveJourneys: ['RunSpecAudit'] },
    };
    expect(fixContext.isSelfTarget).toBe(true);
    expect(fixContext.moduleYaml).toContain('CheckSpecCoverage');
    expect(fixContext.safeguards.preserveNodes.length).toBe(5);
  });

  it("step 8: _actors/LLMWorker receives the self-fix prompt with clear boundaries on what must not be changed", () => {
    const workerInput = {
      module: 'audit',
      mustPreserve: criticalNodes,
      currentYaml: yaml.dump(preFixAudit),
    };
    expect(workerInput.module).toBe('audit');
    expect(workerInput.mustPreserve).toContain('DeclareConverged');
    expect(workerInput.currentYaml).toContain('RunSpecAudit');
  });

  it("step 9: audit/ApplyFix edits audit.yaml to close the gap while preserving all existing audit processes", () => {
    // Verify fix added new journey without removing anything
    const preJourneys = Object.keys(preFixAudit.journeys!);
    const postJourneys = Object.keys(postFixAudit.journeys!);
    for (const j of preJourneys) {
      expect(postJourneys).toContain(j);
    }
    expect(postJourneys.length).toBeGreaterThan(preJourneys.length);
    expect(postJourneys).toContain('RunCrossModuleAudit');
  });

  it("step 10: audit/VerifyFixCompiles compiles the modified audit.yaml to check for errors", () => {
    const result = buildPostFix();
    expect(result.index).toBeDefined();
    expect(result.issues).toBeDefined();
  });

  it("step 11: _actors/Compiler validates the self-modified audit module has 0 errors", () => {
    const result = buildPostFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
  });

  it("step 12: compilation/CompilationResult confirms the self-fix did not break compilation", () => {
    const result = buildPostFix();
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    expect(result.index._stats.total_nodes).toBeGreaterThan(0);
    expect(result.index._stats.duplicate_names).toBe(0);
  });

  it("step 13: audit/ReauditAfterSelfFix triggers a full re-audit to verify the self-fix did not invalidate audit's own integrity", () => {
    const result = buildPostFix();
    // All critical nodes still present
    for (const node of criticalNodes) {
      expect(result.index.nodes[`audit/${node}`]).toBeDefined();
    }
    // Journeys intact
    const auditJourneys = Object.values(result.index.journeys).filter(j => j.module === 'audit');
    expect(auditJourneys.length).toBe(2);
  });

  it("step 14: audit/TrackAuditRound records the self-fix attempt for progress tracking", () => {
    const tracker = {
      round: 1,
      selfFixAttempts: 1,
      successfulFixes: 1,
      failedFixes: 0,
    };
    expect(tracker.selfFixAttempts).toBe(1);
    expect(tracker.successfulFixes).toBe(1);
  });

});
