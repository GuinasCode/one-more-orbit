import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../src/app/appState';
import { getRunRecapNote } from '../../src/app/runRecap';
import { defaultProgressionState } from '../../src/game/core/progression';

describe('getRunRecapNote', () => {
  it('keeps the next sector callout after a win', () => {
    const progression = {
      ...defaultProgressionState(),
      highestUnlockedTier: 3,
      lastPlayedTier: 3,
    };

    const note = getRunRecapNote({
      ...initialAppState(progression),
      screen: 'won',
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

    expect(note).toBe('Sector 3 ready');
  });

  it('adds a contextual coaching tip after a mine collision', () => {
    const note = getRunRecapNote({
      ...initialAppState(defaultProgressionState()),
      screen: 'failed',
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

    expect(note).toBe(
      'a rotating mine clipped the hull. Tip: Feather the boost through hazard lanes instead of holding it all the way down.',
    );
  });

  it('adds a safe-ring recovery tip after drifting too far out', () => {
    const note = getRunRecapNote({
      ...initialAppState(defaultProgressionState()),
      screen: 'failed',
      run: {
        phase: 'failed',
        tier: 1,
        score: 210,
        elapsedMs: 15200,
        elapsedSeconds: 15.2,
        completedOrbits: 3,
        targetOrbits: 6,
        radius: 240,
        hazardCount: 4,
        boostActive: false,
        status: 'Run collapsed.',
        headline: 'Run Lost',
        summary: 'Fast restart ready.',
        endReason: 'you drifted beyond the safe ring',
      },
    });

    expect(note).toBe(
      'you drifted beyond the safe ring. Tip: Release boost a beat sooner when you approach the outer warning ring.',
    );
  });
});
