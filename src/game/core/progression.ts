export interface ProgressionState {
  bestScore: number;
  highestUnlockedTier: number;
  lastPlayedTier: number;
}

export interface RunResolution {
  tier: number;
  score: number;
  won: boolean;
}

export const progressionStorageKey = 'one-more-orbit-progress-v1';

export const defaultProgressionState = (): ProgressionState => ({
  bestScore: 0,
  highestUnlockedTier: 1,
  lastPlayedTier: 1,
});

const sanitizeProgression = (value: unknown): ProgressionState => {
  if (!value || typeof value !== 'object') {
    return defaultProgressionState();
  }

  const candidate = value as Partial<ProgressionState>;
  const bestScore = Number.isFinite(candidate.bestScore) ? Math.max(0, Math.floor(candidate.bestScore as number)) : 0;
  const highestUnlockedTier = Number.isFinite(candidate.highestUnlockedTier)
    ? Math.max(1, Math.floor(candidate.highestUnlockedTier as number))
    : 1;
  const lastPlayedTier = Number.isFinite(candidate.lastPlayedTier)
    ? Math.min(highestUnlockedTier, Math.max(1, Math.floor(candidate.lastPlayedTier as number)))
    : 1;

  return {
    bestScore,
    highestUnlockedTier,
    lastPlayedTier,
  };
};

export const loadProgression = (storage?: Storage): ProgressionState => {
  if (!storage) {
    return defaultProgressionState();
  }

  try {
    const raw = storage.getItem(progressionStorageKey);

    if (!raw) {
      return defaultProgressionState();
    }

    return sanitizeProgression(JSON.parse(raw));
  } catch {
    return defaultProgressionState();
  }
};

export const saveProgression = (progression: ProgressionState, storage?: Storage): void => {
  if (!storage) {
    return;
  }

  storage.setItem(progressionStorageKey, JSON.stringify(progression));
};

export const applyRunResolution = (
  progression: ProgressionState,
  resolution: RunResolution,
): ProgressionState => {
  const tier = Math.max(1, Math.floor(resolution.tier));
  const bestScore = Math.max(progression.bestScore, Math.floor(resolution.score));
  const highestUnlockedTier = resolution.won
    ? Math.max(progression.highestUnlockedTier, tier + 1)
    : progression.highestUnlockedTier;

  return {
    bestScore,
    highestUnlockedTier,
    lastPlayedTier: Math.min(highestUnlockedTier, tier),
  };
};
