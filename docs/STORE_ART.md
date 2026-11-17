# Steam store art — ChatGPT (GPT image) prompts

Steam requires these images (check exact sizes in Steamworks → Store Assets before uploading):
| Asset | Size | Notes |
|---|---|---|
| Header capsule | 920×430 | Most important. Logo must be readable at small size. |
| Small capsule | 462×174 | Mostly logo. |
| Main capsule | 1232×706 | Front page / featured. |
| Vertical capsule | 748×896 | Seasonal sales. |
| Library capsule | 600×900 | Steam library grid. |
| Library hero | 3840×1240 | Background only, **no text/logo**. |
| Library logo | ~1280×720, transparent PNG | Logo only. |

Rules: capsules may contain only the art and the game name/logo (no "Sale", review quotes, award badges).
**Disclose AI** in the Steam content survey ("pre-generated" art: capsules/key art made with AI).

## Workflow
1. Generate the **key art** (prompt A) in a wide format.
2. Ask ChatGPT for the same scene re-cropped for each size (prompt B). Generate the logo separately (prompt C).
3. Put the logo on the art yourself (Photoshop/CapCut/Canva) — AI text is often misspelled.
4. Check at 25 % zoom: can you still read HOPEFIRE and see the ship + glowing eyes? If not, simplify.

## Prompt A — key art
> Pixel-art style video game key art, 3/4 top-down view, night on a dark alien planet. A small crashed silver spaceship ("S.V. HOPE") with a cracked hull and a glowing orange heat-ray cannon on top sits in the centre of a circle of warm light. Beyond the edge of the light, total darkness filled with dozens of pairs of glowing yellow-green eyes of blind alien creatures, a few silhouettes of spiky bug-like monsters stepping into the light. One huge many-eyed boss creature looms in the background shadow. Small defensive turrets around the ship fire beams of orange, ice-blue, yellow electric and green light. Floating gold scrap and purple crystal loot. Strong contrast: warm orange light vs cold black-blue darkness. Mood: lonely, tense, hopeful. Crisp pixels, limited palette, no text, no logo, wide 16:9 composition with empty space on the left third for a title.

## Prompt B — re-crop
> Recompose the same image as a [920×430 / 600×900 vertical / 3840×1240 ultra-wide background without any creatures in the centre] version. Keep the same style, ship and lighting. No text.

## Prompt C — logo
> Game logo text "HOPEFIRE", bold chunky pixel-font letters, warm orange-to-yellow gradient with a small flame replacing the dot/top of the letter I, dark outline, slight glow, on a transparent background. Exactly these 8 letters: H O P E F I R E.

## Screenshots (later, v0.8)
Take 5–8 at 1920×1080 in-game: big swarm at the ring edge, crate opening with a Legendary card, boss fight, menu with repairs, Nightmare site. Real gameplay only (Steam rule).
