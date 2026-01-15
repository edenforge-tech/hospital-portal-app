-- Clear rate limit for sam@test.com after failed attempts
-- The previous failed attempts still created OTP records even though they didn't complete successfully

-- First, check current OTP records for today
SELECT 
    id,
    user_id,
    delivery_method,
    recipient,
    status,
    created_at
FROM otp_activations
WHERE user_id = '019b8f1c-a27d-763d-991b-76ea70519e5f'
  AND created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- Delete all OTP records from today for this user
DELETE FROM otp_activations
WHERE user_id = '019b8f1c-a27d-763d-991b-76ea70519e5f'
  AND created_at >= CURRENT_DATE;

-- Verify deletion
SELECT 
    COUNT(*) as remaining_otps_today,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Rate limit cleared - user can request activation OTP'
        ELSE 'Still has ' || COUNT(*) || ' OTPs from today'
    END as status
FROM otp_activations
WHERE user_id = '019b8f1c-a27d-763d-991b-76ea70519e5f'
  AND created_at >= CURRENT_DATE;
