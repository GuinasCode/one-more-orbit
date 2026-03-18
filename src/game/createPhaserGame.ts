import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { OrbitArenaScene } from './scenes/OrbitArenaScene';

export const createPhaserGame = (parent: string | HTMLElement): Phaser.Game => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: gameConfig.width,
    height: gameConfig.height,
    backgroundColor: gameConfig.backgroundColor,
    scene: [BootScene, OrbitArenaScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
    },
  });
};
