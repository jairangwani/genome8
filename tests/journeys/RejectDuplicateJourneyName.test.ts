// Auto-generated from journey: RejectDuplicateJourneyName
// Module: graph
// Triggered by: _actors/Compiler
// Modules touched: _actors, graph

import { describe, it, expect } from 'vitest';

describe("RejectDuplicateJourneyName", () => {
  it("step 1: _actors/Compiler reads all module YAML files and collects every journey name with its source module", () => {
    // Node: _actors/Compiler (actor)
    // Action: reads all module YAML files and collects every journey name with its source module
    // TODO: agent fills assertion
  });

  it("step 2: graph/JourneyRegistry detects that two or more modules define a journey with the same name", () => {
    // Node: graph/JourneyRegistry (artifact)
    // Action: detects that two or more modules define a journey with the same name
    // TODO: agent fills assertion
  });

  it("step 3: graph/UniqueJourneyNameRule rejects the duplicate because journey names must be unique across all modules", () => {
    // Node: graph/UniqueJourneyNameRule (rule)
    // Action: rejects the duplicate because journey names must be unique across all modules
    // TODO: agent fills assertion
  });

  it("step 4: _actors/Compiler reports a validation error identifying the duplicate journey name and the conflicting modules", () => {
    // Node: _actors/Compiler (actor)
    // Action: reports a validation error identifying the duplicate journey name and the conflicting modules
    // TODO: agent fills assertion
  });

});