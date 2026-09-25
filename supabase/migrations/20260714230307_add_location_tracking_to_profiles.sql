-- Add location tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_lat double precision;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_lng double precision;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_ip text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_device text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
