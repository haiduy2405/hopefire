# Headless test scripts (Playwright + Chrome)

Serve the repo first: `python3 -m http.server 8765` (repo root). Scripts use `/usr/bin/google-chrome`; on Windows change `executable_path` or remove it.

| Script | What it does | Output |
|---|---|---|
| `ftue_bot.py` | Brand-new player bot (fresh save, clicks tips, opens crates, picks left card) — measures first-run pacing | log + `/tmp/ftue/*.png` |
| `crate_shots.py` | Crate 2.0 phases desktop + mobile (closed → flip → choose → hover → element info → pick) | `/tmp/crt_*.png` |
| `feel_check.py` | ★ upgrade pop, module drop-in, kill streak, Hope hit, death sequence, music state | `/tmp/feel_*.png` |
| `music_render.py` | Renders each music mode offline (menu / calm / mid / intense / boss) to WAV, prints peak & RMS | `/tmp/mus_*.wav` |
| `store_screens.py` | 1080p store screenshots (only after Duy approves the game) | `store/screens/` |
| `trailer_frames.py` | Deterministic 30 fps frame capture for the trailer (only after approval) | `/tmp/tr2/` |

Deterministic time: several scripts stub `performance.now`/`requestAnimationFrame` and call `__step(ms)` so frames are exact regardless of machine speed.
Balance: `python3 tools/sim/run.py --runs 2`.
