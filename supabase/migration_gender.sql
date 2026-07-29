-- ─── Member gender, for how the coach addresses them ─────────────────────
--
-- Hebrew inflects the second person, so a coach line has to pick a form. The
-- app defaults to 'unspecified' and uses genuinely neutral phrasing for it —
-- misgendering a member is worse than a slightly less personal sentence, and
-- Arbox does not expose gender in the reports we pull, so there is nothing to
-- import and nothing worth guessing from a first name.
--
-- Members set this themselves on /coach. Safe to run more than once.
--
-- Run in the Supabase SQL editor.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'unspecified';

ALTER TABLE members DROP CONSTRAINT IF EXISTS members_gender_check;
ALTER TABLE members
  ADD CONSTRAINT members_gender_check
  CHECK (gender IN ('female', 'male', 'unspecified'));

-- Verification — everyone should start out unspecified.
SELECT gender, COUNT(*) FROM members GROUP BY gender ORDER BY gender;
