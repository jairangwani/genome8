/**
 * publish.ts — Auto-generate published interface + changelog.
 *
 * After each compile, generates:
 * - published/interface.yaml (what this engine provides + requires)
 * - published/changelog.yaml (what changed since last version)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import type { CompiledIndex, PublishedInterface, Changelog, ChangelogEntry } from './types.js';

/**
 * Generate published interface from compiled index.
 */
export function generateInterface(index: CompiledIndex, engineName: string): PublishedInterface {
  const provides: PublishedInterface['provides'] = {};
  const requires: Record<string, string> = {};

  for (const [fullName, node] of Object.entries(index.nodes)) {
    const module = fullName.split('/')[0];

    // Nodes in this engine = provides
    provides[fullName] = {
      type: node.type,
      description: node.description,
      in_journeys: node.in_journeys.length,
    };

    // Cross-module connections where the OTHER module is external = requires
    for (const conn of node.cross_module_connections) {
      const connModule = conn.split('/')[0];
      // Check if connModule is NOT one of our modules
      if (!index.nodes[conn]) {
        // This is an external reference we couldn't resolve
        requires[conn] = `Referenced in ${node.in_journeys[0] || 'unknown journey'}`;
      }
    }
  }

  // Also scan journey steps for external refs
  for (const [, journey] of Object.entries(index.journeys)) {
    for (const step of journey.steps) {
      if (!index.nodes[step.node]) {
        requires[step.node] = `${journey.name} step ${step.step_number}`;
      }
    }
  }

  const content = JSON.stringify({ provides, requires }, null, 2);
  const version_hash = 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');

  return { engine: engineName, version_hash, provides, requires };
}

/**
 * Generate changelog by diffing two interfaces.
 */
export function generateChangelog(
  previous: PublishedInterface | null,
  current: PublishedInterface
): Changelog {
  const changes: ChangelogEntry[] = [];

  const prevProvides = previous?.provides ?? {};
  const currProvides = current.provides;

  // Find added nodes
  for (const [name, node] of Object.entries(currProvides)) {
    if (!prevProvides[name]) {
      changes.push({
        node: name,
        type: 'added',
        impact: `New ${node.type}: ${node.description}`,
      });
    }
  }

  // Find removed nodes
  for (const [name, node] of Object.entries(prevProvides)) {
    if (!currProvides[name]) {
      changes.push({
        node: name,
        type: 'removed',
        impact: `Removed ${node.type}: ${node.description}. Dependents must find alternative.`,
      });
    }
  }

  // Find modified nodes
  for (const [name, curr] of Object.entries(currProvides)) {
    const prev = prevProvides[name];
    if (!prev) continue;

    if (prev.description !== curr.description) {
      changes.push({
        node: name,
        type: 'modified',
        field: 'description',
        was: prev.description,
        now: curr.description,
        impact: `${name} description changed. Dependents should review.`,
      });
    }

    if (prev.type !== curr.type) {
      changes.push({
        node: name,
        type: 'modified',
        field: 'type',
        was: prev.type,
        now: curr.type,
        impact: `${name} type changed from ${prev.type} to ${curr.type}.`,
      });
    }
  }

  return {
    previous_hash: previous?.version_hash ?? 'none',
    current_hash: current.version_hash,
    changes,
  };
}

/**
 * Write published interface and changelog to disk.
 */
export function publishInterface(
  publishedDir: string,
  index: CompiledIndex,
  engineName: string
): { interface_: PublishedInterface; changelog: Changelog } {
  if (!fs.existsSync(publishedDir)) {
    fs.mkdirSync(publishedDir, { recursive: true });
  }

  const interfacePath = path.join(publishedDir, 'interface.yaml');
  const changelogPath = path.join(publishedDir, 'changelog.yaml');

  // Read previous interface if exists
  let previous: PublishedInterface | null = null;
  if (fs.existsSync(interfacePath)) {
    try {
      previous = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    } catch { /* first time */ }
  }

  // Generate new interface
  const interface_ = generateInterface(index, engineName);

  // Generate changelog
  const changelog = generateChangelog(previous, interface_);

  // Write files
  fs.writeFileSync(interfacePath, yaml.dump(interface_, { lineWidth: 120, noRefs: true }));
  fs.writeFileSync(changelogPath, yaml.dump(changelog, { lineWidth: 120, noRefs: true }));

  return { interface_, changelog };
}
