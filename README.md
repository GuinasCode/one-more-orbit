# One More Orbit

Web-first arcade survival game built for fast restarts, readable action, and a publishable browser MVP.

## Chrome DevTools MCP

Este projeto agora inclui uma configuração local em `.mcp.json` para usar o servidor oficial **Chrome DevTools MCP**.

Detalhes de uso: `docs/chrome-devtools-mcp.md`

## Current MVP Slice

- auto-orbit survival around a collapsing gravity well
- hold boost to widen your arc and dodge rotating mines
- clear a sector by finishing the required orbit count
- fail states for core collision, mine collision, and drifting beyond the safe ring
- persistent best score + sector unlock stub stored in localStorage
- polished HUD, instant restart flow, lightweight game juice, and release docs/workflows

## Stack

- TypeScript
- Vite
- Phaser 3
- ESLint
- Vitest
- Playwright
- GitHub Actions + GitHub Pages

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint TypeScript and config files
- `npm run test:unit` — unit tests with coverage
- `npm run test:integration` — browser integration tests
- `npm test` — run unit + integration suites

## How To Play

- Launch the current sector from the left panel.
- Hold **Space**, **W**, **Up Arrow**, mouse, or touch to boost outward.
- Release boost to let gravity pull you back in.
- Thread between rotating mines and complete the target orbit count.
- Press **R** or use the primary button for an instant restart.

## Shipping Notes

- CI workflow: `.github/workflows/ci.yml`
- GitHub Pages deploy workflow: `.github/workflows/deploy-pages.yml`
- Publish checklist: `docs/publish-checklist.md`
- Store copy draft: `docs/store-copy.md`

## CI / CD

- GitHub Actions runs on every `push` and `pull_request`.
- CI is split into three jobs: `Lint + build`, `Unit tests`, and `Integration tests`.
- `npm run test:unit` is the fast gate for core logic, while Playwright covers browser smoke/integration flow.
- GitHub Pages deploys from `main` via `.github/workflows/deploy-pages.yml` after CI passes and changes are merged.

## Project Structure

- `src/app` — DOM shell, persistence wiring, app-level orchestration
- `src/game/core` — balance, progression, and deterministic run simulation
- `src/game/scenes` — Phaser presentation layer and run controls
- `public` — static web assets and manifest
- `tests/unit` — logic and shell coverage
- `tests/integration` — browser smoke tests
- `docs` — product spec and delivery roadmap
