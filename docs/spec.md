# MVP Spec

## Product Goal

Ship a compact, publishable arcade game that feels complete on the web: clear controls, readable feedback, fast restarts, and enough progression to invite another run.

## Core Loop

1. Launch the current sector.
2. Auto-orbit around the gravity core.
3. Hold boost to widen the orbit and release to fall inward.
4. Dodge rotating mines while gravity pressure ramps up.
5. Complete the target orbit count to clear the sector and unlock the next one.
6. Fail instantly on core collapse, mine collision, or drifting outside the safe ring.
7. Restart immediately.

## MVP Requirements

- deterministic, skill-based loop with one clear input verb
- obvious fail/win conditions
- readable HUD for score, sector, progress, and best score
- persistence stub for best score and sector unlocks
- visual juice strong enough to feel intentionally shipped, not placeholder
- automated coverage for core simulation and playable boot flow

## Design Notes

- **Input simplicity wins.** One primary verb keeps runs legible and mobile-friendly.
- **Deterministic hazards** keep the game learnable while still tense.
- **Short run targets** preserve one-more-try tension.
- **Progression is a stub, not a grind.** Clearing a sector unlocks the next balance tier, giving the MVP a reason to continue without requiring a content pipeline.
