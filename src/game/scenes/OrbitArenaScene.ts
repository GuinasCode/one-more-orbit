import Phaser from 'phaser';
import { gameConfig } from '../config';

export class OrbitArenaScene extends Phaser.Scene {
  static key = 'orbit-arena';

  private orbitingShip?: Phaser.GameObjects.Arc;

  private angle = 0;

  private radius = 132;

  private speed = 0.9;

  private runStarted = false;

  constructor() {
    super(OrbitArenaScene.key);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(gameConfig.backgroundColor);
    this.drawBackdrop();
    this.drawCore();
    this.drawOrbitPath();
    this.orbitingShip = this.add.circle(0, 0, 10, 0x8bf3ff);
    this.positionShip();
    this.drawHud();
  }

  startRun(): void {
    this.runStarted = true;
  }

  update(_: number, delta: number): void {
    if (!this.runStarted || !this.orbitingShip) {
      return;
    }

    this.angle += (delta / 1000) * this.speed;
    this.positionShip();
  }

  private drawBackdrop(): void {
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.65);

    for (let index = 0; index < 80; index += 1) {
      const x = 40 + ((index * 97) % (gameConfig.width - 80));
      const y = 40 + ((index * 67) % (gameConfig.height - 80));
      const size = index % 3 === 0 ? 2 : 1;
      stars.fillCircle(x, y, size);
    }
  }

  private drawCore(): void {
    const centerX = gameConfig.width / 2;
    const centerY = gameConfig.height / 2;

    this.add.circle(centerX, centerY, 48, 0xffbd59, 0.95);
    this.add.circle(centerX, centerY, 82, 0xffbd59, 0.12);
  }

  private drawOrbitPath(): void {
    const centerX = gameConfig.width / 2;
    const centerY = gameConfig.height / 2;

    const ring = this.add.graphics();
    ring.lineStyle(2, 0x6f89ff, 0.55);
    ring.strokeCircle(centerX, centerY, this.radius);
  }

  private drawHud(): void {
    this.add
      .text(32, 28, 'Stage 1 Prototype', {
        color: '#d9e2ff',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: '600',
      })
      .setDepth(2);

    this.add
      .text(32, 56, 'Goal: validate the one-more-run loop, restart speed, and readable action.', {
        color: '#8da2d8',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '14px',
      })
      .setDepth(2);
  }

  private positionShip(): void {
    if (!this.orbitingShip) {
      return;
    }

    const centerX = gameConfig.width / 2;
    const centerY = gameConfig.height / 2;
    this.orbitingShip.setPosition(
      centerX + Math.cos(this.angle) * this.radius,
      centerY + Math.sin(this.angle) * this.radius,
    );
  }
}
