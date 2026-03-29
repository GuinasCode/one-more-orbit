import { getTierBalance, type TierBalance } from './balance';

const TAU = Math.PI * 2;
const START_LANE_CLEARANCE = 28;
const START_LANE_GRACE_CLEARANCE = 12;
const START_LANE_RESERVED_ARC = 1.32;
const START_LANE_SLOT_JITTER_FACTOR = 0.18;
const START_LANE_SLOT_ADJUSTMENT_MULTIPLIERS = [0, 1, -1, 2, -2, 3, -3, 4, -4];
const START_LANE_GRACE_SAMPLE_SECONDS = [0.3, 0.6, 0.9, 1.2];

export type RunPhase = 'idle' | 'running' | 'won' | 'failed';

export interface RunInput {
  boost: boolean;
}

export interface HazardState {
  id: number;
  radius: number;
  angle: number;
  spin: number;
  size: number;
}

export interface RunSnapshot {
  phase: RunPhase;
  tier: number;
  score: number;
  elapsedMs: number;
  elapsedSeconds: number;
  completedOrbits: number;
  targetOrbits: number;
  radius: number;
  hazardCount: number;
  nearestHazardGap: number | null;
  boostActive: boolean;
  launchTutorialStep: 'boost-out' | 'settle-in' | 'watch-mines' | null;
  status: string;
  headline: string;
  summary: string;
  endReason?: string;
}

export interface RunState {
  phase: RunPhase;
  balance: TierBalance;
  score: number;
  elapsedMs: number;
  completedOrbits: number;
  angle: number;
  displayedAngle: number;
  radius: number;
  radialVelocity: number;
  hazards: HazardState[];
  boostActive: boolean;
  collisionGraceMs: number;
  endReason?: string;
}

const getLaunchLaneEdgeClearance = (balance: TierBalance, hazardRadius: number, hazardAngle: number, hazardSize: number): number => {
  const laneMinRadius = balance.coreRadius + balance.shipRadius + 4;
  const laneMaxRadius = balance.maxRadius - balance.shipRadius;
  const hazardX = Math.cos(hazardAngle) * hazardRadius;
  const hazardY = Math.sin(hazardAngle) * hazardRadius;
  const clampedX = Math.min(Math.max(hazardX, laneMinRadius), laneMaxRadius);
  const laneGap = Math.hypot(hazardX - clampedX, hazardY);

  return laneGap - (balance.shipRadius + hazardSize);
};

const getHazardSlotAngles = (balance: TierBalance): number[] => {
  const availableArc = TAU - START_LANE_RESERVED_ARC;
  const slotSize = availableArc / balance.hazardCount;
  const jitterLimit = Math.min(0.18, slotSize * START_LANE_SLOT_JITTER_FACTOR);

  return Array.from({ length: balance.hazardCount }, (_, index) => {
    const baseAngle = (START_LANE_RESERVED_ARC / 2) + slotSize * (index + 0.5);
    const jitterSeed = Math.sin((balance.tier * 0.91) + (index * 1.73));

    return wrapAngle(baseAngle + (jitterSeed * jitterLimit));
  });
};

const createHazards = (balance: TierBalance): HazardState[] => {
  const laneRadii = [104, 128, 220, 244, 264];
  const slotAngles = getHazardSlotAngles(balance);
  const slotSize = (TAU - START_LANE_RESERVED_ARC) / balance.hazardCount;
  const adjustmentStep = Math.min(0.16, slotSize * 0.18);
  const maxOffset = Math.min(slotSize * 0.32, 0.34);
  const startX = Math.cos(0) * balance.startRadius;
  const startY = Math.sin(0) * balance.startRadius;

  return Array.from({ length: balance.hazardCount }, (_, index) => {
    const lane = laneRadii[index % laneRadii.length];
    const radius = lane + ((index % 3) - 1) * 6;
    const size = 12 + (index % 3) * 2;
    const direction = index % 2 === 0 ? 1 : -1;
    const spin = direction * (0.48 + index * 0.07 + balance.tier * 0.03);
    const candidateOffsets = START_LANE_SLOT_ADJUSTMENT_MULTIPLIERS
      .map((multiplier) => multiplier * adjustmentStep)
      .filter((offset) => Math.abs(offset) <= maxOffset);
    const angle = candidateOffsets.reduce<number | null>((resolvedAngle, offset) => {
      if (resolvedAngle !== null) {
        return resolvedAngle;
      }

      const candidateAngle = wrapAngle(slotAngles[index] + offset);
      const hazardX = Math.cos(candidateAngle) * radius;
      const hazardY = Math.sin(candidateAngle) * radius;
      const startGap = Math.hypot(startX - hazardX, startY - hazardY) - (balance.shipRadius + size);
      const launchLaneGap = getLaunchLaneEdgeClearance(balance, radius, candidateAngle, size);
      const graceWindowGap = START_LANE_GRACE_SAMPLE_SECONDS.reduce((smallestGap, sampleSeconds) => {
        const projectedAngle = wrapAngle(candidateAngle + (spin * sampleSeconds) + (direction * 0.0075 * sampleSeconds * sampleSeconds));
        const projectedGap = getLaunchLaneEdgeClearance(balance, radius, projectedAngle, size);

        return Math.min(smallestGap, projectedGap);
      }, Number.POSITIVE_INFINITY);

      if (
        startGap >= START_LANE_CLEARANCE &&
        launchLaneGap >= START_LANE_CLEARANCE &&
        graceWindowGap >= START_LANE_GRACE_CLEARANCE
      ) {
        return candidateAngle;
      }

      return null;
    }, null) ?? slotAngles[index];

    return {
      id: index,
      radius,
      angle,
      spin,
      size,
    };
  });
};

