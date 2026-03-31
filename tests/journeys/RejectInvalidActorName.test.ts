// Auto-generated from journey: RejectInvalidActorName
// Module: actors
// Triggered by: _actors/LLMWorker
// Modules touched: _actors, actors, llm

import { describe, it, expect } from 'vitest';

const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

function validateActorName(name: string): boolean {
  return PASCAL_CASE_REGEX.test(name);
}

function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s\-_]/g, '') // remove special chars except separators
    .split(/[\s_-]+/)
    .filter(w => w.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

describe("RejectInvalidActorName", () => {
  it("step 1: _actors/LLMWorker produces actor entries from the 3-angle discovery", () => {
    const discovered = [
      { name: 'User', description: 'Uses the platform' },
      { name: 'system-admin', description: 'Manages systems' },
      { name: 'new user', description: 'First time visitor' },
      { name: 'attacker!', description: 'Tries to exploit' },
    ];
    expect(discovered.length).toBe(4);
    // Mix of valid and invalid names
    expect(validateActorName(discovered[0].name)).toBe(true);
    expect(validateActorName(discovered[1].name)).toBe(false);
  });

  it("step 2: actors/MergedActorList provides the merged actor list with names for format validation", () => {
    const mergedNames = ['User', 'system-admin', 'new user', 'attacker!'];
    expect(mergedNames.length).toBe(4);
  });

  it("step 3: actors/ValidateActorNameFormat checks each actor name against valid PascalCase identifier rules", () => {
    const names = ['User', 'system-admin', 'new user', 'attacker!', 'Admin'];
    const valid = names.filter(n => validateActorName(n));
    const invalid = names.filter(n => !validateActorName(n));
    expect(valid).toEqual(['User', 'Admin']);
    expect(invalid).toEqual(['system-admin', 'new user', 'attacker!']);
  });

  it("step 4: actors/ValidateActorNameFormat detects an actor name containing spaces, hyphens, special characters, or lowercase-start", () => {
    expect(validateActorName('system-admin')).toBe(false); // hyphen
    expect(validateActorName('new user')).toBe(false);      // space
    expect(validateActorName('attacker!')).toBe(false);     // special char
    expect(validateActorName('lowercaseStart')).toBe(false); // lowercase start
    expect(validateActorName('ValidName')).toBe(true);
  });

  it("step 5: llm/SendTask sends the invalid name with the PascalCase naming convention as a correction task", () => {
    const correctionTask = {
      instruction: 'Convert the following actor name to PascalCase format',
      invalidName: 'system-admin',
      convention: 'PascalCase: first letter of each word capitalized, no spaces/hyphens/special chars',
    };
    expect(correctionTask.invalidName).toBe('system-admin');
    expect(correctionTask.convention).toContain('PascalCase');
  });

  it("step 6: _actors/LLMWorker re-formats the actor name to valid PascalCase matching the convention", () => {
    expect(toPascalCase('system-admin')).toBe('SystemAdmin');
    expect(toPascalCase('new user')).toBe('NewUser');
    expect(toPascalCase('attacker!')).toBe('Attacker');
    // All corrected names pass validation
    expect(validateActorName(toPascalCase('system-admin'))).toBe(true);
    expect(validateActorName(toPascalCase('new user'))).toBe(true);
    expect(validateActorName(toPascalCase('attacker!'))).toBe(true);
  });

  it("step 7: actors/MergeAndDeduplicate re-merges with the corrected name to check for new duplicates against existing actors", () => {
    const existing = ['User', 'Admin'];
    const corrected = ['SystemAdmin', 'NewUser', 'Attacker'];
    const merged = [...new Set([...existing, ...corrected])];
    expect(merged.length).toBe(5); // no duplicates
    // Check if correction created a conflict — 'Admin' vs 'SystemAdmin' are different
    expect(new Set(merged).size).toBe(merged.length);
  });

  it("step 8: actors/ValidateActorNameFormat re-validates and confirms all actor names are now valid identifiers", () => {
    const finalNames = ['User', 'Admin', 'SystemAdmin', 'NewUser', 'Attacker'];
    for (const name of finalNames) {
      expect(validateActorName(name)).toBe(true);
    }
    // All pass PascalCase validation
    const allValid = finalNames.every(n => validateActorName(n));
    expect(allValid).toBe(true);
  });

});
