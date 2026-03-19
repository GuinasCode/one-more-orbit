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

interface SectorTuning {
  baseAngularSpeed: number;
  gravityPull: number;
  boostAcceleration: number;
  hazardCount: number;
  targetOrbits: number;
}

interface SectorDifficultyStep {
  baseAngularSpeed: number;
  gravityPull: number;
  boostAcceleration: number;
  targetOrbits: number;
}

const BASE_START_RADIUS = 172;
const BASE_MAX_RADIUS = 272;
const BASE_CORE_RADIUS = 62;
const BASE_SHIP_RADIUS = 10;
const BASE_RADIAL_DAMPING = 0.92;
const MAX_HAZARD_COUNT = 5;
const SCORE_PER_SECOND = 18;
const SCORE_PER_ORBIT = 140;
const POST_PRESET_BALANCE_STEPS: SectorDifficultyStep[] = [
  { baseAngularSpeed: 0.025, gravityPull: 3, boostAcceleration: 10, targetOrbits: 0 },
  { baseAngularSpeed: 0.03, gravityPull: 4, boostAcceleration: 11, targetOrbits: 0 },
  { baseAngularSpeed: 0.035, gravityPull: 5, boostAcceleration: 12, targetOrbits: 0 },
];
const SECTOR_TUNING: SectorTuning[] = [
  { baseAngularSpeed: 1.5, gravityPull: 96, boostAcceleration: 196, hazardCount: 3, targetOrbits: 4 },
  { baseAngularSpeed: 1.54, gravityPull: 102, boostAcceleration: 210, hazardCount: 4, targetOrbits: 5 },
  { baseAngularSpeed: 1.58, gravityPull: 108, boostAcceleration: 224, hazardCount: 5, targetOrbits: 6 },
  { baseAngularSpeed: 1.61, gravityPull: 114, boostAcceleration: 238, hazardCount: 5, targetOrbits: 6 },
  { baseAngularSpeed: 1.64, gravityPull: 120, boostAcceleration: 252, hazardCount: 5, targetOrbits: 7 },
  { baseAngularSpeed: 1.67, gravityPull: 126, boostAcceleration: 266, hazardCount: 5, targetOrbits: 7 },
  { baseAngularSpeed: 1.7, gravityPull: 132, boostAcceleration: 280, hazardCount: 5, targetOrbits: 8 },
  { baseAngularSpeed: 1.73, gravityPull: 138, boostAcceleration: 294, hazardCount: 5, targetOrbits: 8 },
  { baseAngularSpeed: 1.76, gravityPull: 144, boostAcceleration: 308, hazardCount: 5, targetOrbits: 8 },
  { baseAngularSpeed: 1.79, gravityPull: 150, boostAcceleration: 322, hazardCount: 5, targetOrbits: 8 },
  { baseAngularSpeed: 1.84, gravityPull: 156, boostAcceleration: 344, hazardCount: 5, targetOrbits: 8 },
  { baseAngularSpeed: 1.89, gravityPull: 162, boostAcceleration: 366, hazardCount: 5, targetOrbits: 8 },
];

export const balanceGuardrails = {
  minimumBoostAdvantage: 20,
  minimumStartRadiusBuffer: 24,
  minimumSafeLaneWidth: 150,
  maximumHazardStepPerTier: 1,
  maximumTargetOrbitStepPerTier: 1,
  maximumEstimatedClearSeconds: 43,
  maximumEstimatedClearStepSeconds: 4,
  maximumDifficultyStepPerTier: 34,
} as const;

const getSectorTuning = (tier: number): SectorTuning => {
  const preset = SECTOR_TUNING[tier - 1];

  if (preset) {
    return preset;
  }

  const lastPreset = SECTOR_TUNING[SECTOR_TUNING.length - 1];
  const extraTiers = tier - SECTOR_TUNING.length;

  return Array.from({ length: extraTiers }).reduce<SectorTuning>((tuning, _, index) => {
    const step = POST_PRESET_BALANCE_STEPS[index % POST_PRESET_BALANCE_STEPS.length];

    return {
      baseAngularSpeed: Number((tuning.baseAngularSpeed + step.baseAngularSpeed).toFixed(3)),
      gravityPull: tuning.gravityPull + step.gravityPull,
      boostAcceleration: tuning.boostAcceleration + step.boostAcceleration,
      hazardCount: Math.min(tuning.hazardCount, MAX_HAZARD_COUNT),
      targetOrbits: tuning.targetOrbits + step.targetOrbits,
    };
  }, lastPreset);
};

export const getTierBalance = (tier: number): TierBalance => {
  const normalizedTier = Math.max(1, Math.floor(tier));
  const tuning = getSectorTuning(normalizedTier);

  return {
    tier: normalizedTier,
    startRadius: BASE_START_RADIUS,
    maxRadius: BASE_MAX_RADIUS,
    coreRadius: BASE_CORE_RADIUS,
    shipRadius: BASE_SHIP_RADIUS,
    baseAngularSpeed: tuning.baseAngularSpeed,
    gravityPull: tuning.gravityPull,
    boostAcceleration: tuning.boostAcceleration,
    radialDamping: BASE_RADIAL_DAMPING,
    hazardCount: tuning.hazardCount,
    targetOrbits: tuning.targetOrbits,
    scorePerSecond: SCORE_PER_SECOND,
    scorePerOrbit: SCORE_PER_ORBIT,
  };
};

export const getTierDifficultyRating = (tier: number): number => {
  const balance = getTierBalance(tier);
  const hazardPressure = (balance.hazardCount - 3) * 15;
  const endurancePressure = (balance.targetOrbits - 5) * 8;
  const gravityPressure = (balance.gravityPull - 96) * 0.6;
  const speedPressure = (balance.baseAngularSpeed - 1.5) * 100;

  return Number((hazardPressure + endurancePressure + gravityPressure + speedPressure).toFixed(2));
};
