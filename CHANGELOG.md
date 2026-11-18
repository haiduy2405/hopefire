# Changelog

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
