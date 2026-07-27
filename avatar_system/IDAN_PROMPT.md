# עידן — פרומפט מוכן להעתקה (Nano Banana / Gemini)

## מצב נוכחי

יש **6 פוזות**, מתוכן 5 נקיות. חסרות **10**, ואחת צריכה יצירה מחדש.

| קיים ותקין | צריך יצירה מחדש | חסר לגמרי |
|---|---|---|
| `basic` `empathetic` `celebrate` `lets_go` `rest` | `energetic` | `streak_flame` `trophy` `clap` `thumbs_up` `wave` `wink` `offer_hand` `streak_lost` `level_up` `meditate` |

**למה `energetic` צריך יצירה מחדש:** ההילה הזהובה חצי-שקופה, ומתחתיה נראו
משבצות הרקע. כיוון שהפיקסלים האלה מקבלים גוון זהוב הם כבר לא אפור נייטרלי,
ולכן מסיר הרקע לא יכול לחתוך אותם. עם alpha אמיתי הבעיה נעלמת.

---

## ⚠️ הכלל היחיד שחייב להשתנות

הגיליון הקודם יוצא עם משבצות השקיפות **מצוירות כפיקסלים אפורים** — 0% מהקובץ
היה שקוף באמת. בקש **alpha אמיתי**. אם אי אפשר, בקש **רקע ירוק אחיד `#00B140`**
— הוא רחוק מכל צבע בציור ונחתך מושלם.

---

## שלב 1 — נעילת הזהות

**יש לך כבר `basic` תקין.** אל תייצר אותו מחדש — **העלה אותו כתמונת רפרנס**
לכל פוזה חדשה. זה מה שמונע מהדמות להשתנות בין הפאנלים.

הקובץ: `public/avatars/idan/basic.png`

---

## שלב 2 — תבנית לכל פוזה

העלה את `basic` כרפרנס, ואז:

```
Keep this EXACT same person — identical face, hairstyle, hair colour, skin tone,
light stubble, body and outfit. Change ONLY the pose to:

<<< הדבק כאן שורת פוזה מהרשימה למטה >>>

Same watercolor and ink style. Same canvas size, same character scale, same
vertical position on the canvas as the reference.
Fully transparent background with a real alpha channel — do NOT draw a
checkerboard pattern. If transparency is unavailable use flat solid #00B140.
No text, no words, no labels, no UI, no floor, no ground shadow,
no props except those named in the pose.
Portrait 3:4, high detail, at least 1024px wide.
```

### שורות הפוזות

| שם קובץ | שורת הפוזה להדבקה |
|---|---|
| `energetic` ⚠️ | dynamic powerful low lunge holding a single kettlebell in one hand, energised determined expression, surrounded by a soft painterly golden glow and a few sparkle accents — keep the glow soft, not neon |
| `streak_flame` | excited grin, one hand gesturing toward a single small warm flame beside him |
| `trophy` | holding up a small gold trophy with both hands, proud beaming smile |
| `clap` | clapping hands together, cheerful encouraging expression |
| `thumbs_up` | one confident thumbs-up, friendly smile |
| `wave` | friendly wave hello with one hand, welcoming smile |
| `wink` | playful wink with a bright smile, light and delightful |
| `offer_hand` | extending an open hand toward the viewer, warm and inviting |
| `streak_lost` | soft disappointed-but-kind expression, small reassuring shrug |
| `level_up` | triumphant proud pose, a few sparkles and a subtle small crown motif above the head |
| `meditate` | seated cross-legged in lotus, eyes closed, serene peaceful smile |

**סדר עדיפויות** — אם אתה מייצר מעט: `energetic` (תיקון), `streak_flame`,
`thumbs_up`, `wave`. אלה מכסים את רוב הרגעים באפליקציה.

---

## אם הרפרנס לא עובד — ה-DNA המלא

השתמש בזה רק אם אתה מייצר את עידן מאפס:

```
A man in his early 30s, friendly approachable face, light-medium skin,
light stubble. Dark brown-black wavy medium-length slightly-tousled hair.
Fit athletic build with defined shoulders and arms. Outfit: cream-white ribbed
tank top and charcoal-grey training shorts, dark trainers.
Confident, motivating, warm presence.
```

---

## שלב 3 — שלח לי

לתיקיית `Avatar`, באחת משתיים:

- **קבצים נפרדים** — `idan_energetic.png`, `idan_wave.png` … (הכי קל לי)
- **גיליון אחד** — רשת אחידה, **בלי תוויות טקסט**, ותגיד לי כמה שורות ועמודות

אני חותך, מסיר רקע אם צריך, ומעדכן את `public/avatars/idan/`.
