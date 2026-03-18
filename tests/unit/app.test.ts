import { beforeEach, describe, expect, it, vi } from 'vitest';

const startRunSpy = vi.fn();

vi.mock('../../src/game/createPhaserGame', () => ({
  createPhaserGame: () => ({
    scene: {
      keys: {
        'orbit-arena': {
          startRun: startRunSpy,
        },
      },
    },
  }),
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
});
