import type Phaser from 'phaser';
import { initialAppState, type AppState } from './appState';
import { createPhaserGame } from '../game/createPhaserGame';
import { renderShell } from './renderShell';
import { launchRun } from '../game/core/session';
import { gameConfig } from '../game/config';
import { OrbitArenaScene } from '../game/scenes/OrbitArenaScene';

export class OneMoreOrbitApp {
  private state: AppState = initialAppState();

  private game?: Phaser.Game;

  private readonly root: HTMLDivElement;

  constructor(root: HTMLDivElement) {
    this.root = root;
  }

  mount(): void {
    this.root.innerHTML = renderShell(this.state);
    const gameHost = this.requireElement<HTMLDivElement>('#game-root');
    this.game = createPhaserGame(gameHost);
    this.bindControls();
    this.syncUi();
  }

  private bindControls(): void {
    const launchButton = this.requireElement<HTMLButtonElement>('[data-action="start-run"]');

    launchButton.addEventListener('click', () => {
      this.state = launchRun(this.state);
      this.syncUi();
      this.startArena();
    });
  }

  private startArena(): void {
    const arena = this.game?.scene.keys[OrbitArenaScene.key] as OrbitArenaScene | undefined;
    arena?.startRun();
  }

  private syncUi(): void {
    const shell = this.requireElement<HTMLDivElement>('.shell');
    const statusLine = this.requireElement<HTMLParagraphElement>('.status-line');
    const launchButton = this.requireElement<HTMLButtonElement>('[data-action="start-run"]');

    shell.dataset.screen = this.state.screen;
    statusLine.textContent = this.state.status;
    launchButton.disabled = this.state.screen === 'running';
    launchButton.textContent = this.state.screen === 'running' ? 'Run Active' : gameConfig.startPrompt;
  }

  private requireElement<TElement extends Element>(selector: string): TElement {
    const element = this.root.querySelector<TElement>(selector);

    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  }
}
