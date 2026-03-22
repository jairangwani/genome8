/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { PublishedInterface, DependenciesFile, CompiledIndex, Changelog } from './types.js';

export interface SyncChange {
  dependency: string;
  previous_hash: string;
  current_hash: string;
  affected_modules: string[];
  changelog: Changelog | null;
}

export interface SyncState {
  known_hashes: Record<string, string>; // dependency → last known hash
}

/**
 * Check all dependencies for interface changes.
 */
export function checkDependencies(
  dependenciesPath: string,
  index: CompiledIndex,
  syncStatePath: string,
  resolveDependencyPath: (depName: string) => string | null
): SyncChange[] {
  const changes: SyncChange[] = [];

  // Read dependencies.yaml
  if (!fs.existsSync(dependenciesPath)) return [];
  const deps = yaml.load(fs.readFileSync(dependenciesPath, 'utf-8')) as DependenciesFile;
  if (!deps?.dependencies) return [];

  // Read sync state (known hashes)
  let syncState: SyncState = { known_hashes: {} };
  if (fs.existsSync(syncStatePath)) {
    try {
      syncState = JSON.parse(fs.readFileSync(syncStatePath, 'utf-8'));
    } catch { /* fresh start */ }
  }

  for (const [depName, config] of Object.entries(deps.dependencies)) {
    // Resolve dependency path
    const depPublishedDir = resolveDependencyPath(depName);
    if (!depPublishedDir) continue;

    const interfacePath = path.join(depPublishedDir, 'interface.yaml');
    if (!fs.existsSync(interfacePath)) {
      // Dependency unavailable
      if (config.fallback === 'last_known_good') {
        // Keep running on cached version — no change
        continue;
      }
      continue;
    }

    // Read dependency's current interface
    let depInterface: PublishedInterface;
    try {
      depInterface = yaml.load(fs.readFileSync(interfacePath, 'utf-8')) as PublishedInterface;
    } catch { continue; }

    const currentHash = depInterface.version_hash;
    const knownHash = syncState.known_hashes[depName];

    // Check if pinned to specific version
    if (config.pin !== 'latest' && config.pin !== currentHash) {
      // Pinned to old version — don't update, but alert if configured
      if (config.alert_on_update && currentHash !== knownHash) {
        // New version available but we're pinned
        // Store that we've seen it but don't trigger reconvergence
        syncState.known_hashes[depName] = currentHash;
      }
      continue;
    }

    // Check if hash changed
    if (knownHash && knownHash === currentHash) {
      continue; // No change
    }

    // Hash changed! Find affected local modules
    const affectedModules = findAffectedModules(depName, index);

    // Read changelog if available
    let changelog: Changelog | null = null;
    const changelogPath = path.join(depPublishedDir, 'changelog.yaml');
    if (fs.existsSync(changelogPath)) {
      try {
        changelog = yaml.load(fs.readFileSync(changelogPath, 'utf-8')) as Changelog;
      } catch { /* no changelog */ }
    }

    changes.push({
      dependency: depName,
      previous_hash: knownHash ?? 'none',
      current_hash: currentHash,
      affected_modules: affectedModules,
      changelog,
    });

    // Update known hash
    syncState.known_hashes[depName] = currentHash;
  }

  // Save sync state
  fs.writeFileSync(syncStatePath, JSON.stringify(syncState, null, 2));

  return changes;
}

/**
 * Find which local modules reference a dependency's nodes in their journeys.
 */
function findAffectedModules(depName: string, index: CompiledIndex): string[] {
  const affected = new Set<string>();

  for (const [, journey] of Object.entries(index.journeys)) {
    for (const step of journey.steps) {
      // Check if step references the dependency
      if (step.node.startsWith(depName + '/')) {
        affected.add(journey.module);
      }
    }
  }

  return [...affected];
}

/**
 * Mark modules as stale by adding _stale: true to their YAML files.
 */
export function markModulesStale(
  modulesDir: string,
  modules: string[],
  reason: string
): void {
  for (const mod of modules) {
    const filePath = path.join(modulesDir, `${mod}.yaml`);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('_stale: true')) continue; // already stale

    // Prepend stale marker
    const updated = `_stale: true\n_stale_reason: "${reason}"\n\n${content}`;
    fs.writeFileSync(filePath, updated);
  }
}
