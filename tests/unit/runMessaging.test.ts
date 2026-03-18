import { describe, expect, it } from 'vitest';
import { getResultMessaging } from '../../src/app/runMessaging';
import { defaultProgressionState } from '../../src/game/core/progression';

describe('getResultMessaging', () => {
  it('turns a sector clear into a concrete next-sector briefing', () => {
    const messaging = getResultMessaging(
      {
        phase: 'won',
        tier: 1,
        score: 560,
        elapsedMs: 18400,
        elapsedSeconds: 18.4,
        completedOrbits: 6,
        targetOrbits: 6,
        radius: 178,
        hazardCount: 4,
        nearestHazardGap: null,
        boostActive: false,
        status: 'Sector 1 cleared.',
        headline: 'Sector Cleared',
        summary: 'Sector 2 is now in rotation.',
      },
      {
        ...defaultProgressionState(),
        bestScore: 560,
        highestUnlockedTier: 2,
        lastPlayedTier: 1,
      },
      420,
    );

    expect(messaging.headline).toBe('Sector 1 clear · Sector 2 online');
    expect(messaging.status).toBe('Banked 560 points in 18.4s. New best by 140. Sector 2 is ready.');
    expect(messaging.summary).toBe('Next sector pressure: 7 clean laps through 5 rotating mines.');
  });

  it('turns a failed run into a specific recovery prompt', () => {
    const messaging = getResultMessaging(
      {
        phase: 'failed',
        tier: 1,
        score: 180,
        elapsedMs: 12400,
        elapsedSeconds: 12.4,
        completedOrbits: 2,
        targetOrbits: 6,
        radius: 110,
        hazardCount: 4,
        nearestHazardGap: null,
        boostActive: false,
        status: 'Run collapsed.',
        headline: 'Run Lost',
        summary: 'Fast restart ready.',
        endReason: 'a rotating mine clipped the hull',
      },
      {
        ...defaultProgressionState(),
        bestScore: 180,
      },
      120,
    );

    expect(messaging.headline).toBe('Mine strike');
    expect(messaging.status).toBe('a rotating mine clipped the hull. New best by 60. 4 clean laps still needed in Sector 1.');
    expect(messaging.summary).toBe('Retry Sector 1. Feather boost through hazard lanes instead of holding it all the way down.');
  });
});
