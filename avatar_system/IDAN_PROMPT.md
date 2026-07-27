# עידן — גיליון פוזות (Nano Banana / Gemini) · גרסה 2

הדוחף. שיער כהה גלי, גופייה קרם ומכנס פחם.

> **מצב נוכחי:** יש לעידן **11 פוזות נקיות** ב-`public/avatars/idan/`.
> מאיה ושרה עם 16 מלאות. **חסרות לעידן 5 בלבד:**
> `streak_flame` · `clap` · `thumbs_up` · `streak_lost` · `level_up`
>
> **הרפרנס שלך מוכן:** `public/avatars/idan/basic.png` — העלה אותו כתמונה
> ראשונה בכל הרצה. זה נועל את הזהות ומייתר את שלב היצירה מאפס.

---

## ⚠️ מה נכשל בגיליון הקודם — שלושת אלה חוזרים בפרומפט

| # | מה קרה | התיקון |
|---|---|---|
| 1 | ביקשתי 4×4 = 16, קיבלתי **6×2 = 12** והמודל בחר לעצמו אילו פוזות | הרשת מפורטת עכשיו כשורות מפורשות + ספירה |
| 2 | ב-`celebrate` **הזרועות המורמות נגעו בדמות השכנה** — חיתוך אוטומטי חתך אותה לשניים | דרישת מרווח: כל דמות בתוך התא שלה, כולל זרועות |
| 3 | תא אחד היה **כפילות** של `empathetic` (עוד יד-על-החזה) — נזרק | כל פוזה חייבת להיות שונה ויזואלית |

בנוסף — **רקע ירוק אחיד עבד מצוין**. אל תבקש שקיפות בכלל, זה מה שהרס
את הגיליונות הראשונים (המשבצות צוירו כפיקסלים אמיתיים).

---

# 🎯 מסלול מהיר — רק 5 הפוזות החסרות (מומלץ)

זה מה שאתה באמת צריך. רשת קטנה = פחות סיכוי שהמודל יתבלבל.

**העלה את `public/avatars/idan/basic.png` כרפרנס**, ואז:

```
Using this EXACT same man as reference — identical face, hairstyle, hair colour,
stubble, skin tone, body and outfit in every single panel — create ONE image
containing a 5x1 horizontal row of 5 poses of him.

Read left to right, the 5 poses are:
1  excited grin, one hand gesturing toward a single small warm flame beside him
2  clapping his hands together, cheerful encouraging expression
3  one confident thumbs-up, friendly smile
4  soft disappointed-but-kind expression, small reassuring shrug
5  triumphant proud pose, a few sparkles and a subtle small crown above his head

LAYOUT RULES — these matter more than the poses themselves:
- EXACTLY 5 panels in ONE horizontal row. Not 4, not 6, not two rows.
- Every panel uses the SAME character scale and the SAME vertical position,
  so his head and his feet line up across all 5 cells.
- Each figure must be FULLY CONTAINED inside its own cell, including any
  raised arms, the flame, and the crown. Leave clear empty vertical gaps
  between neighbouring figures — no figure may touch or overlap the next.
- Equal cell widths, generous even margins on all sides.
- No gridlines, no borders, no frames between cells.
- All 5 poses must be visually distinct from each other.

BACKGROUND: a flat solid green #00B140 fill across the entire image.
Do NOT use transparency. Do NOT draw a checkerboard pattern.
Nothing green anywhere on the character or his clothing.

ABSOLUTELY NO TEXT: no pose names, no numbers, no captions, no labels,
no watermark anywhere in the image.

Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture. Very high resolution.
```

---

# מסלול מלא — כל 16 מחדש

אם אתה רוצה סט אחיד לגמרי בסגנון אחד. אותו רפרנס, ואז:

