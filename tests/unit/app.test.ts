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
    expect(root.querySelector('.status-line')?.textContent).toBe('Sector 1 engaged. Hold boost and stabilize the orbit.');
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
      completedOrbits: 6,
      targetOrbits: 6,
      radius: 178,
      hazardCount: 4,
      boostActive: false,
      status: 'Sector 1 cleared.',
      headline: 'Sector Cleared',
      summary: 'Sector 2 is now in rotation.',
    });

    expect(root.querySelector('.pitch')?.textContent).toBe('Sector 1 clear · Sector 2 online');
    expect(root.querySelector('.status-line')?.textContent).toBe('Banked 560 points in 18.4s. First benchmark locked. Sector 2 is ready.');
    expect(root.querySelector('[data-field="summary"]')?.textContent).toBe(
      'Next sector pressure: 7 clean laps through 5 rotating mines.',
    );
    expect(root.querySelector('[data-field="next-pressure-helper"]')?.textContent).toBe(
      'Sector 2 is live: 7 clean laps and 5 rotating mines.',
    );
    expect(root.querySelector('[data-field="score-chase-helper"]')?.textContent).toBe(
      'First benchmark locked: 560 points banked. Beat it next run.',
    );
    expect(root.querySelector('[data-field="next-pressure-sector"]')?.textContent).toBe('Sector 2');
    expect(root.querySelector('[data-field="next-pressure-delta"]')?.textContent).toBe('+1 mine · +1 lap');
    expect(root.querySelector('[data-field="goal-helper"]')?.textContent).toBe(
      '7 clean laps unlock the next sector pressure spike.',
    );
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
      targetOrbits: 6,
      radius: 110,
      hazardCount: 4,
      boostActive: false,
      status: 'Run collapsed.',
      headline: 'Run Lost',
      summary: 'Fast restart ready.',
      endReason: 'a rotating mine clipped the hull',
    });

    expect(root.querySelector('.pitch')?.textContent).toBe('Mine strike');
    expect(root.querySelector('.status-line')?.textContent).toBe(
      'a rotating mine clipped the hull. First benchmark locked. 4 clean laps still needed in Sector 1.',
    );
    expect(root.querySelector('[data-field="summary"]')?.textContent).toBe(
      'Retry Sector 1. Feather boost through hazard lanes instead of holding it all the way down.',
    );
    expect(root.querySelector('[data-action="primary-run-action"]')?.textContent).toBe('Retry Sector 1');
  });
});
