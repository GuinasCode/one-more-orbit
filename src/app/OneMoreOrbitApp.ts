import type Phaser from 'phaser';
import { initialAppState, type AppState, type AppScreenState } from './appState';
import { createPhaserGame } from '../game/createPhaserGame';
import {
  formatNextPressureDelta,
  getFlightCoachCopy,
  getGoalHelper,
  getNextPressureHelper,
  getNextPressureTier,
  getSectorBriefing,
  renderShell,
} from './renderShell';
import { getRunRecapNote } from './runRecap';
import { OrbitArenaScene } from '../game/scenes/OrbitArenaScene';
import {
  applyRunResolution,
  loadProgression,
  saveProgression,
  type ProgressionState,
} from '../game/core/progression';
import { getTierBalance } from '../game/core/balance';
import type { RunSnapshot } from '../game/core/runModel';
import type { GameBridge } from '../game/bridge';

export class OneMoreOrbitApp {
  private state: AppState;

  private progression: ProgressionState;

  private game?: Phaser.Game;

  private readonly root: HTMLDivElement;

  private readonly handlePrimaryActionKeydown = (event: KeyboardEvent): void => {
    if (this.state.screen === 'running') {
      return;
    }

    if (event.key !== 'Enter' && event.key !== 'NumpadEnter') {
      return;
    }

    event.preventDefault();
    this.startRun(this.progression.lastPlayedTier);
  };

  constructor(root: HTMLDivElement) {
    this.root = root;
    this.progression = loadProgression(this.getStorage());
    this.state = initialAppState(this.progression);
  }

  mount(): void {
    this.root.innerHTML = renderShell(this.state);
    const gameHost = this.requireElement<HTMLDivElement>('#game-root');
    const bridge: GameBridge = {
      onRunUpdate: (snapshot) => this.handleRunUpdate(snapshot),
    };

    this.game = createPhaserGame(gameHost, bridge);
    this.bindControls();
    this.syncUi();
  }

  private bindControls(): void {
    const primaryButton = this.requireElement<HTMLButtonElement>('[data-action="primary-run-action"]');

    primaryButton.addEventListener('click', () => {
      this.startRun(this.progression.lastPlayedTier);
    });

    window.addEventListener('keydown', this.handlePrimaryActionKeydown);
  }

  private startRun(tier: number): void {
    this.progression = {
      ...this.progression,
      lastPlayedTier: Math.min(this.progression.highestUnlockedTier, Math.max(1, Math.floor(tier))),
    };
    this.state = {
      ...this.state,
      screen: 'running',
      run: null,
      status: `Sector ${this.progression.lastPlayedTier} engaged. Hold boost and stabilize the orbit.`,
      headline: 'Thread the mines and keep the orbit alive.',
      summary: 'Survive the pull, avoid the rotating hazards, and close the sector target before the hull breaks.',
    };
    this.syncUi();
    this.startArena(this.progression.lastPlayedTier);
  }

  private startArena(tier: number): void {
    const arena = this.game?.scene.keys[OrbitArenaScene.key] as OrbitArenaScene | undefined;
    arena?.startRun(tier);
  }

  private handleRunUpdate(snapshot: RunSnapshot): void {
    const screen = this.mapRunPhaseToScreen(snapshot.phase);
    const resolvedProgression =
      snapshot.phase === 'won' || snapshot.phase === 'failed'
        ? applyRunResolution(this.progression, {
            tier: snapshot.tier,
            score: snapshot.score,
            won: snapshot.phase === 'won',
          })
        : {
            ...this.progression,
            bestScore: Math.max(this.progression.bestScore, snapshot.score),
            lastPlayedTier: snapshot.tier,
          };

    this.progression = resolvedProgression;
    saveProgression(this.progression, this.getStorage());

    const nextTier = snapshot.phase === 'won'
      ? Math.min(this.progression.highestUnlockedTier, snapshot.tier + 1)
      : snapshot.tier;

    this.state = {
      screen,
      status: snapshot.status,
      headline: snapshot.headline,
      summary: snapshot.summary,
      primaryActionLabel: this.getPrimaryActionLabel(screen, nextTier),
      progression: {
        ...this.progression,
        lastPlayedTier: nextTier,
      },
      run: snapshot,
    };

    this.progression = this.state.progression;
    this.syncUi();
  }

  private getPrimaryActionLabel(screen: AppScreenState, tier: number): string {
    if (screen === 'won') {
      return `Launch Sector ${tier}`;
    }

    if (screen === 'failed') {
      return `Retry Sector ${tier}`;
    }

    if (screen === 'running') {
      return 'Restart Run';
    }

    return `Launch Sector ${tier}`;
  }

