-- ─── Tiers that mean something ────────────────────────────────────────────
--
-- Two problems this fixes.
--
-- 1. A tier granted nothing. Nothing in the code read it, and the rewards table
--    had no way to require one, so the perks shown in the app ("10% הנחה",
--    "סדנה חינם") were display text the studio had to honour by hand. Adding
--    rewards.min_tier lets a reward actually be reserved for a tier.
--
-- 2. A tier could never be lost. It was derived from lifetime_coins, which only
--    ever grows, so Gold was permanent even after years away. members.
--    qualifying_coins holds the coins earned in the last 12 months instead, and
--    the nightly cron recomputes it and the tier from it.
--
-- Safe to run more than once. Nothing is deleted; qualifying_coins is seeded
-- from the ledger so nobody is demoted by the migration itself.

-- ── Part 1: rewards can require a tier ───────────────────────────────────
ALTER TABLE rewards
  ADD COLUMN IF NOT EXISTS min_tier TEXT NOT NULL DEFAULT 'silver';

ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_min_tier_check;
ALTER TABLE rewards
  ADD CONSTRAINT rewards_min_tier_check
  CHECK (min_tier IN ('silver', 'gold', 'platinum'));

-- ── Part 2: rolling 12-month qualifying total ────────────────────────────
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS qualifying_coins INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier_reviewed_at DATE;

-- Seed from the ledger: positive entries in the last 12 months. Opening-balance
-- rows are dated to when the member joined, so a long-standing member's
-- historic balance correctly does not count toward requalification.
UPDATE members m
   SET qualifying_coins = COALESCE((
         SELECT SUM(l.points)
           FROM point_ledger l
          WHERE l.member_id = m.id
            AND l.points > 0
            AND l.created_at >= now() - INTERVAL '12 months'
       ), 0);

-- Grandfather the current tier: seeding must never demote anyone on day one.
-- The nightly review takes over from here, and any drop happens only after the
-- notice period the terms describe.
UPDATE members
   SET qualifying_coins = GREATEST(qualifying_coins, 1500)
 WHERE tier = 'platinum';
UPDATE members
   SET qualifying_coins = GREATEST(qualifying_coins, 500)
 WHERE tier = 'gold';

-- ── Verification ─────────────────────────────────────────────────────────
SELECT tier,
       COUNT(*)                       AS members,
       MIN(qualifying_coins)          AS min_qualifying,
       ROUND(AVG(qualifying_coins))   AS avg_qualifying
  FROM members
 GROUP BY tier
 ORDER BY tier;

SELECT min_tier, COUNT(*) AS rewards FROM rewards GROUP BY min_tier ORDER BY min_tier;
