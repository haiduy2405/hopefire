# Changelog

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
