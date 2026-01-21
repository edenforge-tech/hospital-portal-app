-- Check MFA and activation status for receptionist6
SELECT 
  email,
  two_factor_enabled,
  activation_status,
  "UserStatus",
  email_verified
FROM users 
WHERE email = 'receptionist6@hospital.com';
