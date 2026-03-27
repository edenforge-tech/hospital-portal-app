SELECT u.email, u.user_name
FROM users u
JOIN "AspNetUserRoles" ur ON ur."UserId" = u.id
JOIN "AspNetRoles" r ON r."Id" = ur."RoleId"
WHERE r."Name" ILIKE '%admin%' OR r."Name" ILIKE '%system%'
LIMIT 10;
