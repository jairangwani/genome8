// Auto-generated from journey: DetectCrossModuleImpact
// Module: graph
// Modules touched: graph, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { resolveNodeRef } from '../../src/types.js';
import type { ModuleFile } from '../../src/types.js';

describe("DetectCrossModuleImpact", () => {
  // Scenario: module "payments" references nodes from "auth", then auth removes a node
  const modulesBeforeRemoval = new Map<string, ModuleFile>([
    ['auth', {
      nodes: {
        AuthProcess: { type: 'process', description: 'Authenticates credentials' },
        SessionToken: { type: 'artifact', description: 'Session token' },
      },
      journeys: {},
    }],
    ['payments', {
      nodes: {
        PaymentGateway: { type: 'interface', description: 'Payment processing gateway' },
        ChargeProcess: { type: 'process', description: 'Charges the customer' },
      },
      journeys: {
        ProcessPayment: {
          steps: [
            { node: 'auth/AuthProcess', action: 'validates the user is authenticated' },
            { node: 'PaymentGateway', action: 'accepts payment details' },
            { node: 'ChargeProcess', action: 'charges the customer' },
            { node: 'auth/SessionToken', action: 'stores transaction in session' },
          ],
        },
      },
    }],
  ]);

  const resultBefore = compileFromModules(modulesBeforeRemoval);

  // After removal: auth no longer has AuthProcess
  const modulesAfterRemoval = new Map<string, ModuleFile>([
    ['auth', {
      nodes: {
        SessionToken: { type: 'artifact', description: 'Session token' },
        // AuthProcess removed
      },
      journeys: {},
    }],
    ['payments', {
      nodes: {
        PaymentGateway: { type: 'interface', description: 'Payment processing gateway' },
        ChargeProcess: { type: 'process', description: 'Charges the customer' },
      },
      journeys: {
        ProcessPayment: {
          steps: [
            { node: 'auth/AuthProcess', action: 'validates the user is authenticated' },
            { node: 'PaymentGateway', action: 'accepts payment details' },
            { node: 'ChargeProcess', action: 'charges the customer' },
            { node: 'auth/SessionToken', action: 'stores transaction in session' },
          ],
        },
      },
    }],
  ]);

  const resultAfter = compileFromModules(modulesAfterRemoval);

  it("step 1: graph/CompiledIndex identifies which nodes were added, renamed, or removed in the changed module", () => {
    // Before: auth has AuthProcess and SessionToken
    expect(resultBefore.index.nodes['auth/AuthProcess']).toBeDefined();
    expect(resultBefore.index.nodes['auth/SessionToken']).toBeDefined();

    // After: auth no longer has AuthProcess
    expect(resultAfter.index.nodes['auth/AuthProcess']).toBeUndefined();
    expect(resultAfter.index.nodes['auth/SessionToken']).toBeDefined();
  });

  it("step 2: graph/JourneyRegistry provides all journeys across all modules for reference scanning", () => {
    // The ProcessPayment journey still exists in both compilations
    expect(resultBefore.index.journeys['ProcessPayment']).toBeDefined();
    expect(resultAfter.index.journeys['ProcessPayment']).toBeDefined();
  });

  it("step 3: graph/CrossModuleImpactScan scans every journey step for cross-module references targeting the changed module's nodes", () => {
    // Before removal, cross-module connections exist between payments and auth
    const gateway = resultBefore.index.nodes['payments/PaymentGateway'];
    expect(gateway.cross_module_connections).toContain('auth/AuthProcess');
  });

  it("step 4: graph/CrossModuleImpactScan collects the set of other modules whose journeys reference affected nodes", () => {
    // The ProcessPayment journey touches both auth and payments modules
    const journey = resultBefore.index.journeys['ProcessPayment'];
    expect(journey.modules_touched).toContain('auth');
    expect(journey.modules_touched).toContain('payments');
  });

  it("step 5: graph/AllRefsResolveRule flags cross-module references that now point to renamed or removed nodes as dangling", () => {
    // After removal, auth/AuthProcess is referenced but doesn't exist => error
    const danglingErrors = resultAfter.issues.filter(
      i => i.severity === 'error' && i.message.includes('auth/AuthProcess') && i.message.includes('does not exist')
    );
    expect(danglingErrors.length).toBeGreaterThan(0);
  });

  it("step 6: compilation/CompilationResult reports the list of affected modules and their dangling references for targeted revalidation", () => {
    // The result has errors referencing the payments module's journey
    const paymentErrors = resultAfter.issues.filter(
      i => i.module === 'payments' && i.severity === 'error'
    );
    expect(paymentErrors.length).toBeGreaterThan(0);
    expect(paymentErrors[0].journey).toBe('ProcessPayment');
  });
});
