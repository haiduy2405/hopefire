# HOPEFIRE — project memory (read me first)

Owner: Duy (handle **duyluma**), GitHub `haiduy2405/hopefire` (private). Local clone: `D:\GITHUB\HOPEFIRE` (git remote uses account **haiduy2405**, not duynh2405).
Talk to Duy in **Vietnamese**, concise, TL;DR first, blunt. He is a video editor/filmmaker, not a programmer.

## Goal
**Make money.** Every decision maximises the chance of profitable sales. Target: Steam, **$4.99**, premium (no IAP, no paid loot boxes), **English only**, **Vietnam region-locked**. Then Android (paid). Music/packaging/Android come later; graphics quality only matters as far as it sells.

## What the game is
Incremental tower defense. Crashed ship S.V. HOPE on an alien planet; blind creatures only sense you inside the **detection ring**; **HOPE** bar = HP + timer; open **salvage crates** (pick 1 of 3: module / spell / relic); spend **Xeno-cores** on permanent repairs; beat the site boss → next site (5 sites) → ending → Endless. Nightmare mode per cleared site + Advanced Repairs (tier 2, Overclock ∞).
Inspired by *Booster Pack Heroes* (Steam). See `docs/DESIGN.md`.

## Code
Vanilla JS, no build step, no dependencies. `index.html` loads `assets/sprites.js` then `src/*.js` in this order:
`data, core, audio, render, sprites, game, spells, relics, progress, cutscene, update, ui, main` (classic scripts sharing globals; keep the order).
- Balance numbers live in `src/data.js` (CH_HP, CH_DMG, NM, UPG, UPG2, BOSSES, SPAWN_TABLE…).
- Sprites: `python tools/sprites/build.py` → `assets/sprites.png/.json/.js` (procedural pixel art; code fallback when a sprite is missing). See `docs/ASSETS.md`.
- Save: `localStorage['hopefire_v1']`, merged with `defMeta()` in `src/core.js` — add new fields there with defaults, never rename keys.

## Release routine (every version)
1. Bump `window.HF_VERSION` in `index.html` **and** `version.json` (same number; notes = player-facing English). `tools/bump.ps1` does both.
2. Add an entry to `CHANGELOG.md`; tick `docs/ROADMAP.md`.
3. `node --check src/*.js`, run headless tests (below), then commit + push to `main` (GitHub Pages serves it; in-game popup tells players to update).
4. `git pull` in `D:\GITHUB\HOPEFIRE`.

## Testing
- Serve the repo: `python -m http.server 8765`, test with headless Chrome (Playwright). Never test via file:// for update/fetch features.
- Balance: `python tools/sim/run.py --runs 2` (bot plays story + all Nightmares). Current target/result: story ~75–110 min, everything ~3.5 h, no stage needing >~15 runs.
- Full review procedure: `docs/REVIEW_PROMPT.md`; last report `docs/reviews/REVIEW_v0.4.0.md`.

## Business / legal (see docs/BUSINESS_LEGAL.md)
Sell as an individual; W-8BEN (VN–US treaty not in force → 30% withholding on US-customer revenue); VN tax-exempt under the yearly revenue threshold but must keep records/declare; Decree 147/2024 avoided by offline play + VN region lock; **disclose AI-generated content on Steam**; Steam build must disable the online update check.

## Status & next steps
Current: **v0.8.1** — AI-assisted art (ChatGPT image gen in Duy's browser → magenta sheet → `tools/sprites/import_ai.py` → `assets/ai/` → build.py) for ship, cannon, turrets, 8 creatures, 5 bosses, ground props. Store assets done: `store/` (key art, logo, all capsules, 7 screenshots, trailer_v1_silent.mp4), `docs/STEAM_PAGE.md`. Desktop build: `tools/desktop/package_win.ps1` → `build/HOPEFIRE/HOPEFIRE.exe`.
Next:
1. **Duy only:** Steamworks account (identity, $100, bank, W-8BEN tax interview). Then Claude fills the store page from docs/STEAM_PAGE.md → Coming Soon ASAP.
2. Trailer music (licensed/royalty-free) — trailer is silent.
3. Steam SDK (steamworks.js) achievements + cloud save; demo build (sites 1–2) for Next Fest.
4. Art still procedural: drones, loot orbs, crate, spell FX, cutscene planet; ground tiles for sites 2–5.
