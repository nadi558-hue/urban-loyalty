# Urban Studio Club — System Specification

## Project Overview
Loyalty web app for **Urban Pilates Group Ltd** — 3 boutique Pilates studios in Beer Sheva, Israel.
Built with **Next.js 15 App Router**, TypeScript, Tailwind CSS, Supabase (PostgreSQL), RTL Hebrew.

## Core Concept
Two distinct coin pools per member:
- **`total_coins`** — spendable balance (decreases when redeeming rewards)
- **`lifetime_coins`** — cumulative all-time earned (NEVER decreases, determines tier/status)

This separation is critical: members should never be "punished" status-wise for spending coins.

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 App Router + Tailwind CSS |
| Backend | Next.js API Routes (Node.js) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth — OTP via phone number (Israeli format) |
| Hosting | Vercel (preferred) or Hostinger with external cron |
| Arbox Sync | Cron job hitting `/api/sync/arbox` hourly |
| Push | OneSignal (Phase 2) |

## Tier System
| Tier | Lifetime UC | Benefits |
|------|-------------|----------|
| `silver` | 0–499 | Basic access to all rewards |
| `gold` | 500–1,499 | 10% discount + private class every 3 months |
| `platinum` | 1,500+ | 15% discount + monthly private class + VIP pass |

Tiers are calculated from `lifetime_coins` only. Logic in `lib/points.ts → calcTier()`.

## Coin Economy
| Action | UC Earned |
|--------|-----------|
| Class attended (check-in) | +1 |
| Happy Hour class | +2 (double) |
| Streak: 10 classes no cancel | +10 bonus |
| Full month (12+ classes) | +30 bonus |
| Referral — friend trial | +50 |
| Referral — friend subscribed | +50 (both get it) |
| Social share story (weekly) | +7 |
| Birthday | +50 |
| Studio anniversary | +20 |
| App join welcome bonus | +20 |

Late cancellation (<12h) = -1 UC (configurable via `point_rules` table).

## Reward Costs
| Reward | UC Cost |
|--------|---------|
| Merch (socks / bottle) | 30 UC |
| Special workshop entry | 50 UC |
| 10% discount on next subscription | 100 UC |
| Private class | 100 UC |

## Database Schema (Supabase)
```sql
members (
  id uuid PRIMARY KEY,
  arbox_id text UNIQUE,           -- foreign key to Arbox CRM
  name text,
  phone text UNIQUE,
  email text,
  tier text DEFAULT 'silver',     -- silver | gold | platinum
  total_coins int DEFAULT 0,      -- spendable balance
  lifetime_coins int DEFAULT 0,   -- status / tier coins (never decreases)
  preferred_branch text,
  created_at timestamptz DEFAULT now()
)

point_ledger (
  id uuid PRIMARY KEY,
  member_id uuid REFERENCES members,
  points int,                     -- positive = earned, negative = spent
  reason text,                    -- class_attended | streak_10 | redemption | etc.
  metadata jsonb,
  created_at timestamptz DEFAULT now()
)

rewards (
  id uuid PRIMARY KEY,
  name text,
  cost_coins int,
  description text,
  active boolean DEFAULT true
)

redemptions (
  id uuid PRIMARY KEY,
  member_id uuid REFERENCES members,
  reward_id uuid REFERENCES rewards,
  code text UNIQUE,               -- one-time coupon code
  status text DEFAULT 'pending',  -- pending | used | expired
  created_at timestamptz DEFAULT now()
)

referrals (
  id uuid PRIMARY KEY,
  referrer_id uuid REFERENCES members,
  referred_phone text,
  status text DEFAULT 'pending',  -- pending | trial | subscribed
  coins_awarded boolean DEFAULT false
)
```

## Arbox Integration
- Arbox is the studio CRM (class scheduling, check-ins, subscriptions)
- Sync endpoint: `GET /api/sync/arbox` (secured with CRON_SECRET header)
- Pulls: check-ins, cancellations, member data
- Runs hourly via external cron (Vercel Cron / GitHub Actions / cron-job.org)
- Client in `lib/arbox.ts`

## File Structure
```
urban-loyalty/
├── app/
│   ├── (auth)/login/          # OTP phone login
│   ├── home/page.tsx          # Main member home — BUILT
│   ├── rewards/               # Rewards marketplace — TODO
│   ├── history/               # Transaction ledger — TODO
│   └── referrals/             # Referral system — TODO
├── lib/
│   ├── arbox.ts               # Arbox API client
│   ├── points.ts              # Coin logic, tier calc, rules
│   └── supabase.ts            # DB client
├── api/
│   ├── sync/arbox/route.ts    # Cron sync endpoint
│   └── rewards/redeem/route.ts
├── components/
│   ├── CoinCard.tsx           # Main UC balance card
│   ├── TierProgress.tsx       # Tier progress motivator
│   ├── ChallengeCard.tsx      # Active challenges
│   └── RewardsList.tsx        # Rewards marketplace
└── public/
    ├── urban-coin-silver.png  # 3D silver coin (1260x1260px)
    └── class-*.jpg            # Watercolor class backgrounds
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ARBOX_API_KEY=
ARBOX_BASE_URL=https://api.arbox.me
CRON_SECRET=
```

## Key Rules
1. **RTL everywhere** — `dir="rtl"` on `<html>`, all layouts RTL
2. **Mobile-first** — max-width 448px (md), centered
3. **No auth bypass** — all member routes require valid Supabase session
4. **Lifetime coins immutable** — never write negative to `lifetime_coins`
5. **Idempotent sync** — track `arbox_checkin_id` to prevent double-counting
