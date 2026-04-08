-- Check if doctors exist in database
SELECT 
    r."Name" as role_name,
    COUNT(DISTINCT u."Id") as doctor_count
FROM "AspNetRoles" r
LEFT JOIN "AspNetUserRoles" ur ON r."Id" = ur."RoleId"
LEFT JOIN "AspNetUsers" u ON ur."UserId" = u."Id" 
    AND u."TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
WHERE r."NormalizedName" LIKE '%DOCTOR%' 
   OR r."NormalizedName" LIKE '%OPHTHAL%'
   OR r."NormalizedName" LIKE '%SURGEON%'
GROUP BY r."Name"
ORDER BY doctor_count DESC;
