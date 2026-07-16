-- QR check-in records (physical presence proof)
-- Run in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'qr',          -- 'qr' now; 'arbox_verified' after cross-check phase
  coins_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checkins_member_time ON checkins (member_id, created_at DESC);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
-- No policies: only the server (service role) reads/writes.
