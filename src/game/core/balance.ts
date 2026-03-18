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

const BASE_START_RADIUS = 168;
const BASE_MAX_RADIUS = 252;
const BASE_CORE_RADIUS = 62;
const BASE_SHIP_RADIUS = 10;
const BASE_ANGULAR_SPEED = 1.45;
const ANGULAR_SPEED_STEP = 0.05;
const BASE_GRAVITY_PULL = 88;
const GRAVITY_PULL_STEP = 8;
const BASE_BOOST_ACCELERATION = 184;
const BOOST_ACCELERATION_STEP = 12;
const BASE_RADIAL_DAMPING = 0.92;
const BASE_HAZARD_COUNT = 4;
const MAX_HAZARD_COUNT = 7;
const BASE_TARGET_ORBITS = 6;
const SCORE_PER_SECOND = 18;
const SCORE_PER_ORBIT = 140;

export const balanceGuardrails = {
  minimumBoostAdvantage: 20,
  minimumStartRadiusBuffer: 24,
  minimumSafeLaneWidth: 150,
  maximumHazardStepPerTier: 1,
  maximumTargetOrbitStepPerTier: 1,
} as const;

export const getTierBalance = (tier: number): TierBalance => {
  const normalizedTier = Math.max(1, Math.floor(tier));

  return {
    tier: normalizedTier,
    startRadius: BASE_START_RADIUS,
    maxRadius: BASE_MAX_RADIUS,
    coreRadius: BASE_CORE_RADIUS,
    shipRadius: BASE_SHIP_RADIUS,
    baseAngularSpeed: BASE_ANGULAR_SPEED + normalizedTier * ANGULAR_SPEED_STEP,
    gravityPull: BASE_GRAVITY_PULL + normalizedTier * GRAVITY_PULL_STEP,
    boostAcceleration: BASE_BOOST_ACCELERATION + normalizedTier * BOOST_ACCELERATION_STEP,
    radialDamping: BASE_RADIAL_DAMPING,
    hazardCount: Math.min(BASE_HAZARD_COUNT + normalizedTier - 1, MAX_HAZARD_COUNT),
    targetOrbits: BASE_TARGET_ORBITS + normalizedTier - 1,
    scorePerSecond: SCORE_PER_SECOND,
    scorePerOrbit: SCORE_PER_ORBIT,
  };
};
