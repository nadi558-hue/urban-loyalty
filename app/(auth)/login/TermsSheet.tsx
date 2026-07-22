'use client'

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: '1. כללי והסכמה לתנאי השימוש',
    items: [
      'אפליקציה זו ומערכת הטבות המועדון ("האפליקציה") מופעלות על ידי חברת אורבן פילאטיס גרופ בע"מ ("הנהלת הסטודיו").',
      'ההרשמה לאפליקציה והשימוש בה מותנים בהסכמה מלאה, מפורשת ובלתי מסויגת לכל התנאים המפורטים בתקנון זה.',
      'ללא סימון אישור אקטיבי על הסכמה לתקנון זה בעת ההרשמה, לא תתאפשר פתיחת חשבון או שימוש באפליקציה ובמערכת ההטבות.',
    ],
  },
  {
    title: '2. זכות בלעדית לשינויים',
    items: [
      'הנהלת הסטודיו שומרת לעצמה את הזכות הבלעדית לשנות, לעדכן, להוסיף או לגרוע מכל תנאי מתנאי תקנון זה, בכל עת ומכל סיבה, ללא הודעה מוקדמת וללא חובת פיצוי.',
      'הנהלת הסטודיו מחזיקה בשליטה מלאה על: ערך ואופן צבירת Urban Coins · חוקי ומחירי מנגנון חבר-מביא-חבר · תנאי ההנחות, מחירי המנויים וחוקי הביטול · הפסקה זמנית או מוחלטת של האפליקציה ומערכת המטבעות.',
      'המשך השימוש באפליקציה לאחר עדכון התקנון מהווה הסכמה אוטומטית ומלאה לתנאים החדשים.',
    ],
  },
  {
    title: '3. מנגנון המטבעות (Urban Coins)',
    items: [
      'ה-Urban Coins הם תגים דיגיטליים פנימיים לצרכי משחק והטבות בתוך הסטודיו בלבד. אין להם כל ערך כספי, מסחרי או קנייני מחוץ לאפליקציה.',
      'לא ניתן להמיר, לפדות או להחליף Coins בכסף מזומן, החזר כספי או זיכוי כספי מכל סוג.',
      'הנהלת הסטודיו רשאית לאפס, לשנות או לבטל יתרת Coins של משתמש או של כלל המשתמשים, לרבות קביעת תאריך תפוגה, לפי שיקול דעתה הבלעדי.',
    ],
  },
  {
    title: '4. מנגנון חבר מביא חבר',
    items: [
      'קבלת הבונוס בגין הזמנת חבר מותנית בכך שהמוזמן הוא לקוח חדש לחלוטין שהשלים רכישה ראשונה בפועל של מנוי או כרטיסייה דרך האפליקציה.',
      'הנהלת הסטודיו רשאית לבטל או לחסום הענקת מטבעות/הטבות בכל מקרה של חשד למרמה, ניצול לרעה או חשבונות פיקטיביים.',
    ],
  },
  {
    title: '5. ביטול שימוש וחסימת משתמשים',
    items: [
      'הנהלת הסטודיו רשאית לחסום, להשעות או לבטל לאלתר כל חשבון, ללא הסבר או התראה מוקדמת, ובפרט בהפרת תקנון או פגיעה בפעילות העסקית.',
      'בסגירת חשבון (יזומה או על ידי הסטודיו) תתבטל מיידית יתרת ה-Urban Coins ללא זכות לפיצוי.',
    ],
  },
  {
    title: '6. הגבלת אחריות',
    items: [
      'האפליקציה ומערכת ההטבות ניתנות כפי שהן (AS IS), ללא התחייבות לפעילות רציפה ונטולת תקלות.',
      'המשתמש מוותר על כל טענה, דרישה או תביעה כנגד אורבן פילאטיס גרופ בע"מ, בעליה או מנהליה בקשר לשינויים בתקנון, איפוס מטבעות או שינוי בתנאי המועדון.',
    ],
  },
]

export default function TermsSheet({ onClose, onAgree }: { onClose: () => void; onAgree: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="max-w-md w-full"
        style={{
          background: '#2A211C', borderRadius: '24px 24px 0 0',
          maxHeight: '86dvh', display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(192,144,111,0.2)', borderBottom: 'none',
        }}
      >
        <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid rgba(192,144,111,0.15)' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(192,144,111,0.3)', margin: '0 auto 14px' }} />
          <p style={{ fontFamily: 'var(--font-frank,serif)', fontSize: 18, fontWeight: 700, color: '#F6EFEA', textAlign: 'center' }}>
            תקנון ותנאי שימוש
          </p>
          <p style={{ fontSize: 11, color: 'rgba(245,240,230,0.4)', textAlign: 'center', marginTop: 2 }}>
            מועדון לקוחות Urban Pilates
          </p>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
          {SECTIONS.map(sec => (
            <div key={sec.title} style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#DBB89C', marginBottom: 6, fontFamily: 'var(--font-assistant,sans-serif)' }}>
                {sec.title}
              </p>
              {sec.items.map((it, i) => (
                <p key={i} style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(245,240,230,0.65)', marginBottom: 6 }}>
                  {it}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px max(14px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(192,144,111,0.15)' }}>
          <button
            onClick={onAgree}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#DBB89C,#C0906F)', color: '#3B2E27' }}
          >
            קראתי ואני מסכים/ה לתקנון
          </button>
          <button
            onClick={onClose}
            className="w-full text-xs py-2.5"
            style={{ color: 'rgba(245,240,230,0.35)' }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  )
}
