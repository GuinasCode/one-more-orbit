# Product Roadmap — Play Store Push

## Why this exists

`one-more-orbit` already has a solid arcade/web MVP foundation, but shipping on the Play Store changes the target.
The game now needs to succeed as a **mobile-first, short-session, touch-native arcade product** instead of only a browser-playable prototype.

This roadmap turns the current project diagnosis into an execution plan with milestones, implementation tasks, and acceptance criteria.

## Current Snapshot

### What is already strong
- Core loop exists and is understandable: orbit, boost, dodge, survive, clear laps.
- Fast restart flow is in place.
- Sector progression and score persistence exist.
- Balance is already parameterized and covered by tests.
- Build, lint, unit tests, and browser integration tests are passing.
- CI/CD and web publishing groundwork already exist.

### Main gaps before this feels Play Store-ready
- First-session readability is not yet instant enough for mobile traffic.
- HUD/text density is still too high for a hypercasual-style first impression.
- Progression is balanced, but still feels system-driven instead of emotionally paced.
- Reward/juice layer is functional but not yet sticky.
- Mobile packaging, device performance, orientation, install flow, and storefront assets are not yet part of the execution plan.

## Product Goal

Ship a version of One More Orbit that feels:
- easy to understand in the first 5 seconds
- satisfying in runs under 30-60 seconds
- replayable through score chase + progression + lightweight goals
- stable and legible on Android phones
- presentable as a Play Store release, not just a web prototype

## Product Hypotheses

1. If the first run becomes easier to read, more players will understand the loop before failing.
2. If early sectors teach one pressure at a time, the game will feel more fair and more addictive.
3. If near-miss / orbit-clear / sector-clear moments hit harder, restart intent will increase.
4. If the game adds short-term goals beyond raw score, retention will improve.
5. If the experience becomes touch-first and portrait/landscape decisions are intentional, Play Store viability rises significantly.

## Explicit Non-Goals (for now)

Do not expand scope yet into:
- multiplayer
- meta-economy / currency systems
- ads / monetization integration
- cosmetics pipeline
- online leaderboards
- large content expansion beyond what improves core retention

## Milestone Order

1. First 30 seconds / onboarding clarity
2. Early difficulty curve (sectors 1-8)
3. Juice + emotional reward
4. Short-session retention layer
5. Android / Play Store shipping path

---

## Milestone 1 — First 30 Seconds

### Goal
Make the first session understandable almost immediately, especially on touch devices.

### Current problems
- The game asks the player to parse several UI elements at once.
- The central action is understandable, but not yet obvious enough on first contact.
- Some copy is informative but too verbose for a mobile-first arcade first run.
- The player may fail before fully understanding what to pay attention to.

### Proposed changes
- Simplify the top-level value proposition into one primary instruction.
- Reduce non-critical HUD copy during the first session.
- Reframe the start-state messaging around one action and one risk.
- Make the first sector feel like a playable tutorial without calling it a tutorial.
- Revisit fail/win phrasing so outcomes are instantly readable.

### Implementation tasks
- Audit `renderShell.ts` text density and reduce competing helper copy.
- Add first-run specific messaging state if needed.
- Promote one primary instruction for touch/keyboard equivalence.
- Tune Sector 1 to allow successful understanding before harsh punishment.
- Review whether some helper panels should be collapsed, delayed, or shown only after first fail.

### Acceptance criteria
- A new player can explain the control scheme after one run.
- The first screen communicates one clear action and one clear danger.
- The number of simultaneously visible helper messages is reduced.
- Sector 1 acts as onboarding instead of an immediate knowledge check.

---

## Milestone 2 — Early Difficulty Curve (Sectors 1-8)

### Goal
Make progression feel natural, fair, and habit-forming instead of visibly mechanical.

### Design intent by band
- Sector 1: learn the input and safe lane
- Sectors 2-4: learn orbit-width control and confidence
- Sectors 5-8: learn pattern reading and endurance under controlled pressure

### Current problems
- Difficulty is well tuned numerically, but can still feel like system escalation.
- Pressure types stack quickly from a player-perception standpoint.
- The curve needs more emotional pacing: micro-relief, then tension.

### Proposed changes
- Rework the first 8 sectors into explicit learning beats.
- Introduce new pressure dimensions one at a time where possible.
- Create clearer contrast between “comfort sectors” and “test sectors.”
- Preserve passability guardrails while improving feel.

### Implementation tasks
- Review `balance.ts` early-tier values.
- Document the intended job of each sector from 1 through 8.
- Re-tune hazard count, orbit targets, gravity, and boost pressure for learning cadence.
- Add or extend tests that lock in the intended early-curve behavior.
- Verify that the early sectors feel better, not merely easier.
- Add Android availability tasking after the early-curve pass so shipping work stays visible on the roadmap.

