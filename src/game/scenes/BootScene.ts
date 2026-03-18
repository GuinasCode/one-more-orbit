import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  static key = 'boot';

  constructor() {
    super(BootScene.key);
  }

  create(): void {
    this.scene.start('orbit-arena');
  }
}
