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

const BASE_START_RADIUS = 168;
const BASE_MAX_RADIUS = 252;
const BASE_CORE_RADIUS = 62;
const BASE_SHIP_RADIUS = 10;
const BASE_RADIAL_DAMPING = 0.92;
const MAX_HAZARD_COUNT = 7;
const SCORE_PER_SECOND = 18;
const SCORE_PER_ORBIT = 140;
const POST_PRESET_BALANCE_STEPS: SectorDifficultyStep[] = [
  { baseAngularSpeed: 0.045, gravityPull: 6, boostAcceleration: 10, targetOrbits: 0 },
  { baseAngularSpeed: 0.05, gravityPull: 7, boostAcceleration: 11, targetOrbits: 0 },
  { baseAngularSpeed: 0.055, gravityPull: 8, boostAcceleration: 12, targetOrbits: 1 },
];
const SECTOR_TUNING: SectorTuning[] = [
  { baseAngularSpeed: 1.5, gravityPull: 96, boostAcceleration: 196, hazardCount: 3, targetOrbits: 4 },
  { baseAngularSpeed: 1.55, gravityPull: 104, boostAcceleration: 208, hazardCount: 4, targetOrbits: 5 },
  { baseAngularSpeed: 1.6, gravityPull: 112, boostAcceleration: 220, hazardCount: 5, targetOrbits: 6 },
  { baseAngularSpeed: 1.64, gravityPull: 118, boostAcceleration: 230, hazardCount: 5, targetOrbits: 7 },
  { baseAngularSpeed: 1.69, gravityPull: 128, boostAcceleration: 244, hazardCount: 6, targetOrbits: 8 },
  { baseAngularSpeed: 1.73, gravityPull: 136, boostAcceleration: 256, hazardCount: 6, targetOrbits: 9 },
  { baseAngularSpeed: 1.77, gravityPull: 144, boostAcceleration: 268, hazardCount: 6, targetOrbits: 10 },
  { baseAngularSpeed: 1.81, gravityPull: 152, boostAcceleration: 280, hazardCount: 7, targetOrbits: 11 },
  { baseAngularSpeed: 1.84, gravityPull: 160, boostAcceleration: 292, hazardCount: 7, targetOrbits: 12 },
  { baseAngularSpeed: 1.87, gravityPull: 168, boostAcceleration: 304, hazardCount: 7, targetOrbits: 12 },
  { baseAngularSpeed: 1.9, gravityPull: 176, boostAcceleration: 316, hazardCount: 7, targetOrbits: 13 },
  { baseAngularSpeed: 1.93, gravityPull: 184, boostAcceleration: 328, hazardCount: 7, targetOrbits: 13 },
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
