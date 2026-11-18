# Changelog

## v0.12.0 — 2026-11-18
- Whole-game UI restyle with the AI-art kit (brass + gunmetal, amber glow): primary/secondary/danger/disabled buttons, tabs, tiles (upgrades, achievements, save slots), chips, spell buttons, tooltips/toasts, every panel (hub, options, pause, loadout, stats, dialogs). 9-slice `border-image` in css/style.css (v0.12 section); assets in `assets/ui/` (btn_*, tab_*, pk_*).
- Crate choice cards always stay on ONE row (even 4 cards); dark scrollbars; compact build bar.
- Floating text redone: heavy font, thick outline, glow, gradient fill for crits/reaction words, ease-out pop + fast-then-slow rise, crit "!" with shock ring; damage numbers a bit larger. Fixed a bug where long-lived hint text (Reactor hint) was scaled ~12x.
- Reactor button no longer overflows; options panel no longer double-framed; no purple ring on upgrade buttons.
- Disclose AI-generated art on Steam.

## v0.11.1 — 2026-11-18
- Pad focus restore: if the focused control disappears or gets disabled after a re-render (bought the last affordable upgrade), focus goes to `#startBtn` (BEGIN RUN) instead of the nearest neighbour (was the 7/25 achievements button). Test: tools/test/begin_test.py.

## v0.11.0 — 2026-11-18
- AI art (ChatGPT, pixel-art key-art style) in `assets/ui/`: crate_closed/opening/open, hud_hope, hud_boss, hud_medal, kit_panel, kit_plaque, card_common/rare/epic/legend. Cut from magenta sheets with `tools/sprites/import_ui.py` (`--hollow` punches the black centre).
- HOPE bar: framed DOM bar (`#hopetrk` sits in the frame hollow), shine sweep, red pulse when low. HUD is 80px tall (arena offset `top=80*UZ` in render.js).
- Boss bar: canvas `drawBossBar()` with frame, damage-chip trail, quarter ticks, armored tint, slide-in.
- Crate scene: 9-slice `border-image` panel, plaque headers, per-rarity card frames, crate image swaps closed → opening → open. CSS asset urls are `../assets/ui/…` (relative to css/).
- package_win.ps1 now also copies assets/ui, assets/vo, assets/music (previously only sprites were packaged).
- Disclose these as AI-generated on Steam.

## v0.10.1 — 2026-11-18
- Electron: starts fullscreen; window mode saved in userData/window.json (fullscreen, borderless frameless, maximized, windowed); Options → Window mode (`HF_WIN` in preload). Borderless recreates the window.
- Build bar has a fixed height (hovering a card no longer wraps/unwraps it and re-centres the panel); hover lifts replaced by in-place scale so the pointer never leaves the hit area at an edge (no flicker). Probe: tools/test/shift_test.py.

## v0.10.0 — 2026-11-18
- Crate scene 2.0: rarity-coloured panel/glow (`--tc`), floating motes while opening, burst rings on reveal, lock mini-game rune ring + needle trail + in-zone highlight, shimmer on rare cards.
- Focus/scroll memory: after any hub re-render (buy upgrade, etc.) the cursor stays on the same item and the scroll position is kept (`panelSig`, `padRestore`).
- Interaction layer: hover tick, press ripple, idle pulse on primary buttons.
- Floating word texts stack upwards (`wordY`) instead of overlapping; STREAK moved below the ring; toasts moved to the right under the tip; compact tip on phones.
- Pad: rumble toggle in Options.

## v0.9.12 — 2026-11-18
- Gamepad: focusing a card fires the same hover preview as the mouse (`padHover` → `mouseenter`/`mouseleave`), so TEAM DPS in the build bar updates while browsing cards with the pad.

## v0.9.11 — 2026-11-18
- Key labels follow the input device: `spKey(i)` / `confirmKey()` (src/core.js, `PADMODE` set by pad.js) show X/Y/B and A (or □△○ ✕ on PlayStation pads) instead of Q/W/E and Space on the spell bar, spell cards, loadout, lock hint and tutorial tips; switch back to keys when the mouse/keyboard is used.

## v0.9.10 — 2026-11-18
- Gamepad: initial focus in the crate chooser is the first card (was the build-bar element chip).

## v0.9.9 — 2026-11-18
- **Fix**: crate lock mini-game was scaled twice on big screens (`.lockwrap` multiplied `--uz` although `#modal` is already zoomed) → panel overflowed with scrollbars and the dial was cropped. Canvas buffer now sized from `getBoundingClientRect`.
- **Cards**: the 3 choice cards are always the same width/height (flex stretch) with the DPS/tag row pinned to the bottom.

