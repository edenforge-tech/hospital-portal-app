-- All patients in test tenant
SELECT id, first_name, last_name, medical_record_number, contact_number, gender, date_of_birth, status, tenant_id, branch_id
FROM patient
WHERE deleted_at IS NULL AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
ORDER BY created_at
LIMIT 20;

-- All users (surgeons/counselors) in test tenant 
SELECT id, "FirstName", "LastName", "BranchId", "Specialization", "UserType", "UserStatus"
FROM users
WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e' AND "DeletedAt" IS NULL
LIMIT 20;
