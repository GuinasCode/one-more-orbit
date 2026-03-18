import { getTierBalance } from '../game/core/balance';
import { gameConfig } from '../game/config';
import type { AppState } from './appState';
import { getRunRecapImpact, getRunRecapNote } from './runRecap';

const getPreviewBalance = (state: AppState) => getTierBalance(state.progression.lastPlayedTier);

const formatGoal = (state: AppState): string => {
  if (state.screen === 'running' && state.run) {
    return `${state.run.completedOrbits}/${state.run.targetOrbits} orbits`;
  }

  const previewBalance = getPreviewBalance(state);
  return `${previewBalance.targetOrbits} clean orbits`;
};

const formatScore = (state: AppState): string => `${state.run?.score ?? 0}`;

export const getScoreChaseCopy = (state: AppState): string => {
  const bestScore = state.progression.bestScore;
  const previousBestScore = state.previousBestScore;
  const currentScore = state.run?.score ?? 0;
  const runResolved = state.screen === 'won' || state.screen === 'failed';

  if (runResolved && currentScore > previousBestScore) {
    if (previousBestScore <= 0) {
      return `First benchmark locked: ${currentScore} points banked. Beat it next run.`;
    }

    return `New personal best: ${currentScore} banked (+${currentScore - previousBestScore} over ${previousBestScore}).`;
  }

  if (bestScore <= 0) {
    return currentScore > 0
      ? `${Math.max(0, currentScore)} points banked. Finish the run to lock in your first benchmark.`
      : 'No benchmark yet. Finish a run to set the first score target.';
  }

  if (currentScore > previousBestScore) {
    return `Record pace: +${currentScore - previousBestScore} over your best. Keep the lane clean and bank it.`;
  }

  if (currentScore === bestScore && currentScore > 0) {
    return 'Best score matched. One more point sets a new benchmark.';
  }

  return `${bestScore - currentScore} more point${bestScore - currentScore === 1 ? '' : 's'} beats your best score of ${bestScore}.`;
};

const getGoalProgress = (state: AppState): number => {
  if (!state.run || state.run.targetOrbits <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((state.run.completedOrbits / state.run.targetOrbits) * 100));
};

export const getGoalHelper = (state: AppState): string => {
  if (state.screen === 'running' && state.run) {
    const lapsRemaining = Math.max(0, state.run.targetOrbits - state.run.completedOrbits);
    return lapsRemaining === 0
      ? 'Final orbit banked. Hold the lane until the sector resolves.'
      : `${lapsRemaining} clean lap${lapsRemaining === 1 ? '' : 's'} left to clear this sector.`;
  }

  const previewBalance = getPreviewBalance(state);
  return `${previewBalance.targetOrbits} clean laps unlock the next sector pressure spike.`;
};

export const getSectorBriefing = (state: AppState): string => {
  const activeTier = state.run?.tier ?? state.progression.lastPlayedTier;
  const balance = getTierBalance(activeTier);
  const unlockTier = Math.max(state.progression.highestUnlockedTier, activeTier + 1);

  if (state.screen === 'won') {
    return `Sector ${unlockTier} is now unlocked with ${getTierBalance(unlockTier).hazardCount} rotating mines waiting.`;
  }

  if (state.screen === 'failed') {
    return `Sector ${activeTier} still needs ${balance.targetOrbits} clean laps. Clear it to unlock Sector ${unlockTier}.`;
  }

  return `Clear ${balance.targetOrbits} clean laps while dodging ${balance.hazardCount} rotating mines to unlock Sector ${unlockTier}.`;
};

export const getNextPressureTier = (state: AppState): number => {
  const activeTier = state.run?.tier ?? state.progression.lastPlayedTier;
  return Math.max(state.progression.highestUnlockedTier, activeTier + 1);
};

export const formatNextPressureDelta = (state: AppState): string => {
  const activeTier = state.run?.tier ?? state.progression.lastPlayedTier;
  const currentBalance = getTierBalance(activeTier);
  const nextBalance = getTierBalance(getNextPressureTier(state));
  const mineDelta = Math.max(0, nextBalance.hazardCount - currentBalance.hazardCount);
  const orbitDelta = Math.max(0, nextBalance.targetOrbits - currentBalance.targetOrbits);

  return `+${mineDelta} mine${mineDelta === 1 ? '' : 's'} · +${orbitDelta} lap${orbitDelta === 1 ? '' : 's'}`;
};

export const getNextPressureHelper = (state: AppState): string => {
  const nextTier = getNextPressureTier(state);
  const nextBalance = getTierBalance(nextTier);

  if (state.screen === 'won') {
    return `Sector ${nextTier} is live: ${nextBalance.targetOrbits} clean laps and ${nextBalance.hazardCount} rotating mines.`;
  }

  return `Next unlock is Sector ${nextTier}: ${nextBalance.targetOrbits} clean laps, ${nextBalance.hazardCount} rotating mines.`;
};