## v0.9.8 — 2026-11-18
- **Gamepad support** (`src/pad.js`, standard/XInput mapping, tested design in `docs/superpowers/`): menus use D-pad/left stick with a gold focus ring (A select, B back); battle: A crate / lock-needle, X·Y·B spells, LB/RB or right stick marks targets, LT reactor, RT speed, Back loadout, Start pause; pausing automatically when the pad disconnects. Button hints bar (Xbox or PlayStation glyphs), vibration on hits/crates/bosses (Options → Gameplay → Controller vibration). Mouse/keyboard hide the pad UI instantly. Flydigi Vader 4 Pro must be in XInput mode.

## v0.9.7 — 2026-11-18
- **New ending twist**: after liftoff the nav core aligns and the scan sweeps the dust off the "alien" planet — it is **Earth**, 4,000 years in the future (the crew crossed a singularity). Procedural pixel globe in `src/cutscene.js` (buildEarth/earthFrame: ash-brown continents, dead ocean, dust storms, debris ring, scan line), labels "SOL III · EARTH" / "TEMPORAL DISPLACEMENT +4,000 YEARS". Replaces the old "You are not the first" line. 5 new VO lines ending_3..7 (`docs/VOICE_SCRIPT.md`).
- **Crew attack poses**: `assets/ai/crew_<role>_atk` (anchored at the feet, `tools/sprites/import_crew_atk.py`); shown while a crew member attacks (0.28 s). Carrier hitbox slightly larger (r 15).
- Voice tools: `ONLY=id,id` env filter in `gen_lines.py` / `post.py` to regenerate single lines.

## v0.9.6 — 2026-11-18
- **AI art for crew and carrier**: 4 crew sprites (`assets/ai/crew_<role>`, 4 walk frames, hit flash) replace the code-drawn astronauts in battle, in the crate cards and in the Loadout; the element is shown by a coloured pip at the feet. New `carrier` sprite (six-legged pack-beast hauling a golden crate) replaces the re-used brute; carrier radius 13 → 15 to match the bigger sprite. Code-drawn figure stays as fallback when the atlas is missing. Source sheets: `store/crew_v1.png`, `store/carrier_v1.png` (ChatGPT; declare AI art on Steam)

## v0.9.5 — 2026-11-18
- **Voice-over**: 25 lines in `assets/vo/*.mp3` + manifest. HOPE = Kokoro-82M `af_heart` (Apache-2.0), COMMANDER = Chatterbox (MIT) cloned from a Kokoro `am_fenrir` reference with emotion (exaggeration) per line, ??? = HOPE + octave-down layer. Generated on Duy's PC (`tools/voice/gen_lines.py`, venvs in `D:\AI\hopefire_tts`; kokoro venv needs torch ≥2.6 cu124), post-processed here (`tools/voice/post.py`: trim, FX chain, −16 LUFS, mono mp3). Steam: declare AI-generated voices

## v0.9.4 — 2026-11-18
- **Crate lock mini-game** (`src/crate.js` lockStart/lockTap/lockDraw): 3 locks per crate (one per card). A needle sweeps a dial (speed breathes with a sine, faster each lock, random direction); zones: RARE 56° always, EPIC 26° (55%), LEGENDARY 13° (15% + luck). Hit = rarity floor for that card; centre 16% = PERFECT +1 (max Epic). All 3 hit incl. an Epic/Legendary zone = JACKPOT extra card. AFK auto-miss after 3.6 s, Quick open button, Options toggle `SETTINGS.lockGame`. Not shown on the very first crate. Ticks/hit/perfect/miss/jackpot SFX
- **The Horde** (`src/horde.js`): 80→420 non-simulated silhouettes with glowing eyes in packs outside the ring, grows with threat/site/Nightmare, flinches from the light, eyes turn red on ring pulses/OVERDRIVE, ambient growls
- **Surges**: from threat 3 (always on every 3rd threat, 35% otherwise; not during bosses) the horde in one sector crowds the ring for 2.6 s (rumble, banner with direction, red arrows), then 3–16 real creatures charge from there
- Balance: base rarity weights 70/22/7/1.2 → 80/15/4.5/0.7 (locks give the rest); CH_HP sites 2–5 +9%, Nightmare HP +6–11%. Bot (skilled lock play): story 68–78 min, everything 193–222 min, no errors

