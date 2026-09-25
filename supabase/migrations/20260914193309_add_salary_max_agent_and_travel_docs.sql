/*
# Add salary_max, agent info to jobs, and travel_documents table

## Changes to `jobs` table
1. Add `salary_max` (integer) — maximum monthly salary in USD for the position range
2. Add `agent_name` (text) — name of the AI agent representing the employer
3. Add `agent_avatar` (text) — initials/emoji for the agent avatar
4. Add `agent_personality` (text) — personality description for the agent's chat style

## New table: `travel_documents`
Stores auto-generated visa/passport documents for applicants after they apply.
- `id` (uuid PK)
- `user_id` (uuid, owner — defaults to auth.uid())
- `application_id` (uuid, FK to applications)
- `job_id` (uuid, FK to jobs)
- `document_type` (text) — 'visa' or 'passport'
- `document_number` (text) — generated unique document number
- `country` (text) — destination country
- `full_name` (text) — applicant name on the document
- `issue_date` (timestamptz)
- `expiry_date` (timestamptz)
- `status` (text) — 'generated', 'paid', 'downloaded'
- `fee_amount` (integer) — fee required to unlock download/print (in USD cents)
- `paid_at` (timestamptz)
- `created_at` (timestamptz)

## Security
- RLS enabled on `travel_documents`
- Owner-scoped CRUD: users can only see/manage their own documents
*/

-- Add columns to jobs (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'salary_max') THEN
    ALTER TABLE jobs ADD COLUMN salary_max integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'agent_name') THEN
    ALTER TABLE jobs ADD COLUMN agent_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'agent_avatar') THEN
    ALTER TABLE jobs ADD COLUMN agent_avatar text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'agent_personality') THEN
    ALTER TABLE jobs ADD COLUMN agent_personality text;
  END IF;
END $$;

-- Create travel_documents table
CREATE TABLE IF NOT EXISTS travel_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  document_type text NOT NULL DEFAULT 'visa',
  document_number text NOT NULL,
  country text NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  nationality text,
  issue_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  status text NOT NULL DEFAULT 'generated',
  fee_amount integer NOT NULL DEFAULT 15000,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add fields to an already-existing table as well as newly-created tables.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_documents' AND column_name = 'email') THEN
    ALTER TABLE travel_documents ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_documents' AND column_name = 'phone') THEN
    ALTER TABLE travel_documents ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'travel_documents' AND column_name = 'nationality') THEN
    ALTER TABLE travel_documents ADD COLUMN nationality text;
  END IF;
END $$;

ALTER TABLE travel_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON travel_documents;
CREATE POLICY "select_own_documents" ON travel_documents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON travel_documents;
CREATE POLICY "insert_own_documents" ON travel_documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON travel_documents;
CREATE POLICY "update_own_documents" ON travel_documents
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON travel_documents;
CREATE POLICY "delete_own_documents" ON travel_documents
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_travel_documents_user_id ON travel_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_documents_application_id ON travel_documents(application_id);
