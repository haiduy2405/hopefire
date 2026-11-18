# Gamepad support — design (approved by Duy, approach 3)

**Intent / why:** play HOPEFIRE with a controller (Duy tests with a Flydigi Vader 4 Pro, XInput mode) and earn Steam's "Controller support" tag.
**Goals:** every screen playable without mouse/keyboard: title, slots, options, hub (repairs), crate cards, lock mini-game, loadout, pause, ending/cutscene skip, in-battle actions.
**Non-goals:** analog aiming, remapping UI, gyro, mobile. **Anti-goal:** breaking mouse/keyboard/touch play.
**Approaches considered:** (1) virtual mouse cursor — cheap, bad menus; (2) pure focus navigation — no enemy marking; (3) hybrid — chosen.
**Design (my calls marked):**
- New `src/pad.js`, loaded after `ui.js` (before `title`), standard-mapping Gamepad API polled per frame.
- Menus: D-pad/left stick moves focus to the nearest visible `button`/`.card`/`.diff`/`[data-el]` in that direction (spatial); A = click; B = back/close (clicks the visible back/close button); focused element gets a `.padfocus` outline. Navigation only active once a pad input was seen; any mouse move/key hides it. (call)
- Battle: A = open crate / lock tap / confirm tip; stick or LB/RB cycles mark target (nearest to stick direction); Start = pause; Y = loadout; X = reactor mode; RT/LT or Back = speed toggle. (call)
- Prompts switch glyphs (A/B/X/Y vs ✕/○/□/△) by `gamepad.id`; small hint bar shown when a pad is connected. (call)
- Rumble via `vibrationActuator` on hit/crate/boss, setting in Options (default on). (call)
- Pad inputs only synthesize existing handlers (`click()`, existing functions) — no gameplay logic duplicated.
**Left to the builder:** exact focus-search heuristic, hint-bar styling, headless fake-pad test harness.
