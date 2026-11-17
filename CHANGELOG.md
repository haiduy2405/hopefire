# Changelog

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
