import type { AppState } from './appState';

const getFailureTip = (endReason?: string): string => {
  if (!endReason) {
    return 'Retry immediately and look for a calmer lane before committing to a full boost.';
  }

  if (endReason.includes('core')) {
    return 'Hold boost earlier to stay out of the core and rebuild a safer orbit radius.';
  }

  if (endReason.includes('safe ring')) {
    return 'Release boost a beat sooner when you approach the outer warning ring.';
  }

  if (endReason.includes('mine')) {
    return 'Feather the boost through hazard lanes instead of holding it all the way down.';
  }

  return 'Retry immediately and look for a calmer lane before committing to a full boost.';
};

export const getRunRecapNote = (state: AppState): string => {
  if (state.screen === 'won' && state.run) {
    return `Sector ${Math.min(state.progression.highestUnlockedTier, state.run.tier + 1)} ready`;
  }

  if (state.screen === 'failed' && state.run) {
    return `${state.run.endReason ?? 'Orbit instability detected'}. Tip: ${getFailureTip(state.run.endReason)}`;
  }

  return 'Launch a run to log a recap';
};
