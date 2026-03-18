import Phaser from 'phaser';
import { gameConfig } from './config';
import { gameBridgeRegistryKey, type GameBridge } from './bridge';
import { BootScene } from './scenes/BootScene';
import { OrbitArenaScene } from './scenes/OrbitArenaScene';

export const createPhaserGame = (parent: string | HTMLElement, bridge: GameBridge): Phaser.Game => {
  const game = new Phaser.Game({
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
  });

  game.registry.set(gameBridgeRegistryKey, bridge);

  return game;
};
