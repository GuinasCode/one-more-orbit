import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameBridge } from '../../src/game/bridge';

const startRunSpy = vi.fn();
let bridgeRef: GameBridge | undefined;

vi.mock('../../src/game/createPhaserGame', () => ({
  createPhaserGame: (_host: HTMLDivElement, bridge: GameBridge) => {
    bridgeRef = bridge;

    return {
      scene: {
        keys: {
          'orbit-arena': {
            startRun: startRunSpy,
          },
        },
      },
    };
  },
}));

vi.mock('../../src/game/scenes/OrbitArenaScene', () => ({
  OrbitArenaScene: {
    key: 'orbit-arena',
  },
}));

import { OneMoreOrbitApp } from '../../src/app/OneMoreOrbitApp';

describe('OneMoreOrbitApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    window.localStorage.clear();
    startRunSpy.mockClear();
    bridgeRef = undefined;
  });

  it('focuses the primary action and launches a run on Enter from the start screen', () => {
    const root = document.querySelector('#root') as HTMLDivElement;
    const app = new OneMoreOrbitApp(root);

    app.mount();

    const primaryButton = root.querySelector('[data-action="primary-run-action"]') as HTMLButtonElement;
    expect(document.activeElement).toBe(primaryButton);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(startRunSpy).toHaveBeenCalledWith(1);
    expect(root.querySelector('.shell')?.getAttribute('data-screen')).toBe('running');
    expect(root.querySelector('[data-field="action-prompt"]')?.textContent).toBe(
      'Live run: hold boost to widen the orbit, release before the red ring, press R to restart instantly.',
    );
    expect(root.querySelector('.status-line')?.textContent).toBe('Sector 1 engaged. Hold boost and stabilize the orbit.');
  });

  it('lets the player browse unlocked sectors before launch', () => {
    window.localStorage.setItem(
      'one-more-orbit-progress-v1',
      JSON.stringify({
        bestScore: 420,
        highestUnlockedTier: 3,
        lastPlayedTier: 2,
      }),
    );
    const root = document.querySelector('#root') as HTMLDivElement;
    const app = new OneMoreOrbitApp(root);

    app.mount();

    const previousButton = root.querySelector('[data-action="previous-sector"]') as HTMLButtonElement;
    const nextButton = root.querySelector('[data-action="next-sector"]') as HTMLButtonElement;

    expect(root.querySelector('[data-field="selected-sector-chip"]')?.textContent).toBe('Sector 2');
    expect(previousButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);

    nextButton.click();

    expect(root.querySelector('[data-field="selected-sector-chip"]')?.textContent).toBe('Sector 3');
    expect(root.querySelector('[data-field="selected-sector-goal"]')?.textContent).toBe('6 laps to clear');
    expect(root.querySelector('[data-field="selected-sector-hazards"]')?.textContent).toBe('5 rotating mines');
    expect(root.querySelector('[data-field="selected-sector-lane"]')?.textContent).toBe('Safe lane 62-272');
    expect(root.querySelector('[data-field="selected-sector-pressure"]')?.textContent).toBe('Focus: +1 mine · +1 lap');
    expect(root.querySelector('[data-field="action-prompt"]')?.textContent).toBe(
      'Ready check: press Enter or click Launch Sector 3. Browse unlocked sectors before launch if you want a different target.',
    );
    expect(root.querySelector('.status-line')?.textContent).toBe('Awaiting launch command. Sector 3 is calibrated and ready.');
    expect(root.querySelector('[data-field="lane-window-helper"]')?.textContent).toBe(
      'Safe radius window for Sector 3: launch at 172 and stay between the amber core and red drift ring.',
    );
    expect(root.querySelector('[data-field="lane-window-current"]')?.textContent).toBe('Current 172');
    expect(root.querySelector('[data-action="primary-run-action"]')?.textContent).toBe('Launch Sector 3');
    expect(nextButton.disabled).toBe(true);

    previousButton.click();

    expect(root.querySelector('[data-field="selected-sector-chip"]')?.textContent).toBe('Sector 2');
    expect(root.querySelector('[data-field="selected-sector-goal"]')?.textContent).toBe('5 laps to clear');
    expect(root.querySelector('[data-field="selected-sector-hazards"]')?.textContent).toBe('4 rotating mines');
    expect(root.querySelector('[data-field="selected-sector-lane"]')?.textContent).toBe('Safe lane 62-272');
    expect(root.querySelector('[data-field="selected-sector-pressure"]')?.textContent).toBe('Focus: +1 mine · +1 lap');
    expect(root.querySelector('[data-field="sector-selector-helper"]')?.textContent).toBe(
      'Browsing unlocked sectors 1-3. Sector 2 asks for 5 clean laps through 4 rotating mines.',
    );
  });

  it('refreshes the next pressure panel after a sector clear', () => {
    const root = document.querySelector('#root') as HTMLDivElement;
    const app = new OneMoreOrbitApp(root);

    app.mount();
    bridgeRef?.onRunUpdate({
      phase: 'won',
      tier: 1,
      score: 560,
      elapsedMs: 18400,
      elapsedSeconds: 18.4,
      completedOrbits: 4,
      targetOrbits: 4,
      radius: 178,
      hazardCount: 3,
      nearestHazardGap: null,
      boostActive: false,
      status: 'Sector 1 cleared.',
      headline: 'Sector Cleared',
      summary: 'Sector 2 is now in rotation.',
    });

    expect(root.querySelector('.pitch')?.textContent).toBe('Sector 1 clear · Sector 2 online');
    expect(root.querySelector('.status-line')?.textContent).toBe('Banked 560 points in 18.4s. First benchmark locked. Sector 2 is ready.');
    expect(root.querySelector('[data-field="summary"]')?.textContent).toBe(
      'Next sector pressure: 5 clean laps through 4 rotating mines.',
    );
    expect(root.querySelector('[data-field="next-pressure-helper"]')?.textContent).toBe(
      'Sector 2 is live: 5 clean laps and 4 rotating mines.',
    );
    expect(root.querySelector('[data-field="score-chase-helper"]')?.textContent).toBe(
      'First benchmark locked: 560 points banked. Beat it next run.',
    );
    expect(root.querySelector('[data-field="action-prompt"]')?.textContent).toBe(
      'Next move: press Enter or click Launch Sector 2 to test the new pressure spike.',
    );
    expect(root.querySelector('[data-field="run-action"]')?.textContent).toBe(
      'Launch Sector 2 next · 5 clean laps through 4 rotating mines.',
    );
    expect(root.querySelector('[data-field="next-pressure-sector"]')?.textContent).toBe('Sector 2');
    expect(root.querySelector('[data-field="next-pressure-delta"]')?.textContent).toBe('+1 mine · +1 lap');
    expect(root.querySelector('[data-field="lane-window-helper"]')?.textContent).toBe(
      'Sector clear at radius 178: 116 above the core fail line and 94 before drift-out.',
    );
    expect(root.querySelector('[data-field="lane-window-current"]')?.textContent).toBe('Current 178');
    expect(root.querySelector('[data-field="outcome-guide-title"]')?.textContent).toBe('Sector 1 win / fail rules');
    expect(root.querySelector('[data-field="outcome-guide-win"]')?.textContent).toBe(
      'Win: bank 4 clean laps to clear the sector.',
    );
    expect(root.querySelector('[data-field="goal-helper"]')?.textContent).toBe(
      '5 clean laps unlock the next sector pressure spike.',
    );
    expect(root.querySelector('[data-field="selected-sector-chip"]')?.textContent).toBe('Sector 2');
    expect(root.querySelector('[data-field="selected-sector-goal"]')?.textContent).toBe('5 laps to clear');
    expect(root.querySelector('[data-field="selected-sector-hazards"]')?.textContent).toBe('4 rotating mines');
    expect(root.querySelector('[data-field="selected-sector-lane"]')?.textContent).toBe('Safe lane 62-272');
    expect(root.querySelector('[data-field="selected-sector-pressure"]')?.textContent).toBe('Focus: +1 mine · +1 lap');
  });

  it('shows a failure-specific recovery prompt after a lost run', () => {
    const root = document.querySelector('#root') as HTMLDivElement;
    const app = new OneMoreOrbitApp(root);

    app.mount();
    bridgeRef?.onRunUpdate({
      phase: 'failed',
      tier: 1,
      score: 180,
      elapsedMs: 12400,
      elapsedSeconds: 12.4,
      completedOrbits: 2,
      targetOrbits: 4,
      radius: 110,
      hazardCount: 3,
      nearestHazardGap: null,
      boostActive: false,
      status: 'Run collapsed.',
      headline: 'Run Lost',
      summary: 'Fast restart ready.',
      endReason: 'a rotating mine clipped the hull',
    });

    expect(root.querySelector('.pitch')?.textContent).toBe('Mine strike');
    expect(root.querySelector('.status-line')?.textContent).toBe(
      'a rotating mine clipped the hull. First benchmark locked. 2 clean laps still needed in Sector 1.',
    );
    expect(root.querySelector('[data-field="summary"]')?.textContent).toBe(
      'Retry Sector 1. Feather boost through hazard lanes instead of holding it all the way down.',
    );
    expect(root.querySelector('[data-field="lane-window-helper"]')?.textContent).toBe(
      'Run ended near radius 110: 48 above the core fail line and 162 before drift-out.',
    );
    expect(root.querySelector('[data-field="lane-window-current"]')?.textContent).toBe('Current 110');
    expect(root.querySelector('[data-field="outcome-guide-mine"]')?.textContent).toBe(
      'Fail: any of the 3 rotating mines can break the hull on contact.',
    );
    expect(root.querySelector('[data-field="action-prompt"]')?.textContent).toBe(
      'Recovery lane: press Enter or click Retry Sector 1. Feather boost through mine lanes instead of holding it down.',
    );
    expect(root.querySelector('[data-field="run-action"]')?.textContent).toBe(
      'Retry Sector 1 next · Feather the boost through hazard lanes instead of holding it all the way down.',
    );
    expect(root.querySelector('[data-action="primary-run-action"]')?.textContent).toBe('Retry Sector 1');
  });
});
