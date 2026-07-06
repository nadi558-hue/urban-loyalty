# Handoff: Urban Studio Club — Dashboard + Rewards (design "2a", warm boutique + brand illustration)

> App: **Urban Pilates Group Ltd** loyalty web app (Hebrew, RTL, mobile-first). Boutique pilates network in Be'er Sheva. Branches: Sokolov (main), Academia, Bar.
> Existing stack (from the uploaded files): **Next.js + Tailwind v4**, `dir="rtl"`, `lang="he"`.

---

## Overview
Two screens of the loyalty club:
1. **Dashboard (מסך ראשי)** — coin balance, membership tier, progress to next tier, active challenges, recent activity.
2. **Rewards (חנות ההטבות)** — spend Urban Coins (UC) on real studio perks.

The distinctive touch in this version: the studio's **gouache pilates illustrations** are woven into the UI as brand graphics.

## About the design files
`Urban Club.dc.html` is a **design reference created in HTML** — a prototype showing the intended look, layout and copy. It is **not production code to copy verbatim**. Recreate these screens in your existing Next.js + Tailwind app using your established components and conventions (your `globals.css` tokens already match — see below). The HTML uses inline styles only because of the prototyping tool; in your app, translate them to Tailwind classes / CSS variables.

Open the file in a browser to interact with it. Two design turns are stacked in the file — **implement option `2a`** (the top section, "בוטיק חמים + גרפיקת המותג"). Turn 1 (`1a`/`1b`) is earlier exploration; `1a` is the same warm-boutique base without illustrations.

## Fidelity
**High-fidelity.** Colors, typography, spacing and copy are final. Recreate pixel-close. Numbers/data are sample values — wire them to real user data.

---

## Design tokens

These extend the palette already in your `globals.css` (`--urban-*`). Exact values used in the mock:

**Colors**
- Ink / foreground: `#1c1917` (also `#221f1c` for headings)
- Charcoal (header gradient top): `#3a342d`  → bottom `#1c1917`
- Gold: `#c4a05a` · Gold bright: `#e8cc88` (gradients go `#e8cc88 → #c4a05a`)
- Screen background (cream): `#ece7dd`
- Page/canvas background: `#d9d3c7`
- Card surface: `#ffffff` · Card border: `rgba(196,160,90,0.18–0.20)`
- Sand fills: `#f5f2eb` / `#f7f3ea` / `#f4efe6`
- Muted text: `#94897e`, `#a0958a`, `#8a7c6a`, `#6f665c`
- Silver tier coin gradient: `#c6cec0 → #8f9a8b`, glyph text `#33372f`
- Gold tier coin gradient: `#e8cc88 → #c4a05a`
- Platinum tier coin gradient (future): `#eeeeea → #c9c9c2`
- Positive/earned points text (green): `#3f8f5e`
- Challenge badge: bg `#fbeede`, text `#b57e2a`
- Rewards hero header gradient: `#f4eee2 → #e7dcc6`

**Typography** (both Google Fonts)
- Display + all numerals: **Frank Ruhl Libre** — weights 400/500/700/900. Used for big UC numbers, tier labels, screen titles.
- UI + body: **Assistant** — weights 400/500/600/700/800.
- Direction: `dir="rtl"`, `lang="he"`.

**Radius**
- Phone screen container: `38px`
- Cards: `18–20px` · icon tiles: `12–13px` · chips & buttons: `999px` (pill)

**Shadows**
- Gold "available" card: `0 14px 28px -12px rgba(196,160,90,.6)`
- Center QR nav button: `0 10px 22px -6px rgba(196,160,90,.7)`
- Reward figure drop-shadow: `drop-shadow(0 12px 20px rgba(28,25,23,.16))`

**Spacing**: screen padding `16–22px` horizontal; card padding `14–18px`; gaps `8–14px`.

---

## Data model (IMPORTANT — the core mechanic)

Two separate balances — do **not** conflate them:
- **UC לסטטוס (status)** — cumulative, **never decreases**, determines the tier. Sample: `147`.
- **UC זמין למימוש (available/spendable)** — goes down when redeeming rewards. Sample: `47`.

**Tiers** (by status UC):
- 🥈 Silver `0–499` — studio access
- 🥇 Gold `500–1,499` — 10% discount + private lesson each quarter
- 💎 Platinum `1,500+` — 15% discount + monthly private lesson + VIP

**Earning UC**: completed class +1 · Happy Hour +2 · 10-class streak bonus +10 · full month (12+ classes) bonus +30 · friend referral +50 · birthday +50.

**Rewards**: each has `cost` (UC). Redeemable when `cost ≤ available`, else **locked** showing "חסרים {cost − available} UC". Sample catalog:
- Available: שייק התאוששות 15 · בקבוק מים Urban 25 · מגבת סטודיו 30 · שיעור אורח לחברה 45
- Locked: ייעוץ תזונה אישי 60 · חודש הקפאת מנוי 80 · שיעור פרטי 1:1 120 · ערכת מזרן פרימיום 200

