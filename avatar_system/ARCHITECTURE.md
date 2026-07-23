# Gamification Architecture — Streak Engine + Coach Avatar

How the coach avatar, the workout streak, and the Urban-Coin economy fit
together, grounded in the app's **existing** logic (Supabase + `/api/sync` +
`point_ledger`). This is the source of truth for the streak system.

---

## 0. The loop in one line
> **Verified attendance** (Arbox `attended` × QR scan) → **updates the streak** →
> the streak's **state** drives **coins/milestones**, the **avatar image**, and the
> **message**. One **daily cron** handles decay & the Streak Freeze.

```
          ┌────────────────────── daily cron (04:00, Asia/Jerusalem) ─────────────────────┐
          ▼                                                                                │
   [ member trains ] ──QR scan (pending)──┐                                                │
                                          ▼                                                │
                              /api/sync cross-check ──verified──► onAttendance()           │
                                          │                          │                     │
                              late cancel │                          ├─ current_streak++   │
                                          ▼                          ├─ milestone? → UC     │
                                    streak reset → 0                 └─ last_active_date=today
                                                                                           │
                                          dailyRollover(member) ◄──────────────────────────┘
                                          (missed the window? → freeze or break)
                                          │
                                          ▼
                       streakState ──► { avatar image, message, coins }  (home screen)
```

---

## 1. What exists today (do not rebuild)
| Piece | Where | Behaviour |
|---|---|---|
| `members.current_streak` | `checkin_crosscheck.sql` | +1 per verified attendance; `0` on late cancel |
| streak increment + `streak_10` bonus | `app/api/sync/route.ts` | every 10 → +10 UC |
| coin economy | `lib/points.ts` (`awardPoints`, `point_ledger`, tiers) | source of truth for UC |
| avatar state resolver | `avatar_system/avatar_logic.js` | `resolveAvatarState(user)` |

**Gap:** the streak only ever breaks on a *late cancel* — it never decays from
simply not showing up, and there is no Streak Freeze. The work below closes that.

---

## 2. Core decision — what actually *is* a streak?
A boutique studio is **not** Duolingo-daily (nobody trains 7×/week). So the streak
must respect rest days. Chosen model:

> **Active-day streak with a grace window.** The streak counts consecutive
> **active days** (a calendar day with ≥1 verified attendance). It stays alive as
> long as the gap between active days is **≤ `STREAK_WINDOW_DAYS`** (**3** — DECIDED).
> Exceeding the window consumes a **Streak Freeze** if available, otherwise the
> streak breaks.

`STREAK_WINDOW_DAYS = 3` (train at least every 3rd day). **Future:** members who
consistently train every ≤2 days get promoted to a tougher "elite rhythm" challenge
with richer rewards (not in v1).

---

## 3. Data model — additions to `members`
```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS longest_streak    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_active_date  DATE;          -- last day counted
ALTER TABLE members ADD COLUMN IF NOT EXISTS streak_freezes    INTEGER NOT NULL DEFAULT 0; -- available shields
ALTER TABLE members ADD COLUMN IF NOT EXISTS streak_frozen_on  DATE;          -- day a freeze protected (drives empathetic avatar)
ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_coach   TEXT NOT NULL DEFAULT 'maya'; -- 'maya' | 'sara'
-- current_streak already exists
```
No new tables required — streak transitions are audited through the existing
`point_ledger` (new reasons below). Add a `streak_log` table later only if you
want a full visual history.

---

## 4. Streak state machine
```
                 ┌─────────┐   first active day    ┌──────────┐
                 │  IDLE   │ ────────────────────► │  ACTIVE  │
                 │streak=0 │                        │streak≥1 │◄─┐ active day within window (streak++)
                 └─────────┘                        └──────────┘  │
                     ▲                                 │   │      │
     break (no freeze)│              gap > window       │   └──────┘
      or late cancel  │              & freeze avail.    │
                     │                                 ▼
                 ┌─────────┐   still no activity   ┌──────────┐
                 │ BROKEN  │ ◄──────────────────── │  FROZEN  │  freeze consumed,
                 │→ IDLE   │   next window passes  │streak kept│ streak_frozen_on=today
                 └─────────┘                        └──────────┘
                                                        │ active day
                                                        └────────► ACTIVE (streak++)
```

| From | Trigger | To | Side effects |
|---|---|---|---|
| IDLE | verified attendance | ACTIVE | `current_streak=1`, `last_active_date=today` |
| ACTIVE | attendance, same day | ACTIVE | no-op (day already counted) |
| ACTIVE | attendance, new day ≤ window | ACTIVE | `current_streak++`, milestone check |
| ACTIVE | window exceeded, freeze≥1 | FROZEN | `streak_freezes--`, `streak_frozen_on=today` |
| ACTIVE/FROZEN | window exceeded, freeze=0 | BROKEN→IDLE | `current_streak=0` |
| any | **late cancel** | IDLE | `current_streak=0` (existing, stronger penalty) |
| ACTIVE | `current_streak` new max | — | `longest_streak=current_streak` |

---

## 5. Where each transition runs (three touch-points)
1. **`onAttendance()` — inside `/api/sync`** (already the verify point). Replace the
   naive `current_streak++` with the day-aware logic (§8a).
2. **`dailyRollover()` — the daily Vercel cron** (`0 4 * * *`, already scheduled as a
   safety net). Iterate members whose `last_active_date` is older than the window →
   freeze or break (§8b). This is the *only* place a streak decays.
3. **Late cancel — inside `/api/sync`** (existing). Keep the hard reset.

> The cross-check sync (cron-job.org, every 15 min) feeds touch-point 1 in near-real-time;
> the daily 04:00 cron owns touch-point 2.

