import { getTierBalance } from '../game/core/balance';
import type { ProgressionState } from '../game/core/progression';
import type { RunSnapshot } from '../game/core/runModel';

const getFailureLabel = (endReason?: string): string => {
  if (!endReason) {
    return 'Run lost';
  }

  if (endReason.includes('core')) {
    return 'Core hit';
  }

  if (endReason.includes('safe ring')) {
    return 'Drifted out';
  }

  if (endReason.includes('mine')) {
    return 'Mine hit';
  }

  return 'Run lost';
};

const getFailureTip = (endReason?: string): string => {
  if (!endReason) {
    return 'Retry fast and rebuild the lane.';
  }

  if (endReason.includes('core')) {
    return 'Boost a beat earlier.';
  }

  if (endReason.includes('safe ring')) {
    return 'Release sooner near the red ring.';
  }

  if (endReason.includes('mine')) {
    return 'Feather boost through mine lanes.';
  }

  return 'Reset fast and look for the calmest lane before committing to a full boost.';
};

export const getResultMessaging = (
  snapshot: RunSnapshot,
  progression: ProgressionState,
  previousBestScore: number,
): Pick<RunSnapshot, 'headline' | 'status' | 'summary'> => {
  const isNewBest = snapshot.score > previousBestScore;
  const bestCallout = isNewBest
    ? previousBestScore > 0
      ? ` New best by ${snapshot.score - previousBestScore}.`
      : ' First benchmark locked.'
    : '';

  if (snapshot.phase === 'won') {
    const nextTier = Math.min(progression.highestUnlockedTier, snapshot.tier + 1);
    const nextBalance = getTierBalance(nextTier);

    return {
      headline: `Sector ${snapshot.tier} clear · Sector ${nextTier} online`,
      status: `Banked ${snapshot.score} points in ${snapshot.elapsedSeconds.toFixed(1)}s.${bestCallout} Sector ${nextTier} is ready.`,
      summary: `Next sector pressure: ${nextBalance.targetOrbits} clean laps through ${nextBalance.hazardCount} rotating mines.`,
    };
  }

  if (snapshot.phase === 'failed') {
    const lapsRemaining = Math.max(0, snapshot.targetOrbits - snapshot.completedOrbits);

    const failureLabel = getFailureLabel(snapshot.endReason);

    return {
      headline: failureLabel,
      status: `${failureLabel}. ${lapsRemaining} clean lap${lapsRemaining === 1 ? '' : 's'} left in Sector ${snapshot.tier}.${bestCallout}`,
      summary: `Retry Sector ${snapshot.tier} now. ${getFailureTip(snapshot.endReason)}`,
    };
  }

  return {
    headline: snapshot.headline,
    status: snapshot.status,
    summary: snapshot.summary,
  };
};
