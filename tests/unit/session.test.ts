import { describe, expect, it } from 'vitest';
import { createRunState, getNearestHazardGap, toRunSnapshot, updateRunState } from '../../src/game/core/runModel';

const getPolarDistance = (radiusA: number, angleA: number, radiusB: number, angleB: number): number => {
  const xA = Math.cos(angleA) * radiusA;
  const yA = Math.sin(angleA) * radiusA;
  const xB = Math.cos(angleB) * radiusB;
  const yB = Math.sin(angleB) * radiusB;

  return Math.hypot(xA - xB, yA - yB);
};

const getLaunchLaneEdgeClearance = (
  laneMinRadius: number,
  laneMaxRadius: number,
  shipRadius: number,
  hazardRadius: number,
  hazardAngle: number,
  hazardSize: number,
): number => {
  const hazardX = Math.cos(hazardAngle) * hazardRadius;
  const hazardY = Math.sin(hazardAngle) * hazardRadius;
  const clampedX = Math.min(Math.max(hazardX, laneMinRadius), laneMaxRadius);
  const laneGap = Math.hypot(hazardX - clampedX, hazardY);

  return laneGap - (shipRadius + hazardSize);
};

describe('runModel', () => {
  it('starts a running sector with score and goals wired', () => {
    const state = createRunState(2);
    const snapshot = toRunSnapshot(state);

    expect(snapshot.phase).toBe('running');
    expect(snapshot.tier).toBe(2);
    expect(snapshot.targetOrbits).toBeGreaterThan(0);
    expect(snapshot.hazardCount).toBeGreaterThan(0);
    expect(snapshot.nearestHazardGap).not.toBeNull();
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

  it('reports the closest mine gap for danger telegraphing', () => {
    const initial = createRunState(1);
    const hazard = initial.hazards[0];
    const state = {
      ...initial,
      radius: hazard.radius,
      displayedAngle: hazard.angle,
    };

    expect(getNearestHazardGap(state)).toBe(-1 * (initial.balance.shipRadius + hazard.size));
  });

  it('keeps the launch lane clear of immediate mine contact across the first 24 sectors', () => {
    const minimumEdgeClearance = 28;

    for (let tier = 1; tier <= 24; tier += 1) {
      const state = createRunState(tier);

      state.hazards.forEach((hazard) => {
        const edgeClearance =
          getPolarDistance(state.balance.startRadius, 0, hazard.radius, hazard.angle) -
          (state.balance.shipRadius + hazard.size);

        expect(edgeClearance).toBeGreaterThanOrEqual(minimumEdgeClearance);
      });
    }
  });

  it('keeps the full launch corridor passable across the first 24 sectors', () => {
    const minimumEdgeClearance = 28;

    for (let tier = 1; tier <= 24; tier += 1) {
      const state = createRunState(tier);
      const laneMinRadius = state.balance.coreRadius + state.balance.shipRadius + 4;
      const laneMaxRadius = state.balance.maxRadius - state.balance.shipRadius;

      state.hazards.forEach((hazard) => {
        const edgeClearance = getLaunchLaneEdgeClearance(
          laneMinRadius,
          laneMaxRadius,
          state.balance.shipRadius,
          hazard.radius,
          hazard.angle,
          hazard.size,
        );

        expect(edgeClearance).toBeGreaterThanOrEqual(minimumEdgeClearance);
      });
    }
  });
});
