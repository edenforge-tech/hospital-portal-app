-- Check if receptionist6 has MFA settings
SELECT 
  u.email,
  u.two_factor_enabled,
  mfa.is_mfa_enabled,
  mfa.primary_method,
  mfa.totp_enabled,
  mfa.totp_secret_encrypted IS NOT NULL as has_totp_secret,
  mfa.enrolled_at
FROM users u
LEFT JOIN user_mfa_settings mfa ON u.id = mfa.user_id
WHERE u.email = 'receptionist6@hospital.com';
