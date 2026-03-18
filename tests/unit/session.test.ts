import { describe, expect, it } from 'vitest';
import { createRunState, toRunSnapshot, updateRunState } from '../../src/game/core/runModel';

describe('runModel', () => {
  it('starts a running sector with score and goals wired', () => {
    const state = createRunState(2);
    const snapshot = toRunSnapshot(state);

    expect(snapshot.phase).toBe('running');
    expect(snapshot.tier).toBe(2);
    expect(snapshot.targetOrbits).toBeGreaterThan(0);
    expect(snapshot.hazardCount).toBeGreaterThan(0);
  });

  it('widens the orbit while boost is held', () => {
    const initial = createRunState(1);
    const next = updateRunState(initial, { boost: true }, 16);

    expect(next.radius).toBeGreaterThan(initial.radius);
    expect(next.boostActive).toBe(true);
  });

  it('fails when the ship reaches the core', () => {
    const initial = createRunState(1);
    const doomed = {
      ...initial,
      radius: initial.balance.coreRadius + initial.balance.shipRadius + 3,
      radialVelocity: -20,
    };
    const next = updateRunState(doomed, { boost: false }, 16);

    expect(next.phase).toBe('failed');
    expect(next.endReason).toContain('core');
  });

  it('wins after completing the target number of orbits', () => {
    const initial = createRunState(1);
    const nearlyDone = {
      ...initial,
      completedOrbits: initial.balance.targetOrbits - 1,
      angle: Math.PI * 2 * (initial.balance.targetOrbits - 0.001),
    };
    const next = updateRunState(nearlyDone, { boost: false }, 33);

    expect(next.phase).toBe('won');
    expect(next.completedOrbits).toBe(initial.balance.targetOrbits);
  });
});