## v0.9.3 — 2026-11-18
- **Crew** (`src/crew.js`): new crate card type (20% when crew < 3, 10% when full; guaranteed once in run 2+). Guardian (taunts creatures within 66 near the hull, cleave), Hunter (chases MARK → carriers → fast creatures, pounce 2×), Medic (Hope regen 0.25–1%/s, heals crew), Engineer (+30–60% fire rate to the module he tends, rotates every 7 s). Element per crew member → statuses/reactions. HP, DOWN for 8 s then respawn at the hatch, ★ via duplicates. Procedural pixel figures + card portraits (AI art later). Loadout lists crew
- **Carriers**: from ~30 s then every 55–75 s (not during bosses) a carrier circles the ring edge for 15 s then escapes; never attacks; panics when hit. Kill = FREE crate (`R.free`, crate button turns gold). First one pauses with a tip that teaches MARK
- **Bounty**: killing a marked creature drops 2× its scrap
- **Reactor clarity**: button shows mode + short effect, switch banner lists exact % changes, first-time guide is a pausing table (when to use LOW / OVERDRIVE), low-Hope hint pulses the button
- Balance: boss HP +15–25%, CH_HP sites 2–5 +6–9%. Bot (marks carriers/boss): story 75–97 min, everything 182–254 min, no errors

## v0.9.2 — 2026-11-18
- **Elemental reactions** (`src/react.js`): module hits leave a status (Thermal=burn, Cryo=chill, Arc=shock, Nano=nanites, 2.6 s); a second element triggers a reaction (0.9 s cooldown per creature): SHATTER (burn+chill, 1.8× burst + shards), OVERLOAD (burn+shock, explosion + knockback), SUPERCONDUCT (chill+shock, +25% damage taken 3 s + slow), CONTAGION (nano+any, spreads status to 3, repairs a bit of Hope). Status pips, big reaction text, unique SFX, first-time tips
- **Focus mark**: tap/click a creature → modules prioritise it, +25% damage, rotating red reticle
- Crate cards: removed the BEST DPS ribbon (choices were trivial); cards show reaction-unlock badges; element popover lists reactions
- Balance: CH_HP sites 2–5 +12%, Nightmare HP +10%. Bot: story 90 min, everything 198 min, no errors

## v0.9.1 — 2026-11-18
- **Title screen** (`src/title.js`): animated key-art background, embers, logo, Continue / Save slots / Options / Credits / Quit (desktop)
- **3 save slots** (`hopefire_slot_1..3`) + global settings (`hopefire_settings`); legacy save auto-migrated to Slot 1 (old key kept as backup); rename, delete (2-step confirm), new game with name + difficulty (Normal only; Easy/Hard/Hell shown as coming soon)
- **Options** with tabs (Audio, Video: interface size/fullscreen/screen flashes/shake/damage numbers, Gameplay, Controls); used from title, hub and pause
- **Loadout panel** (Tab, ☰ button, tap module chips): modules with DPS share, synergy tiers, spells, relics
- Pause menu: Options, Loadout, Abandon run, Quit to title (banks collected cores); hub shows slot name/difficulty + back to title
- Voice-over + Suno file-music system ready (`src/voice.js`, `docs/VOICE_SCRIPT.md`); free TTS setup script (`tools/voice/setup_tts.ps1`: Kokoro + Chatterbox)

## v0.9.0 — 2026-11-18
- **Adaptive music** (`src/music.js`, procedural WebAudio, 100 BPM A-minor): pad → arp → hats → bass/kick → snare → double-time layers follow intensity (rushing creatures, threat, endless); boss mode (dark progression, brass stabs, toms); menu mode (pad + bells); low-Hope heartbeat; ducking while paused; key-matched stingers (wave, synergy, victory, defeat); Music volume slider; shared compressor bus
- SFX: loot pickup pitch ladder (pentatonic combo), hit/kill variation, star-up fanfare, module drop thud, streak sting, crate crack/flip by rarity
- Feel: ★ upgrade pop + "★2 → ★3" + burst, new modules drop in with dust, kill streak counter (6+), Hope bar shake/flash on damage, death sequence (slow-mo, ship explosions, desaturate) before the end panel
- FTUE: in the very first run the 2nd crate always offers a same-element module (synergy taught by doing)
- End panel: Xeno-core count-up, boss progress bar with best marker, "N repairs ready to install"
- `docs/REVIEW_PROMPT.md` v2 (hook/feel/clarity/sellability, 12 scored areas) + `tools/test/` headless scripts saved in repo
- Balance bot: story 106 min, everything 229 min, no errors

## v0.8.2 — 2026-11-18
- **Crate 2.0** (`src/crate.js`): rarity-tell crate (glow colour + shake strength), light rays on open, staggered card flips with rarity sounds, legendary screen shake/flash
- Cards: element badge + pips (new pips glow), **team-DPS delta**, synergy **ACTIVATES** / **breaks** badges, ★ upgrade and replace tags, BEST DPS ribbon, stat line (dmg · rate · range · area)
- Build bar above the cards (slots, element meters, team DPS) with hover preview of each card
- Element info popover (crate badges, build bar, in-game synergy chips): passive, tier 2/4 bonuses, all modules of that element with owned stars
- In-game synergy activation celebration (banner, rings, particles, sound); keys 1–5 pick cards, Space opens the crate
- README rewritten as full handoff for any new Claude session

