# שרה — פרומפט מוכן להעתקה (Nano Banana / Gemini)

הגיליון הקודם (`sara1.png`) לא היה שמיש: רקע כהה, סרגל ניווט מוטבע, 3 פוזות
בלבד, והדמות השלישית הייתה אישה אחרת לגמרי. הקובץ הזה מתקן בדיוק את זה.

---

## ⚠️ שתי הטעויות מהפעם הקודמת — אל תחזור עליהן

**1. רקע.** הגיליונות יוצאו עם משבצות השקיפות **מצוירות כפיקסלים אפורים** —
0% מהקובץ היה שקוף באמת. נאלצתי לכתוב מסיר רקע. אם אי אפשר alpha אמיתי,
בקש **רקע ירוק אחיד (#00B140)** — הוא רחוק מכל צבע בציור ונחתך מושלם.

**2. עקביות.** בגיליון של שרה כל פאנל הראה אישה אחרת. הפתרון: **צור את
`basic` לבד קודם**, ורק אז העלה אותה כרפרנס לשאר.

---

## שלב 1 — צור את `basic` בלבד

העתק את זה כמו שהוא:

```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness look.
Full body, centered, facing the viewer, even soft front lighting, no harsh shadows.

CHARACTER: A woman in her late 20s, radiant Mediterranean look, warm tan-olive
skin, bright confident smile, defined eyebrows. Voluminous jet-black wavy hair
worn loose to the shoulders. Toned athletic build. Outfit: olive-green ribbed
sports bra with a small cut-out detail at the front, plus matching olive-green
high-waist leggings. Vibrant, magnetic, energetic presence.

POSE: relaxed grounded standing, weight even on both feet, hands loosely clasped
at the waist, warm confident closed-mouth smile.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill instead.
Do NOT draw a checkerboard pattern.

STRICT: no text, no words, no labels, no numbers, no UI, no phone frame,
no navigation bar, no floor, no shadow on the ground, no props.
Portrait 3:4, high detail, at least 1024px wide.
```

בחר את התוצאה הכי טובה. **זו הופכת לרפרנס.**

---

## שלב 2 — כל שאר הפוזות

**העלה את `basic` שבחרת כתמונת רפרנס**, ואז לכל פוזה השתמש בתבנית:

```
Keep this EXACT same person — identical face, hairstyle, hair colour, skin tone,
body and outfit. Change ONLY the pose to:

<<< הדבק כאן שורת פוזה מהרשימה למטה >>>

Same watercolor and ink style. Same canvas size, same character scale, same
vertical position on the canvas as the reference.
Fully transparent background (real alpha), no text, no UI, no floor, no props
except those named in the pose.
```

### שורות הפוזות

| שם קובץ | שורת הפוזה להדבקה |
|---|---|
| `energetic` | dynamic strong Warrior-II stance, arms extended wide, determined expression, surrounded by a soft painterly golden glow and a few sparkle accents |
| `empathetic` | one hand resting gently over the heart, head slightly tilted, warm caring gentle smile |
| `celebrate` | both arms raised in a joyful V, big open happy smile, mid-celebration |
| `streak_flame` | excited grin, one hand gesturing toward a single small warm flame beside her |
| `trophy` | holding up a small gold trophy with both hands, proud beaming smile |
| `clap` | clapping hands together, cheerful encouraging expression |
| `thumbs_up` | one confident thumbs-up, friendly smile |
| `wave` | friendly wave hello with one hand, welcoming smile |
| `lets_go` | beckoning "come with me", pointing slightly forward, energised motivating look |
| `wink` | playful wink with a bright smile, light and delightful |
| `offer_hand` | extending an open hand toward the viewer, warm and inviting |
| `streak_lost` | soft disappointed-but-kind expression, small reassuring shrug |
| `rest` | relaxed, holding a water bottle, easy calm smile |
| `level_up` | triumphant proud pose, a few sparkles and a subtle small crown motif above the head |
| `meditate` | seated cross-legged in lotus, eyes closed, serene peaceful smile |

**סט מינימלי אם אתה רוצה להתחיל מהר (7):**
`basic, energetic, empathetic, celebrate, streak_flame, wave, thumbs_up`

---

## שלב 3 — שלח לי

שמור בתיקיית `Avatar` באחת משתי הדרכים:

- **קבצים נפרדים** — `sara_basic.png`, `sara_energetic.png` … (הכי קל לי)
- **גיליון אחד** — רשת אחידה, בלי תוויות טקסט, ותגיד לי כמה שורות ועמודות

אני חותך, מסיר רקע אם צריך, ומכניס ל-`public/avatars/sara/`.

---

## אותו דבר עבור עידן

לעידן חסרות 10 פוזות, ו-`energetic` שלו יצא עם שאריות משבצות בתוך ההילה
הזהובה (הזוהר חצי-שקוף מעל המשבצות, אז אי אפשר לחתוך אותו כאפור נייטרלי).
השתמש באותו תהליך — ה-DNA שלו נמצא ב-`CHARACTER_PROMPTS.md`.
