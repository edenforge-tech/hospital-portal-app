-- Clear rate limit for sam@test.com (user_id: 019b8f1c-a27d-763d-991b-76ea70519e5f)
-- This will allow testing the activation flow again

DELETE FROM otp_activations 
WHERE user_id = '019b8f1c-a27d-763d-991b-76ea70519e5f'
AND created_at >= CURRENT_DATE;

-- Verify deletion
SELECT 
    COUNT(*) as otps_deleted,
    'Rate limit cleared for user sam@test.com' as message;

-- Check remaining OTPs for today
SELECT 
    COUNT(*) as remaining_otps_today,
    CASE 
        WHEN COUNT(*) = 0 THEN 'User can now request activation OTP'
        WHEN COUNT(*) >= 3 THEN 'Rate limit still active (3 or more OTPs sent today)'
        ELSE CONCAT(3 - COUNT(*), ' more OTP requests allowed today')
    END as status
FROM otp_activations
WHERE user_id = '019b8f1c-a27d-763d-991b-76ea70519e5f'
AND created_at >= CURRENT_DATE;
