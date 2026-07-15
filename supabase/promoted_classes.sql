-- Happy Hour · Promoted Classes — שיעורים שהמנהל בוחר לקדם (רוטציה)
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promoted_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                       -- שם השיעור המקודם, e.g. "Reformer"
  branch TEXT,                               -- סניף (אופציונלי)
  schedule_label TEXT,                       -- מתי (טקסט חופשי) e.g. "יום ג׳ 18:00"
  bonus_coins INTEGER NOT NULL DEFAULT 5,    -- בונוס UC נוסף על השיעור המקודם
  note TEXT,                                 -- הערה / סיבת הקידום
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Server-only access (service-role bypasses RLS); block direct anon access
ALTER TABLE promoted_classes ENABLE ROW LEVEL SECURITY;

-- Members may read the currently-active promoted classes (safe to show in-app)
DROP POLICY IF EXISTS promoted_classes_public_read ON promoted_classes;
CREATE POLICY promoted_classes_public_read ON promoted_classes
  FOR SELECT USING (active = true);
