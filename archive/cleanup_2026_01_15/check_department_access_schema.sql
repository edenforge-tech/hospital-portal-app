-- Check user_department_access structure
\d user_department_access

-- Check department structure
\d department

-- Sample data
SELECT COUNT(*) FROM user_department_access;
SELECT * FROM user_department_access LIMIT 5;
