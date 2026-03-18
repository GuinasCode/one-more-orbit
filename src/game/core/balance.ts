export interface TierBalance {
  tier: number;
  startRadius: number;
  maxRadius: number;
  coreRadius: number;
  shipRadius: number;
  baseAngularSpeed: number;
  gravityPull: number;
  boostAcceleration: number;
  radialDamping: number;
  hazardCount: number;
  targetOrbits: number;
  scorePerSecond: number;
  scorePerOrbit: number;
}

export const getTierBalance = (tier: number): TierBalance => {
  const normalizedTier = Math.max(1, Math.floor(tier));

  return {
    tier: normalizedTier,
    startRadius: 168,
    maxRadius: 252,
    coreRadius: 62,
    shipRadius: 10,
    baseAngularSpeed: 1.45 + normalizedTier * 0.05,
    gravityPull: 88 + normalizedTier * 8,
    boostAcceleration: 184 + normalizedTier * 12,
    radialDamping: 0.92,
    hazardCount: Math.min(3 + normalizedTier, 7),
    targetOrbits: 5 + normalizedTier,
    scorePerSecond: 18,
    scorePerOrbit: 140,
  };
};
