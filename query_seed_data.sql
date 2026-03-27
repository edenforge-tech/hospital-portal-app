-- Query 1: Get tenant-branch info
SELECT 
    t.id AS tenant_id, 
    t.name AS tenant_name,
    b.id AS branch_id,
    b.name AS branch_name
FROM tenant t
JOIN branch b ON b.tenant_id = t.id AND b.deleted_at IS NULL
WHERE t.deleted_at IS NULL
ORDER BY t.name, b.name
LIMIT 8;

-- Query 2: Doctors/Surgeons
SELECT 
    u."Id" AS user_id,
    u."FullName" AS full_name,
    u."TenantId" AS tenant_id,
    u."BranchId" AS branch_id,
    r."Name" AS role_name
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON ur."UserId" = u."Id"
JOIN "AspNetRoles" r ON r."Id" = ur."RoleId"
WHERE u."DeletedAt" IS NULL
  AND u."UserStatus" = 'active'
  AND (r."NormalizedName" LIKE '%DOCTOR%' OR r."NormalizedName" LIKE '%SURGEON%' OR r."NormalizedName" LIKE '%OPHTHAL%')
LIMIT 8;

-- Query 3: Patients (active)
SELECT 
    p.id AS patient_id,
    p.full_name,
    p.mrn,
    p.phone_number,
    p.gender,
    p.date_of_birth,
    p.tenant_id,
    p.branch_id
FROM patient p
WHERE p.deleted_at IS NULL AND p.status = 'active'
LIMIT 10;

-- Query 4: Counseling sessions (completed, for followup tab)
SELECT 
    id AS session_id,
    patient_id,
    status,
    session_type,
    patient_agreed_to_surgery,
    pending_decision,
    recommended_surgery,
    patient_type,
    tenant_id,
    branch_id
FROM counseling_sessions
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- Query 5: OT Theaters
SELECT id, tenant_id, branch_id, theater_name 
FROM ot_theaters
WHERE deleted_at IS NULL
LIMIT 5;

-- Query 6: OT Schedules (current)
SELECT id, status, surgery_type, scheduled_date, patient_id, surgeon_id, tenant_id, branch_id
FROM ot_schedules
WHERE deleted_at IS NULL
ORDER BY scheduled_date DESC
LIMIT 5;

-- Query 7: Post-op care schedules (current)
SELECT id, patient_id, surgery_type, surgery_date, status, tenant_id
FROM post_op_care_schedule
WHERE deleted_at IS NULL
ORDER BY surgery_date DESC
LIMIT 5;

-- Query 8: Admin user info
SELECT u."Id" AS user_id, u."FullName", u."TenantId", u."BranchId", u."Email"
FROM "AspNetUsers" u
WHERE u."Email" = 'admin@test.com' AND u."DeletedAt" IS NULL;
