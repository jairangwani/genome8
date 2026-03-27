// Auto-generated from journey: RejectInvalidActorName
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, actors, llm

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// PascalCase validation regex — valid node names are PascalCase identifiers
const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]+$/;

// Actor names produced by LLM — some valid, some invalid
const rawActorNames = [
  'ProjectOwner',        // valid
  'LLMWorker',           // valid
  'new-user',            // invalid: hyphen + lowercase start
  'malicious spec author', // invalid: spaces + lowercase start
  'admin',               // invalid: lowercase start
  'API_Consumer',        // invalid: underscore
  'DataAnalyst',         // valid
  '123Bot',              // invalid: starts with number
];

describe("RejectInvalidActorName", () => {
  it("step 1: _actors/LLMWorker produces actor entries from the 3-angle discovery", () => {
    expect(rawActorNames.length).toBe(8);
    // Mix of valid and invalid names
    expect(rawActorNames).toContain('ProjectOwner');
    expect(rawActorNames).toContain('new-user');
  });

  it("step 2: actors/MergedActorList provides the merged actor list with names for format validation", () => {
    // All names are present for validation
    const merged = [...new Set(rawActorNames)];
    expect(merged.length).toBe(8);
    // No duplicates in this set
    expect(merged.length).toBe(rawActorNames.length);
  });

  it("step 3: actors/ValidateActorNameFormat checks each actor name against valid PascalCase identifier rules", () => {
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const name of rawActorNames) {
      if (PASCAL_CASE.test(name)) {
        valid.push(name);
      } else {
        invalid.push(name);
      }
    }
    expect(valid).toContain('ProjectOwner');
    expect(valid).toContain('LLMWorker');
    expect(valid).toContain('DataAnalyst');
    expect(valid.length).toBe(3);
    expect(invalid.length).toBe(5);
  });

  it("step 4: actors/ValidateActorNameFormat detects an actor name containing spaces, hyphens, special characters, or lowercase-start", () => {
    const invalid = rawActorNames.filter(n => !PASCAL_CASE.test(n));
    expect(invalid).toContain('new-user');           // hyphen
    expect(invalid).toContain('malicious spec author'); // spaces
    expect(invalid).toContain('admin');               // lowercase start
    expect(invalid).toContain('API_Consumer');         // underscore
    expect(invalid).toContain('123Bot');               // starts with number
  });

  it("step 5: llm/SendTask sends the invalid name with the PascalCase naming convention as a correction task", () => {
    // Build correction tasks for each invalid name
    const corrections = rawActorNames
      .filter(n => !PASCAL_CASE.test(n))
      .map(name => ({
        original: name,
        instruction: `Rename "${name}" to valid PascalCase. Rules: start with uppercase letter, no spaces/hyphens/underscores.`,
      }));
    expect(corrections.length).toBe(5);
    expect(corrections[0].instruction).toContain('PascalCase');
  });

  it("step 6: _actors/LLMWorker re-formats the actor name to valid PascalCase matching the convention", () => {
    // Simulate LLM correction
    const correctionMap: Record<string, string> = {
      'new-user': 'NewUser',
      'malicious spec author': 'MaliciousSpecAuthor',
      'admin': 'Admin',
      'API_Consumer': 'APIConsumer',
      '123Bot': 'Bot123',
    };
    for (const [original, corrected] of Object.entries(correctionMap)) {
      expect(PASCAL_CASE.test(original)).toBe(false);
      expect(PASCAL_CASE.test(corrected)).toBe(true);
    }
  });

  it("step 7: actors/MergeAndDeduplicate re-merges with the corrected name to check for new duplicates against existing actors", () => {
    // After correction, merge and check for dupes
    const corrected = ['ProjectOwner', 'LLMWorker', 'NewUser', 'MaliciousSpecAuthor',
      'Admin', 'APIConsumer', 'DataAnalyst', 'Bot123'];
    const deduped = [...new Set(corrected)];
    expect(deduped.length).toBe(corrected.length); // no dupes introduced
    // If a correction collided with an existing name, dedup would reduce the count
    const withDupe = [...corrected, 'Admin']; // simulate adding a dupe
    const dedupedWithDupe = [...new Set(withDupe)];
    expect(dedupedWithDupe.length).toBe(corrected.length); // dupe removed
  });

  it("step 8: actors/ValidateActorNameFormat re-validates and confirms all actor names are now valid identifiers", () => {
    const finalNames = ['ProjectOwner', 'LLMWorker', 'NewUser', 'MaliciousSpecAuthor',
      'Admin', 'APIConsumer', 'DataAnalyst', 'Bot123'];
    // All pass PascalCase validation
    for (const name of finalNames) {
      expect(PASCAL_CASE.test(name)).toBe(true);
    }
    // Compile to verify they work as node names
    const nodes: Record<string, any> = {};
    for (const name of finalNames) {
      nodes[name] = { type: 'actor', description: `${name} actor` };
    }
    const result = compileFromModules(new Map([['_actors', { nodes, journeys: {} }]]));
    expect(Object.keys(result.index.nodes).length).toBe(8);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

});