```
Using this EXACT same man as reference — identical face, hairstyle, hair colour,
stubble, skin tone, body and outfit in every single panel — create ONE image
containing a 4x4 grid of 16 poses of him. That is 4 columns and 4 rows,
16 panels in total.

Read left to right, top to bottom, the 16 poses are:

ROW 1:
1  relaxed standing, hands loosely clasped at the waist, easy confident smile
2  dynamic powerful low lunge holding a single kettlebell in one hand,
   energised determined expression, surrounded by a soft painterly golden glow
   and a few sparkle accents — keep the glow soft, not neon
3  one hand resting gently over his heart, head slightly tilted, warm caring look
4  both arms raised in a joyful V, big open happy smile, mid-celebration

ROW 2:
5  excited grin, one hand gesturing toward a single small warm flame beside him
6  holding up a small gold trophy with both hands, proud beaming smile
7  clapping his hands together, cheerful encouraging expression
8  one confident thumbs-up, friendly smile

ROW 3:
9  friendly wave hello with one hand, welcoming smile
10 beckoning "come with me", pointing slightly forward, energised motivating look
11 playful wink with a bright smile
12 extending an open hand toward the viewer, warm and inviting

ROW 4:
13 soft disappointed-but-kind expression, small reassuring shrug
14 relaxed, holding a water bottle, easy calm smile
15 triumphant proud pose, a few sparkles and a subtle small crown above his head
16 seated cross-legged in lotus, eyes closed, serene peaceful expression

LAYOUT RULES — these matter more than anything else:
- EXACTLY 4 columns by 4 rows. 16 panels. Do not change the grid.
- Do not skip, merge, reorder or substitute any pose. All 16 must appear,
  in this order, and all 16 must be visually distinct — no two panels may
  show the same gesture.
- Every panel uses the SAME character scale and the SAME vertical position,
  so his head and his feet line up across all 16 cells.
- Each figure must be FULLY CONTAINED inside its own cell, including raised
  arms, the kettlebell, the trophy, the flame and the crown. Leave clear
  empty gaps between neighbouring figures — no figure may touch, overlap
  or reach into the next cell. Pose 4 in particular has wide raised arms:
  shrink the figure if needed so the arms still fit inside its own cell.
- Equal cell sizes, generous even margins.
- No gridlines, no borders, no frames between cells.

BACKGROUND: a flat solid green #00B140 fill across the entire image.
Do NOT use transparency. Do NOT draw a checkerboard pattern.
Nothing green anywhere on the character or his clothing.
The golden glow in panel 2 must sit directly on the green.

ABSOLUTELY NO TEXT: no pose names, no numbers, no captions, no labels,
no watermark anywhere in the image.

Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness
look. Same style throughout. Very high resolution.
```

---

## אם אין לך את `basic.png` ביד — בלוק הדמות

הדבק את זה במקום `Using this EXACT same man as reference`:

```
CHARACTER: A man in his early 30s, friendly approachable face, light-medium
skin, light stubble along the jaw, warm dark eyes, easy confident smile.
Dark brown-almost-black wavy medium-length hair, slightly tousled with natural
volume. Fit athletic build with defined shoulders and arms.
OUTFIT: cream-white ribbed tank top and charcoal-grey training shorts,
dark trainers. Nothing green.
PRESENCE: confident, motivating, warm — the one who gets you moving.

The SAME man must appear in every panel — identical face, hair, stubble and
outfit in every cell. Do not vary his age, hairstyle, hair colour or clothing.
```

---

## ✅ בדיקה לפני ששולח לי

- [ ] **ספרת את התאים** — 5 בשורה אחת, או 16 ברשת 4×4
- [ ] אין שום טקסט או מספרים בתמונה
- [ ] אותו גבר בכל תא — פנים, זקן קל, גופייה קרם, מכנס פחם
- [ ] הראש והרגליים בערך באותו גובה בכל תא
- [ ] **אין דמות שנוגעת בשכנה** — במיוחד זרועות מורמות
- [ ] אין שתי פוזות זהות
- [ ] הרקע ירוק אחיד, בלי משבצות, ואין ירוק על הדמות

## שליחה

לתיקייה:
`C:\Users\nadi5\OneDrive\Desktop\AI\אפליקציה חבר מועדון urban\Avatar\`

בשם `idan sheet 2.png`, ותגיד לי **כמה עמודות וכמה שורות** יצאו בפועל
(לא מה שביקשת — מה שקיבלת). אני חותך ומכניס ל-`public/avatars/idan/`.
