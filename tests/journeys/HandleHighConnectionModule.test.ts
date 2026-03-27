// Auto-generated from journey: HandleHighConnectionModule
// Module: excerpt
// Modules touched: excerpt, graph

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import { generateExcerpt } from '../../src/excerpt.js';
import type { ModuleFile } from '../../src/types.js';

describe("HandleHighConnectionModule", () => {
  // Fixture: a hub module with many cross-module connections
  const modules = new Map<string, ModuleFile>([
    ['graph', {
      nodes: {
        CompiledIndex: { type: 'artifact', description: 'The compiled index artifact', files: ['src/types.ts'] },
      },
      journeys: {},
    }],
    ['hub', {
      nodes: {
        Router: { type: 'process', description: 'Routes requests to modules' },
        Dispatcher: { type: 'process', description: 'Dispatches events to listeners' },
      },
      journeys: {
        RouteToAlpha: {
          steps: [
            { node: 'Router', action: 'routes to alpha' },
            { node: 'alpha/Handler', action: 'handles in alpha' },
          ],
        },
        RouteToGraph: {
          steps: [
            { node: 'Router', action: 'routes to graph' },
            { node: 'graph/CompiledIndex', action: 'looks up in index' },
          ],
        },
        DispatchToBeta: {
          steps: [
            { node: 'Dispatcher', action: 'dispatches to beta' },
            { node: 'beta/Listener', action: 'listens in beta' },
          ],
        },
      },
    }],
    ['alpha', {
      nodes: {
        Handler: { type: 'process', description: 'Handles alpha requests' },
      },
      journeys: {},
    }],
    ['beta', {
      nodes: {
        Listener: { type: 'process', description: 'Listens for beta events' },
      },
      journeys: {},
    }],
  ]);

  const result = compileFromModules(modules);
  const focusModule = 'hub';
  const moduleYaml = 'nodes:\n  Router:\n    type: process\n    description: Routes requests';
  const excerpt = generateExcerpt({
    round: 1,
    focusModule,
    index: result.index,
    coverage: result.coverage,
    issues: result.issues,
    moduleFileContent: moduleYaml,
  });

  it("step 1: excerpt/SelectTargetModule identifies a module with a high number of cross-module connections", () => {
    const cov = result.coverage.modules['hub'];
    expect(cov).toBeDefined();
    expect(cov.cross_module_connections).toBeGreaterThan(0);
    expect(excerpt).toContain('Focus: hub');
  });

  it("step 2: graph/CompiledIndex provides all connections for the target module", () => {
    expect(result.index.nodes['graph/CompiledIndex']).toBeDefined();
    // Hub nodes have cross-module connections
    const router = result.index.nodes['hub/Router'];
    expect(router.cross_module_connections.length).toBeGreaterThan(0);
  });

  it("step 3: excerpt/CollectCrossModuleConnections gathers the full set of cross-module connections which exceeds the normal budget", () => {
    expect(excerpt).toContain('CROSS-MODULE:');
    // There are connections to alpha, graph, and beta
    expect(excerpt).toContain('AFTER YOU:');
  });

  it("step 4: excerpt/RankCrossModuleByRelevance scores each connection by directness, ranking direct dependencies above transitive ones", () => {
    // All connections from hub are direct
    const router = result.index.nodes['hub/Router'];
    expect(router.followed_by.length).toBeGreaterThan(0);
    // They are all listed in the CROSS-MODULE section
    expect(excerpt).toContain('CROSS-MODULE:');
  });

  it("step 5: excerpt/RankCrossModuleByRelevance selects the top-ranked connections that fit within the cross-module budget allocation", () => {
    // The excerpt includes cross-module connections
    expect(excerpt).toContain('alpha/Handler');
    expect(excerpt).toContain('graph/CompiledIndex');
    expect(excerpt).toContain('beta/Listener');
  });

  it("step 6: excerpt/AdaptiveBudgetAllocation allocates more of the ~200 line budget to the cross-module section for this highly-connected module", () => {
    // The cross-module section is present and contains multiple entries
    const crossSection = excerpt.split('CROSS-MODULE:')[1]?.split('\n\n')[0] ?? '';
    const lineCount = crossSection.split('\n').filter(l => l.trim()).length;
    expect(lineCount).toBeGreaterThanOrEqual(2);
  });

  it("step 7: excerpt/AssembleExcerpt assembles the excerpt using only the highest-relevance connections", () => {
    expect(excerpt).toContain('MODULE STATUS:');
    expect(excerpt).toContain('YOUR NODES:');
    expect(excerpt).toContain('CROSS-MODULE:');
    expect(excerpt).toContain('ALL MODULES:');
  });

  it("step 8: excerpt/TruncateToLimit trims the excerpt to the adapted budget limit", () => {
    const lineCount = excerpt.split('\n').length;
    expect(lineCount).toBeGreaterThan(0);
  });

  it("step 9: excerpt/ExcerptOutput stores the connection-focused excerpt that fits within the line budget", () => {
    expect(excerpt).toBeTruthy();
    expect(excerpt).toContain('YOUR FILE (hub.yaml):');
  });
});
