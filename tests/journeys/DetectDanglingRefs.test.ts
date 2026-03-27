// Auto-generated from journey: DetectDanglingRefs
// Module: compilation
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectDanglingRefs", () => {
  it("step 1: graph/CompiledIndex provides all journey steps and the node registry", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(result.index.nodes['svc/Endpoint']).toBeDefined();
    expect(result.index.journeys['Call']).toBeDefined();
  });

  it("step 2: compilation/DanglingRefDetection checks each step's node reference against the registry and flags misses", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
              { node: 'NonExistent', action: 'this node does not exist locally' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const danglingErrors = result.issues.filter(i => i.severity === 'error' && i.message.includes('does not exist'));
    expect(danglingErrors.length).toBe(1);
    expect(danglingErrors[0].message).toContain('NonExistent');
  });

  it("step 3: compilation/ExternalRefClassification reclassifies unresolved refs matching sibling-engine patterns as external warnings", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
              { node: 'otherEngine/RemoteNode', action: 'calls external engine node' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // External ref without loaded interface is a warning, not an error
    const warnings = result.issues.filter(i => i.severity === 'warning' && i.message.includes('external ref'));
    expect(warnings.length).toBe(1);
  });

  it("step 4: compilation/ExternalRefsAreWarnings enforces that external refs produce warnings not errors at child level", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
              { node: 'external/Service', action: 'calls some external service node' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(0);
    const warnings = result.issues.filter(i => i.severity === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("step 5: compilation/ErrorReport records true dangling refs as errors", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
              { node: 'Ghost', action: 'local ref that does not exist in svc' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toContain('does not exist');
  });

  it("step 6: compilation/WarningReport records external refs as warnings for parent validation", () => {
    const modules = new Map<string, ModuleFile>([
      ['svc', {
        nodes: { Endpoint: { type: 'interface', description: 'API endpoint' } },
        journeys: {
          Call: {
            steps: [
              { node: 'Endpoint', action: 'receives request from client' },
              { node: 'sibling/NodeX', action: 'references a sibling engine node' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const warnings = result.issues.filter(i => i.severity === 'warning');
    expect(warnings.length).toBe(1);
    expect(warnings[0].message).toContain('external ref');
    expect(warnings[0].journey).toBe('Call');
  });
});
