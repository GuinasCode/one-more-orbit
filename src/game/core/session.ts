import type { AppState } from '../../app/appState';

export const launchRun = (state: AppState): AppState => ({
  ...state,
  screen: 'running',
  status: 'Hold anywhere to boost out. Release before the red ring.',
  headline: 'Stay between the core and red ring.',
  summary: 'Avoid the mines and bank clean laps before the hull breaks.',
  primaryActionLabel: 'Restart Run',
});