export const createRunState = (tier: number): RunState => {
  const balance = getTierBalance(tier);

  return {
    phase: 'running',
    balance,
    score: 0,
    elapsedMs: 0,
    completedOrbits: 0,
    angle: 0,
    displayedAngle: 0,
    radius: balance.startRadius,
    radialVelocity: 0,
    hazards: createHazards(balance),
    boostActive: false,
    collisionGraceMs: 1200,
  };
};

const wrapAngle = (angle: number): number => {
  const wrapped = angle % TAU;
  return wrapped >= 0 ? wrapped : wrapped + TAU;
};

export const getLaunchTutorialStep = (
  state: Pick<RunState, 'phase' | 'elapsedMs' | 'radius' | 'boostActive' | 'balance' | 'hazards' | 'displayedAngle'>,
): RunSnapshot['launchTutorialStep'] => {
  if (state.phase !== 'running' || state.elapsedMs > 7000) {
    return null;
  }

  const nearestHazardGap = getNearestHazardGap(state);

  if (state.elapsedMs <= 1800 || state.radius <= state.balance.startRadius + 10) {
    return 'boost-out';
  }

  if (nearestHazardGap !== null && nearestHazardGap <= 34) {
    return 'watch-mines';
  }

  if (state.boostActive || state.radius >= state.balance.startRadius + 18) {
    return 'settle-in';
  }

  return 'boost-out';
};

const createStatus = (state: RunState): Pick<RunSnapshot, 'status' | 'headline' | 'summary'> => {
  if (state.phase === 'won') {
    return {
      status: `Sector ${state.balance.tier} cleared. Orbit discipline held under pressure.`,
      headline: 'Sector Cleared',
      summary: `You banked ${state.score} points and unlocked Sector ${state.balance.tier + 1}.`,
    };
  }

  if (state.phase === 'failed') {
    return {
      status: `Run collapsed: ${state.endReason ?? 'the orbit broke down'}.`,
      headline: 'Run Lost',
      summary: `Fast restart ready. Sector ${state.balance.tier} still wants ${state.balance.targetOrbits} clean orbits.`,
    };
  }

  const tutorialStep = getLaunchTutorialStep(state);

  if (tutorialStep === 'boost-out') {
    return {
      status: 'Opening move: hold boost to push out from the core before you worry about lap speed.',
      headline: `Sector ${state.balance.tier} · Opening move`,
      summary: 'Create space first, then settle into the lane. The first seconds are about survival, not speed.',
    };
  }

  if (tutorialStep === 'settle-in') {
    return {
      status: 'Good. Now feather the boost instead of holding it forever so you stay off the red drift ring.',
      headline: `Sector ${state.balance.tier} · Settle the orbit`,
      summary: 'Pulse the boost to hold a safe lane between the core and the outer ring.',
    };
  }

  if (tutorialStep === 'watch-mines') {
    return {
      status: 'Mine pressure incoming. Ease off and let the nearest mine rotate past before you push again.',
      headline: `Sector ${state.balance.tier} · Mine timing`,
      summary: 'You do not need perfect speed — you need clean spacing through the next mine lane.',
    };
  }

  return {
    status: state.boostActive ? 'Boosting outward. Keep the line and thread the mines.' : 'Gravity is winning. Hold boost to widen the orbit.',
    headline: `Sector ${state.balance.tier}`,
    summary: `Complete ${state.balance.targetOrbits} orbits, dodge ${state.hazards.length} rotating mines, and stay out of the core.`,
  };
};

