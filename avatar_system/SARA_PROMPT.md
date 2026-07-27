# שרה — גיליון פוזות מלא (Nano Banana / Gemini)

מבוסס על הרפרנס: האישה מפאנלים 1–2 של המוקאפ — שיער שחור גלי, סט ירוק-זית
עם חיתוכים. **הפאנל השלישי במוקאפ הוא אישה אחרת** (שיער ארוך חום-אפרפר,
חולצת כפתורים) — התעלם ממנו, זה מקור הבלבול.

---

## ⚠️ שלושת הכללים שנכשלו בפעם הקודמת

1. **רקע** — הגיליון יצא עם משבצות שקיפות **מצוירות כפיקסלים אפורים**.
   0% מהקובץ היה שקוף. בקש **alpha אמיתי**, או **ירוק אחיד `#00B140`**.
2. **טקסט** — היו תוויות ושמות פוזות מוטבעים בתמונה. **אפס טקסט.**
3. **עקביות** — כל פאנל הראה אישה אחרת. הפתרון בהמשך.

---

# מסלול א׳ — הבטוח (מומלץ)

שתי הרצות. לוקח דקה יותר, יוצא נכון בפעם הראשונה.

## שלב 1 — צור רק את `basic`

```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness look.
Single character, full body, centered, facing the viewer, even soft front
lighting, no harsh shadows.

CHARACTER: A woman in her late 20s, radiant Mediterranean look, warm tan-olive
skin, bright confident smile, strong well-defined dark eyebrows, warm brown eyes.
Voluminous jet-black wavy hair worn loose to the shoulders, side-parted, with
plenty of natural texture and movement. Toned athletic build with a visible
defined midriff.
OUTFIT: olive-green ribbed sports bra with a distinctive horizontal cut-out
detail below the bust and small cut-outs at the waist, plus matching olive-green
high-waist leggings. Barefoot.
PRESENCE: vibrant, magnetic, energetic.

POSE: relaxed grounded standing, weight even on both feet, arms resting
naturally at her sides, warm confident smile.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern.

STRICT: no text, no words, no labels, no numbers, no UI, no phone frame,
no navigation bar, no floor, no ground shadow, no props.
Portrait 3:4, high detail, at least 1024px wide.
```

בחר את התוצאה הכי טובה. **זו נועלת את הזהות.**

## שלב 2 — הגיליון

**העלה את `basic` שבחרת כרפרנס**, ואז:

```
Using this EXACT same woman as reference — identical face, hairstyle, hair
colour, skin tone, body and outfit in every single panel — create ONE image
containing a 4x4 grid of 16 poses of her.

Read left to right, top to bottom, the 16 poses are:
1  relaxed standing, arms at her sides, warm confident smile
2  strong Warrior-II stance, arms extended wide, determined expression,
   surrounded by a soft painterly golden glow and a few sparkle accents
3  one hand resting gently over her heart, head slightly tilted, warm caring smile
4  both arms raised in a joyful V, big open happy smile, mid-celebration
5  excited grin, one hand gesturing toward a single small warm flame beside her
6  holding up a small gold trophy with both hands, proud beaming smile
7  clapping her hands together, cheerful encouraging expression
8  one confident thumbs-up, friendly smile
9  friendly wave hello with one hand, welcoming smile
10 beckoning "come with me", pointing slightly forward, energised motivating look
11 playful wink with a bright smile
12 extending an open hand toward the viewer, warm and inviting
13 soft disappointed-but-kind expression, small reassuring shrug
14 relaxed, holding a water bottle, easy calm smile
15 triumphant proud pose, a few sparkles and a subtle small crown above her head
16 seated cross-legged in lotus, eyes closed, serene peaceful smile

LAYOUT RULES — these matter more than anything else:
- Every panel uses the SAME character scale and the SAME vertical position,
  so her feet and head line up across all 16 cells.
- Even 4x4 grid, equal cell sizes, generous even margins.
- No gridlines, no borders, no frames between cells.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern.

ABSOLUTELY NO TEXT: no pose names, no numbers, no captions, no labels,
no watermark anywhere in the image.

Same watercolor and ink style throughout. Very high resolution.
```

---

# מסלול ב׳ — הזריז

הרצה אחת: קח את **בלוק ה-CHARACTER + OUTFIT** משלב 1, הדבק אותו לתוך פרומפט
הגיליון במקום `Using this EXACT same woman as reference`, והוסף:

```
The SAME woman must appear in all 16 panels — identical face, hair and outfit
in every cell. Do not vary her age, hair length, hair colour or clothing.
```

מהיר יותר, אבל זה בדיוק מה שנכשל בפעם שעברה. אם יוצא לא עקבי — עבור למסלול א׳.

---

## אם 16 יוצא עמוס — סט מינימלי של 8

`basic, energetic, empathetic, celebrate, streak_flame, wave, thumbs_up, rest`

רשת 4x2. מכסה את רוב הרגעים באפליקציה. תשנה בפרומפט את `4x4 grid of 16` ל-
`4x2 grid of 8` ותשאיר רק את השורות הרלוונטיות.

---

## בדיקה לפני ששולח לי

- [ ] אין שום טקסט בתמונה
- [ ] אותה אישה בכל התאים — פנים, שיער, לבוש
- [ ] הראש והרגליים בערך באותו גובה בכל תא
- [ ] הרקע שקוף באמת (או ירוק אחיד), לא משבצות מצוירות

## שליחה

לתיקיית `Avatar`, בשם `sara_sheet.png`, ותגיד לי **כמה שורות ועמודות**.
אני חותך, מסיר רקע אם צריך, ומכניס ל-`public/avatars/sara/`.
