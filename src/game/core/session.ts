import type { AppState } from '../../app/appState';

export const launchRun = (state: AppState): AppState => ({
  ...state,
  screen: 'running',
  status: `Sector ${state.progression.lastPlayedTier} engaged. Hold boost and stabilize the orbit.`,
  headline: 'Thread the mines and keep the orbit alive.',
  summary: 'Survive the pull, avoid the rotating hazards, and close the sector target before the hull breaks.',
  primaryActionLabel: 'Restart Run',
});
