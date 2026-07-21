-- Cross-verification (Approach 2): reconcile QR scans against Arbox check-ins.
-- Run in the Supabase SQL Editor.

-- A QR scan is now a PENDING proof of presence until an Arbox 'attended'
-- check-in confirms it in the same class window.
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS arbox_checkin_id TEXT;
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- One Arbox check-in can verify at most one scan
CREATE UNIQUE INDEX IF NOT EXISTS checkins_arbox_unique
  ON checkins (arbox_checkin_id) WHERE arbox_checkin_id IS NOT NULL;

-- Consecutive-attendance streak, reset to 0 on a late cancel
ALTER TABLE members ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
