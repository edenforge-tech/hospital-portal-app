-- Check Doctor/Surgeon roles and their user counts
SELECT r."Name", r."NormalizedName", COUNT(ur."UserId") as user_count
FROM "AspNetRoles" r
LEFT JOIN "AspNetUserRoles" ur ON ur."RoleId" = r."Id"
WHERE r."NormalizedName" LIKE '%DOCTOR%'
   OR r."NormalizedName" LIKE '%SURGEON%'
   OR r."NormalizedName" LIKE '%OPHTHAL%'
GROUP BY r."Name", r."NormalizedName"
LIMIT 10;

-- Check users with Doctor UserType and their tenant
SELECT u."FirstName", u."LastName", u."UserType", u.tenant_id, u."DeletedAt"
FROM users u
WHERE u."UserType" IN ('Doctor', 'Surgeon', 'Ophthalmologist');

-- Update referred-by doctors who still have Staff UserType to Doctor
UPDATE users
SET "UserType" = 'Doctor',
    "UpdatedAt" = NOW()
WHERE id IN (
    SELECT DISTINCT referred_by_doctor_id
    FROM counseling_sessions
    WHERE referred_by_doctor_id IS NOT NULL
)
  AND ("UserType" IS NULL OR "UserType" = 'Staff' OR "UserType" = '');

-- Also ensure these doctor users have active status
UPDATE users
SET "UserStatus" = 'active',
    "UpdatedAt" = NOW()
WHERE id IN (
    SELECT DISTINCT referred_by_doctor_id
    FROM counseling_sessions
    WHERE referred_by_doctor_id IS NOT NULL
)
  AND "DeletedAt" IS NULL
  AND ("UserStatus" IS NULL OR "UserStatus" != 'active');

-- Final check - show all doctors
SELECT u."FirstName", u."LastName", u."UserType", u."UserStatus", u."DeletedAt"
FROM users u
WHERE u."UserType" IN ('Doctor', 'Surgeon', 'Ophthalmologist')
ORDER BY u."FirstName";
