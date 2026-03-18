# Stage 1 Spec

## Product Goal

Build a small, publishable arcade game that can ship to web quickly, then expand to desktop later if traction appears.

## Working Concept

**One More Orbit** is a high-score survival game where the player skirts a gravity well, dodges hazards, and chases one-more-run tension through ultra-fast restarts.

## Why This Stack

- **Vite + TypeScript**: fast iteration, low ceremony, easy static hosting.
- **Phaser 3**: proven 2D arcade framework with scene management and strong browser compatibility.
- **Playwright**: confidence that the playable shell boots and start flow works.
- **Vitest**: quick logic coverage for session state and rendering helpers.

## Stage 1 Scope

- bootstrap repo and tooling
- define coherent app/game architecture
- create a polished landing/start screen
- boot a minimal Phaser arena scene
- validate the launch flow with tests

## Non-Goals

- final core mechanic
- art pipeline
- progression, scoring, sound, or monetization
- desktop packaging

## Architecture Notes

- `OneMoreOrbitApp` owns shell state and mounts Phaser.
- `renderShell` keeps the DOM shell simple and testable.
- `launchRun` isolates session transitions for unit coverage.
- Phaser scenes are kept under `src/game/scenes` so mechanics can grow cleanly in later stages.
