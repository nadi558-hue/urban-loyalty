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
- Solid pure blue background (#0000FF), flat and evenly lit, filling the entire frame. No gradients, no shadows cast on the background, no vignette. Do not put any blue tint, blue rim light, or blue reflection on the character.
- Keep the character EXACTLY as in the reference image: same face, same hairstyle, same outfit, same colors, same line-art illustration style, same proportions.
- Locked static camera. No zoom, no pan, no dolly, no camera shake, no perspective change.
- The character stays centered and anchored in frame at a constant scale. Do not let the character drift, resize, or walk out of frame.
- Full body framing identical to the reference image.
- No text, no captions, no watermarks, no logos, no additional characters or props beyond those described.
- Clean 2D animation, smooth motion, 15fps feel.
```

---

# 🥇 שלב 1 — התחל מכאן

## 1. `celebrate` — חגיגת אבן דרך (04_celebrate)
**מתי:** רצף של 3 / 7 / 14 / 30 / 60 / 100 שיעורים · **מנגן פעם אחת** · 3 שניות

```
Animate this character celebrating a milestone achievement.

Motion: The character raises both arms upward in a joyful victory gesture and breaks into a wide, genuine smile. A golden crown gently descends and settles onto their head. As the crown lands, a burst of small golden sparkles and soft golden light rays radiates outward from behind the character, then fades away. The character settles into a proud, happy standing pose.

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
Animate this character standing calmly, with very subtle idle motion only.

Motion: Slow, natural breathing — the chest and shoulders rise and fall gently. One slow, natural eye blink. Almost imperceptible weight shift. The hands and arms stay essentially where they are.

Energy: EXTREMELY SUBTLE AND MINIMAL. This is a resting idle state that a user sees every single day, so it must never feel busy, bouncy, or distracting. Think of a photograph that is barely alive — not a performance.
No gestures, no waving, no jumping, no arm movement.

SEAMLESS LOOP: the first and last frame must be identical so the clip loops with no visible jump.
```

---

# 🥈 שלב 2

## 4. `energetic` — רצף 3-6 שיעורים (02_energetic)
**לולאה** · 3 שניות

```
Animate this character radiating positive workout energy.

Motion: The character bounces very lightly on the spot with an upbeat rhythm, shoulders relaxed, smiling confidently. A small, contained motivating gesture — a light fist pump or an encouraging nod toward the viewer.

Energy: upbeat and motivating but CONTROLLED. Keep the movement small and looping-friendly; the character must not travel across the frame or change scale.

SEAMLESS LOOP: the first and last frame must be identical so the clip loops with no visible jump.
```

## 5. `streak_flame` — רצף 7+ (05_streak_fire)
**לולאה** · 3 שניות

```
Animate this character with a burning streak of momentum.

Motion: The character holds a strong, confident stance with a proud smile, breathing steadily. Warm orange and golden flames flicker and dance continuously around and behind them, with a few small embers drifting slowly upward and fading out.

Energy: powerful and warm. The character's own motion stays fairly still and grounded — the FLAMES carry the movement, not the body.

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
