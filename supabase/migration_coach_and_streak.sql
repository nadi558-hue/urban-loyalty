-- ============================================================
--  Urban Club — מיגרציה: בחירת מאמן + מנוע רצף (Phase 1)
-- ============================================================
--  איפה מריצים: Supabase → SQL Editor → New query → הדבק → Run
--  בטוח להריץ יותר מפעם אחת (הכל IF NOT EXISTS).
--  לא מוחק ולא משנה שום נתון קיים — רק מוסיף עמודות וטבלה.
-- ============================================================


-- ── חלק 1: בחירת מאמן ────────────────────────────────────────
-- בלי זה מסך /coach נראה כאילו נשמר אבל חוזר למאיה בכל טעינה.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS preferred_coach TEXT NOT NULL DEFAULT 'maya';

-- רק שלוש הדמויות שקיימות בפועל
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_preferred_coach_check;
ALTER TABLE members
  ADD CONSTRAINT members_preferred_coach_check
  CHECK (preferred_coach IN ('maya', 'sara', 'idan'));


-- ── חלק 2: מנוע הרצף ─────────────────────────────────────────
-- current_streak כבר קיים. אלה החסרים כדי ש-resolveAvatarState()
-- יוכל לעבוד באמת (streak_freezes = מגני רצף שנרכשו בחנות).
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS longest_streak    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date  DATE,
  ADD COLUMN IF NOT EXISTS streak_freezes    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_frozen_on  DATE;

-- מי שכבר יש לו רצף — שהשיא יתחיל ממנו ולא מאפס
UPDATE members
   SET longest_streak = current_streak
 WHERE longest_streak < current_streak;


-- ── חלק 3: התחייבויות ────────────────────────────────────────
-- "אני מתחייב ל-20 אימונים ברצף" — סרגל ההתחייבות מהתכנון.
CREATE TABLE IF NOT EXISTS pledges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  goal_classes  INTEGER NOT NULL,          -- 10 / 20 / 30
  reward_coins  INTEGER NOT NULL,          -- הבונוס בסיום
  progress      INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'failed')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- התחייבות פעילה אחת בכל רגע לכל חבר
CREATE UNIQUE INDEX IF NOT EXISTS pledges_one_active_per_member
  ON pledges (member_id) WHERE status = 'active';


-- ── בדיקה: הרץ את זה אחרי, אמור להחזיר 5 שורות ──────────────
SELECT column_name
  FROM information_schema.columns
 WHERE table_name = 'members'
   AND column_name IN ('preferred_coach','longest_streak','last_active_date','streak_freezes','streak_frozen_on')
 ORDER BY column_name;