---

## 6. Scoring & rewards integration (via `point_ledger`)
Reuse `awardPoints()`. New `PointReason`s:
```
'streak_milestone'      // reached 3/7/14/30/60/100 → bonus UC (replaces the flat streak_10)
'streak_freeze_earned'  // audit only (0 pts) when a shield is granted
```
- **Milestone bonuses** (config in `point_rules`, DECIDED): 3→+5, 7→+15, 14→+30, 30→+75, 100→+250 UC.
- **Streak Freeze — purchased only** (DECIDED): bought in the rewards store for ~40 UC
  (`REWARD_COSTS.streak_freeze`). No auto-earning. Stored in `streak_freezes`.
- **Break-time rescue popup** (DECIDED): when `dailyRollover` is about to break a streak
  and the member has 0 freezes, the home screen shows a redemption prompt —
  *"הרצף שלך בסכנה! ממש/י מגן רצף להצלה"* — letting them buy a freeze on the spot to
  save it (empathetic avatar + urgency). If they have a freeze, it's auto-consumed silently.
- Coins still flow into `total_coins`/`lifetime_coins` → tiers unchanged.

### 6b. Commitment Pledges (streak ladder) — DECIDED
A separate, opt-in **pledge** mechanic on top of the passive streak. The avatar
offers the member a challenge — e.g. *"מתחייבת ל-20 אימונים רצופים ללא ביטולים?"* —
and on acceptance a **pledge** is created. Completing it pays a **loyalty bonus** in UC.
```sql
CREATE TABLE pledges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID REFERENCES members(id),
  target        INTEGER NOT NULL,        -- e.g. 20 or 30 workouts
  progress      INTEGER NOT NULL DEFAULT 0,
  reward_coins  INTEGER NOT NULL,        -- payout on completion
  status        TEXT NOT NULL DEFAULT 'active', -- active | completed | failed
  started_at    TIMESTAMPTZ DEFAULT now(),
  broken_at     TIMESTAMPTZ
);
```
- **Progress** increments with each verified attendance (touch-point ①).
- **A late cancel fails the active pledge** (`status='failed'`) — the "no cancellations" promise.
- Suggested ladder: 10→+50 UC · 20→+120 UC · 30→+200 UC (higher rungs unlock at higher tiers).
- The avatar drives it: the pledge offer, the progress bar, and the celebration/consolation copy.

---

## 7. Avatar coordination (the payoff)
The avatar is a **pure projection of streak state** — no new data needed:
```js
// avatar_logic.js already does this:
streak_frozen_on === today   → 'empathetic'   // missed, shield saved it
current_streak >= 3          → 'energetic'
else                         → 'basic'
```
Feed the resolver a view built from the member row:
```js
getCoachView({
  currentStreak:   m.current_streak,
  streakFreezeUsed: m.streak_frozen_on === todayISO,   // maps DB → logic
  name:            m.name,
}, m.preferred_coach)
```
Renders on the **home** hero: `<img src={image}/>` + a message bubble; fire confetti when `isMilestone`.

---

## 8. Algorithms (pseudocode)

**a) onAttendance(member, activityDate) — in /api/sync, on verify**
```
today = activityDate (Asia/Jerusalem, date only)
if member.last_active_date === today: return            // already counted today
gapDays = today - member.last_active_date               // null ⇒ first ever
if gapDays == null OR gapDays <= STREAK_WINDOW_DAYS:
    member.current_streak += 1                          // continue (or 1 if first)
else:
    member.current_streak = 1                           // window blown & no freeze left ⇒ fresh start
member.last_active_date = today
member.streak_frozen_on = null                          // coming back clears the "frozen" flag
member.longest_streak = max(longest_streak, current_streak)
if current_streak in MILESTONES: awardPoints(member, bonus, 'streak_milestone')
if current_streak % 7 == 0 and streak_freezes < 2: member.streak_freezes++  ('streak_freeze_earned')
```

**b) dailyRollover(member, today) — daily 04:00 cron**
```
if member.current_streak == 0: return
daysIdle = today - member.last_active_date
if daysIdle <= STREAK_WINDOW_DAYS: return               // still inside the window, nothing to do
// window exceeded:
if member.streak_freezes >= 1:
    member.streak_freezes -= 1
    member.streak_frozen_on = today                     // → empathetic avatar today
    // last_active_date stays; window effectively extended once
else:
    member.current_streak = 0                            // BROKEN → IDLE
    member.streak_frozen_on = null
```

---

## 9. Edge cases
- **Timezone:** all date math in **Asia/Jerusalem**; store dates as `DATE` not timestamps.
- **Multiple check-ins/day:** only the **first** verified one advances the streak (guarded by `last_active_date === today`).
- **Freeze then still absent:** next `dailyRollover` sees window exceeded again with `freeze=0` → break. A freeze buys exactly one window, not immunity.
- **Late cancel vs. quiet miss:** late cancel = hard reset (intentional broken commitment); quiet miss = freeze-eligible (life happens). This matches the empathetic copy.
- **Re-entry after break:** first attendance → streak = 1 (basic avatar), clean restart.

---

## 10. Rollout phases
1. **Phase 1 (foundation):** schema §3, refactor `onAttendance` §8a, add `dailyRollover` §8b (freeze OFF: `streak_freezes` stays 0 so it just decays), wire `getCoachView` into the home hero. Ship the avatar.
2. **Phase 2 (freeze):** turn on earning/spending freezes + the empathetic state end-to-end.
3. **Phase 3 (rewards):** milestone bonuses, buy-a-freeze in the store, confetti + push notifications on milestones.
