import { getTierBalance, type TierBalance } from './balance';

const TAU = Math.PI * 2;
const START_LANE_CLEARANCE = 28;
const START_LANE_ARC_SHIFT = 0.52;
const START_LANE_ADJUSTMENT_ATTEMPTS = 12;

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
  boostActive: boolean;
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

const createHazards = (balance: TierBalance): HazardState[] => {
  const laneRadii = [116, 148, 182, 214, 238];
  const startX = Math.cos(0) * balance.startRadius;
  const startY = Math.sin(0) * balance.startRadius;

  return Array.from({ length: balance.hazardCount }, (_, index) => {
    const lane = laneRadii[index % laneRadii.length];
    const radius = lane + ((index % 3) - 1) * 6;
    const size = 12 + (index % 3) * 2;
    let angle = ((index * 1.37) + 1.8 + balance.tier * 0.41) % TAU;
    const direction = index % 2 === 0 ? 1 : -1;

    for (let attempt = 0; attempt < START_LANE_ADJUSTMENT_ATTEMPTS; attempt += 1) {
      const hazardX = Math.cos(angle) * radius;
      const hazardY = Math.sin(angle) * radius;
      const laneGap = Math.hypot(startX - hazardX, startY - hazardY) - (balance.shipRadius + size);

      if (laneGap >= START_LANE_CLEARANCE) {
        break;
      }

      angle = (angle + START_LANE_ARC_SHIFT + index * 0.04) % TAU;
    }

    return {
      id: index,
      radius,
      angle,
      spin: direction * (0.48 + index * 0.07 + balance.tier * 0.03),
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
  boostActive: state.boostActive,
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
