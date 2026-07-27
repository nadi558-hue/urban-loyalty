# Character Prompt Sheets — Nano Banana (Gemini)

Precise, per-character prompts so every generation of **maya / sara / idan** stays
consistent, plus an extended pose library for gamification & future animation.

## How to build any prompt (the formula)
```
[STYLE + TECH]  +  [CHARACTER DNA]  +  [POSE]
```
- **Consistency method:** for every new pose, **upload the character's best image as a
  reference** and start with: *"Keep this exact same person — identical face, hair, skin
  tone and outfit — change ONLY the pose to: …"*. Generate all of one character's poses
  in a single session. If the face drifts, re-upload the clean `basic` image as reference.

## STYLE + TECH — paste at the top of every prompt
```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness look.
Full body, centered, facing the viewer, even soft front lighting (no harsh shadows).
IMPORTANT: fully transparent background, NO text, NO numbers, NO UI, NO phone frame,
NO floor, NO props except those named in the pose. Portrait 3:4, high detail, ≥1024px.
Keep the SAME canvas size, character scale and vertical position every time.
```

---

## 🎭 CHARACTER DNA (the locked appearance — paste after STYLE+TECH)

### maya — the calm, supportive coach
```
A woman in her early 30s, warm friendly face, fair light-olive skin, soft natural
makeup, straight expressive eyebrows. Dark chestnut-brown hair in a neat high bun
with a few loose strands. Lean athletic build. Outfit: deep burgundy ribbed sports
bra + matching high-waist leggings. Calm, warm, reassuring presence.
```

### sara — the energetic, Mediterranean coach
```
A woman in her late 20s, radiant Mediterranean look, warm tan-olive skin, bright
confident smile, defined brows. Voluminous jet-black wavy hair worn loose to the
shoulders. Toned athletic build. Outfit: olive-green ribbed sports bra with a small
cut-out detail + matching leggings. Vibrant, magnetic, energetic presence.
```

### idan — the driven, encouraging coach
```
A man in his early 30s, friendly approachable face, light-medium skin, light stubble.
Dark-brown wavy medium-length slightly-tousled hair. Fit athletic build, defined
shoulders. Outfit: white ribbed tank top + charcoal training shorts. Confident,
motivating, warm presence.
```

---

## 📚 POSE LIBRARY (append one line as the [POSE])

**Core 3 states**
- `basic` — relaxed standing, hands loosely clasped at the waist, warm confident closed-mouth smile.
- `energetic` — dynamic low lunge holding one kettlebell (women may use a strong Warrior-II stance), determined expression, surrounded by a soft painterly GOLDEN glow and a few sparkle accents.
- `empathetic` — one hand resting gently over the heart, head slightly tilted, warm caring gentle smile.

**Gamification & motivation**
- `celebrate` — both arms raised in a joyful V, big open happy smile, mid-celebration (great for milestones 7/14/30).
- `streak_flame` — excited grin, one hand gesturing toward a single small warm flame beside them (daily-streak motif).
- `trophy` — holding up a small gold trophy with both hands, proud beaming smile (monthly streak / tier).
- `clap` — clapping hands together, cheerful encouraging expression.
- `thumbs_up` — one confident thumbs-up, friendly smile (approval / "great job").
- `wave` — friendly wave hello with one hand, welcoming smile (onboarding greeting).
- `lets_go` — beckoning "come with me", pointing slightly forward, energised motivating look.
- `wink` — playful wink with a bright smile, light and delightful (reward micro-moment).
- `offer_hand` — extending an open hand toward the viewer, warm inviting (pledge / commitment offer).
- `streak_lost` — soft disappointed-but-kind expression, small reassuring shrug (streak broken — gentler than empathetic).
- `rest` — relaxed, holding a water bottle, easy calm smile (rest / recovery day).
- `level_up` — triumphant proud pose with a few sparkles and a subtle small crown motif above the head (tier promotion).

---

## ✅ Fully-assembled examples (copy-paste ready)

**maya · energetic**
```
Hand-painted watercolor illustration with delicate ink line-art outlines, soft muted
warm palette, subtle paper texture, calm premium boutique-fitness look. Full body,
centered, facing viewer, even soft front lighting. Fully transparent background, NO
text, NO UI, NO floor, NO props except the kettlebell. Portrait 3:4, high detail.
A woman in her early 30s, warm friendly face, fair light-olive skin, dark chestnut-brown
hair in a neat high bun with loose strands, lean athletic build, deep burgundy ribbed
sports bra + matching leggings. POSE: dynamic low lunge holding one kettlebell, determined
expression, surrounded by a soft painterly golden glow and a few sparkle accents.
```

**idan · celebrate**
```
Hand-painted watercolor illustration with delicate ink line-art outlines, soft muted
warm palette, subtle paper texture, calm premium boutique-fitness look. Full body,
centered, facing viewer, even soft front lighting. Fully transparent background, NO
text, NO UI, NO floor, NO props. Portrait 3:4, high detail.
A man in his early 30s, friendly face, light-medium skin, light stubble, dark-brown wavy
medium hair, fit athletic build, white ribbed tank top + charcoal shorts. POSE: both arms
raised in a joyful V, big open happy smile, mid-celebration.
```

---

## 🎬 Animation prep (for the Duolingo-style motion later)
- **Same scale & baseline everywhere** — identical canvas, character size and vertical
  position across all poses, so swapping frames never "jumps". This is the #1 rule for
  clean swaps/tweens.
- **Transparent PNG, front-facing, flat even light** → easiest to rig / bounce / squash-stretch.
- **Static PNG is enough** for pop / bounce / wobble (do it in CSS or Lottie on one image).
- **2-frame micro-animations** (smile, wave, wink, breathing): generate the SAME pose twice
  with one small change (mouth closed→open, hand down→up, arms in→out) and alternate them.
- Keep a **neutral `basic`** as the character's home frame — everything returns to it.
- Suggested per-character set to start: `basic, energetic, empathetic, celebrate, streak_flame,
  wave, thumbs_up` (7 frames covers most in-app moments).
