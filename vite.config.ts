import { defineConfig } from 'vitest/config';

const githubPagesBase = process.env.GITHUB_ACTIONS ? '/one-more-orbit/' : '/';

export default defineConfig({
  base: githubPagesBase,
  build: {
    chunkSizeWarningLimit: 1500,
  },
  server: {
    port: 4173,
  },
  preview: {
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/counter.ts', 'src/game/events.ts'],
    },
  },
});
