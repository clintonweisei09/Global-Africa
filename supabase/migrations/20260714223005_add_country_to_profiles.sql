-- Add country column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'UG';
