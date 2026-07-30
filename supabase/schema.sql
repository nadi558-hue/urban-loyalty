-- Urban Studio Loyalty App – Supabase Schema v2
-- Urban Coins Economy – Run this in the Supabase SQL Editor

-- Members table (synced from Arbox)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arbox_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  birth_date DATE,
  tier TEXT NOT NULL DEFAULT 'silver' CHECK (tier IN ('silver', 'gold', 'platinum')),
  total_coins INTEGER NOT NULL DEFAULT 0,       -- ארנק נוכחי (ניתן למימוש)
  lifetime_coins INTEGER NOT NULL DEFAULT 0,    -- כל הזמנים (לחישוב רמה)
  preferred_branch TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  referred_by UUID REFERENCES members(id),
  welcome_bonus_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only ledger of all coin events
CREATE TABLE IF NOT EXISTS point_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,           -- positive = צבירה, negative = מימוש
  reason TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sync tracking – prevents double-awarding for same Arbox check-in
CREATE TABLE IF NOT EXISTS processed_checkins (
  arbox_checkin_id TEXT PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  is_happy_hour BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rewards catalog (status/discount perks only — no physical merch)
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cost_coins INTEGER NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'discount' CHECK (reward_type IN ('priority', 'discount', 'class', 'workshop', 'other')),
  emoji TEXT NOT NULL DEFAULT '✨',
  stock INTEGER,                 -- null = ללא הגבלה
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Redemption records
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  coins_spent INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'cancelled')),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES members(id),
  referred_phone TEXT NOT NULL,
  referred_member_id UUID REFERENCES members(id),
  trial_bonus_given BOOLEAN NOT NULL DEFAULT false,    -- 50 coins when trial attended
  sub_bonus_given BOOLEAN NOT NULL DEFAULT false,      -- 50 coins when subscription bought
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Happy Hour windows (configurable by admin)
CREATE TABLE IF NOT EXISTS happy_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch TEXT,                   -- null = כל הסניפים
  day_of_week INTEGER,           -- 0=Sun, 6=Sat, null = כל יום
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  multiplier NUMERIC NOT NULL DEFAULT 2,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configurable coin rules (editable from admin dashboard)
CREATE TABLE IF NOT EXISTS point_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sync run log
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_ins_found INTEGER NOT NULL DEFAULT 0,
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  errors TEXT
);

-- ─── Default coin rules ────────────────────────────────────────────────────
-- Rebalanced: class_attended carries the incentive to attend at all, and
-- half_month gives a 2x/week member a bonus of their own instead of missing
-- the old single cliff at 12 classes by a wide margin. See migration_tiers.sql
-- for the reasoning and the full frequency table.
INSERT INTO point_rules (key, points, description) VALUES
  ('class_attended',      3,  'Urban Coin לכל שיעור שהושלם'),
  ('streak_10',           10, 'בונוס על 10 שיעורים רצופים ללא ביטול'),
  ('half_month',          12, 'בונוס חצי חודש – 8+ שיעורים'),
  ('full_month',          30, 'בונוס חודש מלא – 12+ שיעורים'),
  ('happy_hour',          1,  'כפל מטבעות בשיעור Happy Hour (+1 נוסף)'),
  ('welcome_bonus',       20, 'בונוס הצטרפות לאפליקציה'),
  ('referral_trial',      50, 'חבר הגיע לשיעור ניסיון'),
  ('referral_subscribed', 50, 'חבר רכש מנוי (גם מפנה וגם מופנה)'),
  ('social_share',        2,  'שיתוף סטורי עם תיוג הסטודיו (פעם בחודש)'),
  ('birthday',            50, 'מתנת יום הולדת'),
  ('anniversary',         20, 'שנת חברות בסטודיו')
ON CONFLICT (key) DO UPDATE SET points = EXCLUDED.points;

-- ─── Default rewards catalog (matches the app UI) ─────────────────────────
-- Prices scale with the rebalanced class value above. The two premium rewards
-- are gold-gated (see migration_tiers.sql for rewards.min_tier) and priced so
-- an active Gold member redeems each roughly once a quarter, not weekly.
INSERT INTO rewards (name, description, cost_coins, reward_type, emoji) VALUES
  ('הקפצה בראש רשימת המתנה',          'קפיצה לראש רשימת ההמתנה בשיעור מלא',                       60,  'priority', '⤴️'),
  ('שריון מוקדם · שבוע מראש',          'פתיחת מערכת השעות שבוע לפני כולם',                          110, 'priority', '📅'),
  ('5% הנחה · חידוש מנוי או כרטיסייה',  '5% הנחה על החידוש הבא (מנוי פעיל 3+ חודשים)',              140, 'discount', '💫'),
  ('10% הנחה · חידוש מנוי או כרטיסייה', '10% הנחה על החידוש הבא (מנוי פעיל 3+ חודשים)',             400, 'discount', '💰'),
  ('שריון VIP · שבועיים מראש',          'פתיחת מערכת השעות שבועיים לפני כולם',                       330, 'priority', '⭐'),
  ('שיעור בודד מעבר למכסה',            'שיעור נוסף מעבר למכסת המנוי החודשי',                        370, 'class',    '🎫')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  cost_coins  = EXCLUDED.cost_coins,
  reward_type = EXCLUDED.reward_type,
  emoji       = EXCLUDED.emoji;

-- ─── Default Happy Hours ───────────────────────────────────────────────────
INSERT INTO happy_hours (branch, day_of_week, start_time, end_time, multiplier) VALUES
  (NULL, 5, '10:00', '14:00', 2),  -- שישי 10:00-14:00 כל הסניפים
  (NULL, 0, '12:00', '16:00', 2)   -- ראשון 12:00-16:00 כל הסניפים
ON CONFLICT DO NOTHING;

-- ─── Updated_at trigger ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS point_rules_updated_at ON point_rules;
CREATE TRIGGER point_rules_updated_at BEFORE UPDATE ON point_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────
-- All app access goes through the server with the service-role key (bypasses RLS).
-- Enabling RLS with no policies blocks any direct access via the public anon key.
ALTER TABLE members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_ledger       ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards            ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE happy_hours        ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log           ENABLE ROW LEVEL SECURITY;

-- Read-only public access to the rewards catalog (safe to display before login)
DROP POLICY IF EXISTS rewards_public_read ON rewards;
CREATE POLICY rewards_public_read ON rewards FOR SELECT USING (active = true);
