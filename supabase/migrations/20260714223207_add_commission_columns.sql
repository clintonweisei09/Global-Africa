-- Add platform_fee column to track owner commission
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS employer_payout numeric DEFAULT 0;
