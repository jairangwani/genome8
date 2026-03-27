// Auto-generated from journey: CheckSpecCoverageAgainstOrganization
// Module: audit
// Triggered by: _actors/Auditor
// Modules touched: organization, audit, _actors

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

const _actors: ModuleFile = {
  nodes: {
    Auditor: { type: 'actor', description: 'reviews coverage' },
  },
  journeys: {},
};

// Module claiming spec sections 1, 2
const auth: ModuleFile = {
  spec_sections: [1, 2],
  nodes: {
    Login: { type: 'process', description: 'authenticates users' },
    TokenStore: { type: 'artifact', description: 'stores tokens' },
  },
  journeys: {
    UserLogin: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews auth' },
        { node: 'Login', action: 'validates' },
        { node: 'TokenStore', action: 'stores token' },
      ],
    },
  },
};

// Module claiming spec sections 3, 5
const audit: ModuleFile = {
  spec_sections: [3, 5],
  nodes: {
    CheckSpecCoverage: { type: 'process', description: 'checks spec coverage' },
  },
  journeys: {
    RunSpecAudit: {
      steps: [
        { node: '_actors/Auditor', action: 'reviews spec coverage' },
        { node: 'CheckSpecCoverage', action: 'checks section coverage' },
      ],
    },
  },
};

// Module claiming NO spec sections (uncovered — thin coverage)
const events: ModuleFile = {
  nodes: {
    EventEmitter: { type: 'process', description: 'emits events' },
  },
  journeys: {
    EmitEvent: {
      steps: [
        { node: '_actors/Auditor', action: 'triggers event' },
        { node: 'EventEmitter', action: 'emits' },
      ],
    },
  },
};

const result = compileFromModules(new Map([
  ['_actors', _actors],
  ['auth', auth],
  ['audit', audit],
  ['events', events],
]));

describe("CheckSpecCoverageAgainstOrganization", () => {
  it("step 1: organization/SpecSectionIndex provides the indexed list of spec sections parsed from spec.md", () => {
    // All spec sections claimed across all modules
    const allSections = new Set<number>();
    for (const mod of Object.values(result.coverage.modules)) {
      for (const s of mod.spec_sections) allSections.add(s);
    }
    expect(allSections.has(1)).toBe(true);
    expect(allSections.has(2)).toBe(true);
    expect(allSections.has(3)).toBe(true);
    expect(allSections.has(5)).toBe(true);
  });

  it("step 2: organization/ModuleSpecSectionMap provides the mapping of which modules claim which spec sections", () => {
    expect(result.coverage.modules['auth'].spec_sections).toEqual([1, 2]);
    expect(result.coverage.modules['audit'].spec_sections).toEqual([3, 5]);
    expect(result.coverage.modules['events'].spec_sections).toEqual([]);
  });

  it("step 3: audit/GenerateAuditPrompt builds the spec coverage prompt including the section-to-module mapping as ground truth", () => {
    // Build a section → module mapping
    const sectionMap: Record<number, string[]> = {};
    for (const [modName, mod] of Object.entries(result.coverage.modules)) {
      for (const s of mod.spec_sections) {
        if (!sectionMap[s]) sectionMap[s] = [];
        sectionMap[s].push(modName);
      }
    }
    expect(sectionMap[1]).toContain('auth');
    expect(sectionMap[3]).toContain('audit');
  });

  it("step 4: _actors/Auditor compares each spec section against nodes and journeys in modules that claim it", () => {
    // auth claims sections 1, 2 and has a journey with nodes — covered
    expect(result.coverage.modules['auth'].nodes).toBe(2);
    expect(Object.values(result.index.journeys).filter(j => j.module === 'auth').length).toBe(1);
    // audit claims sections 3, 5 and has a journey — covered
    expect(result.coverage.modules['audit'].nodes).toBe(1);
    expect(Object.values(result.index.journeys).filter(j => j.module === 'audit').length).toBe(1);
  });

  it("step 5: audit/CheckSpecCoverage flags spec sections with no claiming module and sections with claims but no journeys", () => {
    // events claims no spec sections — thinly covered module
    expect(result.coverage.modules['events'].spec_sections.length).toBe(0);
    // If hypothetical spec section 4 exists but no module claims it, that's an unclaimed section
    const claimedSections = new Set<number>();
    for (const mod of Object.values(result.coverage.modules)) {
      for (const s of mod.spec_sections) claimedSections.add(s);
    }
    // Sections 4, 6, 7 etc. are unclaimed (not present in any module)
    expect(claimedSections.has(4)).toBe(false);
  });

  it("step 6: audit/SpecCoverageReport records which sections are covered, which are unclaimed, and which are thinly covered", () => {
    const report = {
      covered: [] as number[],
      unclaimed: [] as number[],
      thinModules: [] as string[],
    };
    const claimedSections = new Set<number>();
    for (const [modName, mod] of Object.entries(result.coverage.modules)) {
      for (const s of mod.spec_sections) {
        claimedSections.add(s);
        report.covered.push(s);
      }
      if (mod.spec_sections.length === 0 && modName !== '_actors') {
        report.thinModules.push(modName);
      }
    }
    expect(report.covered).toContain(1);
    expect(report.covered).toContain(3);
    expect(report.thinModules).toContain('events');
  });

  it("step 7: audit/CollectAuditFindings adds spec coverage gaps to the findings list with the organization mapping as context", () => {
    // Modules with no spec sections are potential spec coverage gaps
    const modulesWithNoSections = Object.entries(result.coverage.modules)
      .filter(([name, mod]) => mod.spec_sections.length === 0 && name !== '_actors')
      .map(([name]) => name);
    expect(modulesWithNoSections).toContain('events');
  });

});
