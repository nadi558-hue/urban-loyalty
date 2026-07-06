# Urban Studio Club — UI/UX Design Guide

## Design Philosophy
Boutique fitness studio aesthetic: **editorial, warm, premium but approachable**.
Think luxury wellness brand — not gamified app. The loyalty mechanics are present but never garish.

## Color Palette
```css
/* Base */
--urban-bg:     #f5f2ee   /* warm off-white page background */
--urban-dark:   #2a2018   /* near-black warm brown — headings */
--urban-muted:  #8a7a68   /* medium warm gray — secondary text */
--urban-border: #e8e0d4   /* subtle warm border */

/* Accent */
--urban-sand:   #f0e8d8   /* warm sand — card backgrounds */
--urban-blush:  #f0e0d0   /* soft terracotta blush */
--urban-sage:   #a4bfa4   /* muted sage green */
--urban-gold:   #9a7818   /* deep ochre gold */

/* Tier-specific accents (computed per tier) */
/* Silver: cardAccent=#5e7068 (sage), cardBg=linear-gradient(160deg,#ecefea,#dde4d8) */
/* Gold:   cardAccent=#9a7818 (gold), cardBg=linear-gradient(160deg,#f8eed2,#eddfb0) */
/* Platinum: cardAccent=#6a6880 (mauve), cardBg=linear-gradient(160deg,#f0f0f4,#e0e2e8) */
```

## Typography
- **Display / Numbers:** `Georgia, "Times New Roman", serif` — used for UC numbers, card labels, member name
- **UI / Body:** System font stack (Tailwind default) — used for descriptions, progress, tags
- **Tracking patterns:**
  - Section headers: `tracking-[0.15em] uppercase text-xs font-bold`
  - Card micro-labels: `tracking-[0.42em] uppercase font-size:0.5rem`
  - Badge labels: `tracking-[0.12em]`

## Spacing & Layout
- Page max-width: `max-w-md` (448px), `mx-auto`
- Section padding: `px-5`
- Card internal padding: `p-5` or `px-6 py-4`
- Card border-radius: `rounded-3xl` (24px)
- Gap between sections: `mb-5`

## Component Patterns

### Cards (`.urban-card`)
```css
background: white or var(--urban-sand)
border-radius: 24px
border: 1px solid var(--urban-border)
box-shadow: 0 2px 16px rgba(0,0,0,0.06)
```

### The Coin Card (Main UC Balance Card)
This is the hero element. Rules:
- Background gradient changes by tier (silver/gold/platinum)
- Top micro-label: "URBAN — COINS" in `tracking-[0.42em]` Georgia serif
- Coin image (84×84px circle, `overflow:hidden`) + big number side by side
- Coin image: `/public/urban-coin-silver.png`, CSS filter applied per tier:
  - Silver: `filter: none`
  - Gold: `filter: sepia(1) saturate(3.5) hue-rotate(8deg) brightness(1.08)`
  - Platinum: `filter: brightness(1.35) contrast(0.88) saturate(0.15)`
- Number font: Georgia, 5rem, `#2a2018`
- Sub-label: "זמינים למימוש" (spendable) + "סה״כ נצברו X UC · לסטטוס חברות"
- Bottom dark strip: `background: #3a3328`, shows tier label + lifetime UC

### Tier Progress Card
- Same gradient as coin card (visual continuity)
- Shows next-tier coin (mini, 44px) with appropriate filter
- Progress bar: h-2, rounded, tier accent color
- Shows: "עוד X UC לרמת [tier]" + perk description
- Counter format: `147 / 500 UC לסטטוס` (RTL safe — existing / target)

### Challenge Cards
- Inside `.urban-card`, `space-y-4`
- Each challenge: label (emoji prefix) + reward badge (right) + progress bar + count
- Emoji usage: 🔥 for streaks, 📅 for monthly goals
- Progress bar colors: `var(--urban-dark)` for streak, `var(--urban-sage)` for monthly

### Class Type Cards
- `urban-card overflow-hidden relative`
- Watercolor JPG background: `opacity: 0.55`, `object-fit: cover`
- Gradient overlay: `rgba(255,252,248,0.15) → rgba(255,252,248,0.96)` bottom fade
- Content sits above at `z-index: 1`

## RTL Rules
- `<html dir="rtl" lang="he">` — set in root layout
- All flex rows read right-to-left naturally
- Numbers and UC values: write as `147 / 500` (Hebrew reads right: existing/target) ✓
- Never write `UC 500 / 147` — reads backwards in RTL ✗
- Tailwind: use `ms-` / `me-` (margin-start/end) instead of `ml-` / `mr-` where possible

## Interaction States
- Progress bars: `transition-all duration-700` — smooth animation on load
- Buttons: rounded-full, minimum 44px height (touch target)
- Active tier badge: pill with `background: cardAccentLight`, `border: 1px solid ${cardAccent}44`

## What NOT to do
- No bright primary colors (no blue, no green, no red UI chrome)
- No heavy shadows or gradients that feel "app-store-gamey"
- No emoji in section headers — only in challenge labels for urgency
- No lorem ipsum — all demo text must be realistic Hebrew studio content
- No `text-black` — use `var(--urban-dark)` or `#2a2018`
- No fixed heights on cards — let content breathe

## Accessibility
- All images that are decorative: `alt=""`
- Interactive elements: min 44px tap target
- Color contrast: accent colors on white must pass AA (test cardAccent on cardBg)
- eslint-disable-next-line comments required for `<img>` tags (Next.js Image lint rule)

## Demo Data (for development without Supabase)
```ts
const DEMO: Member = {
  name: 'נדב בנימין',
  total_coins: 47,       // spendable
  lifetime_coins: 147,   // status (never decreases)
  tier: 'silver'         // change to 'gold' or 'platinum' to test
}
```

## Page-by-Page Spec

### `/home` (BUILT)
- Header: greeting + tier badge + lifetime UC
- CoinCard: balance + coin image + tier progress
- TierProgress: motivational next-tier card
- Challenges: active weekly/monthly
- ClassTypes: discover classes with watercolor backgrounds

### `/rewards` (TODO)
- Grid of reward cards (30 UC / 50 UC / 100 UC)
- Each card: reward name, cost in UC, "מימוש" CTA button
- If `total_coins >= cost` → button active; else greyed with "חסרים X UC"
- On redeem: generate one-time code, deduct from `total_coins` (not lifetime)
- Show generated code clearly with copy button

### `/history` (TODO)
- Reverse-chronological list of point_ledger entries
- Each row: icon by type + description + ±UC + date
- Positive: green/sage, Negative: muted
- Group by date (היום / אתמול / [date])

### `/referrals` (TODO)
- Personal referral link: `urban.club/join?ref=[member_id]`
- Counter: how many friends completed trial / subscribed
- Reward status per referral
- Share buttons: WhatsApp, copy link

### `/login` (TODO)
- Full-screen hero with URBAN branding photo
- Phone input (Israeli format: 05X-XXX-XXXX)
- OTP 6-digit input (Supabase Auth)
- No password — OTP only
