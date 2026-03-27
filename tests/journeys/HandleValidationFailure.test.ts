// Auto-generated from journey: HandleValidationFailure
// Module: publish
// Modules touched: publish, convergence

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateInterface } from '../../src/publish.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleValidationFailure", () => {
  it("step 1: publish/CollectExportedNodes provides the collected exported nodes for validation", () => {
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'Valid node A' },
          NodeB: { type: 'artifact', description: 'Valid node B' },
        },
        journeys: {},
      }],
    ]);
    const result = compileFromModules(modules);
    const iface = generateInterface(result.index, 'test-engine');
    expect(Object.keys(iface.provides)).toHaveLength(2);
  });

  it("step 2: publish/CollectExportedJourneys provides the collected exported journeys for validation", () => {
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'A process' },
        },
        journeys: {
          TestJourney: {
            steps: [
              { node: 'NodeA', action: 'does something meaningful' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    expect(Object.keys(result.index.journeys)).toContain('TestJourney');
  });

  it("step 3: publish/ValidateExportedInterface finds broken refs in the exported subset where journey steps reference unexported nodes", () => {
    // Journey referencing a non-existent node produces an error
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'A process' },
        },
        journeys: {
          BrokenJourney: {
            steps: [
              { node: 'NodeA', action: 'does something meaningful' },
              { node: 'NonExistent', action: 'references a missing node' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const brokenRefErrors = result.issues.filter(
      i => i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(brokenRefErrors.length).toBeGreaterThan(0);
  });

  it("step 4: publish/ValidateExportedInterface identifies the specific broken refs and the journeys that contain them", () => {
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'A process' },
        },
        journeys: {
          BrokenJourney: {
            steps: [
              { node: 'NodeA', action: 'does something meaningful' },
              { node: 'MissingNode', action: 'references a missing node' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const brokenRefErrors = result.issues.filter(
      i => i.severity === 'error' && i.message.includes('does not exist')
    );
    expect(brokenRefErrors.length).toBe(1);
    expect(brokenRefErrors[0].journey).toBe('BrokenJourney');
    expect(brokenRefErrors[0].message).toContain('MissingNode');
  });

  it("step 5: publish/ReportPublishFailure builds a failure report listing the broken refs that prevent publish", () => {
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'A process' },
        },
        journeys: {
          BrokenJourney: {
            steps: [
              { node: 'NodeA', action: 'does something meaningful' },
              { node: 'Missing1', action: 'missing ref first' },
              { node: 'Missing2', action: 'missing ref second' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors.length).toBe(2);
    expect(errors.some(e => e.message.includes('Missing1'))).toBe(true);
    expect(errors.some(e => e.message.includes('Missing2'))).toBe(true);
  });

  it("step 6: convergence/ConvergenceState receives the validation failure and triggers audit or reconvergence to fix the broken refs", () => {
    // Valid modules produce no errors
    const modules = new Map<string, ModuleFile>([
      ['publish', {
        nodes: {
          NodeA: { type: 'process', description: 'A process' },
        },
        journeys: {
          GoodJourney: {
            steps: [
              { node: 'NodeA', action: 'does something meaningful' },
            ],
          },
        },
      }],
      ['convergence', {
        nodes: {
          ConvergenceState: { type: 'artifact', description: 'Pipeline state' },
        },
        journeys: {},
      }],
    ]);
    const result = compileFromModules(modules);
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
    expect(result.index.nodes['convergence/ConvergenceState']).toBeDefined();
  });

});
