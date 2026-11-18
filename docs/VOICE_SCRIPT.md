# HOPEFIRE — Voice-over script (AI voice, ElevenLabs Starter or better = commercial licence)

Two voices, English only. Keep every line short (≤ 4 s) so it never blocks play. Files: `assets/vo/<id>.mp3` (mono, 44.1 kHz, −16 LUFS, trimmed silence). The game shows the text as a subtitle and plays the file if present (`src/voice.js`).

## Cast
- **HOPE** — the ship's AI. Calm, warm, slightly synthetic female voice; gets glitchy/strained when Hope is low. ElevenLabs settings: stability 0.55, similarity 0.75, style 0.2. Light post FX: band-pass 200–6k Hz + tiny chorus (done in-engine).
- **COMMANDER** — the stranded astronaut (the player). Tired, dry humour, determined; 30–40 y/o, slightly husky. Stability 0.4, style 0.45 (more emotion).

## Lines
| id | who | when | line | delivery |
|---|---|---|---|---|
| intro_1 | HOPE | intro, hull breach | "Hull breach. Engines failing. Brace for impact." | urgent, alarm-calm |
| intro_2 | COMMANDER | intro, after crash | "...Where... am I?" | groggy, pained |
| intro_3 | HOPE | intro, eyes in the dark | "Movement detected. They can't see us... yet." | whisper |
| tut_ring | HOPE | first run start | "They're blind. They only sense us inside the light." | calm, instructive |
| tut_crate | HOPE | first crate | "Salvage crate. Let's see what survived." | hopeful |
| first_mod | COMMANDER | first module placed | "Okay. That'll do." | dry relief |
| synergy | HOPE | synergy activates | "Systems linked. Output rising." | pleased |
| star_up | COMMANDER | ★ upgrade (rare, cooldown 60 s) | "Better. Much better." | satisfied |
| legendary | COMMANDER | legendary card revealed | "Now *that's* what I needed." | excited |
| low_hope | HOPE | Hope < 25 % (cooldown 30 s) | "Hope critical. I... can't hold much longer." | strained, glitchy |
| cell | COMMANDER | energy cell picked at low Hope | "Come on... stay with me." | breathless |
| second_wind | HOPE | Second Wind revive | "Rerouting emergency power. One more chance." | determined |
| boss_1 | HOPE | Devourer appears | "Massive signal. It swallowed our navigation core." | tense |
| boss_2 | HOPE | Brood Mother appears | "Brood signature. She's birthing more as she comes." | tense |
| boss_3 | HOPE | Crusher appears | "Armoured target. Strike when it stops charging." | tactical |
| boss_4 | HOPE | Phantom Warlord appears | "It's blinking through the dark. Watch the edges." | uneasy |
| boss_5 | HOPE | The Origin appears | "The source of it all. It feeds on our light." | dread |
| boss_down | COMMANDER | any boss killed | "Got you. Part recovered." | triumphant, breathless |
| death | HOPE | ship falls | "Hope... fading..." | dying glitch |
| repair | COMMANDER | first time in repair menu | "Patch her up. We go again." | resolute |
| new_site | HOPE | new site unlocked | "Engines at partial power. We can jump." | hopeful |
| nightmare | HOPE | Nightmare run start | "Readings off the scale. This is a bad idea." | wary |
| ending_1 | HOPE | ending, liftoff | "All systems restored. Hope at one hundred percent." | emotional |
| ending_2 | COMMANDER | ending | "Take us home." | quiet, emotional |
| ending_3 | ??? (HOPE, distorted) | ending twist | "You are not the first. You will not be the last." | cold, layered |

## Generation checklist
1. ElevenLabs (paid plan, commercial licence) → Voice Library or Voice Design for both voices; keep the same voice IDs for every line.
2. Generate 2–3 takes per line, pick the best, export MP3 44.1 kHz.
3. Name exactly `<id>.mp3`, put in `assets/vo/`, run the game: `src/voice.js` picks them up automatically.
4. Disclose "AI-generated voices" in the Steam AI content survey.
