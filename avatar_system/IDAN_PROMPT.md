# עידן — גיליון פוזות מלא (Nano Banana / Gemini)

הדוחף. שיער כהה גלי, גופייה קרם ומכנס פחם.

> יש כבר 6 פוזות של עידן ב-`public/avatars/idan/`, מתוכן 5 נקיות.
> ה-`energetic` שלו יצא עם שאריות משבצות **בתוך ההילה הזהובה** — הזוהר
> חצי-שקוף מעל הרקע, אז הפיקסלים שם מקבלים גוון זהוב ואי אפשר לחתוך אותם
> כאפור נייטרלי. עם alpha אמיתי הבעיה נעלמת מעצמה.

---

## ⚠️ שלושת הכללים שנכשלו בפעם הקודמת

1. **רקע** — הגיליון יצא עם משבצות שקיפות **מצוירות כפיקסלים אפורים**.
   0% מהקובץ היה שקוף. בקש **alpha אמיתי**, או **ירוק אחיד `#00B140`**.
2. **טקסט** — היו שמות פוזות מוטבעים מעל ומתחת לשורות. **אפס טקסט.**
3. **עקביות** — הפתרון במסלול א׳.

---

# מסלול א׳ — הבטוח (מומלץ)

## שלב 1 — צור רק את `basic`

```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness look.
Single character, full body, centered, facing the viewer, even soft front
lighting, no harsh shadows.

CHARACTER: A man in his early 30s, friendly approachable face, light-medium
skin, light stubble along the jaw, warm dark eyes, easy confident smile.
Dark brown-almost-black wavy medium-length hair, slightly tousled with natural
volume. Fit athletic build with defined shoulders and arms.
OUTFIT: cream-white ribbed tank top and charcoal-grey training shorts,
dark trainers.
PRESENCE: confident, motivating, warm — the one who gets you moving.

POSE: relaxed grounded standing, weight even on both feet, hands loosely
clasped in front at the waist, easy confident smile.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern.

STRICT: no text, no words, no labels, no numbers, no UI, no phone frame,
no navigation bar, no floor, no ground shadow, no props.
Portrait 3:4, high detail, at least 1024px wide.
```

בחר את הכי טוב. **זו נועלת את הזהות.**
(או פשוט העלה את `public/avatars/idan/basic.png` הקיים.)

## שלב 2 — הגיליון

**העלה את `basic` כרפרנס**, ואז:

```
Using this EXACT same man as reference — identical face, hairstyle, hair colour,
stubble, skin tone, body and outfit in every single panel — create ONE image
containing a 4x4 grid of 16 poses of him.

Read left to right, top to bottom, the 16 poses are:
1  relaxed standing, hands loosely clasped at the waist, easy confident smile
2  dynamic powerful low lunge holding a single kettlebell in one hand,
   energised determined expression, surrounded by a soft painterly golden glow
   and a few sparkle accents — keep the glow soft, not neon
3  one hand resting gently over his heart, head slightly tilted, warm caring look
4  both arms raised in a joyful V, big open happy smile, mid-celebration
5  excited grin, one hand gesturing toward a single small warm flame beside him
6  holding up a small gold trophy with both hands, proud beaming smile
7  clapping his hands together, cheerful encouraging expression
8  one confident thumbs-up, friendly smile
9  friendly wave hello with one hand, welcoming smile
10 beckoning "come with me", pointing slightly forward, energised motivating look
11 playful wink with a bright smile
12 extending an open hand toward the viewer, warm and inviting
13 soft disappointed-but-kind expression, small reassuring shrug
14 relaxed, holding a water bottle, easy calm smile
15 triumphant proud pose, a few sparkles and a subtle small crown above his head
16 seated cross-legged in lotus, eyes closed, serene peaceful expression

LAYOUT RULES — these matter more than anything else:
- Every panel uses the SAME character scale and the SAME vertical position,
  so his head and feet line up across all 16 cells.
- Even 4x4 grid, equal cell sizes, generous even margins.
- No gridlines, no borders, no frames between cells.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern. The golden glow in panel 2 must sit on
transparency, not over any drawn background pattern.

ABSOLUTELY NO TEXT: no pose names, no numbers, no captions, no labels,
no watermark anywhere in the image.

Same watercolor and ink style throughout. Very high resolution.
```

---

# מסלול ב׳ — הזריז

הרצה אחת: קח את בלוק ה-**CHARACTER + OUTFIT** משלב 1, הדבק לתוך פרומפט
הגיליון במקום `Using this EXACT same man as reference`, והוסף:

```
The SAME man must appear in all 16 panels — identical face, hair, stubble and
outfit in every cell. Do not vary his age, hairstyle, hair colour or clothing.
```

מהיר, אבל זה מה שנכשל בעבר. אם יוצא לא עקבי — עבור למסלול א׳.

---

## סט מינימלי של 8

`basic, energetic, empathetic, celebrate, streak_flame, wave, thumbs_up, rest`

רשת 4x2. שנה בפרומפט `4x4 grid of 16` ל-`4x2 grid of 8` והשאר את השורות
1, 2, 3, 4, 5, 9, 8, 14 בסדר הזה.

**אם אתה מייצר מעט מאוד** — `energetic` לבדו הוא התיקון הכי דחוף, כי זו
הפוזה היחידה שלו שלא שמישה כרגע.

---

## בדיקה לפני ששולח לי

- [ ] אין שום טקסט בתמונה
- [ ] אותו גבר בכל התאים — פנים, זקן קל, גופייה קרם, מכנס פחם
- [ ] הראש והרגליים בערך באותו גובה בכל תא
- [ ] הרקע שקוף באמת (או ירוק אחיד), לא משבצות מצוירות
- [ ] **ההילה בפוזה 2 יושבת על שקיפות**, לא על דפוס מצויר

## שליחה

לתיקיית `Avatar`, בשם `idan_sheet.png`, ותגיד לי **כמה שורות ועמודות**.
אני חותך ומכניס ל-`public/avatars/idan/`.
