import Phaser from 'phaser';
import { gameConfig } from '../config';
import { gameBridgeRegistryKey, type GameBridge } from '../bridge';
import { createRunState, getNearestHazardGap, toRunSnapshot, updateRunState, type RunState } from '../core/runModel';

const centerX = gameConfig.width / 2;
const centerY = gameConfig.height / 2;
const MINE_DANGER_GAP = 20;

export class OrbitArenaScene extends Phaser.Scene {
  static key = 'orbit-arena';

  private bridge?: GameBridge;

  private runState?: RunState;

  private boostKey?: Phaser.Input.Keyboard.Key;

  private boostKeyAlt?: Phaser.Input.Keyboard.Key;

  private boostKeyUp?: Phaser.Input.Keyboard.Key;

  private restartKey?: Phaser.Input.Keyboard.Key;

  private shipGlow?: Phaser.GameObjects.Arc;

  private ship?: Phaser.GameObjects.Arc;

  private shipTrail?: Phaser.GameObjects.Group;

  private coreGlow?: Phaser.GameObjects.Arc;

  private corePulse?: Phaser.GameObjects.Arc;

  private hudTitle?: Phaser.GameObjects.Text;

  private hudBody?: Phaser.GameObjects.Text;

  private ringGraphics?: Phaser.GameObjects.Graphics;

