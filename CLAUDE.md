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
`data, core, i18n, audio, music, voice, render, sprites, game, react, crew, horde, threat, ship, spells, relics, progress, cutscene, update, crate, ui, title, main` (classic scripts sharing globals; keep the order).
- Balance numbers live in `src/data.js` (CH_HP, CH_DMG, NM, UPG, UPG2, BOSSES, SPAWN_TABLE…).
- Sprites: `python tools/sprites/build.py` → `assets/sprites.png/.json/.js` (procedural pixel art; code fallback when a sprite is missing). See `docs/ASSETS.md`.
- Save: 3 slots `localStorage['hopefire_slot_1..3']` (per-slot `meta`, merged with `defMeta()` in `src/core.js` — add new fields there with defaults, never rename keys) + global `hopefire_settings` (`SETTINGS`, aliased as `meta.set`). Legacy `hopefire_v1` is migrated to slot 1 once and kept as backup. Boot → `titleScreen()` (src/title.js); `SLOT=0` on the title screen.

## Release routine (every version)
1. Bump `window.HF_VERSION` in `index.html` **and** `version.json` (same number; notes = player-facing English). `tools/bump.ps1` does both.
2. Add an entry to `CHANGELOG.md`; tick `docs/ROADMAP.md`.
3. `node --check src/*.js`, run headless tests (below), then commit + push to `main` (GitHub Pages serves it; in-game popup tells players to update).
4. `git pull` in `D:\GITHUB\HOPEFIRE`.

## Testing
- Serve the repo: `python -m http.server 8765`, test with headless Chrome (Playwright). Never test via file:// for update/fetch features.
- Balance: `python tools/sim/run.py --runs 2` (bot plays story + all Nightmares). Current target/result: story ~75–110 min, everything ~3.5 h, no stage needing >~15 runs.
- Full review procedure: `docs/REVIEW_PROMPT.md`; last report `docs/reviews/REVIEW_v0.13.4.md` (7.2/10; top gaps: no real playtest data, Steam path, replay value, FX clutter at 150 creatures, phone layout).

## Business / legal (see docs/BUSINESS_LEGAL.md)
Sell as an individual; W-8BEN (VN–US treaty not in force → 30% withholding on US-customer revenue); VN tax-exempt under the yearly revenue threshold but must keep records/declare; Decree 147/2024 avoided by offline play + VN region lock; **disclose AI-generated content on Steam**; Steam build must disable the online update check.

## Duy's standing rules
- Difficulty: 4 levels planned (Easy/Normal/Hard/Hell). Perfect **Normal** first; build the others only after Normal is approved.
- Use free, commercially-licensed tools where possible (TTS: Kokoro Apache-2.0 + Chatterbox MIT).
- Game must hook players from the very first runs (gameplay + feedback + FX + animation + music + sound).
- **No trailer / store screenshots until Duy plays and approves the finished game.**
- Duy plans **more game modes beyond Story** later (not yet specified). Keep run-rule systems (wave events, elites, rank in `src/threat.js`) driven by flags on `R` (`R.endless`, `R.night`, …) so new modes can reuse or switch them.
- Keep Electron for desktop (Tauri/Rust considered and rejected).
- Work carefully: future AI reviews will build on this (docs/REVIEW_PROMPT.md).
- Update README.md ("Đã/đang/sẽ") + this file after every big step — they are the handoff for any new Claude account.

## Working environment (how the previous Claude worked — reuse it)
- **Cloud workspace:** clone `haiduy2405/hopefire` (attach the repo with access=push), edit, test headless (Playwright + `/usr/bin/google-chrome`), push to `main`. The local test server dies often → restart: `setsid nohup python3 -m http.server 8765 &`.
- **Duy's PC (Windows, RTX 3060 Ti)** via the Claude desktop app bridge: Desktop Commander `start_process` (PowerShell) + `device_stage_files` / `device_commit_files`. Connected folders: `D:\GITHUB\HOPEFIRE`, `D:\DOWNLOADS`. After every push: `cd D:\GITHUB\HOPEFIRE; git pull; powershell -ExecutionPolicy Bypass -File tools\desktop\package_win.ps1` → `build\HOPEFIRE\HOPEFIRE.exe` (Desktop shortcut "HOPEFIRE (test)"). Long commands: run detached (`Start-Process ... *> build\x.log`) and poll the log (bridge calls time out at ~80 s).
- **Voice:** `tools/voice/gen_lines.py` on the PC (venvs `D:\AI\hopefire_tts\kokoro` [needs torch ≥2.6 cu124] and `...\chatter`) → `build\vo_raw` → stage to the cloud → `tools/voice/post.py` (ffmpeg) → `assets/vo/`.
- **AI art pipeline:** Claude in Chrome on Duy's browser → ChatGPT (his Google account; same chat "Create Pixel Art Key Art" keeps the style) → ask for a sprite sheet on flat magenta #FF00FF, same pixel-art style as the existing key art → download to `D:\DOWNLOADS` → stage → `python tools/sprites/import_ai.py` (`--strict` if purple parts get keyed out) → `tools/sprites/build.py`. Chrome may block repeated auto-downloads; retry later.
- **Suno:** Pro works now (menu/boss/ending tracks in assets/music, v0.14.1); generate at suno.com/create (Advanced, v6 Pro), Cloudflare CAPTCHA needs Duy to tick it; download MP3 uses monthly credits.
- **Balance check after any gameplay change:** `python3 tools/sim/run.py --runs 2` (bot marks carriers/boss, simulates crate locks at ~70% skill) + `tools/test/ftue_bot.py` (first run).
- **Duy's style:** gives ideas as hints only ("bạn tự tính cho tối ưu"); expects you to decide, build, test, release, rebuild on his PC, then report in short Vietnamese with what to playtest. Send him things he must see (demos, audio) with SendUserFile.

