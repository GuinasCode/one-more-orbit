# One More Orbit

Web-first arcade game prototype focused on a fast restart loop and streamer-friendly readability.

## MVP Stack

- TypeScript
- Vite
- Phaser 3
- ESLint
- Vitest
- Playwright

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint TypeScript and config files
- `npm run test:unit` — unit tests with coverage
- `npm run test:integration` — browser integration tests
- `npm test` — run unit + integration suites

## Stage 1 Delivered

- project scaffold for web-first release
- Phaser runtime embedded in a clean app shell
- start screen with launch CTA and live status text
- minimal orbit arena scene with placeholder motion
- lint + unit + integration test setup
- docs/spec and roadmap for follow-up stages

## Structure

- `src/app` — shell UI and app orchestration
- `src/game` — Phaser scenes, config, session logic
- `tests/unit` — unit tests
- `tests/integration` — Playwright integration flow
- `docs` — spec and roadmap
