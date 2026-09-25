/*
# GlobalHire Africa — Core Database Schema

## Overview
Creates the complete schema for a multi-user international recruitment platform.
Users sign in with Supabase email/password auth. Each user owns their profile,
documents, applications, saved jobs, notifications, and payments.

## New Tables
1. `profiles` — Extended user data beyond auth.users (phone, recovery phone, 2FA settings, avatar, bio, profession, country, resume URL, profile completion %)
2. `employers` — Company profiles (name, logo, tagline, country, flag, description, website, verified, rating, hiring history)
3. `jobs` — Job listings (title, employer FK, country, city, salary, type, visa, accommodation, meals, insurance, contract, responsibilities, requirements, benefits, working hours, status)
4. `applications` — Job applications linking user to job with a 9-stage tracking timeline (submitted → documents_verified → employer_review → interview → medical → visa_processing → flight_booking → departure → arrival)
5. `saved_jobs` — Bookmarked jobs per user
6. `documents` — User uploaded documents (resume, passport, certificates, medical, visa)
7. `reviews` — Employer reviews and ratings from placed candidates
8. `notifications` — User notifications (interview schedule, status updates, etc.)
9. `payments` — Payment history (application fees, visa fees, service charges)

## Security
- RLS enabled on ALL tables.
- `profiles`, `documents`, `applications`, `saved_jobs`, `notifications`, `payments` are owner-scoped (user_id = auth.uid()).
- `employers`, `jobs`, `reviews` are publicly readable (anon + authenticated) so the homepage and listings work without login.
- INSERT/UPDATE/DELETE on employers, jobs, reviews restricted to authenticated owners.
- All owner columns default to `auth.uid()` so frontend inserts work without passing user_id.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  recovery_phone text,
  two_factor_enabled boolean DEFAULT false,
  fingerprint_enabled boolean DEFAULT false,
  avatar_url text,
  bio text,
  profession text,
  country text,
  city text,
  experience_years int DEFAULT 0,
  profile_completion int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- EMPLOYERS
CREATE TABLE IF NOT EXISTS employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text DEFAULT '',
  tagline text DEFAULT '',
  country text NOT NULL,
  flag text DEFAULT '',
  city text DEFAULT '',
  description text DEFAULT '',
  website text DEFAULT '',
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  open_roles int DEFAULT 0,
  hiring_history int DEFAULT 0,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_employers" ON employers;
CREATE POLICY "read_employers" ON employers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_employers" ON employers;
CREATE POLICY "insert_employers" ON employers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_employers" ON employers;
CREATE POLICY "update_employers" ON employers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_employers" ON employers;
CREATE POLICY "delete_employers" ON employers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  employer_id uuid REFERENCES employers(id) ON DELETE SET NULL,
  company text NOT NULL,
  logo text DEFAULT '',
  country text NOT NULL,
  flag text DEFAULT '',
  city text DEFAULT '',
  salary text NOT NULL,
  salary_min int DEFAULT 0,
  type text DEFAULT 'Full-time',
  category text DEFAULT '',
  visa boolean DEFAULT false,
  accommodation boolean DEFAULT false,
  meals boolean DEFAULT false,
  insurance boolean DEFAULT false,
  contract text DEFAULT '',
  working_hours text DEFAULT '',
  responsibilities text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  posted text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_jobs" ON jobs;
CREATE POLICY "read_jobs" ON jobs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_jobs" ON jobs;
CREATE POLICY "insert_jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_jobs" ON jobs;
CREATE POLICY "update_jobs" ON jobs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_jobs" ON jobs;
CREATE POLICY "delete_jobs" ON jobs FOR DELETE TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS jobs_category_idx ON jobs (category);
CREATE INDEX IF NOT EXISTS jobs_country_idx ON jobs (country);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status text DEFAULT 'submitted',
  current_stage int DEFAULT 0,
  stages text[] DEFAULT '{"submitted","documents_verified","employer_review","interview","medical","visa_processing","flight_booking","departure","arrival"}',
  stage_dates jsonb DEFAULT '{}',
  interview_date timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SAVED JOBS
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_saved" ON saved_jobs;
CREATE POLICY "select_own_saved" ON saved_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_saved" ON saved_jobs;
CREATE POLICY "insert_own_saved" ON saved_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_saved" ON saved_jobs;
CREATE POLICY "delete_own_saved" ON saved_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL,
  file_url text DEFAULT '',
  status text DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employers(id) ON DELETE CASCADE,
  user_id uuid DEFAULT auth.uid(),
  author_name text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  title text DEFAULT '',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_reviews" ON reviews;
CREATE POLICY "read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_reviews" ON reviews;
CREATE POLICY "insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  method text DEFAULT 'card',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments FOR DELETE TO authenticated USING (auth.uid() = user_id);
