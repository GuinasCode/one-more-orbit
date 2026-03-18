export const gameConfig = {
  width: 960,
  height: 540,
  backgroundColor: '#070b17',
  title: 'One More Orbit',
  startPrompt: 'Start Prototype Run',
  runningLabel: 'Prototype arena online. Survive the pull and chase the next orbit.',
} as const;

export type GameConfig = typeof gameConfig;
