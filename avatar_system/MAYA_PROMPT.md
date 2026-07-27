# מאיה — פרומפט מוכן להעתקה (Nano Banana / Gemini)

## מצב נוכחי

**מאיה שלמה.** כל 16 הפוזות קיימות ונקיות ב-`public/avatars/maya/`:

`basic` `energetic` `empathetic` `celebrate` `streak_flame` `trophy` `clap`
`thumbs_up` `wave` `lets_go` `wink` `offer_hand` `streak_lost` `rest`
`level_up` `meditate`

**לא צריך לייצר כלום.** הקובץ הזה נועד לשני מקרים בלבד:

1. אתה רוצה **פוזה חדשה** שאין ברשימה
2. אתה רוצה **פריימי אנימציה** (אותה פוזה עם שינוי קטן)

---

## נעילת הזהות

יש לך `basic` נקי — **העלה אותו כתמונת רפרנס** לכל דבר חדש. אל תייצר את מאיה
מאפס; ככה היא נשארת אותה דמות בדיוק.

הקובץ: `public/avatars/maya/basic.png`

---

## תבנית לפוזה חדשה

```
Keep this EXACT same person — identical face, hairstyle, hair colour, skin tone,
body and outfit. Change ONLY the pose to:

<<< תאר כאן את הפוזה החדשה באנגלית >>>

Same watercolor and ink style. Same canvas size, same character scale, same
vertical position on the canvas as the reference.
Fully transparent background with a real alpha channel — do NOT draw a
checkerboard pattern. If transparency is unavailable use flat solid #00B140.
No text, no words, no labels, no UI, no floor, no ground shadow,
no props except those named in the pose.
Portrait 3:4, high detail, at least 1024px wide.
```

### רעיונות לפוזות שעדיין אין

| שם מוצע | שורת הפוזה |
|---|---|
| `sad_streak_freeze` | holding a small pale-blue snowflake shield, gentle protective expression |
| `pledge` | hand raised in a small confident promise gesture, resolute warm look |
| `high_five` | one palm raised forward for a high five, bright encouraging smile |
| `stretch` | calm standing side stretch, one arm overhead, serene expression |
| `coffee` | relaxed, holding a warm cup with both hands, cosy content smile |
| `sleep` | eyes closed, head tilted onto joined hands, peaceful resting expression |

---

## פריימי אנימציה (החלק החשוב)

בשביל תנועה קטנה בסגנון דולינגו, **אל תייצר פוזה אחרת** — תייצר את **אותה
פוזה פעמיים** עם שינוי אחד קטן, ותחליף ביניהן.

| אפקט | פריים א׳ | פריים ב׳ |
|---|---|---|
| חיוך | `basic` פה סגור | `basic` פה פתוח בחיוך |
| נפנוף | `wave` יד למטה | `wave` יד למעלה |
| מצמוץ | `basic` עיניים פקוחות | `basic` עיניים עצומות |
| נשימה | `basic` רגיל | `basic` כתפיים מעט מורמות |

תבנית לפריים שני:

```
Keep this EXACT same image — identical person, pose, outfit, framing, scale and
vertical position. Change ONLY: <<< השינוי הקטן, למשל: her mouth from a closed
smile to an open happy smile >>>
Everything else must stay pixel-identical.
Fully transparent background with a real alpha channel.
```

**חוק הברזל:** אותו קנבס, אותו גודל דמות, אותו מיקום אנכי. אם זה זז — האנימציה
"תקפוץ" והכל ייראה זול.

---

## ה-DNA המלא (רק אם מייצרים מאפס)

```
A woman in her early 30s, warm friendly face, fair light-olive skin, soft natural
makeup, straight expressive eyebrows. Dark chestnut-brown hair in a neat high bun
with a few loose strands. Lean athletic build. Outfit: deep burgundy ribbed sports
bra and matching burgundy high-waist leggings.
Calm, warm, reassuring presence.
```

---

## שלח לי

לתיקיית `Avatar` — קבצים נפרדים בשם `maya_<pose>.png`, או גיליון אחיד בלי
תוויות טקסט. אני חותך ומעדכן את `public/avatars/maya/`.
