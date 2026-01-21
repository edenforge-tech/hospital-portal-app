-- Check user_mfa_settings table schema
\d user_mfa_settings;

-- Also show all data for receptionist6
SELECT * FROM user_mfa_settings WHERE user_id = (
  SELECT id FROM users WHERE email = 'receptionist6@hospital.com'
);
