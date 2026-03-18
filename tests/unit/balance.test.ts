import { describe, expect, it } from 'vitest';
import { balanceGuardrails, getTierBalance } from '../../src/game/core/balance';

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
});
