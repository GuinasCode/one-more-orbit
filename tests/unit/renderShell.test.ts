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
    expect(html).toContain('4 clean orbits');
    expect(html).toContain('Sector select');
    expect(html).toContain('Browsing unlocked sectors 1-1. Sector 1 asks for 4 clean laps through 3 rotating mines.');
    expect(html).toContain('data-action="previous-sector" disabled');
    expect(html).toContain('data-action="next-sector" disabled');
    expect(html).toContain('4 laps to clear');
    expect(html).toContain('3 rotating mines');
    expect(html).toContain('Safe lane 62-252');
    expect(html).toContain('Focus: launch rhythm');
    expect(html).toContain('Arena danger legend');
    expect(html).toContain('Best score chase');
    expect(html).toContain('No benchmark yet. Finish a run to set the first score target.');
    expect(html).toContain('Goal track');
    expect(html).toContain('4 clean laps unlock the next sector pressure spike.');
    expect(html).toContain('Ready check: press Enter or click Launch Sector 1. Browse unlocked sectors before launch if you want a different target.');
    expect(html).toContain('Sector briefing');
    expect(html).toContain('Clear 4 clean laps while dodging 3 rotating mines to unlock Sector 2.');
    expect(html).toContain('Next pressure');
    expect(html).toContain('Next unlock is Sector 2: 5 clean laps, 4 rotating mines.');
    expect(html).toContain('Sector 1 win / fail rules');
    expect(html).toContain('Win: bank 4 clean laps to clear the sector.');
    expect(html).toContain('Fail: the amber core ends the run inside radius 62.');
    expect(html).toContain('Fail: crossing the red ring at radius 252 counts as a drift-out.');
    expect(html).toContain('Fail: any of the 3 rotating mines can break the hull on contact.');
    expect(html).toContain('Safe lane');
    expect(html).toContain('Safe radius window for Sector 1: launch at 168 and stay between the amber core and red drift ring.');
    expect(html).toContain('62-252 radius');
    expect(html).toContain('Current 168');
    expect(html).toContain('aria-valuenow="56"');
    expect(html).toContain('Core edge');
    expect(html).toContain('Drift ring');
    expect(html).toContain('Sector 2');
    expect(html).toContain('+1 lap');
    expect(html).toContain('aria-valuenow="0"');
    expect(html).toContain('Amber core pulls inward hard');
    expect(html).toContain('Red ring marks the drift-out fail line');
    expect(html).toContain('Pink mines punish greedy boost lines');
    expect(html).toContain('Flight coach: Launch, then hold boost only when gravity starts dragging you inward.');
    expect(html).toContain('Arena signal');
    expect(html).toContain('Stand by');
    expect(html).toContain('Launch Sector 1 to establish a safe lane between the core and red ring.');
  });

  it('previews the next sector goal after a completed run', () => {
    const progression = {
      ...defaultProgressionState(),
      bestScore: 420,
      highestUnlockedTier: 3,
      lastPlayedTier: 3,
    };
    const html = renderShell({
      ...initialAppState(progression),
      previousBestScore: 360,
      screen: 'won',
      primaryActionLabel: 'Launch Sector 3',
      run: {
        phase: 'won',
        tier: 2,
        score: 420,
        elapsedMs: 20000,
        elapsedSeconds: 20,
        completedOrbits: 5,
        targetOrbits: 5,
        radius: 180,
        hazardCount: 4,
        nearestHazardGap: null,
        boostActive: false,
        status: 'Sector 2 cleared.',
        headline: 'Sector Cleared',
        summary: 'Next sector unlocked.',
      },
    });

    expect(html).toContain('6 clean orbits');
    expect(html).not.toContain('7/7 orbits');
    expect(html).toContain('Browsing unlocked sectors 1-3. Sector 3 asks for 6 clean laps through 5 rotating mines.');
    expect(html).toContain('6 laps to clear');
    expect(html).toContain('5 rotating mines');
    expect(html).toContain('Safe lane 62-252');
    expect(html).toContain('Focus: +1 mine · +1 lap');
    expect(html).toContain('Last run recap');
    expect(html).toContain('Sector cleared');
    expect(html).toContain('New personal best: 420 banked (+60 over 360).');
    expect(html).toContain('20.0s');
    expect(html).toContain('New best 420 · next goal 6 laps');
    expect(html).toContain('New best locked · +60 over your previous benchmark');
    expect(html).toContain('Launch Sector 3 next · 6 clean laps through 5 rotating mines.');
    expect(html).toContain('Next move: press Enter or click Launch Sector 3 to test the new pressure spike.');
    expect(html).toContain('Sector 3 is now unlocked with 5 rotating mines waiting.');
    expect(html).toContain('Sector 2 win / fail rules');
    expect(html).toContain('Win: bank 5 clean laps to clear the sector.');
    expect(html).toContain('Fail: any of the 4 rotating mines can break the hull on contact.');
    expect(html).toContain('Sector 3 is live: 6 clean laps and 5 rotating mines.');
    expect(html).toContain('+1 mine · +1 lap');
    expect(html).toContain('Sector clear');
    expect(html).toContain('Sector clear at radius 180: 118 above the core fail line and 72 before drift-out.');
    expect(html).toContain('Current 180');
    expect(html).toContain('aria-valuenow="62"');
    expect(html).toContain('Sector 3 is unlocked and ready. Relaunch when you want the next pressure spike.');
  });

  it('renders failure recap details for a lost run', () => {
    const html = renderShell({
      ...initialAppState({
        ...defaultProgressionState(),
        bestScore: 360,
      }),
      screen: 'failed',
      primaryActionLabel: 'Retry Sector 1',
      run: {
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
      },
    });

    expect(html).toContain('Run lost');
    expect(html).toContain('12.4s');
    expect(html).toContain('Retry Sector 1 · 2 laps still needed');
    expect(html).toContain('180 more points beats your best score of 360.');
    expect(html).toContain('a rotating mine clipped the hull. Tip: Feather the boost through hazard lanes instead of holding it all the way down.');
    expect(html).toContain('Retry Sector 1 next · Feather the boost through hazard lanes instead of holding it all the way down.');
    expect(html).toContain('Recovery lane: press Enter or click Retry Sector 1. Feather boost through mine lanes instead of holding it down.');
    expect(html).toContain('Sector 1 win / fail rules');
    expect(html).toContain('Fail: any of the 3 rotating mines can break the hull on contact.');
    expect(html).toContain('Sector 1 still needs 4 clean laps. Clear it to unlock Sector 2.');
    expect(html).toContain('Flight coach: Mine contact ended the run. Feather the boost instead of committing through the whole lane.');
    expect(html).toContain('Mine strike');
    expect(html).toContain('Run ended near radius 110: 48 above the core fail line and 142 before drift-out.');
    expect(html).toContain('Current 110');
    expect(html).toContain('aria-valuenow="25"');
    expect(html).toContain('A mine clipped the hull. Feather boost through hazard lanes instead of forcing the arc.');
  });

  it('surfaces drift-risk flight coach messaging during a live run', () => {
    const html = renderShell({
      ...initialAppState({
        ...defaultProgressionState(),
        bestScore: 200,
        highestUnlockedTier: 2,
      }),
      screen: 'running',
      primaryActionLabel: 'Restart Run',
      run: {
        phase: 'running',
        tier: 1,
        score: 240,
        elapsedMs: 9800,
        elapsedSeconds: 9.8,
        completedOrbits: 3,
        targetOrbits: 4,
        radius: 238,
        hazardCount: 3,
        nearestHazardGap: null,
        boostActive: true,
        status: 'Boosting outward.',
        headline: 'Sector 1',
        summary: 'Stay alive.',
      },
    });

    expect(html).toContain('Flight coach: Drift risk. Release boost now before you cross the red ring.');
    expect(html).toContain('Record pace: +40 over your best. Keep the lane clean and bank it.');
    expect(html).toContain('Live run: hold boost to widen the orbit, release before the red ring, press R to restart instantly.');
    expect(html).toContain('1 clean lap left to clear this sector.');
    expect(html).toContain('Sector 1 is live. Finish or fail this run before switching sectors.');
    expect(html).toContain('data-action="previous-sector" disabled');
    expect(html).toContain('data-action="next-sector" disabled');
    expect(html).toContain('aria-valuenow="75"');
    expect(html).toContain('width: 75%');
    expect(html).toContain('Sector 1 win / fail rules');
    expect(html).toContain('176 radius units above core fail · 14 left before drift-out.');
    expect(html).toContain('Current 238');
    expect(html).toContain('aria-valuenow="93"');
    expect(html).toContain('Drift risk');
    expect(html).toContain('Release boost now before the orbit spills through the red ring.');
  });

  it('prioritizes mine danger telegraphing when a hazard is about to clip the hull', () => {
    const html = renderShell({
      ...initialAppState(defaultProgressionState()),
      screen: 'running',
      primaryActionLabel: 'Restart Run',
      run: {
        phase: 'running',
        tier: 1,
        score: 180,
        elapsedMs: 7600,
        elapsedSeconds: 7.6,
        completedOrbits: 2,
        targetOrbits: 4,
        radius: 180,
        hazardCount: 3,
        nearestHazardGap: 14,
        boostActive: false,
        status: 'Gravity is pulling inward.',
        headline: 'Sector 1',
        summary: 'Stay alive.',
      },
    });

    expect(html).toContain('Mine danger');
    expect(html).toContain('Mine proximity alert: only 14 radius units of hull clearance left. Feather boost and slip behind the nearest mine.');
    expect(html).toContain('Flight coach: Mine danger. The nearest mine is only 14 radius units off the hull — feather boost and let it rotate past.');
  });
});
