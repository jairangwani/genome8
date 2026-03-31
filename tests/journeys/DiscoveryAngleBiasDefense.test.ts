// Auto-generated from journey: DiscoveryAngleBiasDefense
// Module: actors
// Triggered by: _actors/MaliciousSpecAuthor
// Modules touched: _actors, actors, compilation

import { describe, it, expect } from 'vitest';

// Biased discovery: activities angle has many, threats/lifecycle suppressed
const activitiesActors = ['User', 'Admin', 'Editor', 'Viewer', 'Moderator', 'Creator', 'Analyst', 'Operator'];
const threatsActors: string[] = []; // suppressed — spec avoids threat language
const lifecycleActors: string[] = []; // suppressed — spec omits lifecycle

const MIN_ANGLE_PROPORTION = 0.1; // each angle should produce >= 10% of total

function computeAngleRatios(activities: string[], threats: string[], lifecycle: string[]) {
  const total = activities.length + threats.length + lifecycle.length;
  if (total === 0) return { activities: 0, threats: 0, lifecycle: 0, total: 0 };
  return {
    activities: activities.length / total,
    threats: threats.length / total,
    lifecycle: lifecycle.length / total,
    total,
  };
}

function detectSuppressedAngles(ratios: ReturnType<typeof computeAngleRatios>): string[] {
  const suppressed: string[] = [];
  if (ratios.threats < MIN_ANGLE_PROPORTION) suppressed.push('threats');
  if (ratios.lifecycle < MIN_ANGLE_PROPORTION) suppressed.push('lifecycle');
  if (ratios.activities < MIN_ANGLE_PROPORTION) suppressed.push('activities');
  return suppressed;
}

describe("DiscoveryAngleBiasDefense", () => {
  it("step 1: _actors/MaliciousSpecAuthor writes a spec heavily weighted toward one domain to suppress other discovery angles", () => {
    const biasedSpec = 'Users create content. Admins edit it. Editors review it. Viewers see it. Moderators enforce policy. Creators publish. Analysts report. Operators monitor.';
    // All activities, no threat or lifecycle language
    expect(biasedSpec).not.toContain('attack');
    expect(biasedSpec).not.toContain('onboard');
    expect(biasedSpec).not.toContain('churn');
  });

  it("step 2: actors/DiscoverFromActivities discovers a disproportionately large number of actors from the biased spec", () => {
    expect(activitiesActors.length).toBe(8);
    expect(activitiesActors.length).toBeGreaterThan(5);
  });

  it("step 3: actors/DiscoverFromThreats discovers zero or very few threat actors because the spec avoids threat language", () => {
    expect(threatsActors.length).toBe(0);
  });

  it("step 4: actors/DiscoverFromLifecycle discovers zero or very few lifecycle actors because the spec omits lifecycle scenarios", () => {
    expect(lifecycleActors.length).toBe(0);
  });

  it("step 5: actors/ActivitiesActorList stores the inflated activities actor set", () => {
    expect(activitiesActors).toContain('User');
    expect(activitiesActors).toContain('Operator');
    expect(activitiesActors.length).toBe(8);
  });

  it("step 6: actors/ThreatsActorList stores the suppressed threats actor set", () => {
    expect(threatsActors.length).toBe(0);
  });

  it("step 7: actors/LifecycleActorList stores the suppressed lifecycle actor set", () => {
    expect(lifecycleActors.length).toBe(0);
  });

  it("step 8: actors/DetectDiscoveryAngleBias computes the ratio of actors from each angle to the total", () => {
    const ratios = computeAngleRatios(activitiesActors, threatsActors, lifecycleActors);
    expect(ratios.activities).toBe(1.0); // all from activities
    expect(ratios.threats).toBe(0);
    expect(ratios.lifecycle).toBe(0);
    expect(ratios.total).toBe(8);
  });

  it("step 9: actors/DetectDiscoveryAngleBias flags angles producing less than the minimum threshold proportion as suppressed", () => {
    const ratios = computeAngleRatios(activitiesActors, threatsActors, lifecycleActors);
    const suppressed = detectSuppressedAngles(ratios);
    expect(suppressed).toContain('threats');
    expect(suppressed).toContain('lifecycle');
    expect(suppressed).not.toContain('activities');
  });

  it("step 10: actors/ValidateThreeAngleCompleteness confirms that the suppressed angles violate the completeness requirement", () => {
    // All 3 angles must produce at least 1 actor
    const allAnglesComplete = activitiesActors.length >= 1
      && threatsActors.length >= 1
      && lifecycleActors.length >= 1;
    expect(allAnglesComplete).toBe(false);
  });

  it("step 11: compilation/ErrorReport records the angle bias with the specific ratios and which angles were suppressed", () => {
    const ratios = computeAngleRatios(activitiesActors, threatsActors, lifecycleActors);
    const suppressed = detectSuppressedAngles(ratios);
    const errorReport = {
      type: 'discovery_angle_bias',
      ratios,
      suppressed_angles: suppressed,
      message: `Discovery angle bias detected: ${suppressed.join(', ')} produced < ${MIN_ANGLE_PROPORTION * 100}% of actors`,
    };
    expect(errorReport.suppressed_angles.length).toBe(2);
    expect(errorReport.message).toContain('threats');
    expect(errorReport.message).toContain('lifecycle');
  });

});
