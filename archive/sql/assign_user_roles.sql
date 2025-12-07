-- Comprehensive User-Role Mapping Script
-- Maps all 70 users to their appropriate roles based on userType

-- Mapping: Ophthalmologists (all specialties) → Ophthalmologist role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" LIKE 'Ophthalmologist%'
  AND r."Name" = 'Ophthalmologist'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Optometrists → Optometrist role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Optometrist'
  AND r."Name" = 'Optometrist'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Ophthalmic Nurses → Ophthalmic Nurse role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Ophthalmic Nurse'
  AND r."Name" = 'Ophthalmic Nurse'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Ward Managers → Ward Manager role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Ward Manager'
  AND r."Name" = 'Ward Manager'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: OT Managers → OT Manager role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'OT Manager'
  AND r."Name" = 'OT Manager'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Doctors → Doctor role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Doctor'
  AND r."Name" = 'Doctor'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Lab Technicians → Lab Technician role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Lab Technician'
  AND r."Name" = 'Lab Technician'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Imaging Technicians → Imaging Technician role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Imaging Technician'
  AND r."Name" = 'Imaging Technician'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Pharmacists → Pharmacist role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Pharmacist'
  AND r."Name" = 'Pharmacist'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Opticians → Optician role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" IN ('Optician', 'Sales Optician')
  AND r."Name" IN ('Optician', 'Sales Optician')
  AND u."UserType" = r."Name"
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Receptionists → Receptionist role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Receptionist'
  AND r."Name" = 'Receptionist'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Registration Staff → Registration Staff role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Registration Staff'
  AND r."Name" = 'Registration Staff'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Billing Staff → Billing Staff role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Billing Staff'
  AND r."Name" = 'Billing Staff'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Accountants → Accountant role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Accountant'
  AND r."Name" = 'Accountant'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Insurance Coordinators → Insurance Coordinator role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Insurance Coordinator'
  AND r."Name" = 'Insurance Coordinator'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: MRD Staff → MRD Staff role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'MRD Staff'
  AND r."Name" = 'MRD Staff'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Admin Officers → Admin Officer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" IN ('Admin Officer', 'Administrative')
  AND r."Name" = 'Admin Officer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: HR Managers → HR Manager role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'HR Manager'
  AND r."Name" = 'HR Manager'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Finance Managers → Finance Manager role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Finance Manager'
  AND r."Name" = 'Finance Manager'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: IT Officers → IT Officer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'IT Officer'
  AND r."Name" = 'IT Officer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Counselors → Counselor role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Counselor'
  AND r."Name" = 'Counselor'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Maintenance Supervisors → Maintenance Supervisor role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Maintenance Supervisor'
  AND r."Name" = 'Maintenance Supervisor'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Biomedical Engineers → Biomedical Engineer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Biomedical Engineer'
  AND r."Name" = 'Biomedical Engineer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Security Officers → Security Officer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Security Officer'
  AND r."Name" = 'Security Officer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Housekeeping Staff → Housekeeping Staff role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Housekeeping Staff'
  AND r."Name" = 'Housekeeping Staff'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Quality Managers → Quality Manager role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Quality Manager'
  AND r."Name" = 'Quality Manager'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Compliance Officers → Compliance Officer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Compliance Officer'
  AND r."Name" = 'Compliance Officer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Grievance Officers → Grievance Officer role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Grievance Officer'
  AND r."Name" = 'Grievance Officer'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Outreach Coordinators → Outreach Coordinator role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Outreach Coordinator'
  AND r."Name" = 'Outreach Coordinator'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Mapping: Research Fellows → Research Fellow role
INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
CROSS JOIN "AspNetRoles" r
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND r."TenantId" = '11111111-1111-1111-1111-111111111111'
  AND u."UserType" = 'Research Fellow'
  AND r."Name" = 'Research Fellow'
  AND NOT EXISTS (
    SELECT 1 FROM "AspNetUserRoles" ur
    WHERE ur."UserId" = u."Id" AND ur."RoleId" = r."Id"
  );

-- Verification Query: Count role assignments by user type
SELECT 
    u."UserType",
    r."Name" as RoleName,
    COUNT(*) as UserCount
FROM "AspNetUsers" u
INNER JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
INNER JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111'
GROUP BY u."UserType", r."Name"
ORDER BY UserCount DESC, u."UserType";

-- Total role assignments
SELECT COUNT(*) as TotalRoleAssignments
FROM "AspNetUserRoles" ur
INNER JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
WHERE u."TenantId" = '11111111-1111-1111-1111-111111111111';
