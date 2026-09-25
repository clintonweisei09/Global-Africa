/*
# Add email_log table for tracking sent emails

## New table: `email_log`
Stores records of all emails sent to users (application confirmation, acceptance, etc.)
- `id` (uuid PK)
- `user_id` (uuid, nullable — the recipient user if known)
- `recipient` (text, not null — email address)
- `subject` (text, not null)
- `body` (text — HTML content)
- `status` (text — 'sent', 'failed', 'read')
- `read_at` (timestamptz)
- `created_at` (timestamptz)

## Security
- RLS enabled
- Users can only see their own emails (matched by user_id)
*/

CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'sent',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_emails" ON email_log;
CREATE POLICY "select_own_emails" ON email_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_emails" ON email_log;
CREATE POLICY "insert_own_emails" ON email_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_email_log_user_id ON email_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
