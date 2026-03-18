import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../src/app/appState';
import { renderShell } from '../../src/app/renderShell';
import { defaultProgressionState } from '../../src/game/core/progression';

describe('renderShell', () => {
  it('renders the shell with launch controls, stats, and game root', () => {
    const html = renderShell(initialAppState(defaultProgressionState()));

    expect(html).toContain('One More Orbit');
    expect(html).toContain('data-action="primary-run-action"');
    expect(html).toContain('data-field="best-score"');
    expect(html).toContain('id="game-root"');
    expect(html).toContain('Boost: Space / W / ↑ / Mouse / Touch');
    expect(html).toContain('6 clean orbits');
    expect(html).toContain('Arena danger legend');
    expect(html).toContain('Goal track');
    expect(html).toContain('6 clean laps unlock the next sector pressure spike.');
    expect(html).toContain('Sector briefing');
    expect(html).toContain('Clear 6 clean laps while dodging 4 rotating mines to unlock Sector 2.');
    expect(html).toContain('Next pressure');
    expect(html).toContain('Next unlock is Sector 2: 7 clean laps, 5 rotating mines.');
    expect(html).toContain('Sector 2');
    expect(html).toContain('+1 mine · +1 lap');
    expect(html).toContain('aria-valuenow="0"');
    expect(html).toContain('Amber core pulls inward hard');
    expect(html).toContain('Red ring marks the drift-out fail line');
    expect(html).toContain('Pink mines punish greedy boost lines');
    expect(html).toContain('Flight coach: Launch, then hold boost only when gravity starts dragging you inward.');
  });

  it('previews the next sector goal after a completed run', () => {
    const progression = {
      ...defaultProgressionState(),
      highestUnlockedTier: 3,
      lastPlayedTier: 3,
    };
    const html = renderShell({
      ...initialAppState(progression),
      screen: 'won',
      primaryActionLabel: 'Launch Sector 3',
      run: {
        phase: 'won',
        tier: 2,
        score: 420,
        elapsedMs: 20000,
        elapsedSeconds: 20,
        completedOrbits: 7,
        targetOrbits: 7,
        radius: 180,
        hazardCount: 5,
        boostActive: false,
        status: 'Sector 2 cleared.',
        headline: 'Sector Cleared',
        summary: 'Next sector unlocked.',
      },
    });

    expect(html).toContain('8 clean orbits');
    expect(html).not.toContain('7/7 orbits');
    expect(html).toContain('Last run recap');
    expect(html).toContain('Sector cleared');
    expect(html).toContain('20.0s');
    expect(html).toContain('Sector 3 ready');
    expect(html).toContain('Sector 3 is now unlocked with 6 rotating mines waiting.');
    expect(html).toContain('Sector 3 is live: 8 clean laps and 6 rotating mines.');
    expect(html).toContain('+1 mine · +1 lap');
  });

  it('renders failure recap details for a lost run', () => {
    const html = renderShell({
      ...initialAppState(defaultProgressionState()),
      screen: 'failed',
      primaryActionLabel: 'Retry Sector 1',
      run: {
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
      },
    });

    expect(html).toContain('Run lost');
    expect(html).toContain('12.4s');
    expect(html).toContain('a rotating mine clipped the hull. Tip: Feather the boost through hazard lanes instead of holding it all the way down.');
    expect(html).toContain('Sector 1 still needs 6 clean laps. Clear it to unlock Sector 2.');
    expect(html).toContain('Flight coach: Mine contact ended the run. Feather the boost instead of committing through the whole lane.');
  });

  it('surfaces drift-risk flight coach messaging during a live run', () => {
    const html = renderShell({
      ...initialAppState(defaultProgressionState()),
      screen: 'running',
      primaryActionLabel: 'Restart Run',
      run: {
        phase: 'running',
        tier: 1,
        score: 240,
        elapsedMs: 9800,
        elapsedSeconds: 9.8,
        completedOrbits: 3,
        targetOrbits: 6,
        radius: 238,
        hazardCount: 4,
        boostActive: true,
        status: 'Boosting outward.',
        headline: 'Sector 1',
        summary: 'Stay alive.',
      },
    });

    expect(html).toContain('Flight coach: Drift risk. Release boost now before you cross the red ring.');
    expect(html).toContain('3 clean laps left to clear this sector.');
    expect(html).toContain('aria-valuenow="50"');
    expect(html).toContain('width: 50%');
  });
});
