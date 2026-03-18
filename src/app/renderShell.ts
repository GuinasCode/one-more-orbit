import { getTierBalance } from '../game/core/balance';
import { gameConfig } from '../game/config';
import type { AppState } from './appState';
import { getRunRecapNote } from './runRecap';

const formatGoal = (state: AppState): string => {
  if (state.screen === 'running' && state.run) {
    return `${state.run.completedOrbits}/${state.run.targetOrbits} orbits`;
  }

  const previewBalance = getTierBalance(state.progression.lastPlayedTier);
  return `${previewBalance.targetOrbits} clean orbits`;
};

const formatScore = (state: AppState): string => `${state.run?.score ?? 0}`;

const getGoalProgress = (state: AppState): number => {
  if (!state.run || state.run.targetOrbits <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((state.run.completedOrbits / state.run.targetOrbits) * 100));
};

const getGoalHelper = (state: AppState): string => {
  if (state.screen === 'running' && state.run) {
    const lapsRemaining = Math.max(0, state.run.targetOrbits - state.run.completedOrbits);
    return lapsRemaining === 0
      ? 'Final orbit banked. Hold the lane until the sector resolves.'
      : `${lapsRemaining} clean lap${lapsRemaining === 1 ? '' : 's'} left to clear this sector.`;
  }

  const previewBalance = getTierBalance(state.progression.lastPlayedTier);
  return `${previewBalance.targetOrbits} clean laps unlock the next sector pressure spike.`;
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

export const renderShell = (state: AppState): string => `
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