export const toRunSnapshot = (state: RunState): RunSnapshot => ({
  phase: state.phase,
  tier: state.balance.tier,
  score: state.score,
  elapsedMs: state.elapsedMs,
  elapsedSeconds: Number((state.elapsedMs / 1000).toFixed(1)),
  completedOrbits: state.completedOrbits,
  targetOrbits: state.balance.targetOrbits,
  radius: Math.round(state.radius),
  hazardCount: state.hazards.length,
  nearestHazardGap: getNearestHazardGap(state),
  boostActive: state.boostActive,
  launchTutorialStep: getLaunchTutorialStep(state),
  ...createStatus(state),
  endReason: state.endReason,
});

const distanceBetweenPolar = (radiusA: number, angleA: number, radiusB: number, angleB: number): number => {
  const xA = Math.cos(angleA) * radiusA;
  const yA = Math.sin(angleA) * radiusA;
  const xB = Math.cos(angleB) * radiusB;
  const yB = Math.sin(angleB) * radiusB;

  return Math.hypot(xA - xB, yA - yB);
};

export const getNearestHazardGap = (state: Pick<RunState, 'radius' | 'displayedAngle' | 'balance' | 'hazards'>): number | null => {
  if (state.hazards.length === 0) {
    return null;
  }

  return state.hazards.reduce<number | null>((closestGap, hazard) => {
    const gap = distanceBetweenPolar(state.radius, state.displayedAngle, hazard.radius, hazard.angle) -
      (state.balance.shipRadius + hazard.size);

    if (closestGap === null) {
      return gap;
    }

    return Math.min(closestGap, gap);
  }, null);
};

export const updateRunState = (previous: RunState, input: RunInput, deltaMs: number): RunState => {
  if (previous.phase !== 'running') {
    return {
      ...previous,
      boostActive: false,
    };
  }

  const deltaSeconds = Math.min(deltaMs, 33) / 1000;
  const balance = previous.balance;
  const elapsedMs = previous.elapsedMs + deltaMs;
  const elapsedSeconds = elapsedMs / 1000;
  const boostActive = input.boost;
  const gravityRamp = 1 + Math.min(0.38, elapsedSeconds * 0.012);
  const netAcceleration = (boostActive ? balance.boostAcceleration : 0) - (balance.gravityPull * gravityRamp);
  const radialVelocity = (previous.radialVelocity + netAcceleration * deltaSeconds) * balance.radialDamping;
  const radius = previous.radius + radialVelocity * deltaSeconds;
  const angularSpeed = balance.baseAngularSpeed + ((balance.maxRadius - radius) / 220) + (boostActive ? 0.2 : 0);
  const angle = previous.angle + angularSpeed * deltaSeconds;
  const displayedAngle = wrapAngle(angle);
  const completedOrbits = Math.max(previous.completedOrbits, Math.floor(angle / TAU));
  const hazards = previous.hazards.map((hazard, index) => ({
    ...hazard,
    angle: wrapAngle(hazard.angle + (hazard.spin + elapsedSeconds * 0.015 * (index % 2 === 0 ? 1 : -1)) * deltaSeconds),
  }));

  let nextState: RunState = {
    ...previous,
    elapsedMs,
    score: Math.round(elapsedSeconds * balance.scorePerSecond + completedOrbits * balance.scorePerOrbit),
    completedOrbits,
    angle,
    displayedAngle,
    radius,
    radialVelocity,
    hazards,
    boostActive,
    collisionGraceMs: Math.max(0, previous.collisionGraceMs - deltaMs),
  };

  if (radius <= balance.coreRadius + balance.shipRadius + 4) {
    nextState = {
      ...nextState,
      phase: 'failed',
      endReason: 'you were swallowed by the core',
      boostActive: false,
    };
  } else if (radius >= balance.maxRadius) {
    nextState = {
      ...nextState,
      phase: 'failed',
      endReason: 'you drifted beyond the safe ring',
      boostActive: false,
    };
  } else if (nextState.collisionGraceMs === 0) {
    const collidedHazard = hazards.find((hazard) => {
      const gap = distanceBetweenPolar(radius, displayedAngle, hazard.radius, hazard.angle);
      return gap <= balance.shipRadius + hazard.size;
    });

    if (collidedHazard) {
      nextState = {
        ...nextState,
        phase: 'failed',
        endReason: 'a rotating mine clipped the hull',
        boostActive: false,
      };
    }
  }

  if (nextState.phase === 'running' && completedOrbits >= balance.targetOrbits) {
    nextState = {
      ...nextState,
      phase: 'won',
      boostActive: false,
    };
  }

  return nextState;
};
