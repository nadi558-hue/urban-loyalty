# מאיה — גיליון פוזות מלא (Nano Banana / Gemini)

הדמות השקטה והתומכת. שיער חום-ערמוני בקוק גבוה, סט בורדו.

> יש כבר 16 פוזות נקיות של מאיה ב-`public/avatars/maya/`. אם אתה רק מחליף
> אותן בגרסה טובה יותר — מסלול א׳ למטה הוא הכי בטוח, כי אפשר להעלות את
> `basic.png` הקיים כרפרנס וזה נועל את הזהות מיד.

---

## ⚠️ שלושת הכללים שנכשלו בפעם הקודמת

1. **רקע** — הגיליון יצא עם משבצות שקיפות **מצוירות כפיקסלים אפורים**.
   0% מהקובץ היה שקוף. בקש **alpha אמיתי**, או **ירוק אחיד `#00B140`**.
2. **טקסט** — היו שמות פוזות מוטבעים בתמונה. **אפס טקסט.**
3. **עקביות** — הדמות השתנתה בין פאנלים. הפתרון במסלול א׳.

---

# מסלול א׳ — הבטוח (מומלץ)

## שלב 1 — צור רק את `basic`

```
Hand-painted watercolor illustration with delicate ink line-art outlines,
soft muted warm palette, subtle paper texture, calm premium boutique-fitness look.
Single character, full body, centered, facing the viewer, even soft front
lighting, no harsh shadows.

CHARACTER: A woman in her early 30s, warm friendly face, fair light-olive skin,
soft natural makeup, straight expressive eyebrows, gentle warm smile.
Dark chestnut-brown hair pulled up into a neat high bun, with a few loose
strands framing her face. Lean athletic build with a defined midriff.
OUTFIT: deep burgundy ribbed racerback sports bra and matching burgundy
high-waist leggings.
PRESENCE: calm, warm, reassuring — the steady one who has your back.

POSE: relaxed grounded standing, weight even on both feet, hands loosely
clasped in front at the waist, warm confident closed-mouth smile.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern.

STRICT: no text, no words, no labels, no numbers, no UI, no phone frame,
no navigation bar, no floor, no ground shadow, no props.
Portrait 3:4, high detail, at least 1024px wide.
```

בחר את הכי טוב. **זו נועלת את הזהות.**
(או פשוט העלה את `public/avatars/maya/basic.png` הקיים.)

## שלב 2 — הגיליון

**העלה את `basic` כרפרנס**, ואז:

```
Using this EXACT same woman as reference — identical face, hairstyle, hair
colour, skin tone, body and outfit in every single panel — create ONE image
containing a 4x4 grid of 16 poses of her.

Read left to right, top to bottom, the 16 poses are:
1  relaxed standing, hands loosely clasped at the waist, warm confident smile
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
  so her head and feet line up across all 16 cells.
- Even 4x4 grid, equal cell sizes, generous even margins.
- No gridlines, no borders, no frames between cells.
- Her hair stays in the SAME high bun in every panel.

BACKGROUND: fully transparent, real alpha channel.
If transparency is unavailable, use a flat solid green #00B140 fill.
Do NOT draw a checkerboard pattern.

ABSOLUTELY NO TEXT: no pose names, no numbers, no captions, no labels,
no watermark anywhere in the image.

Same watercolor and ink style throughout. Very high resolution.
```

---

# מסלול ב׳ — הזריז

הרצה אחת: קח את בלוק ה-**CHARACTER + OUTFIT** משלב 1, הדבק לתוך פרומפט
הגיליון במקום `Using this EXACT same woman as reference`, והוסף:

```
The SAME woman must appear in all 16 panels — identical face, hair and outfit
in every cell. Her hair stays in the same high bun throughout.
Do not vary her age, hairstyle, hair colour or clothing.
```

מהיר, אבל זה מה שנכשל בעבר. אם יוצא לא עקבי — עבור למסלול א׳.

---

## סט מינימלי של 8

`basic, energetic, empathetic, celebrate, streak_flame, wave, thumbs_up, rest`

רשת 4x2. שנה בפרומפט `4x4 grid of 16` ל-`4x2 grid of 8` והשאר את השורות
1, 2, 3, 4, 5, 9, 8, 14 בסדר הזה.

---

## פריימי אנימציה (בונוס)

לתנועה קטנה בסגנון דולינגו — **אותה פוזה פעמיים** עם שינוי אחד:

| אפקט | פריים א׳ | פריים ב׳ |
|---|---|---|
| חיוך | פה סגור | פה פתוח בחיוך |
| נפנוף | יד למטה | יד למעלה |
| מצמוץ | עיניים פקוחות | עיניים עצומות |

```
Keep this EXACT same image — identical person, pose, outfit, framing, scale and
vertical position. Change ONLY: <<< השינוי הקטן >>>
Everything else must stay pixel-identical.
Fully transparent background with a real alpha channel. No text.
```

---

## בדיקה לפני ששולח לי

- [ ] אין שום טקסט בתמונה
- [ ] אותה אישה בכל התאים — פנים, קוק, סט בורדו
- [ ] הראש והרגליים בערך באותו גובה בכל תא
- [ ] הרקע שקוף באמת (או ירוק אחיד), לא משבצות מצוירות

## שליחה

לתיקיית `Avatar`, בשם `maya_sheet.png`, ותגיד לי **כמה שורות ועמודות**.
אני חותך ומכניס ל-`public/avatars/maya/`.