## Status & next steps
See README.md → "Đã làm / đang làm / sẽ làm" (kept current). Current: **v0.16.0** (Manual Cannon `manual` + Spells 2.0 + Overdrive + swarm packs: src/spells.js rewritten (R.sx effects, drawSpellFx), manualFire in game.js, swarmTick in horde.js, new sfx in audio.js; balance retuned CH_HP/NM.hp/cores x0.55; add UI strings via tools/i18n/add_keys.py) — before that **v0.15.0** (8 languages: src/i18n.js + assets/lang/*.js, built by tools/i18n/build_lang.py from tools/i18n/keys.json + tr/<code>.txt; add a new UI string → append it to keys.json and a line `idx|text` to every tr/*.txt, rebuild; EN is the key, proper names stay English) — before that **v0.14.2** (new ship cannon art, title music at boot, batched horde drawing, i18n groundwork) — before that **v0.14.1** (Suno music files for menu/boss/ending in assets/music, CH_HP +12%) — before that **v0.14.0** (Ships & Mutators src/ship.js, crowd FX budget, phone bar, F3 FPS overlay, save backup/export) — before that **v0.13.4** (menu perf: transform-only animations, no drop-shadow filters on big panels; smaller crate art) — before that **v0.13.3** (Mender + Leaper creatures) — before that **v0.13.2** (AI sprites for the 5 new creatures) — before that **v0.13.1** (framed icons in loadout/build bar) — before that **v0.13.0** (new creatures, wave events, elites, Surge Cells, rank; src/threat.js loads after horde.js) — before that **v0.12.1** (hub fits one screen: .hubp header/body/footer) — before that **v0.12.0** (whole-game AI-art UI kit restyle, one-row crate cards, polished floating text/crit FX) — before that **v0.11.1** (pad focus falls back to BEGIN RUN) — before that **v0.11.0** (AI-art HUD: hope bar, boss bar, crate art, panel, plaques, rarity card frames — assets/ui, tools/sprites/import_ui.py) — before that **v0.10.1** (fullscreen default + Window mode option; hover layout-jitter fix — tools/test/shift_test.py) — before that **v0.10.0** (polish: crate scene 2.0, focus/scroll memory, hover/press layer, text stacking) — before that **v0.9.12** (pad card focus = hover preview) — before that **v0.9.11** (key labels follow pad/keyboard: spKey/confirmKey) — before that **v0.9.10** (pad: first card focused) — before that **v0.9.9** (fix lock mini-game double zoom, equal-size cards) — before that **v0.9.8** (gamepad support src/pad.js: loaded after ui.js; test with fake navigator.getGamepads, see tools/test/pad_test.py) — before that **v0.9.7** (ending twist: the alien planet is Earth 4,000 years in the future — cutscene.js earth phase + VO ending_3..7; crew attack-pose sprites) — before that **v0.9.6** (AI art for crew/carrier: assets/ai/crew_*, carrier; code-drawn fallback kept) — before that **v0.9.5** (voice-over done: tools/voice/gen_lines.py + post.py; crate lock mini-game + horde/surges; crew src/crew.js + carriers/free crates + bounty; reactions src/react.js + tap-to-mark; reactor explained; crew/carrier art done in 0.9.6) (title screen, 3 save slots, options, loadout; difficulty: Normal only until approved) (Crate 2.0, adaptive music, feel pass, FTUE). Waiting for Duy's playtest feedback. Voice/file-music system ready (src/voice.js, docs/VOICE_SCRIPT.md) — needs Suno Pro working on account haiduy2405 and ElevenLabs Starter+ for commercial rights. Next: independent AI review (docs/REVIEW_PROMPT.md v2) → fixes; Suno tracks for menu/boss if Duy buys Suno Pro. Test scripts: tools/test/.
