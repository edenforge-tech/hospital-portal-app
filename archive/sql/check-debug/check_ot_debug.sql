-- Check admin user details
SELECT u.id as user_id, u.tenant_id, u."BranchId" as branch_id, ar."Name" as role
FROM users u
JOIN "AspNetUserRoles" aur ON aur."UserId" = u.id
JOIN "AspNetRoles" ar ON ar."Id" = aur."RoleId"
WHERE ar."Name" ILIKE '%admin%'
LIMIT 5;

-- Check ot.schedules.view permission assignment
SELECT p.name as permission, ar."Name" as role
FROM app_permissions p
JOIN app_role_permissions rp ON p.id = rp.permission_id
JOIN "AspNetRoles" ar ON ar."Id"::uuid = rp.role_id
WHERE p.name = 'ot.schedules.view'
LIMIT 10;

-- Check date range: today is 2026-03-19, week filter = 2026-03-19 to 2026-03-26
SELECT id, status, scheduled_date, tenant_id, "BranchId" as branch_id
FROM ot_schedules
WHERE status IN ('Booked','Confirmed')
  AND scheduled_date BETWEEN '2026-03-19' AND '2026-03-26'
LIMIT 10;
