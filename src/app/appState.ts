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
  status: `Awaiting launch command. Sector ${progression.lastPlayedTier} is calibrated and ready.`,
  headline: 'Fast-restart orbital survival',
  summary: 'Hold Space, W, Up Arrow, or mouse/touch to boost outward. Complete clean laps to unlock the next sector.',
  primaryActionLabel: `Launch Sector ${progression.lastPlayedTier}`,
  progression,
  previousBestScore: progression.bestScore,
  run: null,
});
