-- =====================================================
-- CHECK IF DOCTORS EXIST IN DATABASE
-- =====================================================
-- This script checks if any doctor users exist in the system

-- Check if doctor roles exist
SELECT 
    r."Id",
    r."Name",
    r."NormalizedName"
FROM "AspNetRoles" r
WHERE r."NormalizedName" LIKE '%DOCTOR%' 
   OR r."NormalizedName" LIKE '%OPHTHAL%'
   OR r."NormalizedName" LIKE '%SURGEON%';

-- Check if any users have doctor-related roles  
SELECT 
    u."Id",
    u."FirstName",
    u."LastName", 
    u."Email",
    u."UserStatus",
    u."Specialization",
    u."LicenseNumber",
    r."Name" as role_name
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND r."NormalizedName" LIKE '%DOCTOR%' 
   OR r."NormalizedName" LIKE '%OPHTHAL%'
   OR r."NormalizedName" LIKE '%SURGEON%'
  AND u."DeletedAt" IS NULL
  AND u."UserStatus" = 'active';

-- Count doctors by role
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