## v0.8.1 — 2026-11-18
- AI-assisted sprites for all 5 bosses (+40% size) and 12 ground props (rocks, crystals, glowing plants, wreckage); warm crash-site ground
- UI scales with screen size (`--uz`), softer plant glows
- Desktop build: `tools/desktop/package_win.ps1` (Electron, icon, no online update check)
- Store: 7 screenshots (1080p), trailer v1 (42 s), `docs/STEAM_PAGE.md`

## v0.8.0 — 2026-11-18
- **New art direction** matching the Steam key art: AI-assisted hi-res pixel sprites for the ship, heat-ray cannon, 4 turret types and all 8 creatures (procedural walk frames, auto eye detection) — `tools/sprites/import_ai.py`
- Juice: hit sparks, goo decals that fade, death flash + dissolving corpses, crit hit-stop, boss kill hit-stop + slow-mo + fireworks, engine embers, dust motes, warm flickering light pool, cinematic vignette, damage-number pop, softer smoke
- Store: key art, logo and every Steam capsule size in `store/`

## v0.7.0 — 2026-11-18
- Art wave 2: 5 boss sprites (4-frame + hit flash; Devourer spines, Brood sacs, Crusher plates, Warlord crown, Origin veins), pixel salvage crate (closed/open), loot sprites (scrap, core, cell)
- 33 pixel icons replace emoji: 8 relics, 5 spells, 16 module class×type icons (cards, chips, spell bar)
- Card frames: rarity tint, inner frame, rarity gem; relic banner no longer relies on emoji
- docs/STORE_ART.md: Steam capsule sizes + ChatGPT image prompts

## v0.6.0 — 2026-11-18
- **Module identity per type**: Thermal (+30% dmg, slower), Cryo (+25% fire rate, 12% chill), Arc (every hit arcs for 35%), Nano (hits restore Hope)
- **☠ Nightmare** for every cleared site: per-site creature multipliers, ×2.5 Xeno-cores, better crate luck
- **Advanced Repairs** (tier 2): Critical Strikes, Second Wind, Core Refinery, Long Barrels, Deep Salvage, Field Kit, Capacitors, Relic Bay, Bounty Hunter, Cell Recycler, Overclock ∞
- 6 achievements (Nightmare ×5, Overclock 25); upgrade cards show next-level effect
- Simulated playtime: story ~75–110 min, story + all Nightmares ~3.5 h (bot), plus Endless
- docs/BUSINESS_LEGAL.md: Steam, US/VN tax, VN game law, AI disclosure, net revenue estimate

## v0.5.0 — 2026-11-18
- **Pixel-art pipeline**: procedural sprite builder (`tools/sprites/build.py`) → atlas; integer-scaled crisp sprites with code fallback
- Art wave 1: crashed ship, 8 creatures (4-frame walk + hit flash), module housings ×4 types, drones, seamless ground for 5 sites, rocks, debris
- Pause (Esc / P / button), auto-pause on tab switch
- Damage numbers merge per target
- Warp start (cleared sites begin at Threat 5); compact chips on phones
- Fixed: duplicate cards in one crate, cores lost when updating mid-run, HUD visible behind menu, speed reset each run, endless boss tip

## v0.4.0 — 2026-11-17
- New creatures: **Spitter** (ranged acid), **Bloater** (explodes; shoot it to blast its friends), **Wisp** (flying, half damage from mortars), **Phantom** (cloaked until close), **Splitter** (bursts into skitters)
- Unique boss per site: Devourer, Brood Mother (spawns crawlers), Crusher (armored, vulnerable only when stunned after a charge), Phantom Warlord (blinks + escort), The Origin (3 phases: minions → drains light → enraged acid volleys)
- 4 Drone modules (hunt anywhere in the ring)
- 8 relics (passive, max 3 per run) from crates
- 19 achievements (+50 cores each), stats panel, settings (volume, shake, damage numbers, default speed)
- Spell Autocast upgrade (+ AUTO toggle)
- Ending sequence after The Origin + Endless Wastes mode (boss every 10 threat)
- Relics/spells only appear once you have 2 modules; per-site difficulty table tuned by simulation (~26 runs to finish)

## v0.3.1 — 2026-11-17
- In-game update check (version.json): update popup with "Update now" / "Later" (collapses to a small button)
- Optional forced update via `minVersion`
- Version shown in menu + HUD; all assets cache-busted with `?v=<version>`
- `tools/bump.ps1` to bump index.html + version.json in one step

## v0.3 — 2026-11-17
- Repo structure, 5 spell cards, in-engine intro cutscene, docs

## v0.2 — 2026-11-17
- Sci-fi theme: detection ring, darkness, Hope, salvage crates, reactor, boss, audio, tutorial

## v0.1 — 2026-11-17
- Core loop prototype (Pack Siege)
