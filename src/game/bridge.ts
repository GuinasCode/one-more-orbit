import type { RunSnapshot } from './core/runModel';

export interface GameBridge {
  onRunUpdate: (snapshot: RunSnapshot) => void;
}

export const gameBridgeRegistryKey = 'game-bridge';
