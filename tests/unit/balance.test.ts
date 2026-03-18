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
});
