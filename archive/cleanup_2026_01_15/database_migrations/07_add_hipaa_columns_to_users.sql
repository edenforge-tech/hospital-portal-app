-- Migration: Add HIPAA compliance columns to users table
-- Purpose: Add accepted_hipaa, accepted_hipaa_at, and other HIPAA-related columns
-- Created: 2026-01-13

-- Add HIPAA compliance columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_privacy BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_privacy_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_hipaa BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepted_hipaa_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_password_change_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_password_expiry ON users(password_expires_at) WHERE password_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_hipaa_acceptance ON users(accepted_hipaa, accepted_hipaa_at);
CREATE INDEX IF NOT EXISTS idx_users_account_locked ON users(account_locked_until) WHERE account_locked_until IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.accepted_terms IS 'Terms and Conditions acceptance status';
COMMENT ON COLUMN users.accepted_terms_at IS 'Timestamp when user accepted Terms';
COMMENT ON COLUMN users.accepted_privacy IS 'Privacy Policy acceptance status';
COMMENT ON COLUMN users.accepted_privacy_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN users.accepted_hipaa IS 'HIPAA Security Training acknowledgment status';
COMMENT ON COLUMN users.accepted_hipaa_at IS 'Timestamp when user accepted HIPAA training';
COMMENT ON COLUMN users.password_expires_at IS 'Password expiration date (HIPAA requires 90-day rotation)';
COMMENT ON COLUMN users.last_password_change_at IS 'Last password change timestamp for audit trail';
COMMENT ON COLUMN users.failed_login_attempts IS 'Failed login attempt counter for account lockout';
COMMENT ON COLUMN users.account_locked_until IS 'Account lockout expiration timestamp';

-- Update existing users to have password expiry set to 90 days from now
UPDATE users 
SET password_expires_at = NOW() + INTERVAL '90 days',
    last_password_change_at = NOW()
WHERE password_expires_at IS NULL;

COMMENT ON TABLE users IS 'User table with HIPAA compliance fields for healthcare portal';
