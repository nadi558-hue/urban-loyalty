-- Social share submissions — members upload a screenshot of a story that tags
-- the studio, an admin approves it, and the approval awards `social_share` UC.
--
-- Run this in the Supabase SQL editor (DDL can't go through the app client).

CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  coins_awarded INTEGER,              -- filled in on approval
  note TEXT,                          -- optional admin reason on reject
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- The admin queue reads pending-first, newest-first.
CREATE INDEX IF NOT EXISTS social_shares_status_idx
  ON social_shares (status, created_at DESC);

-- The weekly rate limit checks "this member's submissions since <date>".
CREATE INDEX IF NOT EXISTS social_shares_member_idx
  ON social_shares (member_id, created_at DESC);

-- Storage bucket for the uploaded screenshots.
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-shares', 'social-shares', true)
ON CONFLICT (id) DO NOTHING;
