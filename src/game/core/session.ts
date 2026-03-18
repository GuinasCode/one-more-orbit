import type { AppState } from '../../app/appState';
import { gameConfig } from '../config';

export const launchRun = (state: AppState): AppState => {
  if (state.screen === 'running') {
    return state;
  }

  return {
    screen: 'running',
    status: gameConfig.runningLabel,
  };
};
