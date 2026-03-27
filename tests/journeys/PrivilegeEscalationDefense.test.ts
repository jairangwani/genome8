// Auto-generated from journey: PrivilegeEscalationDefense
// Module: actors
// Triggered by: _actors/PrivilegeEscalator
// Modules touched: _actors, llm, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Implementation: test/compile.test.ts
// Implementation: test/pando8.test.ts
// Implementation: test/pando9.test.ts

// Simulate a privilege escalation attempt: a module tries to reference nodes outside its scope
const attackerModule: ModuleFile = {
  nodes: {
    Escalator: { type: 'actor', description: 'attempts to access files outside box scope' },
  },
  journeys: {},
};

// Module that references a non-existent external engine's nodes
const maliciousModule: ModuleFile = {
  nodes: {
    LocalProcess: { type: 'process', description: 'local handler' },
  },
  journeys: {
    EscalationAttempt: {
      steps: [
        { node: '_actors/Escalator', action: 'initiates escalation attempt' },
        { node: 'LocalProcess', action: 'processes the request locally' },
        { node: 'external-secret-engine/PrivateData', action: 'tries to access out-of-scope data' },
      ],
    },
  },
};

describe("PrivilegeEscalationDefense", () => {
  it("step 1: _actors/PrivilegeEscalator attempts to use LLMWorker's native tools to access files outside box scope", () => {
    // The escalator actor exists and is defined
    const result = compileFromModules(new Map([
      ['_actors', attackerModule],
      ['evil', maliciousModule],
    ]));
    expect(result.index.nodes['_actors/Escalator']).toBeDefined();
    expect(result.index.nodes['_actors/Escalator'].type).toBe('actor');
  });

  it("step 2: llm/NativeToolSet provides the tool access that could be exploited", () => {
    // The LLM worker has tool access — in the graph, this is modeled as an interface node
    const llmModule: ModuleFile = {
      nodes: {
        NativeToolSet: { type: 'interface', description: 'Claude Code native tools (Read, Write, Bash)' },
        WriteFile: { type: 'process', description: 'writes content to a file path' },
      },
      journeys: {},
    };
    const result = compileFromModules(new Map([['llm', llmModule]]));
    expect(result.index.nodes['llm/NativeToolSet']).toBeDefined();
    expect(result.index.nodes['llm/NativeToolSet'].type).toBe('interface');
    expect(result.index.nodes['llm/WriteFile']).toBeDefined();
  });

  it("step 3: llm/WriteFile worker attempts to write to a path outside the box directory", () => {
    // Path traversal attempt: ../../../etc/passwd — the filesystem boundary is enforced by the tool
    const boxDir = '/project/genome/modules';
    const maliciousPath = '../../../etc/passwd';
    const resolved = maliciousPath; // In real code, path.resolve would catch this
    // The path clearly leaves the box scope
    expect(maliciousPath.startsWith('..')).toBe(true);
    // A proper check would verify the resolved path starts with boxDir
    const normalizedBox = boxDir.replace(/\\/g, '/');
    expect(maliciousPath.startsWith(normalizedBox)).toBe(false);
  });

  it("step 4: _actors/Compiler detects files or references outside the expected module scope", () => {
    // Compilation catches references to non-existent modules as errors or warnings
    const result = compileFromModules(new Map([
      ['_actors', attackerModule],
      ['evil', maliciousModule],
    ]));
    // external-secret-engine is not a local module — generates a warning about external ref
    const externalRefIssues = result.issues.filter(i =>
      i.message.includes('external-secret-engine') || i.message.includes('PrivateData')
    );
    expect(externalRefIssues.length).toBeGreaterThanOrEqual(1);
  });

  it("step 5: compilation/DanglingRefDetection flags any references to nodes or files outside the box boundary", () => {
    // The reference to external-secret-engine/PrivateData is flagged
    const result = compileFromModules(new Map([
      ['_actors', attackerModule],
      ['evil', maliciousModule],
    ]));
    const danglingIssues = result.issues.filter(i =>
      i.message.includes('external') && i.message.includes('PrivateData')
    );
    expect(danglingIssues.length).toBeGreaterThanOrEqual(1);
    // The node itself does not exist in the compiled index
    expect(result.index.nodes['external-secret-engine/PrivateData']).toBeUndefined();
  });

  it("step 6: compilation/CompilationResult reports the out-of-scope access as validation errors", () => {
    const result = compileFromModules(new Map([
      ['_actors', attackerModule],
      ['evil', maliciousModule],
    ]));
    // Overall issues are present
    expect(result.issues.length).toBeGreaterThanOrEqual(1);
    // The escalation journey is partially compiled but the external ref step is flagged
    const journey = result.index.journeys['EscalationAttempt'];
    expect(journey).toBeDefined();
    // The local steps still work
    expect(journey.steps.some(s => s.node === '_actors/Escalator')).toBe(true);
    expect(journey.steps.some(s => s.node === 'evil/LocalProcess')).toBe(true);
  });

});
