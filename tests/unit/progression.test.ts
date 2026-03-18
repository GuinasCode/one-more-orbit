import { describe, expect, it } from 'vitest';
import {
  applyRunResolution,
  defaultProgressionState,
  loadProgression,
  progressionStorageKey,
} from '../../src/game/core/progression';

describe('progression', () => {
  it('unlocks the next sector on a win and stores best score', () => {
    const next = applyRunResolution(defaultProgressionState(), {
      tier: 1,
      score: 620,
      won: true,
    });

    expect(next.highestUnlockedTier).toBe(2);
    expect(next.bestScore).toBe(620);
    expect(next.lastPlayedTier).toBe(1);
  });

  it('falls back to defaults when storage is corrupted', () => {
    const storage = {
      getItem: (key: string) => (key === progressionStorageKey ? '{broken json' : null),
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    } satisfies Storage;

    expect(loadProgression(storage)).toEqual(defaultProgressionState());
  });
});
