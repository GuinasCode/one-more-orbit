import { getTierBalance } from '../game/core/balance';
import type { ProgressionState } from '../game/core/progression';
import type { RunSnapshot } from '../game/core/runModel';

const getFailureLabel = (endReason?: string): string => {
  if (!endReason) {
    return 'Run lost';
  }

  if (endReason.includes('core')) {
    return 'Core collapse';
  }

  if (endReason.includes('safe ring')) {
    return 'Drift-out';
  }

  if (endReason.includes('mine')) {
    return 'Mine strike';
  }

  return 'Run lost';
};

const getFailureTip = (endReason?: string): string => {
  if (!endReason) {
    return 'Reset fast and look for the calmest lane before committing to a full boost.';
  }

  if (endReason.includes('core')) {
    return 'Boost a beat earlier to recover into the middle rings.';
  }

  if (endReason.includes('safe ring')) {
    return 'Release boost sooner when the ship reaches the outer warning lane.';
  }

  if (endReason.includes('mine')) {
    return 'Feather boost through hazard lanes instead of holding it all the way down.';
  }

  return 'Reset fast and look for the calmest lane before committing to a full boost.';
};

export const getResultMessaging = (
  snapshot: RunSnapshot,
  progression: ProgressionState,
): Pick<RunSnapshot, 'headline' | 'status' | 'summary'> => {
  if (snapshot.phase === 'won') {
    const nextTier = Math.min(progression.highestUnlockedTier, snapshot.tier + 1);
    const nextBalance = getTierBalance(nextTier);

    return {
      headline: `Sector ${snapshot.tier} clear · Sector ${nextTier} online`,
      status: `Banked ${snapshot.score} points in ${snapshot.elapsedSeconds.toFixed(1)}s. Sector ${nextTier} is ready.`,
      summary: `Next sector pressure: ${nextBalance.targetOrbits} clean laps through ${nextBalance.hazardCount} rotating mines.`,
    };
  }

  if (snapshot.phase === 'failed') {
    const lapsRemaining = Math.max(0, snapshot.targetOrbits - snapshot.completedOrbits);

    return {
      headline: getFailureLabel(snapshot.endReason),
      status: `${snapshot.endReason ?? 'Orbit instability detected'}. ${lapsRemaining} clean lap${lapsRemaining === 1 ? '' : 's'} still needed in Sector ${snapshot.tier}.`,
      summary: `Retry Sector ${snapshot.tier}. ${getFailureTip(snapshot.endReason)}`,
    };
  }

  return {
    headline: snapshot.headline,
    status: snapshot.status,
    summary: snapshot.summary,
  };
};
