import { describe, expect, it } from 'vitest';
import { balanceGuardrails, getTierBalance } from '../../src/game/core/balance';

const TAU = Math.PI * 2;

const estimateClearSeconds = (tier: number): number => {
  const balance = getTierBalance(tier);
  return Number(((balance.targetOrbits * TAU) / balance.baseAngularSpeed).toFixed(2));
};

describe('balance fairness guardrails', () => {
  it('keeps every checked sector passable with a recoverable lane', () => {
    for (let tier = 1; tier <= 12; tier += 1) {
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
    for (let tier = 2; tier <= 12; tier += 1) {
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
    for (let tier = 1; tier <= 12; tier += 1) {
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

  it('keeps sector 2 as a fair onboarding bridge before early mine pressure ramps', () => {
    const sector1 = getTierBalance(1);
    const sector2 = getTierBalance(2);
    const sector3 = getTierBalance(3);
    const sector4 = getTierBalance(4);
    const sector5 = getTierBalance(5);

    expect(sector2.hazardCount).toBe(sector1.hazardCount);
    expect(sector2.targetOrbits).toBe(sector1.targetOrbits + 1);
    expect(sector3.hazardCount).toBe(sector2.hazardCount + 1);
    expect(sector4.hazardCount).toBe(sector3.hazardCount);
    expect(sector5.hazardCount).toBe(sector4.hazardCount + 1);
    expect(sector4.targetOrbits).toBe(sector3.targetOrbits + 1);
    expect(sector5.targetOrbits).toBe(sector4.targetOrbits + 1);
  });

  it('keeps sector 7 as an endurance bridge before the 7-mine pressure spike', () => {
    const sector5 = getTierBalance(5);
    const sector6 = getTierBalance(6);
    const sector7 = getTierBalance(7);
    const sector8 = getTierBalance(8);

    expect(sector6.hazardCount).toBe(sector5.hazardCount);
    expect(sector7.hazardCount).toBe(sector6.hazardCount);
    expect(sector7.targetOrbits).toBe(sector6.targetOrbits + 1);
    expect(sector8.hazardCount).toBe(sector7.hazardCount + 1);
    expect(sector8.targetOrbits).toBe(sector7.targetOrbits);
  });
});
