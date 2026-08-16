# פרומפטים לאנימציית האווטרים — Gemini / Veo

## ⚠️ קרא זאת קודם  (עודכן: רקע כחול, לא מגנטה)

מחולל וידאו **לא יודע לייצר רקע שקוף**. בקליפ הראשון ששלחת הרקע יצא שחור,
וכשניסיתי להסיר אותו — השיער הכהה וקווי המתאר נמחקו יחד איתו.

**הפתרון: לבקש רקע כחול אחיד (#0000FF).**

עדכון חשוב: בהתחלה המלצתי על מגנטה וזו הייתה טעות. ההיילייטס הבהירים
בבורדו של מאיה ורדרדים ולכן קרובים למגנטה — הם יצאו שקופים למחצה, רקע
האפליקציה הציץ מבעדם, והבד המט נראה מבריק כמו לטקס.

**כחול רחוק מכל מה שיש בדמויות:**
| רכיב | מרחק מכחול |
|---|---|
| בורדו (מאיה) | B נמוך → רחוק ✅ |
| ירוק זית (שרה) | B נמוך → רחוק ✅ |
| **ניצוצות זהב** | B נמוך מאוד → **הכי רחוק** ✅ |
| עור / גופייה לבנה | ניטרלי → לא נתפס ✅ |

הזהב הוא הסיבה העיקרית: הוא ההפך הגמור מכחול, ולכן גם הניצוצות
השקופים־למחצה ינוקו נקי — מה שלא הצליח מול מגנטה.

**אל תבקש green screen** — שרה לובשת ירוק זית, וזה יחורר לה את הבגד.
**ואל תבקש מגנטה** — זה מה שגרם לברק אצל מאיה.

---

## 🔧 בלוק טכני — הדבק בסוף כל פרומפט

```
TECHNICAL REQUIREMENTS (must follow exactly):
- Solid pure blue background (#0000FF), flat and evenly lit, filling the entire frame. No gradients, no shadows cast on the background, no vignette.
- NEVER let blue light touch the character. No blue tint, no blue rim light, no blue reflection, no blue glow on her skin, hair or outfit, not even faintly and not even for a single frame. Her colors must stay exactly as warm as the reference image.
- Keep the character EXACTLY as in the reference image: same face, same hairstyle, same outfit, same colors, same line-art illustration style, same proportions.
- Locked static camera. No zoom, no pan, no dolly, no camera shake, no perspective change.
- The character stays centered and anchored in frame at a constant scale. Do not let the character drift, resize, or walk out of frame.
- FULL BODY FRAMING, always the same: the whole character from the top of her head to the soles of her shoes must stay inside the frame for every frame of the clip, with a small margin of background above her head and below her feet. She should fill roughly 80% of the frame height. Never crop her at the chest, waist or thighs, and never zoom in on her upper body — every pose must be framed at exactly the same distance so the clips can be used interchangeably.
- No text, no captions, no watermarks, no logos, no additional characters or props beyond those described.
- Any sparkles, glows, particles or light effects must be WARM GOLD or AMBER only. Absolutely no white, silver, pale-blue or cyan light, no white light rays, no lens flare, no starburst glow. Effects must stay close to the character, not fill the frame or reach the frame edges.
- Clean 2D animation with smooth, natural motion.
```

> ⚠️ **למה נוספה השורה על אפקטים** — בקליפ הראשון של `celebrate` הדמות
> יצאה מושלמת, אבל פרץ האור והניצוצות יצאו **לבנים/תכלת**. אור לבן הוא נייטרלי,
> ולכן שום מפתח כרומה בעולם לא יודע להפריד אותו מהרקע — הוא ספג את הכחול
> ונשאר אפור־כחלחל מלוכלך על הרקע הקרם של האפליקציה.
> הכתר הזהוב באותו קליפ יצא נקי לחלוטין. **זהב עובד, לבן לא.**

---

# 🥇 שלב 1 — התחל מכאן

## 1. `celebrate` — חגיגת אבן דרך (04_celebrate)
**מתי:** רצף של 3 / 7 / 14 / 30 / 60 / 100 שיעורים · **מנגן פעם אחת** · 3 שניות

```
Animate this character celebrating a milestone achievement.

Motion: The character raises both arms upward in a joyful victory gesture and breaks into a wide, genuine smile. A golden crown gently descends and settles onto their head. As the crown lands, a small burst of WARM GOLDEN sparkles appears close around the character's head and shoulders and then fades away. The sparkles must be solid warm gold — no white glow, no white light rays, no silver or pale blue glints, no starburst filling the frame.

Timing: build-up (0-1s), peak burst as the crown lands (1-2s), settle and hold (2-3s).
Energy: triumphant and warm, celebratory but elegant — not cartoonish or frantic.
This plays ONCE and ends on a held pose. It does not loop.
```

## 2. `wave` — ברכת שלום (09_wave)
**מתי:** הפעם הראשונה שנכנסים לאפליקציה · **מנגן פעם אחת** · 2-3 שניות

```
Animate this character warmly greeting someone for the first time.

Motion: The character raises one hand and waves gently twice — a friendly, unhurried wave. Their head tilts very slightly and they smile warmly, making eye contact with the viewer. After the wave, the hand lowers naturally and the character settles into a relaxed, welcoming standing pose.

Timing: raise hand (0-0.5s), two soft waves (0.5-2s), lower and settle (2-3s).
Energy: warm, inviting, calm. This is a first impression — friendly, not hyperactive.
This plays ONCE and ends on a held pose. It does not loop.
```

## 3. `basic` — ברירת מחדל יומיומית (01_basic)
**מתי:** המצב הרגיל — **נראה הכי הרבה** · **לולאה** · 3 שניות
> ⚠️ חייב להיות מינימלי. אם זה קופצני, זה יעצבן אחרי יומיים.

```
Animate this character standing in a relaxed, friendly idle — alive and present, but calm.

Motion: Easy natural breathing that visibly lifts the chest and shoulders. She shifts her weight softly from one leg to the other, so her hips and shoulders sway a little. Her head turns very slightly and she gives a warm, easy smile toward the viewer, with a couple of unhurried natural blinks at different moments. A few loose strands of hair drift gently with the movement, but her hairstyle itself stays exactly as in the reference image. Her arms hang relaxed and sway slightly with her weight shift.

Energy: warm, welcoming and quietly alive — like someone waiting comfortably for a friend. She should look like a real person standing there, never like a frozen photograph, but also never busy or bouncy: this is the everyday state a user sees on every visit, so all motion stays slow, soft and low-amplitude.
No jumping, no big gestures, no waving, no arm raising, no travelling across the frame.

SEAMLESS LOOP: the first and last frame must be identical so the clip loops with no visible jump.
```

---

# 🥈 שלב 2

## 4. `energetic` — רצף 3-6 שיעורים (02_energetic)
**לולאה** · 3 שניות

```
Animate this character jogging energetically on the spot.

Motion: The character runs in place with a brisk, athletic rhythm, knees lifting, and her ARMS PUMP IN TIME WITH HER LEGS — elbows bent at about 90 degrees, swinging forward and back in the natural running rhythm, one arm forward while the opposite knee lifts. Her whole body commits to the movement: shoulders and torso rotate slightly with each stride, and she smiles with real effort and enthusiasm.

CRITICAL: the arms must never hang still or stay relaxed while the legs run. Legs and arms move together as one coordinated running motion, at the same tempo. A calm upper body over running legs looks broken.

CRITICAL: keep her hair in EXACTLY the same style as the reference image and never let it down. If her hair is tied up in a bun, it stays a tight bun for the whole clip — do not turn it into a ponytail, do not let long hair fall loose, do not let hair fly. Only tiny loose strands near the face may move.

Energy: genuinely athletic and enthusiastic — she is mid-workout and enjoying it. Keep her anchored on the same spot at a constant scale; she must not travel across the frame.

SEAMLESS LOOP: the first and last frame must be identical so the running cycle loops with no visible jump.
```

## 5. `streak_flame` — רצף 7+ (05_streak_fire)
**לולאה** · 3 שניות

```
Animate this character powered up and unstoppable, on a hot winning streak.

Motion: The character plants a strong wide stance, pulls both fists in tight to her sides and pushes her chest up in a powerful "charged up" surge, then holds it with visible strength — shoulders squared, chin up, a fierce proud grin. Her body pulses with the effort: a firm rhythmic bounce of the shoulders and a small triumphant fist pump. She looks powerful and fired up, NOT calm.

The flames sit BEHIND her and rise from BELOW her feet, like a glowing aura framing her silhouette — warm orange and gold, flickering upward with a few embers drifting away. The flames must never cover her face, her body or her outfit, and she must never look like she is burning or in pain.

CRITICAL: do not make her stand still and breathe calmly. The character's own energy must match the fire — she is dominating, not meditating.

Energy: triumphant, strong, exhilarating.

SEAMLESS LOOP: the flames must loop continuously with no visible cut, and the first and last frame must match.
```

---

# 🥉 שלב 3 — עדין בכוונה

> 🚨 שתי התנוחות הבאות מוצגות ברגע של **פספוס**.
> אנימציה חוגגת כאן תהיה צורמת. שמור אותן כמעט סטטיות.

## 6. `empathetic` — פספסה אימון, הרצף הוקפא (03_empathetic)
**לולאה** · 3 שניות

```
Animate this character offering quiet, gentle reassurance.

Motion: Slow, calm breathing. A soft, understanding smile and a single slow, gentle nod — the kind of nod that says "it's okay". One slow blink. Nothing more.

Energy: CALM, WARM, AND VERY RESTRAINED. This is shown to someone who missed a workout, so it must feel supportive and quiet — never upbeat, never celebratory, never energetic.

SEAMLESS LOOP: the first and last frame must be identical so the clip loops with no visible jump.
```

## 7. `streak_lost` — הרצף נשבר ❌ **הקובץ חסר!**
**לולאה** · 3 שניות
> אין לך `streak_lost` בתיקייה — צריך לייצר קודם תמונה סטטית:
> דמות בעמידה רגועה, הבעה חמה ומעודדת, יד מושטת קדימה בהזמנה להתחיל מחדש.

```
Animate this character gently encouraging a fresh start.

Motion: Calm breathing. The character extends one open hand forward in a soft, inviting "let's start again" gesture, with a warm and encouraging expression, then relaxes the hand back.

Energy: GENTLE AND ENCOURAGING, never disappointed and never scolding. The streak just broke — this must feel like an invitation, not a judgment. Keep it quiet and supportive.

SEAMLESS LOOP: the first and last frame must be identical so the clip loops with no visible jump.
```

---

## 📋 סיכום העבודה

| # | תנוחה | קובץ מקור | סוג | סה״כ |
|---|---|---|---|---|
| 1 | celebrate | 04_celebrate | פעם אחת | ×3 דמויות |
| 2 | wave | 09_wave | פעם אחת | ×3 |
| 3 | basic | 01_basic | לולאה | ×3 |
| 4 | energetic | 02_energetic | לולאה | ×3 |
| 5 | streak_flame | 05_streak_fire | לולאה | ×3 |
| 6 | empathetic | 03_empathetic | לולאה | ×3 |
| 7 | streak_lost | ❌ חסר | לולאה | ×3 |

**21 אנימציות סה״כ.** אל תנפיש את 10 התנוחות האחרות — הקוד לא מציג אותן.

**התחל ב-`celebrate` של מאיה בלבד**, שלח לי, ונוודא שהמסלול עובד לפני שתשקיע בשאר.
