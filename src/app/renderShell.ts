import { getTierBalance } from '../game/core/balance';
import { gameConfig } from '../game/config';
import type { AppState } from './appState';

const formatGoal = (state: AppState): string => {
  if (state.screen === 'running' && state.run) {
    return `${state.run.completedOrbits}/${state.run.targetOrbits} orbits`;
  }

  const previewBalance = getTierBalance(state.progression.lastPlayedTier);
  return `${previewBalance.targetOrbits} clean orbits`;
};

const formatScore = (state: AppState): string => `${state.run?.score ?? 0}`;

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
      <ul class="pill-list" aria-label="How to play">
        <li>Hold boost to widen your orbit</li>
        <li>Dodge rotating mines</li>
        <li>Finish the target laps to win</li>
      </ul>
      <button class="launch-button" type="button" data-action="primary-run-action">
        ${state.primaryActionLabel}
      </button>
      <p class="status-line" aria-live="polite">${state.status}</p>
      <p class="summary-line" data-field="summary">${state.summary}</p>
    </section>

    <section class="game-panel" aria-label="game preview area">
      <div id="game-root" class="game-root"></div>
      <div class="hud-tip">Boost: Space / W / ↑ / Mouse / Touch · Restart: R</div>
    </section>
  </div>
`;