### Acceptance criteria
- Sector 1 reliably teaches the core action.
- Sectors 2-4 increase confidence before significant punishment.
- Sectors 5-8 introduce meaningful challenge without feeling unfair.
- Balance changes remain covered by deterministic tests.

---

## Milestone 3 — Juice and Emotional Reward

### Goal
Increase replay desire through clearer emotional highs and near-fail tension.

### Current problems
- The game already functions, but key moments do not hit hard enough yet.
- Not enough emotional contrast between routine play and high-value moments.

### Priority moments to improve
- near collision
- clean orbit completion
- sector clear
- new best score
- fail state

### Proposed changes
- Stronger screen shake / pulse / sound / flash hierarchy by event value.
- Better “almost died” feedback without confusing the player.
- More celebratory sector-clear moment.
- Better fail-state framing that invites immediate retry.
- Cleaner best-score celebration.

### Implementation tasks
- Inventory existing effects in scene/UI layers.
- Define event tiers: minor, medium, major.
- Add/adjust feedback hooks for near-miss, orbit completion, sector clear, best score.
- Reduce flatness in fail and success presentation.
- Ensure feedback still reads well on mobile screens.

### Acceptance criteria
- Players can feel the difference between normal survival and high-value moments.
- Sector clear and new record moments feel rewarding.
- Fails feel readable and retry-inducing, not simply abrupt.

---

## Milestone 4 — Short-Session Retention Layer

### Goal
Give the player a reason to keep playing beyond “maybe I can score more.”

### Candidate features
- per-sector medals or rank grades
- short optional goals
- streak framing
- near-miss bonus
- mission-style prompts

### Recommendation
Start with the smallest retention layer that reinforces the existing loop without requiring a large content system.

### Proposed first pass
- sector rank/grade based on completion quality
- one optional challenge per unlocked sector
- stronger run recap framing with clear “next target” language

### Implementation tasks
- Define progression-adjacent retention model.
- Decide which rewards are cosmetic/informational vs unlock-affecting.
- Extend progression persistence carefully.
- Add UI hooks without overloading the main shell.
- Add tests for persistence and unlock logic.

### Acceptance criteria
- The game gives at least one concrete short-term goal besides raw score.
- The goal is legible and motivating after a fail.
- New retention systems do not clutter the core loop.

---

## Milestone 5 — Android / Play Store Shipping Path

### Goal
Turn the game from a browser-ready project into a realistic Android release candidate.

### Questions to answer early
- Native wrapper or PWA-first distribution bridge?
- Portrait or landscape as the primary orientation?
- Offline support expectations?
- Device performance budget on mid-range Android phones?
- Input assumptions for one-handed play?

### Required workstreams

#### 5.1 Mobile UX decisions
- choose intended orientation
- verify tap/hold comfort on real phone dimensions
- review HUD safe areas and touch ergonomics
- reduce text footprint for smaller screens

#### 5.2 Technical packaging
- choose Android packaging strategy (likely Capacitor/TWA depending direction)
- define app icon, splash, package id, versioning, signing path
- verify local storage persistence behavior inside Android shell
- validate resume/background behavior

#### 5.3 Performance and stability
- profile load time and runtime memory on Android devices
- reduce unnecessary visual cost
- ensure stable framerate on target phones
- test app lifecycle interruptions

#### 5.4 Store readiness
- final short and long descriptions
- screenshots
- feature graphic
- gameplay capture/video
- privacy policy if required by final implementation path
- content rating and store listing details

### Acceptance criteria
- The game runs correctly on Android hardware in its chosen packaging path.
- Controls feel natural on touch.
- UI remains legible on typical phone sizes.
- Store assets and listing copy are no longer placeholders.

---

## Quick Wins

These should be considered early because they are likely high impact for low-to-medium effort:
- shorten first-screen copy
- make the main input instruction more visually dominant
- reframe fail text into immediate retry motivation
- tighten Sector 1 onboarding feel
- improve orbit-complete feedback
- celebrate new best score more clearly
- hide/de-emphasize lower-priority helper text during active runs

## Suggested Execution Branches

Recommended order for implementation branches:
1. `feat/first-run-onboarding-clarity`
2. `feat/early-curve-retune`
3. `feat/juice-reward-pass`
4. `feat/retention-layer-v1`
5. `feat/android-play-store-path`

## Recommended Immediate Next Step

Start with a tightly scoped branch for:
- onboarding clarity
- HUD simplification
- first-run messaging
- Sector 1 onboarding retune

This is the smallest block likely to improve both retention and Play Store readiness.