  private mapRunPhaseToScreen(phase: RunSnapshot['phase']): AppScreenState {
    if (phase === 'won') {
      return 'won';
    }

    if (phase === 'failed') {
      return 'failed';
    }

    if (phase === 'running') {
      return 'running';
    }

    return 'start';
  }

  private syncUi(): void {
    const shell = this.requireElement<HTMLDivElement>('.shell');
    const pitch = this.requireElement<HTMLParagraphElement>('.pitch');
    const statusLine = this.requireElement<HTMLParagraphElement>('.status-line');
    const summaryLine = this.requireElement<HTMLParagraphElement>('[data-field="summary"]');
    const primaryButton = this.requireElement<HTMLButtonElement>('[data-action="primary-run-action"]');
    const sectorValue = this.requireElement<HTMLElement>('[data-field="sector"]');
    const bestScoreValue = this.requireElement<HTMLElement>('[data-field="best-score"]');
    const currentScoreValue = this.requireElement<HTMLElement>('[data-field="current-score"]');
    const goalValue = this.requireElement<HTMLElement>('[data-field="goal"]');
    const goalHelperValue = this.requireElement<HTMLElement>('[data-field="goal-helper"]');
    const goalProgressValue = this.requireElement<HTMLElement>('.goal-track-meter');
    const goalProgressFillValue = this.requireElement<HTMLElement>('[data-field="goal-progress-fill"]');
    const sectorBriefingValue = this.requireElement<HTMLElement>('[data-field="sector-briefing-helper"]');
    const nextPressureHelperValue = this.requireElement<HTMLElement>('[data-field="next-pressure-helper"]');
    const nextPressureSectorValue = this.requireElement<HTMLElement>('[data-field="next-pressure-sector"]');
    const nextPressureDeltaValue = this.requireElement<HTMLElement>('[data-field="next-pressure-delta"]');
    const flightCoachValue = this.requireElement<HTMLElement>('[data-field="flight-coach"]');
    const runRecap = this.requireElement<HTMLElement>('[data-field="run-recap"]');
    const runResultValue = this.requireElement<HTMLElement>('[data-field="run-result"]');
    const runTimeValue = this.requireElement<HTMLElement>('[data-field="run-time"]');
    const runNoteValue = this.requireElement<HTMLElement>('[data-field="run-note"]');

    shell.dataset.screen = this.state.screen;
    pitch.textContent = this.state.headline;
    statusLine.textContent = this.state.status;
    summaryLine.textContent = this.state.summary;
    primaryButton.textContent = this.state.primaryActionLabel;
    sectorValue.textContent = `${this.progression.lastPlayedTier}`;
    bestScoreValue.textContent = `${this.progression.bestScore}`;
    currentScoreValue.textContent = `${this.state.run?.score ?? 0}`;
    const targetOrbits = this.state.run?.targetOrbits ?? getTierBalance(this.progression.lastPlayedTier).targetOrbits;
    const completedOrbits = this.state.run?.completedOrbits ?? 0;
    const goalProgress = targetOrbits > 0 ? Math.min(100, Math.round((completedOrbits / targetOrbits) * 100)) : 0;

    goalValue.textContent =
      this.state.screen === 'running' && this.state.run
        ? `${this.state.run.completedOrbits}/${this.state.run.targetOrbits} orbits`
        : `${targetOrbits} clean orbits`;
    goalHelperValue.textContent = getGoalHelper(this.state);
    goalProgressValue.setAttribute('aria-valuenow', `${goalProgress}`);
    goalProgressFillValue.style.width = `${goalProgress}%`;
    sectorBriefingValue.textContent = getSectorBriefing(this.state);
    nextPressureHelperValue.textContent = getNextPressureHelper(this.state);
    nextPressureSectorValue.textContent = `Sector ${getNextPressureTier(this.state)}`;
    nextPressureDeltaValue.textContent = formatNextPressureDelta(this.state);
    flightCoachValue.textContent = getFlightCoachCopy(this.state);

    const shouldShowRecap = this.state.screen === 'won' || this.state.screen === 'failed';
    runRecap.toggleAttribute('hidden', !shouldShowRecap);
    runResultValue.textContent = this.state.screen === 'won' ? 'Sector cleared' : shouldShowRecap ? 'Run lost' : 'Stand by';
    runTimeValue.textContent = this.state.run ? `${this.state.run.elapsedSeconds.toFixed(1)}s` : '0.0s';
    runNoteValue.textContent = getRunRecapNote(this.state);

    if (this.state.screen !== 'running') {
      primaryButton.focus();
    }
  }

  private getStorage(): Storage | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    return window.localStorage;
  }

  private requireElement<TElement extends Element>(selector: string): TElement {
    const element = this.root.querySelector<TElement>(selector);

    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  }
}
