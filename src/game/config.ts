export const gameConfig = {
  width: 960,
  height: 540,
  backgroundColor: '#070b17',
  title: 'One More Orbit',
} as const;

export type GameConfig = typeof gameConfig;
