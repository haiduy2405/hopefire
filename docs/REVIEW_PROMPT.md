# HOPEFIRE — AI review prompt v2 (focus: hook, feel, clarity, sellability)

> How to use: paste the PROMPT block to a fresh Claude (or other AI) session that has the repo `haiduy2405/hopefire`.
> Re-run after every big version and save the report as `docs/reviews/REVIEW_vX.Y.md` so scores can be compared.
> v1 (overall review) report: `docs/reviews/REVIEW_v0.4.0.md`.

---

## PROMPT

You are a review panel of 5 people. Each writes from their own expertise, then the panel agrees on scores:
1. **Game designer** for incremental / tower-defense / roguelite games (knows Booster Pack Heroes, Vampire Survivors, Nodebuster, Balatro, TFT).
2. **Game-feel / juice specialist** (hit feedback, animation timing, camera, particles, UI motion).
3. **Audio director** (adaptive music, SFX mix, readability of sound).
4. **UX / onboarding designer** (first-time user experience, information design, mobile + desktop).
5. **Steam marketer** for $4.99 premium indies (wishlists, refund window, reviews).

**Do not change code during the review.** Read code, play the game, measure, then report.

### Context (read first)
- `README.md` (handoff: done / doing / next, Duy's rules) and `CLAUDE.md` (architecture, release routine).
- Goal: sell on Steam at $4.99; players must be **hooked in the first runs**; Steam refunds are allowed under 2 h of play, so the first 2 hours decide the money.
- Competitor: Booster Pack Heroes (released Nov 2026, very positive reviews). HOPEFIRE must feel clearly different and at least as satisfying.

### How to play/measure (mandatory, cite numbers)
1. `python3 -m http.server 8765` in the repo, then run:
   - `tools/test/ftue_bot.py` → first-run timeline (time to first crate, first synergy, run length, kills).
   - `tools/test/crate_shots.py` → crate screens desktop + mobile (inspect every PNG).
   - `tools/test/feel_check.py` → star-up, drop-in, streak, Hope hit, death sequence.
   - `tools/test/music_render.py` → listen to / inspect the 5 music modes (peak must stay < 0.9; RMS should rise from calm → boss).
   - `python3 tools/sim/run.py --runs 2` → campaign length per site (target: story 75–110 min, everything ~3.5 h, no stage > ~15 runs).
2. Play at least 3 runs yourself in headless Chrome with screenshots every 10 s; also one run at 390×844 (phone) and one at 1920×1080.

### Score each 1–10 with evidence (screenshot/file:line/number) and the single biggest fix
| # | Area | What "10" means |
|---|---|---|
| 1 | **First 60 seconds** | Player understands the goal, kills things, opens a crate and feels a power spike within 60 s, with no wall of text |
| 2 | **First 3 runs (the hook)** | Each run ends wanting "one more": visible goal (boss bar), affordable repairs, a new thing unlocked or teased |
| 3 | **Crate moment** | Anticipation (rarity tell), payoff (flip, sound, shake), clear decision support (DPS delta, synergy activate/break), fast to read |
| 4 | **Decision depth** | Element synergies, star upgrades, spells, relics, reactor risk create real trade-offs; no dominant strategy |
| 5 | **Combat feel / juice** | Every hit, kill, pickup, upgrade and death has proportionate visual + audio feedback; nothing floaty or silent |
| 6 | **Readability** | Under heavy swarms the player can still read Hope, threats, boss, ring and loot; colour/shape language consistent |
| 7 | **Music & SFX** | Music reacts to danger (calm → intense → boss), SFX are distinct and not fatiguing, mix is balanced, nothing clips |
| 8 | **Art cohesion** | In-game art matches the key art; no leftover programmer art breaking the style (list every offender) |
| 9 | **Progression & pacing** | Upgrade curve, site difficulty, Nightmare/Endless; no grind walls, no trivial stretches |
| 10 | **UX & platforms** | Desktop (1080p/1440p/4K scaling), mobile layout, keyboard shortcuts, settings, pause, save safety |
| 11 | **Performance & stability** | ≥ 58 FPS with 120+ creatures, no console errors, no soft-locks (crate/tip/pause/update overlaps) |
| 12 | **Sellability** | Would a $4.99 Steam buyer keep it past the 2-hour refund window and leave a positive review? Why/why not |

### Report format (Vietnamese, for Duy — TL;DR first, blunt)
1. **TL;DR**: overall score /10, the 3 changes that would most increase sales.
2. Score table (12 areas) with one-line evidence each.
3. **Top 10 problems**, ordered by impact on sales: problem → evidence → concrete fix (files/functions) → effort (S/M/L).
4. **Leftover programmer art / placeholder list** (anything not matching the key art).
5. **Quick wins** (< 1 hour each).
6. Compare with the previous report in `docs/reviews/` (what improved, what regressed).
7. Save as `docs/reviews/REVIEW_v<version>.md`.

Be specific and honest. "Good" without evidence is not allowed; every criticism needs a fix.
