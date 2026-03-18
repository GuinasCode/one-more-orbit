export type AppScreenState = 'start' | 'running';

export interface AppState {
  screen: AppScreenState;
  status: string;
}

export const initialAppState = (): AppState => ({
  screen: 'start',
  status: 'Awaiting launch command.',
});
