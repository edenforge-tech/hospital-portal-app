-- Fix receptionist6@hospital.com status after activation completed
UPDATE users 
SET 
    "UserStatus" = 'active',
    activation_status = 'active',
    email_verified = true,
    "MustChangePasswordOnLogin" = false,
    must_reset_password = false,
    "PasswordExpiresAt" = NOW() + INTERVAL '90 days'
WHERE email = 'receptionist6@hospital.com';

-- Verify the update
SELECT 
    email,
    "UserStatus",
    activation_status,
    email_verified,
    "PasswordExpiresAt"
FROM users
WHERE email = 'receptionist6@hospital.com';
