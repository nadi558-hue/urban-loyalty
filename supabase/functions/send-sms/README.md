# send-sms — הפעלה

Hook שמאפשר לסופהבייס לשלוח SMS דרך ספק ישראלי במקום Twilio.
הרקע והמחירים ב-`docs/SMS_READINESS.md`.

⚠️ **כל עוד לא הפעלת אותו בהגדרות, הקוד הזה לא רץ ולא משפיע על כלום.**

## מה הוא לא עושה

**הוא לא נוגע ברשימת Test OTP.** סופהבייס בודק אותה לפני שהוא פונה לכאן,
ומחזיר את הקוד הקבוע בלי לקרוא לפונקציה. פנינה והמזכירות ממשיכות בדיוק
כמו היום, בלי SMS ובלי עלות — גם אחרי שזה יעלה לאוויר.

## שלב 1 — פריסה במצב יומן (בלי לשלוח כלום)

ברירת המחדל היא ספק בשם `log`: הוא לא שולח הודעה, רק כותב אותה ליומן
ומחזיר הצלחה. **ככה בודקים את כל המסלול בלי חשבון ובלי לשלם.**

```bash
npx supabase functions deploy send-sms --no-verify-jwt
```

`--no-verify-jwt` נחוץ: סופהבייס קורא לפונקציה עם חתימת webhook, לא עם
טוקן משתמש. האימות נעשה בקוד מול `SEND_SMS_HOOK_SECRET`.

## שלב 2 — הפעלה בסופהבייס

Dashboard → Authentication → Hooks → **Send SMS** → בוחרים את הפונקציה.
סופהבייס ייצר סוד בצורה `v1,whsec_…`. מעתיקים אותו ל:

```bash
npx supabase secrets set SEND_SMS_HOOK_SECRET="v1,whsec_..."
```

עכשיו מספר **שאינו** ברשימת Test OTP יעבור דרך הפונקציה. בודקים ביומן:

```bash
npx supabase functions logs send-sms
```

שורה `[send-sms] would send to 05XXXXXXXX: הקוד שלך…` אומרת שהמסלול שלם.

## שלב 3 — חיבור ספק אמיתי

רק בשלב הזה צריך חשבון.

```bash
npx supabase secrets set SMS_PROVIDER=sms4free \
  SMS4FREE_KEY=... SMS4FREE_USER=... SMS4FREE_PASS=... SMS_SENDER=URBAN
```

או:

```bash
npx supabase secrets set SMS_PROVIDER=textme \
  TEXTME_TOKEN=... SMS_SENDER=URBAN
```

⚠️ **לפני שמפעילים ספק אמיתי — לאמת את מבנה הבקשה ב-`providers.ts` מול
התיעוד בחשבון שלך.** שדות ההזדהות של SMS4FREE (`user` / `pass` / `key`)
מתועדים בדף ה-API הציבורי, אבל את שאר השדות ואת הכתובת המדויקת לא הצלחתי
לאמת מבחוץ. זה החלק היחיד כאן שלא נבדק מקצה לקצה — שינוי של שורה, אבל
צריך לעשות אותו בעיניים פתוחות.

## שלב 4 — בדיקה אמיתית אחת

**לפני שמודיעים למישהי:** לבקש קוד למספר אמיתי אחד שלא ברשימת Test OTP,
ולוודא שההודעה מגיעה ושהשולח מוצג כ-URBAN.

## חזרה אחורה

לכבות את ה-Hook במסך Authentication → Hooks. סופהבייס חוזר מיד לספק
המובנה. רשימת Test OTP ממשיכה לעבוד בכל מצב.
