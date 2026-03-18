import type Phaser from 'phaser';
import { initialAppState, type AppState, type AppScreenState } from './appState';
import { createPhaserGame } from '../game/createPhaserGame';
import {
  formatNextPressureDelta,
  getActionPrompt,
  getArenaSignalHelper,
  getArenaSignalLabel,
  getArenaSignalTone,
  getFlightCoachCopy,
  getGoalHelper,
  getLaneBalance,
  getLaneCurrentRadius,
  getLanePositionPercent,
  getLaneWindowHelper,
  getNextPressureHelper,
  getNextPressureTier,
  getOutcomeGuideCoreFail,
  getOutcomeGuideMineFail,
  getOutcomeGuideRingFail,
  getOutcomeGuideTitle,
  getOutcomeGuideWin,
  getScoreChaseCopy,
  getSectorBriefing,
  getSectorSelectorHelper,
  getSelectedSectorGoalChip,
  getSelectedSectorHazardChip,
  getSelectedSectorLaneChip,
  renderShell,
} from './renderShell';
import { getRunRecapAction, getRunRecapImpact, getRunRecapNote } from './runRecap';
import { getResultMessaging } from './runMessaging';
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
    const previousSectorButton = this.requireElement<HTMLButtonElement>('[data-action="previous-sector"]');
    const nextSectorButton = this.requireElement<HTMLButtonElement>('[data-action="next-sector"]');

    primaryButton.addEventListener('click', () => {
      this.startRun(this.progression.lastPlayedTier);
    });

    previousSectorButton.addEventListener('click', () => {
      this.changeSelectedTier(-1);
    });

    nextSectorButton.addEventListener('click', () => {
      this.changeSelectedTier(1);
    });

    window.addEventListener('keydown', this.handlePrimaryActionKeydown);
  }

  private changeSelectedTier(delta: number): void {
    if (this.state.screen === 'running') {
      return;
    }

    const nextTier = Math.min(
      this.progression.highestUnlockedTier,
      Math.max(1, this.progression.lastPlayedTier + delta),
    );

    if (nextTier === this.progression.lastPlayedTier) {
      return;
    }

    this.progression = {
      ...this.progression,
      lastPlayedTier: nextTier,
    };
    saveProgression(this.progression, this.getStorage());

    this.state = {
      ...this.state,
      progression: this.progression,
      status: `Awaiting launch command. Sector ${nextTier} is calibrated and ready.`,
      primaryActionLabel: this.getPrimaryActionLabel(this.state.screen, nextTier),
    };
    this.syncUi();
  }

  private startRun(tier: number): void {
    this.progression = {
      ...this.progression,
      lastPlayedTier: Math.min(this.progression.highestUnlockedTier, Math.max(1, Math.floor(tier))),
    };
    saveProgression(this.progression, this.getStorage());
    this.state = {
      ...this.state,
      screen: 'running',
      run: null,
      previousBestScore: this.progression.bestScore,
      progression: this.progression,
      primaryActionLabel: 'Restart Run',
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
    const previousBestScore = this.progression.bestScore;
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
    const resultMessaging = getResultMessaging(snapshot, this.progression, previousBestScore);

    this.state = {
      screen,
      status: resultMessaging.status,
      headline: resultMessaging.headline,
      summary: resultMessaging.summary,
      primaryActionLabel: this.getPrimaryActionLabel(screen, nextTier),
      progression: {
        ...this.progression,
        lastPlayedTier: nextTier,
      },
      previousBestScore,
      run: snapshot,
    };

    this.progression = this.state.progression;
    saveProgression(this.progression, this.getStorage());
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
    const actionPromptLine = this.requireElement<HTMLParagraphElement>('[data-field="action-prompt"]');
    const statusLine = this.requireElement<HTMLParagraphElement>('.status-line');
    const summaryLine = this.requireElement<HTMLParagraphElement>('[data-field="summary"]');
    const primaryButton = this.requireElement<HTMLButtonElement>('[data-action="primary-run-action"]');
    const sectorValue = this.requireElement<HTMLElement>('[data-field="sector"]');
    const bestScoreValue = this.requireElement<HTMLElement>('[data-field="best-score"]');
    const currentScoreValue = this.requireElement<HTMLElement>('[data-field="current-score"]');
    const goalValue = this.requireElement<HTMLElement>('[data-field="goal"]');
    const sectorSelectorHelperValue = this.requireElement<HTMLElement>('[data-field="sector-selector-helper"]');
    const selectedSectorChipValue = this.requireElement<HTMLElement>('[data-field="selected-sector-chip"]');
    const selectedSectorGoalValue = this.requireElement<HTMLElement>('[data-field="selected-sector-goal"]');
    const selectedSectorHazardsValue = this.requireElement<HTMLElement>('[data-field="selected-sector-hazards"]');
    const selectedSectorLaneValue = this.requireElement<HTMLElement>('[data-field="selected-sector-lane"]');
    const previousSectorButton = this.requireElement<HTMLButtonElement>('[data-action="previous-sector"]');
    const nextSectorButton = this.requireElement<HTMLButtonElement>('[data-action="next-sector"]');
    const scoreChaseValue = this.requireElement<HTMLElement>('[data-field="score-chase-helper"]');
    const goalHelperValue = this.requireElement<HTMLElement>('[data-field="goal-helper"]');
    const goalProgressValue = this.requireElement<HTMLElement>('.goal-track-meter');
    const goalProgressFillValue = this.requireElement<HTMLElement>('[data-field="goal-progress-fill"]');
    const sectorBriefingValue = this.requireElement<HTMLElement>('[data-field="sector-briefing-helper"]');
    const nextPressureHelperValue = this.requireElement<HTMLElement>('[data-field="next-pressure-helper"]');
    const nextPressureSectorValue = this.requireElement<HTMLElement>('[data-field="next-pressure-sector"]');
    const nextPressureDeltaValue = this.requireElement<HTMLElement>('[data-field="next-pressure-delta"]');
    const outcomeGuideTitleValue = this.requireElement<HTMLElement>('[data-field="outcome-guide-title"]');
    const outcomeGuideWinValue = this.requireElement<HTMLElement>('[data-field="outcome-guide-win"]');
    const outcomeGuideCoreValue = this.requireElement<HTMLElement>('[data-field="outcome-guide-core"]');
    const outcomeGuideRingValue = this.requireElement<HTMLElement>('[data-field="outcome-guide-ring"]');
    const outcomeGuideMineValue = this.requireElement<HTMLElement>('[data-field="outcome-guide-mine"]');
    const laneWindowHelperValue = this.requireElement<HTMLElement>('[data-field="lane-window-helper"]');
    const laneWindowRangeValue = this.requireElement<HTMLElement>('[data-field="lane-window-range"]');
    const laneWindowCurrentValue = this.requireElement<HTMLElement>('[data-field="lane-window-current"]');
    const laneWindowMeterValue = this.requireElement<HTMLElement>('.lane-window-meter');
    const laneWindowFillValue = this.requireElement<HTMLElement>('[data-field="lane-window-fill"]');
    const flightCoachValue = this.requireElement<HTMLElement>('[data-field="flight-coach"]');
    const arenaSignal = this.requireElement<HTMLElement>('.arena-signal');
    const arenaSignalLabelValue = this.requireElement<HTMLElement>('[data-field="arena-signal-label"]');
    const arenaSignalHelperValue = this.requireElement<HTMLElement>('[data-field="arena-signal-helper"]');
    const runRecap = this.requireElement<HTMLElement>('[data-field="run-recap"]');
    const runResultValue = this.requireElement<HTMLElement>('[data-field="run-result"]');
    const runTimeValue = this.requireElement<HTMLElement>('[data-field="run-time"]');
    const runImpactValue = this.requireElement<HTMLElement>('[data-field="run-impact"]');
    const runNoteValue = this.requireElement<HTMLElement>('[data-field="run-note"]');
    const runActionValue = this.requireElement<HTMLElement>('[data-field="run-action"]');

    shell.dataset.screen = this.state.screen;
    pitch.textContent = this.state.headline;
    actionPromptLine.textContent = getActionPrompt(this.state);
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
    sectorSelectorHelperValue.textContent = getSectorSelectorHelper(this.state);
    selectedSectorChipValue.textContent = `Sector ${this.progression.lastPlayedTier}`;
    selectedSectorGoalValue.textContent = getSelectedSectorGoalChip(this.state);
    selectedSectorHazardsValue.textContent = getSelectedSectorHazardChip(this.state);
    selectedSectorLaneValue.textContent = getSelectedSectorLaneChip(this.state);
    previousSectorButton.disabled = this.state.screen === 'running' || this.progression.lastPlayedTier <= 1;
    nextSectorButton.disabled =
      this.state.screen === 'running' || this.progression.lastPlayedTier >= this.progression.highestUnlockedTier;
    scoreChaseValue.textContent = getScoreChaseCopy(this.state);
    goalHelperValue.textContent = getGoalHelper(this.state);
    goalProgressValue.setAttribute('aria-valuenow', `${goalProgress}`);
    goalProgressFillValue.style.width = `${goalProgress}%`;
    sectorBriefingValue.textContent = getSectorBriefing(this.state);
    nextPressureHelperValue.textContent = getNextPressureHelper(this.state);
    nextPressureSectorValue.textContent = `Sector ${getNextPressureTier(this.state)}`;
    nextPressureDeltaValue.textContent = formatNextPressureDelta(this.state);
    outcomeGuideTitleValue.textContent = getOutcomeGuideTitle(this.state);
    outcomeGuideWinValue.textContent = getOutcomeGuideWin(this.state);
    outcomeGuideCoreValue.textContent = getOutcomeGuideCoreFail(this.state);
    outcomeGuideRingValue.textContent = getOutcomeGuideRingFail(this.state);
    outcomeGuideMineValue.textContent = getOutcomeGuideMineFail(this.state);
    laneWindowHelperValue.textContent = getLaneWindowHelper(this.state);
    laneWindowRangeValue.textContent = `${getLaneBalance(this.state).coreRadius}-${getLaneBalance(this.state).maxRadius} radius`;
    laneWindowCurrentValue.textContent = `Current ${Math.round(getLaneCurrentRadius(this.state))}`;
    laneWindowMeterValue.setAttribute('aria-valuenow', `${getLanePositionPercent(this.state)}`);
    laneWindowFillValue.style.width = `${getLanePositionPercent(this.state)}%`;
    flightCoachValue.textContent = getFlightCoachCopy(this.state);
    arenaSignal.dataset.tone = getArenaSignalTone(this.state);
    arenaSignalLabelValue.textContent = getArenaSignalLabel(this.state);
    arenaSignalHelperValue.textContent = getArenaSignalHelper(this.state);

    const shouldShowRecap = this.state.screen === 'won' || this.state.screen === 'failed';
    runRecap.toggleAttribute('hidden', !shouldShowRecap);
    runResultValue.textContent = this.state.screen === 'won' ? 'Sector cleared' : shouldShowRecap ? 'Run lost' : 'Stand by';
    runTimeValue.textContent = this.state.run ? `${this.state.run.elapsedSeconds.toFixed(1)}s` : '0.0s';
    runImpactValue.textContent = getRunRecapImpact(this.state);
    runNoteValue.textContent = getRunRecapNote(this.state);
    runActionValue.textContent = getRunRecapAction(this.state);

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
