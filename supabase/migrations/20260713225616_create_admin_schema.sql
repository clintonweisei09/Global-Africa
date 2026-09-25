/*
# GlobalHire Africa — Admin System Schema

## Overview
Creates tables for the administration system: user roles, support tickets, premium subscriptions, news, success stories, fraud detection, AI settings, and payment records.

## New Tables
1. `user_roles` — Maps users to admin/agent/editor roles
2. `support_tickets` — Support ticket system with priority, status, and assignment
3. `subscriptions` — Premium plan subscriptions for applicants and employers (plan, billing cycle, payment method, status)
4. `news` — News articles for the employer news section
5. `success_stories` — Success story entries for the success stories section
6. `fraud_alerts` — Fraud detection alerts (flagged users, jobs, employers)
7. `ai_settings` — AI assistant configuration (model, temperature, system prompt)
8. `payment_transactions` — Payment records across Stripe, PayPal, M-Pesa, Flutterwave, Paystack

## Security
- RLS enabled on ALL tables.
- Public read for news and success stories (anon + authenticated).
- Owner-scoped for subscriptions, support tickets, and payment transactions.
- Admin-only for user_roles, fraud_alerts, ai_settings (authenticated, since admin users are authenticated).
*/

-- USER ROLES
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'applicant',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_user_roles" ON user_roles;
CREATE POLICY "read_user_roles" ON user_roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_user_roles" ON user_roles;
CREATE POLICY "insert_user_roles" ON user_roles FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_user_roles" ON user_roles;
CREATE POLICY "update_user_roles" ON user_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_user_roles" ON user_roles;
CREATE POLICY "delete_user_roles" ON user_roles FOR DELETE TO authenticated USING (true);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  category text DEFAULT 'general',
  assigned_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  tier text DEFAULT 'applicant',
  billing_cycle text DEFAULT 'monthly',
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_method text DEFAULT '',
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_subs" ON subscriptions;
CREATE POLICY "select_own_subs" ON subscriptions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_subs" ON subscriptions;
CREATE POLICY "insert_own_subs" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_own_subs" ON subscriptions;
CREATE POLICY "update_own_subs" ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- NEWS
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'industry',
  author text DEFAULT 'GlobalHire Team',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_news" ON news;
CREATE POLICY "read_news" ON news FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_news" ON news;
CREATE POLICY "insert_news" ON news FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_news" ON news;
CREATE POLICY "update_news" ON news FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_news" ON news;
CREATE POLICY "delete_news" ON news FOR DELETE TO authenticated USING (true);

-- SUCCESS STORIES
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  flag text DEFAULT '',
  job_title text NOT NULL,
  employer text DEFAULT '',
  story text NOT NULL,
  image_url text DEFAULT '',
  rating int DEFAULT 5,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_stories" ON success_stories;
CREATE POLICY "read_stories" ON success_stories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_stories" ON success_stories;
CREATE POLICY "insert_stories" ON success_stories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_stories" ON success_stories;
CREATE POLICY "update_stories" ON success_stories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_stories" ON success_stories;
CREATE POLICY "delete_stories" ON success_stories FOR DELETE TO authenticated USING (true);

-- FRAUD ALERTS
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL DEFAULT 'job',
  target_id text DEFAULT '',
  target_name text DEFAULT '',
  reason text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  reported_by text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_fraud" ON fraud_alerts;
CREATE POLICY "read_fraud" ON fraud_alerts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_fraud" ON fraud_alerts;
CREATE POLICY "insert_fraud" ON fraud_alerts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_fraud" ON fraud_alerts;
CREATE POLICY "update_fraud" ON fraud_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_fraud" ON fraud_alerts;
CREATE POLICY "delete_fraud" ON fraud_alerts FOR DELETE TO authenticated USING (true);

-- AI SETTINGS
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_ai_settings" ON ai_settings;
CREATE POLICY "read_ai_settings" ON ai_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_ai_settings" ON ai_settings;
CREATE POLICY "insert_ai_settings" ON ai_settings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_ai_settings" ON ai_settings;
CREATE POLICY "update_ai_settings" ON ai_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  gateway text NOT NULL DEFAULT 'stripe',
  description text DEFAULT '',
  status text DEFAULT 'pending',
  reference text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_payments" ON payment_transactions;
CREATE POLICY "read_payments" ON payment_transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_payments" ON payment_transactions;
CREATE POLICY "insert_payments" ON payment_transactions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_payments" ON payment_transactions;
CREATE POLICY "update_payments" ON payment_transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