export const getSectorSelectorHelper = (state: AppState): string => {
  const selectedTier = state.progression.lastPlayedTier;
  const balance = getTierBalance(selectedTier);

  if (state.screen === 'running' && state.run) {
    return `Sector ${state.run.tier} is live. Finish or fail this run before switching sectors.`;
  }

  return `Browsing unlocked sectors 1-${state.progression.highestUnlockedTier}. Sector ${selectedTier} asks for ${balance.targetOrbits} clean laps through ${balance.hazardCount} rotating mines.`;
};

const formatRunResult = (state: AppState): string => {
  if (state.screen === 'won') {
    return 'Sector cleared';
  }

  if (state.screen === 'failed') {
    return 'Run lost';
  }

  return 'Stand by';
};

const formatRunTime = (state: AppState): string => {
  if (!state.run) {
    return '0.0s';
  }

  return `${state.run.elapsedSeconds.toFixed(1)}s`;
};

const formatRunNote = (state: AppState): string => getRunRecapNote(state);

const getFailureRecoveryPrompt = (endReason?: string): string => {
  if (!endReason) {
    return 'Reset fast and rebuild a calmer lane.';
  }

  if (endReason.includes('core')) {
    return 'Boost a beat earlier to stay out of the core.';
  }

  if (endReason.includes('safe ring')) {
    return 'Release boost sooner near the outer warning ring.';
  }

  if (endReason.includes('mine')) {
    return 'Feather boost through mine lanes instead of holding it down.';
  }

  return 'Reset fast and rebuild a calmer lane.';
};

export const getActionPrompt = (state: AppState): string => {
  const targetTier = state.progression.lastPlayedTier;

  if (state.screen === 'running') {
    return 'Live run: hold boost to widen the orbit, release before the red ring, press R to restart instantly.';
  }

  if (state.screen === 'won') {
    return `Next move: press Enter or click Launch Sector ${targetTier} to test the new pressure spike.`;
  }

  if (state.screen === 'failed') {
    return `Recovery lane: press Enter or click Retry Sector ${targetTier}. ${getFailureRecoveryPrompt(state.run?.endReason)}`;
  }

  return `Ready check: press Enter or click Launch Sector ${targetTier}. Browse unlocked sectors before launch if you want a different target.`;
};

export const getFlightCoachCopy = (state: AppState): string => {
  if (!state.run) {
    return 'Flight coach: Launch, then hold boost only when gravity starts dragging you inward.';
  }

  if (state.screen === 'won') {
    return `Flight coach: Sector clear. Queue Sector ${state.progression.lastPlayedTier} when you want the next pressure spike.`;
  }

  if (state.screen === 'failed') {
    if (state.run.endReason?.includes('core')) {
      return 'Flight coach: Core danger won that run. Boost a beat earlier and rebuild a safer lane.';
    }

    if (state.run.endReason?.includes('safe ring')) {
      return 'Flight coach: Drift risk broke the run. Release boost sooner when the ship nears the red ring.';
    }

    if (state.run.endReason?.includes('mine')) {
      return 'Flight coach: Mine contact ended the run. Feather the boost instead of committing through the whole lane.';
    }

    return 'Flight coach: Reset fast and look for the calmest lane before taking the next wide arc.';
  }

  const balance = getTierBalance(state.run.tier);
  const lapsRemaining = Math.max(0, state.run.targetOrbits - state.run.completedOrbits);

  if (lapsRemaining <= 1) {
    return 'Flight coach: Final lap. Stay patient and protect the clean line to the finish.';
  }

  if (state.run.radius <= balance.coreRadius + 34) {
    return 'Flight coach: Core danger. Hold boost now to climb back into the safer rings.';
  }

  if (state.run.radius >= balance.maxRadius - 18) {
    return 'Flight coach: Drift risk. Release boost now before you cross the red ring.';
  }

  if (state.run.boostActive) {
    return 'Flight coach: Orbit widening. Prepare to release before the ship touches the outer warning lane.';
  }

  return 'Flight coach: Stable lane. Feather boost to stay mid-ring and keep clean orbit progress.';
};

