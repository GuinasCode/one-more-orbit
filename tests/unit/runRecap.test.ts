import { describe, expect, it } from 'vitest';
import { initialAppState } from '../../src/app/appState';
import { getRunRecapAction, getRunRecapImpact, getRunRecapNote } from '../../src/app/runRecap';
import { defaultProgressionState } from '../../src/game/core/progression';

describe('getRunRecapNote', () => {
  it('keeps the next sector callout after a win', () => {
    const progression = {
      ...defaultProgressionState(),
      bestScore: 420,
      highestUnlockedTier: 3,
      lastPlayedTier: 3,
    };

    const state = {
      ...initialAppState(progression),
      previousBestScore: 420,
      screen: 'won' as const,
      run: {
        phase: 'won' as const,
        tier: 2,
        score: 420,
        elapsedMs: 20000,
        elapsedSeconds: 20,
        completedOrbits: 5,
        targetOrbits: 5,
        radius: 180,
        hazardCount: 5,
        nearestHazardGap: null,
        boostActive: false,
        status: 'Sector 2 cleared.',
        headline: 'Sector Cleared',
        summary: 'Next sector unlocked.',
      },
    };

    expect(getRunRecapNote(state)).toBe('Sector 3 ready');
    expect(getRunRecapImpact(state)).toBe('Unlocked Sector 3 · next goal 6 laps');
    expect(getRunRecapAction(state)).toBe('Launch Sector 3 next · 6 clean laps through 5 rotating mines.');
  });

  it('adds a personal-best callout and coaching tip after a mine collision', () => {
    const state = {
      ...initialAppState({
        ...defaultProgressionState(),
        bestScore: 180,
      }),
      previousBestScore: 120,
      screen: 'failed' as const,
      run: {
        phase: 'failed' as const,
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
    };

    expect(getRunRecapNote(state)).toBe(
      'New best locked · +60 over your previous benchmark. Tip: Feather the boost through hazard lanes instead of holding it all the way down.',
    );
    expect(getRunRecapImpact(state)).toBe('New best 180 · 2 laps still needed');
    expect(getRunRecapAction(state)).toBe(
      'Retry Sector 1 next · Feather the boost through hazard lanes instead of holding it all the way down.',
    );
  });

  it('adds a safe-ring recovery tip after drifting too far out', () => {
    const note = getRunRecapNote({
      ...initialAppState({
        ...defaultProgressionState(),
        bestScore: 210,
      }),
      previousBestScore: 210,
      screen: 'failed',
      run: {
        phase: 'failed',
        tier: 1,
        score: 210,
        elapsedMs: 15200,
        elapsedSeconds: 15.2,
        completedOrbits: 3,
        targetOrbits: 4,
        radius: 240,
        hazardCount: 3,
        nearestHazardGap: null,
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
