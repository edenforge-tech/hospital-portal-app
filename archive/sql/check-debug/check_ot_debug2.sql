-- Find admin user and their branch
SELECT u.id, u.tenant_id, u.branch_id
FROM users u
INNER JOIN app_user_roles aur ON aur.user_id = u.id
INNER JOIN app_roles ar ON ar.id = aur.role_id
WHERE ar.name ILIKE '%admin%'
LIMIT 5;

-- Check user role assignments directly
SELECT u.id, u.tenant_id, u.branch_id, ura.role_id
FROM users u
INNER JOIN user_role_assignment ura ON ura.user_id = u.id
LIMIT 5;

-- Check ot.schedules.view permission
SELECT p.name, p.id
FROM permissions p
WHERE p.name = 'ot.schedules.view';

-- Check which roles have ot.schedules.view
SELECT rp.role_id, p.name
FROM role_permission rp
JOIN permissions p ON p.id = rp.permission_id
WHERE p.name = 'ot.schedules.view'
LIMIT 10;

-- Check date range for schedules (today = 2026-03-19)
SELECT id, status, scheduled_date, tenant_id, branch_id
FROM ot_schedules
WHERE status IN ('Booked','Confirmed')
  AND scheduled_date::date BETWEEN '2026-03-19' AND '2026-03-26'
ORDER BY scheduled_date LIMIT 10;
