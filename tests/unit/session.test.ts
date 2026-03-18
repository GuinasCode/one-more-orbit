import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../src/app/appState';
import { launchRun } from '../../src/game/core/session';
import { gameConfig } from '../../src/game/config';

describe('launchRun', () => {
  it('transitions from start to running with the expected status copy', () => {
    const nextState = launchRun(initialAppState());

    expect(nextState).toEqual({
      screen: 'running',
      status: gameConfig.runningLabel,
    });
  });

  it('keeps the same running state when called repeatedly', () => {
    const runningState = launchRun(initialAppState());
    const nextState = launchRun(runningState);

    expect(nextState).toBe(runningState);
  });
});
