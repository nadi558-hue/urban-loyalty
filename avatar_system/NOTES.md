# avatar_system — Coach Avatar gamification

Duolingo-style streak system. A coach character appears in 3 states that mirror
the member's momentum. Logic lives in [`avatar_logic.js`](./avatar_logic.js).

## Characters
- **maya/** — brown hair, burgundy outfit (source: `avatar 2 girl brown hair.png`)
- **sara/** — black curly hair, olive outfit, Mediterranean look (source: `avatar 1 girl black hair.png`)

## States (per character)
| file | state | when shown |
|---|---|---|
| `basic.png` | relaxed, confident smile | default daily home |
| `energetic.png` | dynamic pose + gold aura | active streak (3+ days) |
| `empathetic.png` | soft, hand on heart | missed a day, Streak Freeze active |

## ⚠️ Asset status — these are MOCKUP CROPS, not final sprites
The two source PNGs are full-screen **design mockups** (2528×1688) with the app
UI **baked in** (greeting text, 65% weekly arc, 🛡️ label, bottom nav). The files
here were cropped from the 3 panels and still contain some of that baked text.

They are good **reference** for pose/energy/message, but for production we need
**clean per-state character art** — transparent background, no text, no nav —
exported at ~900px tall, then copied to `public/avatars/{coach}/{state}.png`
(the path `avatarImage()` returns). Options: re-export from the design source,
or run background-removal on tight character crops.

## Integration sketch
```js
import { getCoachView } from '@/avatar_system/avatar_logic'
const { state, image, message, isMilestone } = getCoachView(member, 'maya')
// render <img src={image}/> + a bubble with {message}; celebrate if isMilestone
```
