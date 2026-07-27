# avatar_system — Coach Avatar gamification

Duolingo-style streak system. A coach character appears in states that mirror
the member's momentum. Logic lives in [`avatar_logic.js`](./avatar_logic.js).

## Build

`_build_avatars.mjs` (repo root) slices the sprite sheets in the `Avatar/` folder
into individual poses under `public/avatars/{coach}/{pose}.png`. Re-run it after
dropping in a new sheet.

## Source sheets

Both sheets were exported with the transparency checkerboard **rendered as real
pixels** — 0% of either file is actually transparent. The build script keys the
background out by matching strict neutral grey inside the checker's brightness
range; the artwork is warm-toned throughout (even the cream tank top reads warm,
not neutral), so the figures survive intact.

| File | Result |
|---|---|
| `maya1.png` | ✅ 16 poses, all clean. 4x4 grid, labels in each cell's bottom band. |
| `idan 1.png` | ⚠️ 6 poses. 5 clean; `energetic` keeps checker artefacts inside the golden aura — the glow is semi-transparent over the checker, so those pixels are gold-tinted and can't be keyed as neutral. Needs re-export. |
| `sara1.png` | ❌ Unusable. A promotional mockup: dark background, baked-in bottom nav, only 3 poses, and the third figure is a different woman entirely. Needs regenerating as a clean sheet. |

## Poses available

- **maya** — basic, energetic, empathetic, celebrate, streak_flame, trophy,
  clap, thumbs_up, wave, lets_go, wink, offer_hand, streak_lost, rest,
  level_up, meditate
- **idan** — basic, energetic, empathetic, celebrate, lets_go, rest
- **sara** — none yet

## What to ask for on the next generation

Export with **real alpha**, not a rendered checkerboard — that single change
removes all the keying guesswork. Failing that, a flat solid colour well outside
the artwork's palette (strong green or magenta) keys perfectly.

Keep the same canvas, character scale and vertical position across every pose,
so swapping frames in the app never makes the character jump.

Character DNA and the full pose library are in `CHARACTER_PROMPTS.md`.

## Integration sketch
```js
import { getCoachView } from '@/avatar_system/avatar_logic'
const { state, image, message, isMilestone } = getCoachView(member, 'maya')
// render <img src={image}/> + a bubble with {message}; celebrate if isMilestone
```
