// ─── Core Domain Types ────────────────────────────────────────────────────

export type Tier = 'silver' | 'gold' | 'platinum'

export type Member = {
  id: string
  arbox_id: string | null
  name: string
  phone: string
  email: string | null
  tier: Tier
  total_coins: number
  lifetime_coins: number
  preferred_branch: string | null
  created_at: string
}

export type PointReason =
  | 'class_attended'
  | 'streak_10'
  | 'full_month'
  | 'happy_hour'
  | 'welcome_bonus'
  | 'referral_trial'
  | 'referral_subscribed'
  | 'social_share'
  | 'birthday'
  | 'anniversary'
  | 'late_cancel'
  | 'manual'
  | 'redemption'

export type PointLedgerEntry = {
  id: string
  member_id: string
  points: number
  reason: PointReason
  metadata: Record<string, unknown> | null
  created_at: string
}

export type Reward = {
  id: string
  name: string
  cost_coins: number
  description: string | null
  active: boolean
}

export type RedemptionStatus = 'pending' | 'used' | 'expired'

export type Redemption = {
  id: string
  member_id: string
  reward_id: string
  code: string
  status: RedemptionStatus
  created_at: string
}

export type ReferralStatus = 'pending' | 'trial' | 'subscribed'

export type Referral = {
  id: string
  referrer_id: string
  referred_phone: string
  status: ReferralStatus
  coins_awarded: boolean
}

// ─── UI / Display Types ───────────────────────────────────────────────────

export type ActivityType =
  | 'class'
  | 'bonus'
  | 'streak'
  | 'referral'
  | 'redemption'
  | 'birthday'
  | 'anniversary'

export type ActivityItem = {
  type: ActivityType
  label: string
  coins: number
  date: string
}

export type TierVisualConfig = {
  cardBg: string
  cardAccent: string
  cardAccentLight: string
  coinFilter: string
  progressBarColor: string
  tierLabel: string
  tierLabelHe: string
}
