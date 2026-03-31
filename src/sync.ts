/**
 * sync.ts — Cross-engine/project sync via hash watching.
 *
 * Checks if any dependency's published interface has changed.
 * If yes, identifies which local modules are affected.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { PublishedInterface, DependenciesFile, DependencyConfig, CompiledIndex, Changelog } from './types.js';

export interface SyncChange {
  dependency: string;
  previous_hash: string;
  current_hash: string;
  affected_modules: string[];
  changelog: Changelog | null;
}

export interface SyncState {
  known_hashes: Record<string, string>;       // dependency → last known hash
  sync_in_progress?: boolean;                 // Guard against concurrent sync operations
  sync_started_at?: string;                   // Timestamp of last sync start (for stale lock detection)
  last_processed_sequence?: Record<string, number>; // dependency → last processed event sequence number
  box_id?: string;                            // This box's ID for oscillation chain tracking
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

  // Guard against concurrent sync operations
  if (syncState.sync_in_progress) {
    // Check for stale lock (>5 min old)
    const lockAge = syncState.sync_started_at
      ? Date.now() - new Date(syncState.sync_started_at).getTime()
      : Infinity;
    if (lockAge < 5 * 60 * 1000) {
      // Another sync is running and lock is fresh — skip
      return [];
    }
    // Stale lock — proceed and take over
  }
  syncState.sync_in_progress = true;
  syncState.sync_started_at = new Date().toISOString();
  fs.writeFileSync(syncStatePath, JSON.stringify(syncState, null, 2));

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

  // Release sync lock and save state
  syncState.sync_in_progress = false;
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

/**
 * Parse an event file payload. Event files contain JSON with interface hash,
 * changelog summary, origin chain, and sequence number.
 */
export interface EventPayload {
  interface_hash: string;
  changelog_summary?: string[];
  origin_chain: string[];
  sequence_number: number;
  dependency: string;
}

export function parseEventPayload(eventFilePath: string): EventPayload | null {
  try {
    const raw = fs.readFileSync(eventFilePath, 'utf-8');
    const parsed = JSON.parse(raw) as EventPayload;
    if (!parsed.interface_hash || typeof parsed.sequence_number !== 'number') {
      return null;
    }
    return {
      interface_hash: parsed.interface_hash,
      changelog_summary: parsed.changelog_summary ?? [],
      origin_chain: parsed.origin_chain ?? [],
      sequence_number: parsed.sequence_number,
      dependency: parsed.dependency ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Check if an event's sequence number is newer than the last processed sequence.
 * Returns true if the event should be processed, false if it should be discarded.
 */
export function checkEventSequence(
  syncState: SyncState,
  dependency: string,
  incomingSequence: number
): boolean {
  const lastProcessed = syncState.last_processed_sequence?.[dependency] ?? -1;
  return incomingSequence > lastProcessed;
}

/**
 * Detect oscillation in a ripple origin chain.
 * Returns true if this box's ID appears in the chain (A→B→A cycle).
 */
export function detectOscillation(
  originChain: string[],
  boxId: string
): boolean {
  return originChain.includes(boxId);
}

/**
 * Validate dependency configuration: check that each dependency's
 * directory exists and interface.yaml is present.
 */
export function validateDependencyConfig(
  deps: Record<string, DependencyConfig>,
  resolveDependencyPath: (depName: string) => string | null
): Array<{ dependency: string; error: string }> {
  const errors: Array<{ dependency: string; error: string }> = [];

  for (const depName of Object.keys(deps)) {
    const depPath = resolveDependencyPath(depName);
    if (!depPath) {
      errors.push({ dependency: depName, error: 'dependency directory not found' });
      continue;
    }
    const interfacePath = path.join(depPath, 'interface.yaml');
    if (!fs.existsSync(interfacePath)) {
      errors.push({ dependency: depName, error: 'interface.yaml not found' });
    }
  }
  return errors;
}

/**
 * Filter affected modules by comparing their cross-module references
 * against a changelog's changed nodes. Only modules that reference
 * actually-changed nodes remain in the affected set.
 */
export function filterUnrelatedChanges(
  affectedModules: string[],
  changelog: Changelog | null,
  index: CompiledIndex
): string[] {
  if (!changelog || !changelog.changes.length) {
    return affectedModules; // No changelog to filter with
  }

  // Build set of changed node names from changelog
  const changedNodes = new Set(changelog.changes.map(c => c.node));

  return affectedModules.filter(mod => {
    // Check if any node in this module references a changed dependency node
    for (const [, node] of Object.entries(index.nodes)) {
      if (node.module !== mod) continue;
      for (const ref of node.cross_module_connections) {
        if (changedNodes.has(ref) || changedNodes.has(ref.split('/')[1])) {
          return true;
        }
      }
    }
    return false;
  });
}

/**
 * Append this box's ID to the ripple origin chain for downstream propagation.
 */
export function appendToOriginChain(
  existingChain: string[],
  boxId: string
): string[] {
  return [...existingChain, boxId];
}

/**
 * Narrow outgoing changelog to include only changes that affected this box.
 * Removes entries for nodes not referenced by any local module.
 */
export function narrowChangelog(
  changelog: Changelog,
  index: CompiledIndex
): Changelog {
  // Build set of all external nodes referenced locally
  const referencedNodes = new Set<string>();
  for (const node of Object.values(index.nodes)) {
    for (const ref of node.cross_module_connections) {
      referencedNodes.add(ref);
      referencedNodes.add(ref.split('/')[1]); // bare name too
    }
  }

  const narrowedChanges = changelog.changes.filter(c =>
    referencedNodes.has(c.node) || referencedNodes.has(c.node.split('/')[1])
  );

  return {
    previous_hash: changelog.previous_hash,
    current_hash: changelog.current_hash,
    changes: narrowedChanges,
  };
}
