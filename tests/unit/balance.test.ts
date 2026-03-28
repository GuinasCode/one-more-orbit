import { describe, expect, it } from 'vitest';
import { balanceGuardrails, getTierBalance, getTierDifficultyRating } from '../../src/game/core/balance';

const TAU = Math.PI * 2;

const estimateClearSeconds = (tier: number): number => {
  const balance = getTierBalance(tier);
  return Number(((balance.targetOrbits * TAU) / balance.baseAngularSpeed).toFixed(2));
};

describe('balance fairness guardrails', () => {
  it('keeps every checked sector passable with a recoverable lane', () => {
    for (let tier = 1; tier <= 24; tier += 1) {
      const balance = getTierBalance(tier);
      const boostAdvantage = balance.boostAcceleration - balance.gravityPull;
      const startRadiusBuffer = balance.startRadius - balance.coreRadius - balance.shipRadius;
      const safeLaneWidth = balance.maxRadius - balance.coreRadius;

      expect(boostAdvantage).toBeGreaterThanOrEqual(balanceGuardrails.minimumBoostAdvantage);
      expect(startRadiusBuffer).toBeGreaterThanOrEqual(balanceGuardrails.minimumStartRadiusBuffer);
      expect(balance.startRadius).toBeLessThan(balance.maxRadius);
      expect(safeLaneWidth).toBeGreaterThanOrEqual(balanceGuardrails.minimumSafeLaneWidth);
    }
  });

  it('ramps sector pressure gradually without impossible spikes', () => {
    for (let tier = 2; tier <= 24; tier += 1) {
      const previous = getTierBalance(tier - 1);
      const current = getTierBalance(tier);

      expect(current.hazardCount).toBeGreaterThanOrEqual(previous.hazardCount);
      expect(current.hazardCount - previous.hazardCount).toBeLessThanOrEqual(balanceGuardrails.maximumHazardStepPerTier);
      expect(current.targetOrbits).toBeGreaterThanOrEqual(previous.targetOrbits);
      expect(current.targetOrbits - previous.targetOrbits).toBeLessThanOrEqual(
        balanceGuardrails.maximumTargetOrbitStepPerTier,
      );
      expect(current.gravityPull).toBeGreaterThanOrEqual(previous.gravityPull);
      expect(current.boostAcceleration).toBeGreaterThanOrEqual(previous.boostAcceleration);
      expect(current.baseAngularSpeed).toBeGreaterThanOrEqual(previous.baseAngularSpeed);
    }
  });

  it('keeps sector clear-time demands short and smoothly stepped', () => {
    for (let tier = 1; tier <= 24; tier += 1) {
      const estimatedClearSeconds = estimateClearSeconds(tier);

      expect(estimatedClearSeconds).toBeLessThanOrEqual(balanceGuardrails.maximumEstimatedClearSeconds);

      if (tier > 1) {
        const previousEstimatedClearSeconds = estimateClearSeconds(tier - 1);

        expect(estimatedClearSeconds - previousEstimatedClearSeconds).toBeLessThanOrEqual(
          balanceGuardrails.maximumEstimatedClearStepSeconds,
        );
      }
    }
  });

  it('keeps the derived difficulty rating progressive without runaway jumps', () => {
    for (let tier = 2; tier <= 24; tier += 1) {
      const previousRating = getTierDifficultyRating(tier - 1);
      const currentRating = getTierDifficultyRating(tier);

      expect(currentRating).toBeGreaterThanOrEqual(previousRating);
      expect(currentRating - previousRating).toBeLessThanOrEqual(balanceGuardrails.maximumDifficultyStepPerTier);
    }
  });

  it('shapes sectors 1-8 into a readable learn-pressure-confidence curve', () => {
    const sector1 = getTierBalance(1);
    const sector2 = getTierBalance(2);
    const sector3 = getTierBalance(3);
    const sector4 = getTierBalance(4);
    const sector5 = getTierBalance(5);
    const sector6 = getTierBalance(6);
    const sector7 = getTierBalance(7);
    const sector8 = getTierBalance(8);

    expect(sector1.hazardCount).toBe(3);
    expect(sector1.targetOrbits).toBe(4);

    expect(sector2.hazardCount).toBe(4);
    expect(sector2.targetOrbits).toBe(4);

    expect(sector3.hazardCount).toBe(4);
    expect(sector3.targetOrbits).toBe(5);

    expect(sector4.hazardCount).toBe(5);
    expect(sector4.targetOrbits).toBe(5);

    expect(sector5.hazardCount).toBe(5);
    expect(sector5.targetOrbits).toBe(6);

    expect(sector6.hazardCount).toBe(5);
    expect(sector6.targetOrbits).toBe(6);

    expect(sector7.hazardCount).toBe(5);
    expect(sector7.targetOrbits).toBe(7);

    expect(sector8.hazardCount).toBe(5);
    expect(sector8.targetOrbits).toBe(7);

    expect(sector1.baseAngularSpeed).toBeLessThan(sector2.baseAngularSpeed);
    expect(sector2.baseAngularSpeed).toBeLessThan(sector3.baseAngularSpeed);
    expect(sector3.baseAngularSpeed).toBeLessThan(sector4.baseAngularSpeed);
    expect(sector4.gravityPull).toBeLessThan(sector5.gravityPull);
    expect(sector6.gravityPull).toBeLessThan(sector7.gravityPull);
  });

  it('keeps later preset sectors on a solvable five-mine endurance ramp before endless scaling', () => {
    const sector7 = getTierBalance(7);
    const sector8 = getTierBalance(8);
    const sector9 = getTierBalance(9);
    const sector10 = getTierBalance(10);
    const sector11 = getTierBalance(11);
    const sector12 = getTierBalance(12);

    expect(sector7.hazardCount).toBe(5);
    expect(sector8.hazardCount).toBe(5);
    expect(sector9.hazardCount).toBe(5);
    expect(sector10.hazardCount).toBe(5);
    expect(sector11.hazardCount).toBe(5);
    expect(sector12.hazardCount).toBe(5);
    expect(sector8.targetOrbits).toBe(sector7.targetOrbits);
    expect(sector9.targetOrbits).toBe(sector8.targetOrbits + 1);
    expect(sector10.targetOrbits).toBe(sector9.targetOrbits);
    expect(sector11.targetOrbits).toBe(sector10.targetOrbits);
    expect(sector12.targetOrbits).toBe(sector11.targetOrbits);
  });
});
