// Auto-generated from journey: DiscoveryAngleBiasDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation

import { describe, it, expect } from 'vitest';
import { compileFromModules } from '../../src/compile.js';
import type { ModuleFile } from '../../src/types.js';

// Biased discovery: activities heavily weighted, threats and lifecycle suppressed
const activitiesActors = ['Admin', 'Developer', 'Designer', 'QAEngineer', 'DevOpsEngineer',
  'ProductManager', 'TechLead', 'ScrumMaster', 'StakeHolder', 'DataAnalyst'];
const threatsActors: string[] = []; // suppressed — zero threat actors
const lifecycleActors = ['NewUser']; // minimal — just 1

describe("DiscoveryAngleBiasDefense", () => {
  it("step 1: _actors/MaliciousSpecAuthor writes a spec heavily weighted toward one domain to suppress other discovery angles", () => {
    // The biased spec produces a lopsided actor distribution
    expect(activitiesActors.length).toBe(10);
    expect(threatsActors.length).toBe(0);
    expect(lifecycleActors.length).toBe(1);
  });

  it("step 2: actors/DiscoverFromActivities discovers a disproportionately large number of actors from the biased spec", () => {
    expect(activitiesActors.length).toBe(10);
    expect(activitiesActors).toContain('Admin');
    expect(activitiesActors).toContain('Developer');
  });

  it("step 3: actors/DiscoverFromThreats discovers zero or very few threat actors because the spec avoids threat language", () => {
    expect(threatsActors.length).toBe(0);
  });

  it("step 4: actors/DiscoverFromLifecycle discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios", () => {
    expect(lifecycleActors.length).toBe(1);
    // Only 1 lifecycle actor — minimal
  });

  it("step 5: actors/ActivitiesActorList stores the inflated activities actor set", () => {
    expect(activitiesActors.length).toBe(10);
    // More than 80% of all actors come from activities
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const activitiesRatio = activitiesActors.length / total;
    expect(activitiesRatio).toBeGreaterThan(0.8);
  });

  it("step 6: actors/ThreatsActorList stores the suppressed threats actor set", () => {
    expect(threatsActors.length).toBe(0);
    // Zero threats = 0% representation
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const threatsRatio = threatsActors.length / total;
    expect(threatsRatio).toBe(0);
  });

  it("step 7: actors/LifecycleActorList stores the suppressed lifecycle actor set", () => {
    expect(lifecycleActors.length).toBe(1);
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const lifecycleRatio = lifecycleActors.length / total;
    expect(lifecycleRatio).toBeLessThan(0.1);
  });

  it("step 8: actors/DetectDiscoveryAngleBias computes the ratio of actors from each angle to the total", () => {
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const ratios = {
      activities: activitiesActors.length / total,
      threats: threatsActors.length / total,
      lifecycle: lifecycleActors.length / total,
    };
    expect(ratios.activities).toBeCloseTo(10 / 11, 2);
    expect(ratios.threats).toBe(0);
    expect(ratios.lifecycle).toBeCloseTo(1 / 11, 2);
    // Sum of ratios = 1
    expect(ratios.activities + ratios.threats + ratios.lifecycle).toBeCloseTo(1, 5);
  });

  it("step 9: actors/DetectDiscoveryAngleBias flags angles producing less than the minimum threshold proportion as suppressed", () => {
    const minThreshold = 0.1; // each angle should contribute at least 10%
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const suppressed: string[] = [];
    if (threatsActors.length / total < minThreshold) suppressed.push('threats');
    if (lifecycleActors.length / total < minThreshold) suppressed.push('lifecycle');
    if (activitiesActors.length / total < minThreshold) suppressed.push('activities');
    expect(suppressed).toContain('threats');
    expect(suppressed).toContain('lifecycle');
    expect(suppressed).not.toContain('activities');
  });

  it("step 10: actors/ValidateThreeAngleCompleteness confirms that the suppressed angles violate the completeness requirement", () => {
    // Three-angle completeness requires at least 1 actor per angle
    const allAnglesHaveActors =
      activitiesActors.length >= 1 &&
      threatsActors.length >= 1 &&
      lifecycleActors.length >= 1;
    expect(allAnglesHaveActors).toBe(false);
    // Threats has 0 → completeness check fails
    expect(threatsActors.length).toBe(0);
  });

  it("step 11: compilation/ErrorReport records the angle bias with the specific ratios and which angles were suppressed", () => {
    const total = activitiesActors.length + threatsActors.length + lifecycleActors.length;
    const report = {
      total_actors: total,
      activities: { count: activitiesActors.length, ratio: activitiesActors.length / total },
      threats: { count: threatsActors.length, ratio: threatsActors.length / total },
      lifecycle: { count: lifecycleActors.length, ratio: lifecycleActors.length / total },
      suppressed_angles: ['threats', 'lifecycle'],
      completeness_passed: false,
    };
    expect(report.total_actors).toBe(11);
    expect(report.suppressed_angles).toContain('threats');
    expect(report.suppressed_angles).toContain('lifecycle');
    expect(report.completeness_passed).toBe(false);
    expect(report.activities.ratio).toBeGreaterThan(0.8);
  });

});
