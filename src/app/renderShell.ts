import { gameConfig } from '../game/config';
import type { AppState } from './appState';

export const renderShell = (state: AppState): string => `
  <div class="shell" data-screen="${state.screen}">
    <section class="marketing-panel">
      <p class="eyebrow">Fast-restart browser arcade MVP</p>
      <h1>${gameConfig.title}</h1>
      <p class="pitch">
        A gravity survival hook designed for instant retries, streamer clips, and web-first publishing.
      </p>
      <ul class="pill-list" aria-label="Stage 1 pillars">
        <li>Web-first release via Vite</li>
        <li>Phaser runtime for rapid arcade iteration</li>
        <li>Playwright checks for playable flows</li>
      </ul>
      <button class="launch-button" type="button" data-action="start-run">
        ${gameConfig.startPrompt}
      </button>
      <p class="status-line" aria-live="polite">${state.status}</p>
    </section>

    <section class="game-panel" aria-label="game preview area">
      <div id="game-root" class="game-root"></div>
    </section>
  </div>
`;