export const renderShell = (state: AppState): string => {
  const selectedTier = state.progression.lastPlayedTier;
  const selectionLocked = state.screen === 'running';
  const canSelectPrevious = !selectionLocked && selectedTier > 1;
  const canSelectNext = !selectionLocked && selectedTier < state.progression.highestUnlockedTier;

  return `
  <div class="shell" data-screen="${state.screen}">
    <section class="marketing-panel">
      <p class="eyebrow">Fast-restart browser arcade MVP</p>
      <h1>${gameConfig.title}</h1>
      <p class="pitch">${state.headline}</p>
      <div class="stat-grid" aria-label="run summary">
        <article class="stat-card">
          <span class="stat-label">Sector</span>
          <strong class="stat-value" data-field="sector">${state.progression.lastPlayedTier}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">Best</span>
          <strong class="stat-value" data-field="best-score">${state.progression.bestScore}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">Score</span>
          <strong class="stat-value" data-field="current-score">${formatScore(state)}</strong>
        </article>
        <article class="stat-card">
          <span class="stat-label">Goal</span>
          <strong class="stat-value" data-field="goal">${formatGoal(state)}</strong>
        </article>
      </div>
      <section class="sector-selector" aria-label="Sector selector">
        <div class="sector-selector-copy">
          <p class="sector-selector-label">Sector select</p>
          <p class="sector-selector-helper" data-field="sector-selector-helper">${getSectorSelectorHelper(state)}</p>
        </div>
        <div class="sector-selector-controls">
          <button class="sector-selector-button" type="button" data-action="previous-sector" ${canSelectPrevious ? '' : 'disabled'}>
            ← Prev
          </button>
          <strong class="sector-selector-chip" data-field="selected-sector-chip">Sector ${selectedTier}</strong>
          <button class="sector-selector-button" type="button" data-action="next-sector" ${canSelectNext ? '' : 'disabled'}>
            Next →
          </button>
        </div>
      </section>
      <section class="score-chase" aria-label="Best score chase">
        <div class="score-chase-copy">
          <p class="score-chase-label">Best score chase</p>
          <p class="score-chase-helper" data-field="score-chase-helper">${getScoreChaseCopy(state)}</p>
        </div>
      </section>
      <section class="goal-track" aria-label="Sector goal progress">
        <div class="goal-track-copy">
          <p class="goal-track-label">Goal track</p>
          <p class="goal-track-helper" data-field="goal-helper">${getGoalHelper(state)}</p>
        </div>
        <div
          class="goal-track-meter"
          role="progressbar"
          aria-label="Sector goal completion"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${getGoalProgress(state)}"
        >
          <span class="goal-track-fill" data-field="goal-progress-fill" style="width: ${getGoalProgress(state)}%"></span>
        </div>
      </section>
      <section class="sector-briefing" aria-label="Sector briefing">
        <div class="sector-briefing-copy">
          <p class="sector-briefing-label">Sector briefing</p>
          <p class="sector-briefing-helper" data-field="sector-briefing-helper">${getSectorBriefing(state)}</p>
        </div>
      </section>
      <section class="next-pressure" aria-label="Next sector pressure">
        <div class="next-pressure-copy">
          <p class="next-pressure-label">Next pressure</p>
          <p class="next-pressure-helper" data-field="next-pressure-helper">${getNextPressureHelper(state)}</p>
        </div>
        <div class="next-pressure-chips" aria-label="Next sector pressure delta">
          <span class="next-pressure-chip" data-field="next-pressure-sector">Sector ${getNextPressureTier(state)}</span>
          <span class="next-pressure-chip" data-field="next-pressure-delta">${formatNextPressureDelta(state)}</span>
        </div>
      </section>
      <ul class="pill-list" aria-label="How to play">
        <li>Hold boost to widen your orbit</li>
        <li>Dodge rotating mines</li>
        <li>Finish the target laps to win</li>
      </ul>
      <section class="danger-legend" aria-label="Arena danger legend">
        <div class="danger-legend-item">
          <span class="danger-dot danger-dot--core" aria-hidden="true"></span>
          <span>Amber core pulls inward hard</span>
        </div>
        <div class="danger-legend-item">
          <span class="danger-dot danger-dot--ring" aria-hidden="true"></span>
          <span>Red ring marks the drift-out fail line</span>
        </div>
        <div class="danger-legend-item">
          <span class="danger-dot danger-dot--mine" aria-hidden="true"></span>
          <span>Pink mines punish greedy boost lines</span>
        </div>
      </section>
      <section class="flight-coach" aria-label="Flight coach">
        <p class="flight-coach-label">Flight coach</p>
        <p class="flight-coach-copy" data-field="flight-coach">${getFlightCoachCopy(state)}</p>
      </section>
      <button class="launch-button" type="button" data-action="primary-run-action">
        ${state.primaryActionLabel}
      </button>
      <p class="action-prompt" data-field="action-prompt">${getActionPrompt(state)}</p>
      <p class="status-line" aria-live="polite">${state.status}</p>
      <p class="summary-line" data-field="summary">${state.summary}</p>
      <section class="run-recap" data-field="run-recap" ${state.screen === 'won' || state.screen === 'failed' ? '' : 'hidden'}>
        <p class="run-recap-title">Last run recap</p>
        <div class="run-recap-grid" aria-label="last run recap">
          <article class="stat-card">
            <span class="stat-label">Result</span>
            <strong class="stat-value stat-value--compact" data-field="run-result">${formatRunResult(state)}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-label">Time</span>
            <strong class="stat-value stat-value--compact" data-field="run-time">${formatRunTime(state)}</strong>
          </article>
          <article class="stat-card stat-card--wide">
            <span class="stat-label">Impact</span>
            <strong class="stat-value stat-value--compact" data-field="run-impact">${getRunRecapImpact(state)}</strong>
          </article>
          <article class="stat-card stat-card--wide">
            <span class="stat-label">Note</span>
            <strong class="stat-value stat-value--compact" data-field="run-note">${formatRunNote(state)}</strong>
          </article>
        </div>
      </section>
    </section>

    <section class="game-panel" aria-label="game preview area">
      <div id="game-root" class="game-root"></div>
      <div class="hud-tip">Boost: Space / W / ↑ / Mouse / Touch · Restart: R</div>
    </section>
  </div>
`;
};
