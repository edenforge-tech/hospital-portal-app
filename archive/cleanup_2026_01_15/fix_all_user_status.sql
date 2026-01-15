-- Check Sam Aluri's current status
SELECT 
    email, 
    activation_status, 
    "UserStatus" as user_status, 
    updated_at 
FROM users 
WHERE email = 'aluriswamidass@gmail.com';

-- Update ALL users with 'created' activation_status to have correct UserStatus
UPDATE users 
SET "UserStatus" = 'pending_invitation'
WHERE activation_status = 'created' 
  AND "UserStatus" != 'pending_invitation';

-- Show how many users were updated
SELECT 'Updated ' || COUNT(*) || ' users to pending_invitation' as result
FROM users 
WHERE activation_status = 'created';

-- Show current distribution of statuses
SELECT 
    activation_status,
    "UserStatus",
    COUNT(*) as count
FROM users
WHERE "DeletedAt" IS NULL
GROUP BY activation_status, "UserStatus"
ORDER BY activation_status, "UserStatus";
