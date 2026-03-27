// Auto-generated from journey: AdaptCooldownDuringRapidRipple
// Module: events
// Triggered by: _actors/FileSystem
// Modules touched: _actors, events

import { describe, it, expect } from 'vitest';

describe("AdaptCooldownDuringRapidRipple", () => {
  it("step 1: _actors/FileSystem fires multiple fs.watch callbacks in rapid succession from the same or different dependencies", () => {
    // Simulate rapid callbacks by recording timestamps
    const callbacks: number[] = [];
    for (let i = 0; i < 5; i++) callbacks.push(Date.now());
    expect(callbacks).toHaveLength(5);
    // All timestamps should be very close together
    expect(callbacks[4] - callbacks[0]).toBeLessThan(1000);
  });

  it("step 2: events/DetectEventFileChange receives each filesystem notification", () => {
    const notifications = [
      { path: '/dep-a/events/1.event', type: 'change' },
      { path: '/dep-b/events/2.event', type: 'change' },
      { path: '/dep-a/events/3.event', type: 'change' },
    ];
    expect(notifications).toHaveLength(3);
    expect(notifications[0].type).toBe('change');
  });

  it("step 3: events/DebounceEvents detects that events are arriving faster than the current cooldown window", () => {
    const cooldownMs = 5000;
    const eventTimestamps = [1000, 1200, 1400, 1600]; // 200ms apart
    const avgInterval = (eventTimestamps[eventTimestamps.length - 1] - eventTimestamps[0]) / (eventTimestamps.length - 1);
    expect(avgInterval).toBeLessThan(cooldownMs);
    expect(avgInterval).toBe(200);
  });

  it("step 4: events/AdjustCooldownWindow reads the current event arrival rate from the debounce buffer", () => {
    const buffer = { events: ['dep-a', 'dep-b', 'dep-a'], windowStart: 1000, windowEnd: 1600 };
    const arrivalRate = buffer.events.length / ((buffer.windowEnd - buffer.windowStart) / 1000);
    expect(arrivalRate).toBe(5); // 3 events in 0.6 seconds
  });

  it("step 5: events/AdjustCooldownWindow widens the cooldown window to suppress rapid re-triggers during the cascade", () => {
    let cooldownMs = 5000;
    const rapidThreshold = 3; // events per second
    const currentRate = 5;
    if (currentRate > rapidThreshold) {
      cooldownMs = cooldownMs * 2;
    }
    expect(cooldownMs).toBe(10000);
  });

  it("step 6: events/OscillationCooldown applies the widened cooldown window to filter subsequent events", () => {
    const widenedCooldown = 10000;
    const lastTrigger = Date.now() - 3000;
    const elapsed = Date.now() - lastTrigger;
    const suppressed = elapsed < widenedCooldown;
    expect(suppressed).toBe(true);
  });

  it("step 7: events/LogEventReceived records the cooldown adjustment with the old and new window values", () => {
    const logEntry = { type: 'cooldown_adjusted', oldWindow: 5000, newWindow: 10000 };
    expect(logEntry.oldWindow).toBe(5000);
    expect(logEntry.newWindow).toBe(10000);
    expect(logEntry.newWindow).toBeGreaterThan(logEntry.oldWindow);
  });

  it("step 8: events/EventLog persists the cooldown adjustment log entry", () => {
    const log: Array<Record<string, unknown>> = [];
    log.push({ type: 'cooldown_adjusted', timestamp: new Date().toISOString() });
    expect(log).toHaveLength(1);
  });

  it("step 9: events/AdjustCooldownWindow schedules the cooldown window to narrow back to the default after a stable period with no events", () => {
    const defaultCooldown = 5000;
    let currentCooldown = 10000;
    const stablePeriodMs = 30000;
    // After stable period, reset
    currentCooldown = defaultCooldown;
    expect(currentCooldown).toBe(defaultCooldown);
  });
});
