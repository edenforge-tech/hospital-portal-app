-- Check MFA-related columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND (column_name LIKE '%mfa%' OR column_name LIKE '%two_factor%' OR column_name LIKE '%totp%' OR column_name LIKE '%secret%')
ORDER BY column_name;
