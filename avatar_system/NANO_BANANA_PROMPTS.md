# Nano Banana (Gemini) — Coach Character Generation Guide

Goal: produce **clean, reusable character assets** — one coach, 3 states, on a
**transparent background with NO text or UI** (unlike the first mockups). Each
character needs `basic.png`, `energetic.png`, `empathetic.png`.

---

## ⭐ The golden rules (why the first batch wasn't usable)
- **Transparent background.** No phone frame, no floor, no gym, no props.
- **NO TEXT of any kind.** No Hebrew, no numbers, no % arc, no nav bar.
- **One character, full/3-quarter body, centered, facing viewer.**
- **Portrait 3:4, high-res (≥1024×1365).**
- **Consistency:** same face + hair + outfit across all 3 states (use the reference workflow below).

---

## STYLE ANCHOR — paste this at the top of EVERY prompt
```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette — terracotta, warm sand, cream, dusty olive green.
Subtle watercolor paper texture, gentle soft shading, calm premium
boutique-fitness aesthetic. A single athletic woman in her late 20s to early
30s, natural healthy build, wearing a fitted olive-green activewear set
(sports bra + leggings). Full body, centered, facing the viewer.
IMPORTANT: plain fully transparent background, absolutely NO text, NO words,
NO numbers, NO phone frame, NO UI, NO floor, NO gym equipment, NO props.
Portrait orientation 3:4, high detail.
```

---

## Workflow — generate once, then clone the pose
1. Generate **BASIC** first (style anchor + basic pose below). Pick the best result.
2. For **ENERGETIC** and **EMPATHETIC**: **upload the basic image as a reference**, then use:
   > *"Using this exact character — keep the same face, same hairstyle and hair color,
   > same outfit, same body and skin tone — repaint her in a NEW pose: [POSE]. Same
   > watercolor & ink style, fully transparent background, no text, no props."*

This is where Nano Banana shines — it locks the identity so the 3 states look like the same person.

---

## The 3 state poses (append to the style anchor)
**basic** — daily home, calm
```
Relaxed grounded standing pose, weight even on both feet, hands loosely
clasped at the waist, warm confident closed-mouth smile, welcoming and serene.
```
**energetic** — active streak, gold aura
```
Dynamic powerful low lunge holding a single kettlebell in one hand (or a strong
Warrior-II stance), energised determined expression. Surround her with a soft
painterly glowing GOLDEN aura and a few small sparkle accents, warm light
radiating outward — keep the glow soft, not neon.
```
**empathetic** — streak freeze, comfort
```
Soft compassionate three-quarter pose, one hand resting gently over her heart,
head slightly tilted, warm caring gentle smile, tender reassuring body language.
```

---

## More coaches (grow the roster — same style anchor, swap the person)
Keep everything else identical; change only the description of the woman/man:
- **Coach — mature mentor:** *"a woman in her mid-40s, dark hair with subtle silver streaks in a low bun, warm wise calm presence, sand-colored activewear."*
- **Coach — male:** *"a fit man in his early 30s, short dark hair and a short trimmed beard, terracotta training tee and shorts, friendly approachable."*
- **Coach — different look:** *"a woman with warm brown skin, long dark curly hair, burgundy activewear set."*

Each new coach → its own folder (`avatar_system/{name}/`) with the same 3 states.

---

## If transparent background isn't available
Generate on a **flat solid cream (#F1E9E3) or pure white** background instead
(still no text/props) — I'll remove the background cleanly on my side.

---

## Handoff to me
Name the files `{coach}/{state}.png` (e.g. `maya/energetic.png`) and drop them in
the `Avatar` folder or tell me where. I optimise them and wire `getCoachView()`
into the home hero.
