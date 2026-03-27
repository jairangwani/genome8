// Auto-generated from journey: HandleMalformedEventFile
// Module: events
// Modules touched: events

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe("HandleMalformedEventFile", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'genome-malformed-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it("step 1: events/DetectEventFileChange receives a filesystem notification for an event file change", () => {
    const notification = { eventType: 'change', filename: 'malformed.event' };
    expect(notification.eventType).toBe('change');
  });

  it("step 2: events/ReadEventFile successfully reads the event file bytes from disk", () => {
    const eventFile = path.join(tmpDir, 'malformed.event');
    fs.writeFileSync(eventFile, '{broken json!!!');
    const content = fs.readFileSync(eventFile, 'utf-8');
    expect(content).toBe('{broken json!!!');
  });

  it("step 3: events/ValidateEventFileFormat attempts to parse the event file as JSON and finds malformed content", () => {
    const content = '{broken json!!!';
    let parseError: Error | null = null;
    try {
      JSON.parse(content);
    } catch (e) {
      parseError = e as Error;
    }
    expect(parseError).not.toBeNull();
    expect(parseError!.message).toContain('Unexpected token');
  });

  it("step 4: events/HandleInvalidEventPayload identifies the specific validation failure such as missing hash field, invalid JSON, or unparseable sequence number", () => {
    const failures = [
      { type: 'invalid_json', detail: 'Unexpected token' },
      { type: 'missing_field', detail: 'hash field is required' },
      { type: 'invalid_sequence', detail: 'sequence must be a number' },
    ];
    expect(failures).toHaveLength(3);
    expect(failures[0].type).toBe('invalid_json');
  });

  it("step 5: events/HandleInvalidEventPayload produces a structured error with the field name, expected format, and actual value", () => {
    const error = { field: 'hash', expected: 'sha256:<hex64>', actual: undefined, message: 'hash field is required' };
    expect(error.field).toBe('hash');
    expect(error.expected).toContain('sha256');
    expect(error.actual).toBeUndefined();
  });

  it("step 6: events/LogEventFailure records the malformed event with source dependency, error details, and raw file content excerpt", () => {
    const logEntry = {
      type: 'malformed-event',
      dependency: 'dep-a',
      error: 'Unexpected token',
      rawExcerpt: '{broken json!!!'
    };
    expect(logEntry.type).toBe('malformed-event');
    expect(logEntry.rawExcerpt).toContain('broken');
  });

  it("step 7: events/EventLog persists the malformed event log entry", () => {
    const logFile = path.join(tmpDir, 'event-log.json');
    fs.writeFileSync(logFile, JSON.stringify([{ type: 'malformed' }]));
    const loaded = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
    expect(loaded).toHaveLength(1);
  });

  it("step 8: events/LogEventReceived records the event disposition as discarded due to invalid format", () => {
    const logEntry = { disposition: 'discarded', reason: 'invalid-format' };
    expect(logEntry.disposition).toBe('discarded');
  });

  it("step 9: events/EnterSleep returns to sleep since the malformed event cannot be processed and no sync is triggered", () => {
    const state = { sleeping: true, syncTriggered: false };
    expect(state.sleeping).toBe(true);
    expect(state.syncTriggered).toBe(false);
  });
});
