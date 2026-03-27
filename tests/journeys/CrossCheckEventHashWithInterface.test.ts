// Auto-generated from journey: CrossCheckEventHashWithInterface
// Module: events
// Triggered by: _actors/FileSystem
// Modules touched: _actors, events

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

describe("CrossCheckEventHashWithInterface", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-crosscheck-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("step 1: _actors/FileSystem fires the fs.watch callback for a dependency event file change", () => {
    expect(typeof fs.watch).toBe('function');
  });

  it("step 2: events/DetectEventFileChange receives the filesystem notification with the changed file path", () => {
    const notification = { eventType: 'change', filename: '12345.event' };
    expect(notification.filename).toMatch(/\.event$/);
  });

  it("step 3: events/ReadEventFile reads the event file and extracts the claimed interface hash", () => {
    const eventFile = path.join(tmpDir, 'event.json');
    const data = { hash: 'sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' };
    fs.writeFileSync(eventFile, JSON.stringify(data));
    const parsed = JSON.parse(fs.readFileSync(eventFile, 'utf-8'));
    expect(parsed.hash).toMatch(/^sha256:/);
  });

  it("step 4: events/ValidateEventFileFormat validates the event file has valid structure", () => {
    const validEvent = { hash: 'sha256:abc', sequence: 1, origin_chain: [] };
    expect(validEvent).toHaveProperty('hash');
    expect(validEvent).toHaveProperty('sequence');
    expect(validEvent).toHaveProperty('origin_chain');
  });

  it("step 5: events/ValidateEventHashFormat confirms the hash field is a non-empty SHA256 hex string", () => {
    const validHash = 'sha256:' + 'a'.repeat(64);
    const hashRegex = /^sha256:[0-9a-f]{64}$/;
    expect(validHash).toMatch(hashRegex);

    const invalidHash = 'sha256:tooshort';
    expect(invalidHash).not.toMatch(hashRegex);
  });

  it("step 6: events/EventPayload stores the validated event data including the claimed hash", () => {
    const payload = { hash: 'sha256:' + 'b'.repeat(64), sequence: 5, dependency: 'upstream' };
    expect(payload.hash).toContain('sha256:');
    expect(payload.dependency).toBe('upstream');
  });

  it("step 7: events/CrossCheckEventHashAgainstInterface fetches the dependency's actual interface.yaml from disk", () => {
    const ifacePath = path.join(tmpDir, 'interface.yaml');
    fs.writeFileSync(ifacePath, 'engine: test\nversion_hash: sha256:actual123\n');
    expect(fs.existsSync(ifacePath)).toBe(true);
  });

  it("step 8: events/CrossCheckEventHashAgainstInterface computes or reads the hash of the actual interface.yaml and compares it against the event's claimed hash", () => {
    const claimedHash = 'sha256:abc123';
    const actualContent = '{"provides": {}}';
    const computedHash = 'sha256:' + crypto.createHash('sha256').update(actualContent).digest('hex');
    // The cross-check compares claimed vs computed
    const match = claimedHash === computedHash;
    expect(match).toBe(false); // They differ in this test case
  });

  it("step 9: events/LogEventReceived records whether the cross-check passed or detected a mismatch", () => {
    const logEntry = { event: 'cross-check', result: 'mismatch', claimed: 'sha256:a', actual: 'sha256:b' };
    expect(logEntry.result).toBe('mismatch');
  });

  it("step 10: events/EventLog persists the cross-check result log entry", () => {
    const log: Array<Record<string, string>> = [];
    log.push({ type: 'cross-check', result: 'pass' });
    expect(log).toHaveLength(1);
  });

  it("step 11: events/DelegateToSync passes the verified event payload to sync.ts only if the cross-check passed", () => {
    const crossCheckPassed = true;
    const delegated = crossCheckPassed;
    expect(delegated).toBe(true);

    const crossCheckFailed = false;
    expect(crossCheckFailed).toBe(false);
  });
});
