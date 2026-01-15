-- Set all users to initial status
UPDATE users 
SET 
    activation_status = 'created', 
    "UserStatus" = 'pending_invitation', 
    updated_at = NOW();

-- Show updated status distribution
SELECT 
    activation_status, 
    "UserStatus", 
    COUNT(*) as count 
FROM users 
GROUP BY activation_status, "UserStatus";
