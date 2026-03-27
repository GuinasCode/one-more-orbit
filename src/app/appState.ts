import type { ProgressionState } from '../game/core/progression';
import type { RunSnapshot } from '../game/core/runModel';

export type AppScreenState = 'start' | 'running' | 'won' | 'failed';

export interface AppState {
  screen: AppScreenState;
  status: string;
  headline: string;
  summary: string;
  primaryActionLabel: string;
  progression: ProgressionState;
  previousBestScore: number;
  run: RunSnapshot | null;
}

export const initialAppState = (progression: ProgressionState): AppState => ({
  screen: 'start',
  status: 'Hold anywhere to boost out. Release before the red ring.',
  headline: 'Hold to boost. Release to stay in orbit.',
  summary: 'Avoid the pink mines and finish Sector 1 clean laps.',
  primaryActionLabel: `Launch Sector ${progression.lastPlayedTier}`,
  progression,
  previousBestScore: progression.bestScore,
  run: null,
});
