-- ─── Opening balance reconciliation ───────────────────────────────────────
--
-- The app maintains two invariants (see lib/points.ts awardPoints):
--
--     members.lifetime_coins = SUM of POSITIVE point_ledger rows
--     members.total_coins    = SUM of ALL      point_ledger rows
--
-- Members imported from Arbox, or seeded before the ledger existed, carry
-- balances that no ledger row explains. That was invisible while the history
-- screen rendered demo data; now that it reads the real ledger, a member sees
-- "174 UC" in the header while the list below sums to 27.
--
-- This inserts, per member, at most two rows that close the gap:
--
--   opening_balance     +earned gap   (coins earned before the ledger existed)
--   opening_redemption  -spent  gap   (coins already spent before the ledger)
--
-- It is INSERT-only. It never touches members.total_coins or lifetime_coins —
-- those are the figures being reconciled TO, not corrected. Re-running is safe:
-- members who already have an opening row are skipped, so a second run inserts
-- nothing. Rows are dated to members.created_at so they sort to the bottom of
-- the history screen, below real activity.
--
-- Run in the Supabase SQL editor. Review the SELECT at the bottom first.

BEGIN;

WITH ledger_totals AS (
  SELECT
    m.id,
    m.created_at,
    m.lifetime_coins,
    m.total_coins,
    COALESCE(SUM(l.points) FILTER (WHERE l.points > 0), 0) AS ledger_earned,
    COALESCE(-SUM(l.points) FILTER (WHERE l.points < 0), 0) AS ledger_spent,
    COUNT(*) FILTER (WHERE l.reason IN ('opening_balance', 'opening_redemption')) AS already_seeded
  FROM members m
  LEFT JOIN point_ledger l ON l.member_id = m.id
  GROUP BY m.id, m.created_at, m.lifetime_coins, m.total_coins
),
gaps AS (
  SELECT
    id,
    created_at,
    lifetime_coins - ledger_earned                       AS earned_gap,
    (lifetime_coins - total_coins) - ledger_spent        AS spent_gap
  FROM ledger_totals
  WHERE already_seeded = 0
)
INSERT INTO point_ledger (member_id, points, reason, metadata, created_at)
SELECT id, earned_gap, 'opening_balance',
       jsonb_build_object('note', 'יתרת פתיחה · לפני מעבר לאפליקציה'),
       created_at
FROM gaps
WHERE earned_gap > 0

UNION ALL

SELECT id, -spent_gap, 'opening_redemption',
       jsonb_build_object('note', 'מימושים קודמים · לפני מעבר לאפליקציה'),
       created_at
FROM gaps
WHERE spent_gap > 0;

COMMIT;

-- ─── Verification — every row should read balanced = true ─────────────────
-- A member is balanced when the ledger reproduces both stored figures.
SELECT
  m.name,
  m.lifetime_coins,
  m.total_coins,
  COALESCE(SUM(l.points) FILTER (WHERE l.points > 0), 0) AS ledger_earned,
  COALESCE(SUM(l.points), 0)                             AS ledger_total,
  (
    m.lifetime_coins = COALESCE(SUM(l.points) FILTER (WHERE l.points > 0), 0)
    AND m.total_coins = COALESCE(SUM(l.points), 0)
  ) AS balanced
FROM members m
LEFT JOIN point_ledger l ON l.member_id = m.id
GROUP BY m.id, m.name, m.lifetime_coins, m.total_coins
ORDER BY balanced, m.name;
