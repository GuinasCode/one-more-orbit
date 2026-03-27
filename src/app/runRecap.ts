import { getTierBalance } from '../game/core/balance';
import type { AppState } from './appState';

const getFailureTip = (endReason?: string): string => {
  if (!endReason) {
    return 'Retry fast and rebuild the lane.';
  }

  if (endReason.includes('core')) {
    return 'Boost a beat earlier to stay out of the core.';
  }

  if (endReason.includes('safe ring')) {
    return 'Release a beat sooner near the red ring.';
  }

  if (endReason.includes('mine')) {
    return 'Feather boost through mine lanes.';
  }

  return 'Retry immediately and look for a calmer lane before committing to a full boost.';
};

export const getRunRecapImpact = (state: AppState): string => {
  if (!state.run) {
    return 'No run logged';
  }

  const isNewBest = state.run.score > state.previousBestScore;

  if (state.screen === 'won') {
    const unlockedTier = Math.min(state.progression.highestUnlockedTier, state.run.tier + 1);
    const unlockedBalance = getTierBalance(unlockedTier);
    return isNewBest
      ? `New best ${state.run.score} · next goal ${unlockedBalance.targetOrbits} laps`
      : `Unlocked Sector ${unlockedTier} · next goal ${unlockedBalance.targetOrbits} laps`;
  }

  if (state.screen === 'failed') {
    const lapsRemaining = Math.max(0, state.run.targetOrbits - state.run.completedOrbits);
    return isNewBest
      ? `New best ${state.run.score} · ${lapsRemaining} lap${lapsRemaining === 1 ? '' : 's'} still needed`
      : `Retry Sector ${state.run.tier} · ${lapsRemaining} lap${lapsRemaining === 1 ? '' : 's'} still needed`;
  }

  return 'Run in progress';
};

export const getRunRecapNote = (state: AppState): string => {
  if (state.screen === 'won' && state.run) {
    if (state.run.score > state.previousBestScore) {
      const delta = state.run.score - state.previousBestScore;
      return state.previousBestScore > 0
        ? `New best locked · +${delta} over your previous benchmark`
        : 'First benchmark locked';
    }

    return `Sector ${Math.min(state.progression.highestUnlockedTier, state.run.tier + 1)} ready`;
  }

  if (state.screen === 'failed' && state.run) {
    if (state.run.score > state.previousBestScore) {
      const delta = state.run.score - state.previousBestScore;
      const bestCallout = state.previousBestScore > 0
        ? `New best locked · +${delta} over your previous benchmark.`
        : 'First benchmark locked.';
      return `${bestCallout} ${getFailureTip(state.run.endReason)}`;
    }

    return `${state.run.endReason ?? 'Orbit instability detected'}. ${getFailureTip(state.run.endReason)}`;
  }

  return 'Launch a run to log a recap';
};

export const getRunRecapAction = (state: AppState): string => {
  if (state.screen === 'won' && state.run) {
    const nextTier = Math.min(state.progression.highestUnlockedTier, state.run.tier + 1);
    const nextBalance = getTierBalance(nextTier);
    return `Launch Sector ${nextTier} next · ${nextBalance.targetOrbits} clean laps through ${nextBalance.hazardCount} rotating mines.`;
  }

  if (state.screen === 'failed' && state.run) {
    return `Retry Sector ${state.run.tier} next · ${getFailureTip(state.run.endReason)}`;
  }

  return 'Launch a run to surface the next action.';
};