  private hazardSprites: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super(OrbitArenaScene.key);
  }

  create(): void {
    this.bridge = this.game.registry.get(gameBridgeRegistryKey) as GameBridge | undefined;
    this.cameras.main.setBackgroundColor(gameConfig.backgroundColor);
    this.drawBackdrop();
    this.createCore();
    this.ringGraphics = this.add.graphics();
    this.createShip();
    this.createHud();
    this.bindInput();
    this.renderIdleState();
  }

  startRun(tier: number): void {
    this.runState = createRunState(tier);
    this.clearHazards();
    this.createHazards();
    this.cameras.main.flash(160, 85, 155, 255, false);
    this.emitSnapshot();
    this.renderFrame();
  }

  update(_: number, delta: number): void {
    if (!this.runState) {
      return;
    }

    if (this.restartKey?.isDown && this.runState.phase !== 'idle') {
      this.startRun(this.runState.balance.tier);
      return;
    }

    const nextState = updateRunState(this.runState, { boost: this.isBoostActive() }, delta);
    const previousPhase = this.runState.phase;
    this.runState = nextState;
    this.renderFrame();

    if (previousPhase !== nextState.phase) {
      if (nextState.phase === 'won') {
        this.cameras.main.shake(220, 0.004);
        this.cameras.main.flash(220, 120, 255, 180, false);
      }

      if (nextState.phase === 'failed') {
        this.cameras.main.shake(240, 0.008);
        this.cameras.main.flash(180, 255, 90, 90, false);
      }
    }

    this.emitSnapshot();
  }

  private bindInput(): void {
    this.boostKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.boostKeyAlt = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.boostKeyUp = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  private isBoostActive(): boolean {
    const pointer = this.input.activePointer;

    return Boolean(pointer.isDown || this.boostKey?.isDown || this.boostKeyAlt?.isDown || this.boostKeyUp?.isDown);
  }

  private drawBackdrop(): void {
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.72);

    for (let index = 0; index < 110; index += 1) {
      const x = 24 + ((index * 97) % (gameConfig.width - 48));
      const y = 24 + ((index * 67) % (gameConfig.height - 48));
      const size = index % 5 === 0 ? 2 : 1;
      stars.fillCircle(x, y, size);
    }

    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x070b17, 0x070b17, 0x02030a, 0x02030a, 0.1, 0.1, 0.85, 0.85);
    vignette.fillRect(0, 0, gameConfig.width, gameConfig.height);
  }

  private createCore(): void {
    this.coreGlow = this.add.circle(centerX, centerY, 84, 0xffb45a, 0.14);
    this.corePulse = this.add.circle(centerX, centerY, 58, 0xffd27a, 0.92);
    this.add.circle(centerX, centerY, 36, 0xfff3bd, 0.95);

    this.tweens.add({
      targets: [this.coreGlow, this.corePulse],
      scale: { from: 0.96, to: 1.04 },
      alpha: { from: 0.14, to: 0.24 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createShip(): void {
    this.shipTrail = this.add.group();
    this.shipGlow = this.add.circle(centerX, centerY, 18, 0x8bf3ff, 0.18);
    this.ship = this.add.circle(centerX, centerY, 10, 0x8bf3ff, 1);
    this.ship.setDepth(4);
    this.shipGlow.setDepth(3);
  }

  private createHud(): void {
    this.hudTitle = this.add
      .text(28, 22, 'Sector idle', {
        color: '#eef4ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: '700',
      })
      .setDepth(5);

    this.hudBody = this.add
      .text(28, 54, 'Press the launch button, then hold boost to widen the orbit.', {
        color: '#95a7dc',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
        wordWrap: { width: 320 },
      })
      .setDepth(5);
  }

  private renderIdleState(): void {
    this.hudTitle?.setText('Sector idle');
    this.hudBody?.setText('Launch a run, hold boost to widen the orbit, and hit R any time for a clean restart.');
    this.drawOrbitRings(168, 252);
    this.positionShip(0, 168, false);
  }

  private drawOrbitRings(currentRadius: number, maxRadius: number): void {
    if (!this.ringGraphics) {
      return;
    }

    this.ringGraphics.clear();
    this.ringGraphics.lineStyle(2, 0x6f89ff, 0.22);
    this.ringGraphics.strokeCircle(centerX, centerY, 116);
    this.ringGraphics.strokeCircle(centerX, centerY, 148);
    this.ringGraphics.strokeCircle(centerX, centerY, 182);
    this.ringGraphics.strokeCircle(centerX, centerY, 214);
    this.ringGraphics.lineStyle(2, 0x6f89ff, 0.42);
    this.ringGraphics.strokeCircle(centerX, centerY, currentRadius);
    this.ringGraphics.lineStyle(2, 0xff6b7d, 0.28);
    this.ringGraphics.strokeCircle(centerX, centerY, maxRadius);
  }

  private clearHazards(): void {
    this.hazardSprites.forEach((hazard) => hazard.destroy());
    this.hazardSprites = [];
  }

  private createHazards(): void {
    this.clearHazards();

    this.runState?.hazards.forEach(() => {
      const hazard = this.add.circle(centerX, centerY, 12, 0xff6b7d, 0.95).setDepth(3);
      this.tweens.add({
        targets: hazard,
        alpha: { from: 0.75, to: 1 },
        scale: { from: 0.9, to: 1.08 },
        duration: 480,
        yoyo: true,
        repeat: -1,
      });
      this.hazardSprites.push(hazard);
    });
  }

  private renderFrame(): void {
    const state = this.runState;

    if (!state) {
      this.renderIdleState();
      return;
    }

    const nearestHazardGap = getNearestHazardGap(state);
    const shipX = centerX + Math.cos(state.displayedAngle) * state.radius;
    const shipY = centerY + Math.sin(state.displayedAngle) * state.radius;
    const nearestHazardIndex = state.hazards.reduce((closestIndex, hazard, index, hazards) => {
      const currentDistance = Math.hypot(shipX - (centerX + Math.cos(hazard.angle) * hazard.radius), shipY - (centerY + Math.sin(hazard.angle) * hazard.radius));

      if (closestIndex < 0) {
        return index;
      }

      const closestHazard = hazards[closestIndex];
      const closestDistance = Math.hypot(
        shipX - (centerX + Math.cos(closestHazard.angle) * closestHazard.radius),
        shipY - (centerY + Math.sin(closestHazard.angle) * closestHazard.radius),
      );

      return currentDistance < closestDistance ? index : closestIndex;
    }, -1);

    this.drawOrbitRings(state.radius, state.balance.maxRadius);
    this.positionShip(state.displayedAngle, state.radius, state.boostActive);

    state.hazards.forEach((hazard, index) => {
      const sprite = this.hazardSprites[index];

      if (!sprite) {
        return;
      }

      const isNearestDanger = index === nearestHazardIndex && nearestHazardGap !== null && nearestHazardGap <= MINE_DANGER_GAP;

      sprite.setRadius(hazard.size);
      sprite.setPosition(
        centerX + Math.cos(hazard.angle) * hazard.radius,
        centerY + Math.sin(hazard.angle) * hazard.radius,
      );
      sprite.setFillStyle(0xff6b7d, isNearestDanger ? 1 : 0.95);
      sprite.setStrokeStyle(isNearestDanger ? 3 : 0, 0xfff1a8, 0.92);
      sprite.setScale(isNearestDanger ? 1.12 : 1);
    });

    if (state.phase === 'running') {
      const tutorialStep = toRunSnapshot(state).launchTutorialStep;

      this.hudTitle?.setText(
        tutorialStep === 'boost-out'
          ? `Sector ${state.balance.tier} · Opening move · ${state.score} score`
          : tutorialStep === 'settle-in'
            ? `Sector ${state.balance.tier} · Settle orbit · ${state.score} score`
            : tutorialStep === 'watch-mines'
              ? `Sector ${state.balance.tier} · Mine timing · ${state.score} score`
              : `Sector ${state.balance.tier} · ${state.completedOrbits}/${state.balance.targetOrbits} orbits · ${state.score} score`,
      );
      this.hudBody?.setText(
        tutorialStep === 'boost-out'
          ? 'Step 1: hold boost to open space from the core. Survive first, optimize later.'
          : tutorialStep === 'settle-in'
            ? 'Step 2: feather the boost. Short pulses keep you centered between the core and drift ring.'
            : tutorialStep === 'watch-mines'
              ? 'Step 3: watch the nearest mine, release a beat, then boost back into the open lane.'
              : nearestHazardGap !== null && nearestHazardGap <= MINE_DANGER_GAP
                ? `Mine danger close: ${Math.max(0, Math.round(nearestHazardGap))} units of hull clearance. Feather boost and let the nearest mine rotate past.`
                : state.boostActive
                  ? 'Boost held: orbit widening. Ease off before you slip beyond the safe ring.'
                  : 'Gravity is pulling you inward. Feather boost to line up around the mines.',
      );
      return;
    }

    if (state.phase === 'won') {
      this.hudTitle?.setText(`Sector ${state.balance.tier} clear · ${state.score} score`);
      this.hudBody?.setText('Sector cleared. Use the left panel to launch the newly unlocked sector.');
      return;
    }

    this.hudTitle?.setText(`Run lost · ${state.score} score`);
    this.hudBody?.setText('Hull compromised. Restart instantly from the left panel or press R.');
  }

  private positionShip(angle: number, radius: number, boosting: boolean): void {
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    this.ship?.setPosition(x, y);
    this.shipGlow?.setPosition(x, y);
    this.shipGlow?.setFillStyle(0x8bf3ff, boosting ? 0.3 : 0.16);

    if (boosting) {
      const spark = this.add.circle(x, y, 4, 0xb678ff, 0.35).setDepth(2);
      this.shipTrail?.add(spark);
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scale: 0.2,
        duration: 220,
        onComplete: () => spark.destroy(),
      });
    }
  }

  private emitSnapshot(): void {
    if (!this.runState) {
      return;
    }

    this.bridge?.onRunUpdate(toRunSnapshot(this.runState));
  }
}