**Challenges** (each: current, goal, reward, countdown copy):
- 🔥 רצף שיעורים — 7/10, +10 UC, "עוד 3 ברצף"
- 📅 חודש מלא — 8/12, +30 UC, "עוד 4 החודש"

---

## Screen 1 — Dashboard (מסך ראשי)

**Layout (top → bottom):**
1. **Dark header** (gradient `#3a342d → #1c1917`, `overflow:hidden`):
   - Top row: branch name "סוקולוב" + time.
   - Greeting "ערב טוב, / מאיה לוי" (name in Frank Ruhl Libre 24px) + tier chip (translucent pill with the Silver **U-coin** 22px + "SILVER").
   - **Arc gauge** (semicircle SVG): track `rgba(255,255,255,.10)`, progress stroke `#c4a05a`, `stroke-width:11`, round caps. Fill = status/tier-cap (147/500 ≈ 29%). Center: status number `147` (Frank Ruhl Libre 52px, `#f7f2ea`) + "UC · סטטוס". End labels SILVER (right) / GOLD (left).
   - Sub-line: "עוד **353 UC** ל‑Gold ✦".
   - **Brand graphic**: `assets/figure-reach.png` positioned `bottom:-24px; left:-46px; height:262px; opacity:.5`, faded into the header with a CSS mask `linear-gradient(105deg,#000 0%,rgba(0,0,0,.55) 30%,transparent 52%)` so text stays legible. Purely decorative (`pointer-events:none`, `alt=""`).
2. **"Available to redeem" card** — gold gradient `#e8cc88 → #c4a05a`, big `47` + "UC" + dark pill button "מימוש →". This is the emphatic, spendable balance.
3. **"המסלול ל‑Gold" card** — white, header + `147 / 500`, gold progress bar (29%), two mini stat tiles (10% / 1:1) for waiting benefits.
4. **Challenges** — two white cards side by side: emoji, gold "+N UC" badge, title, thin gold progress bar, "x / y · countdown".
5. **Recent activity** — white card, rows of `title / meta` with green `+N`.
6. **Bottom tab bar** (sticky, translucent white, top border gold-tint): בית · הטבות · **center raised gold QR button** · היסטוריה · פרופיל.

## Screen 2 — Rewards (חנות ההטבות)

**Layout:**
1. **Illustrated hero header** — cream gradient `#f4eee2 → #e7dcc6`, `min-height:220px`, `overflow:hidden`:
   - Kicker "מועדון URBAN" (gold, tracked) → title "חנות ההטבות" (Frank Ruhl Libre 30px/900) → subtitle → gold pill "**47** UC זמין".
   - **Brand graphic (hero)**: `assets/figure-stretch.png` at `bottom:0; left:-24px; height:236px` with drop-shadow, sitting behind the text (`z-index:1`; text `z-index:2`). Text block is right-aligned (RTL) so the figure occupies the left.
2. **Featured card** — dark gradient `#3a342d → #1c1917`, faint `assets/wash.png` blob top-left (`opacity:.35`), "✦ מומלץ החודש" / "שיעור פרטי 1:1" / cost `120 UC` (gold).
3. **Filter chips** — "הכל" (active, dark) · "זמין עכשיו" · "בקרוב" (pills).
4. **"זמין עכשיו" grid** — 2-col cards: icon tile, name, `cost UC`, gold "מימוש" button.
5. **"בהישג יד" grid** — 2-col locked cards: greyed icon (`grayscale(.35)`), 🔒, "חסרים {need} UC".
6. Same bottom tab bar (Rewards tab active).

---

## Interactions & behavior
- Tapping "מימוש" on an available reward → confirm → deduct from **available** UC (never from status).
- Locked rewards are non-interactive; show the deficit.
- Progress bars animate width on mount (ease-out ~500ms) — optional.
- Tier chip/coin color switches by tier (Silver/Gold/Platinum gradients above).
- Bottom nav switches screens; center QR button opens the member scan/check-in.

## State
- `user`: `{ name, branch, tier, statusUC, availableUC }`
- Derived: `tierCap` (500/1500), `progressPct = statusUC / tierCap`, `toNext = tierCap − statusUC`.
- `rewards[]`: `{ id, name, icon, cost }` → `locked = cost > availableUC`, `need = cost − availableUC`.
- `challenges[]`: `{ icon, title, current, goal, reward, note }`.
- `activity[]`: `{ title, meta, delta }`.

## Assets
In `assets/` — transparent PNGs the studio owns, extracted from the provided "Artistic Watercolor Pilates Scene" file:
- `figure-reach.png` (665×724) — sage-top figure, arm raised. Used faded in the dashboard header.
- `figure-stretch.png` (380×781) — white-top figure stretching. Hero on the rewards header.
- `wash.png` (665×724) — soft peach watercolor blob. Texture behind the featured card.
Icons in the mock are emoji placeholders — swap for the studio's icon set if available. The "U" tier coin is a CSS circle with a Frank Ruhl Libre "U", gradient-filled per tier.

## Files
- `Urban Club.dc.html` — the design prototype (implement the **`2a`** section, at the top).
- `preview-2a.png` — rendered preview of both screens.
- `assets/` — brand illustrations.
