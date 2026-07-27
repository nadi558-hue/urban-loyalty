# avatar_system — Coach Avatar gamification

Duolingo-style streak system. A coach character appears in states that mirror
the member's momentum. Logic lives in [`avatar_logic.js`](./avatar_logic.js).

## Build

`_build_avatars.mjs` (repo root) slices the sheets in the `Avatar/` folder into
`public/avatars/{coach}/{pose}.png`. Re-run it after dropping in a new sheet.

## Current assets — 43 poses

| Coach | Poses | Source | Backdrop |
|---|---|---|---|
| **maya** | 16 ✅ | `maya sheet 1.png` 1792×2400, even 4×4 | green |
| **sara** | 16 ✅ | `sara sheet 1.png` 1760×2376, even 4×4 | white |
| **idan** | 11 | `idan sheet 1.png` 2400×1792, 6×2 | green |

maya and sara have the full set:
`basic energetic empathetic celebrate streak_flame trophy clap thumbs_up
wave lets_go wink offer_hand streak_lost rest level_up meditate`

idan is missing `streak_flame clap thumbs_up streak_lost level_up` — his sheet
came back 6×2 with the generator's own subset rather than the 4×4 that was
asked for.

## Keying

Asking for a solid backdrop instead of transparency was the fix. Earlier sheets
were exported with the transparency checkerboard rendered as real pixels (0% of
the file actually transparent), which needed fragile grey-matching.

- **Green** keys on `g >= r`. Skin, the burgundy and olive kit, the gold trophy
  and the warm glow are all red-dominant, so the semi-transparent golden aura
  survives while its green-blended fringe is removed. A looser threshold left a
  green halo around the aura.
- **White** keys tightly on near-pure neutral white, so sparkles and skin
  highlights survive.

## idan's sheet needed manual windows

His figures don't sit on an even grid: in row 1 the celebrate figure's raised
arms touch its neighbour, so an even split cut it in half. The x-windows in the
build script were measured from each row's alpha profile. Note the celebrate
window is far wider than the torso because the arms reach out either side.

Row 1 cell 4 is a second hand-on-chest variant and is dropped rather than
shipped as a near-duplicate of empathetic.

## Next sheet

Prompt sheets: `SARA_PROMPT.md`, `MAYA_PROMPT.md`, `IDAN_PROMPT.md`.

Keep asking for a **solid green `#00B140` backdrop** — it keyed cleanly on the
first try. The one thing to push harder on is the **grid**: ask explicitly for
4 columns by 4 rows and even spacing, since two of three sheets came back with
their own layout.

## Integration sketch
```js
import { getCoachView } from '@/avatar_system/avatar_logic'
const { state, image, message, isMilestone } = getCoachView(member, 'maya')
// render <img src={image}/> + a bubble with {message}; celebrate if isMilestone
```
