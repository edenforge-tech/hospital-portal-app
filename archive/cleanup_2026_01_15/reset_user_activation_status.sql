-- Reset all user activation statuses to initial state
-- Sets all users to "created" status (not activated)

-- 1. Reset activation status in users table
UPDATE users
SET 
    activation_status = 'created',
    email_verified = false,
    "UserStatus" = 'pending_activation',
    lockout_end = NULL,
    access_failed_count = 0,
    updated_at = NOW()
WHERE activation_status != 'created' OR email_verified = true;

-- 2. Clear MFA settings for all users (since they're being reset)
DELETE FROM user_mfa_settings;

-- 3. Clear OTP activation codes
DELETE FROM otp_activations;

-- 4. Clear user activation logs
DELETE FROM user_activation_log;

-- 5. Show updated user statuses
SELECT 
    email,
    activation_status,
    email_verified,
    "UserStatus",
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- Summary
SELECT 
    activation_status,
    COUNT(*) as user_count
FROM users
GROUP BY activation_status;
