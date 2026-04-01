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
 * Validate that all journey refs in the exported interface resolve to
 * exported nodes or are explicitly marked as external requirements.
 */
export function validateExportedInterface(
  interface_: PublishedInterface,
  index: CompiledIndex
): string[] {
  const errors: string[] = [];
  const exportedNodes = new Set(Object.keys(interface_.provides));

  for (const [, journey] of Object.entries(index.journeys)) {
    for (const step of journey.steps) {
      if (!exportedNodes.has(step.node) && !interface_.requires[step.node]) {
        // Node is neither exported nor declared as external requirement
        // This is OK if the node is internal — only flag if it's a dangling ref
        if (!index.nodes[step.node]) {
          errors.push(`Journey "${journey.name}" step ${step.step_number}: ref ${step.node} is not exported, not required, and not in index`);
        }
      }
    }
  }
  return errors;
}

/**
 * Detect corrupted previous hash file. Returns true if the hash is invalid.
 */
export function detectCorruptedHash(hashString: string | undefined): boolean {
  if (!hashString) return false; // no hash = first time, not corruption
  if (!hashString.startsWith('sha256:')) return true;
  const hex = hashString.slice(7);
  return !/^[a-f0-9]{64}$/.test(hex);
}

/**
 * Write event file to signal downstream dependents.
 * Contains interface hash, changelog summary, origin chain, and sequence number.
 */
export function writeEventFile(
  publishedDir: string,
  interface_: PublishedInterface,
  changelog: Changelog,
  originChain: string[],
  boxId: string
): void {
  const eventDir = publishedDir;
  const eventPath = path.join(eventDir, 'event.json');

  // Read existing event to get sequence number
  let sequenceNumber = 1;
  if (fs.existsSync(eventPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
      sequenceNumber = (existing.sequence_number ?? 0) + 1;
    } catch { /* first event */ }
  }

  const event = {
    interface_hash: interface_.version_hash,
    changelog_summary: changelog.changes.map(c => `${c.type}: ${c.node}`),
    origin_chain: [...originChain, boxId],
    sequence_number: sequenceNumber,
    dependency: interface_.engine,
    timestamp: new Date().toISOString(),
  };

  // Atomic write: write temp then rename
  const tempPath = eventPath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(event, null, 2));
  fs.renameSync(tempPath, eventPath);
}

/**
 * Atomic file write: write to temp file then rename.
 * Prevents partial writes from leaving corrupted files on disk.
 */
export function atomicWrite(filePath: string, content: string): void {
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, content);
  fs.renameSync(tempPath, filePath);
}

/**
 * Write published interface and changelog to disk.
 */
export function publishInterface(
  publishedDir: string,
  index: CompiledIndex,
  engineName: string
): { interface_: PublishedInterface; changelog: Changelog; skipped: boolean } {
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
      // Detect corrupted previous hash — treat as first-time publish
      if (previous && detectCorruptedHash(previous.version_hash)) {
        console.log('  [publish] Previous hash corrupted — treating as first-time publish');
        previous = null;
      }
    } catch { /* first time */ }
  }

  // Generate new interface
  const interface_ = generateInterface(index, engineName);

  // Skip publish if unchanged
  if (previous && previous.version_hash === interface_.version_hash) {
    return {
      interface_,
      changelog: { previous_hash: previous.version_hash, current_hash: interface_.version_hash, changes: [] },
      skipped: true,
    };
  }

  // Validate exported interface
  const validationErrors = validateExportedInterface(interface_, index);
  if (validationErrors.length > 0) {
    console.log(`  [publish] ${validationErrors.length} validation warnings in exported interface`);
  }

  // Generate changelog
  const changelog = generateChangelog(previous, interface_);

  // Atomic write files
  atomicWrite(interfacePath, yaml.dump(interface_, { lineWidth: 120, noRefs: true }));
  atomicWrite(changelogPath, yaml.dump(changelog, { lineWidth: 120, noRefs: true }));

  return { interface_, changelog, skipped: false };
}

/**
 * On cold start, scan the publish output directory for orphan .tmp files
 * left by atomic write operations that crashed between temp file creation
 * and rename. Removes them to prevent disk accumulation.
 * Enables CleanupOrphanTempFilesOnColdStart journey.
 */
export function detectOrphanTempFiles(publishedDir: string): string[] {
  if (!fs.existsSync(publishedDir)) return [];
  const removed: string[] = [];
  const entries = fs.readdirSync(publishedDir);
  for (const entry of entries) {
    if (entry.endsWith('.tmp')) {
      const tmpPath = path.join(publishedDir, entry);
      fs.unlinkSync(tmpPath);
      removed.push(entry);
    }
  }
  return removed;
}

/**
 * Before incrementing the event sequence counter, check if the last event
 * file already has the expected next sequence number (indicating a retry
 * of an already-written event). Skips increment to prevent double-counting.
 * Enables GuardSequenceCounterOnPublishRetry journey.
 */
export function guardSequenceCounter(
  eventPath: string,
  expectedNext: number
): boolean {
  if (!fs.existsSync(eventPath)) return false;
  try {
    const existing = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
    return existing.sequence_number === expectedNext;
  } catch {
    return false;
  }
}
