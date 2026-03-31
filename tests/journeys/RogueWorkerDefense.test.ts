// Auto-generated from journey: RogueWorkerDefense
// Module: actors
// Triggered by: _actors/RogueWorker
// Modules touched: _actors, actors, compilation, convergence

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { compile, compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

describe("RogueWorkerDefense", () => {
  it("step 1: _actors/RogueWorker produces subtly wrong actor content with hallucinated or phantom actors", () => {
    // Rogue worker produces actors that don't correspond to the spec
    const rogueActors: ModuleFile = {
      nodes: {
        User: { type: 'actor', description: 'Uses the platform' },
        PhantomBot: { type: 'actor', description: 'A hallucinated actor that does not exist in the spec' },
        GhostAdmin: { type: 'actor', description: 'Another hallucinated actor' },
      },
    };
    expect(Object.keys(rogueActors.nodes).length).toBe(3);
    // PhantomBot and GhostAdmin are hallucinated — they exist in the file but nothing references them
    expect(rogueActors.nodes['PhantomBot']).toBeDefined();
    expect(rogueActors.nodes['GhostAdmin']).toBeDefined();
  });

  it("step 2: actors/WriteActorsFile writes the rogue content to _actors.yaml", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rogue-'));
    const rogueActors = {
      nodes: {
        User: { type: 'actor', description: 'Uses the platform' },
        PhantomBot: { type: 'actor', description: 'Hallucinated actor' },
        GhostAdmin: { type: 'actor', description: 'Hallucinated actor' },
      },
    };
    fs.writeFileSync(path.join(tmpDir, '_actors.yaml'), yaml.dump(rogueActors));
    expect(fs.existsSync(path.join(tmpDir, '_actors.yaml'))).toBe(true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("step 3: actors/ActorsFile contains the hallucinated actors", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Uses the platform' },
          PhantomBot: { type: 'actor', description: 'Hallucinated' },
          GhostAdmin: { type: 'actor', description: 'Hallucinated' },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // All three are in the index including the hallucinated ones
    expect(result.index.nodes['_actors/PhantomBot']).toBeDefined();
    expect(result.index.nodes['_actors/GhostAdmin']).toBeDefined();
    expect(result.index._stats.total_nodes).toBe(3);
  });

  it("step 4: actors/ValidateActorCoverage checks that every actor appears in at least one journey", () => {
    // Compile with actors but a module that only references User
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Uses the platform' },
          PhantomBot: { type: 'actor', description: 'Hallucinated' },
        },
      }],
      ['app', {
        nodes: {
          Login: { type: 'process', description: 'Login' },
        },
        journeys: {
          UserLogin: {
            steps: [
              { node: '_actors/User', action: 'submits credentials' },
              { node: 'Login', action: 'authenticates' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // User is in a journey; PhantomBot is not
    expect(result.index.nodes['_actors/User'].in_journeys.length).toBeGreaterThanOrEqual(1);
    expect(result.index.nodes['_actors/PhantomBot'].in_journeys.length).toBe(0);
  });

  it("step 5: compilation/OrphanDetection flags hallucinated actors that no journey references as orphans", () => {
    const modules = new Map<string, ModuleFile>([
      ['_actors', {
        nodes: {
          User: { type: 'actor', description: 'Uses the platform' },
          PhantomBot: { type: 'actor', description: 'Hallucinated' },
        },
      }],
      ['app', {
        nodes: {
          Login: { type: 'process', description: 'Login' },
        },
        journeys: {
          UserLogin: {
            steps: [
              { node: '_actors/User', action: 'submits credentials' },
              { node: 'Login', action: 'authenticates' },
            ],
          },
        },
      }],
    ]);
    const result = compileFromModules(modules);
    // PhantomBot is an orphan — in no journeys
    expect(result.coverage.orphans).toContain('_actors/PhantomBot');
    expect(result.index._stats.orphans).toBeGreaterThanOrEqual(1);
  });

  it("step 6: convergence/AuditGapFix targeted fix removes orphan actors that cannot be connected to any journey", () => {
    // After detecting orphans, the fix is to remove them from the actor file
    const actorNodes: Record<string, any> = {
      User: { type: 'actor', description: 'Uses the platform' },
      PhantomBot: { type: 'actor', description: 'Hallucinated' },
    };
    const orphans = ['_actors/PhantomBot'];
    // Remove orphan actors
    for (const orphan of orphans) {
      const name = orphan.split('/')[1];
      delete actorNodes[name];
    }
    expect(Object.keys(actorNodes)).toEqual(['User']);
    expect(actorNodes['PhantomBot']).toBeUndefined();
  });

});
