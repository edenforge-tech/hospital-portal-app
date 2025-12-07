-- ============================================
-- SIMPLE PERMISSIONS SEED SCRIPT
-- Matches actual permissions table structure
-- ============================================

-- Clear existing permissions (optional - comment out if preserving)
-- DELETE FROM permissions WHERE "IsSystemPermission" = true;

-- ============================================
-- SIMPLE PERMISSIONS SEED SCRIPT
-- Matches actual permissions table structure (with all columns)
-- ============================================

-- Insert basic permissions with ALL required columns
INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "ResourceName", "Scope", "DataClassification",
    "IsSystemPermission", "DepartmentSpecific", "IsCustom", "Dependencies",
    "ConflictsWith", "IsActive", "CreatedAt", "UpdatedAt", "data_classification",
    "scope", "resource_type", "is_system_permission"
) VALUES
-- Patient Management (4 basic permissions)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patients.view', 'View Patients', 'View patient information', 'Patient Management', 'view', 'patient', 'patient_record', 'tenant', 'sensitive', true, false, false, null, null, true, NOW(), NOW(), 'sensitive', 'tenant', 'patient', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patients.create', 'Create Patients', 'Create new patient records', 'Patient Management', 'create', 'patient', 'patient_record', 'tenant', 'sensitive', true, false, false, null, null, true, NOW(), NOW(), 'sensitive', 'tenant', 'patient', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patients.edit', 'Edit Patients', 'Edit patient information', 'Patient Management', 'edit', 'patient', 'patient_record', 'tenant', 'sensitive', true, false, false, null, null, true, NOW(), NOW(), 'sensitive', 'tenant', 'patient', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patients.delete', 'Delete Patients', 'Delete patient records', 'Patient Management', 'delete', 'patient', 'patient_record', 'tenant', 'sensitive', true, false, false, null, null, true, NOW(), NOW(), 'sensitive', 'tenant', 'patient', true),

-- Clinical Assessment (4 basic permissions)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'clinical.assessments.view', 'View Assessments', 'View clinical assessments', 'Clinical Assessment', 'view', 'assessment', 'assessment', 'tenant', 'confidential', true, false, false, null, null, true, NOW(), NOW(), 'confidential', 'tenant', 'assessment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'clinical.assessments.create', 'Create Assessments', 'Create clinical assessments', 'Clinical Assessment', 'create', 'assessment', 'assessment', 'tenant', 'confidential', true, false, false, null, null, true, NOW(), NOW(), 'confidential', 'tenant', 'assessment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'clinical.assessments.edit', 'Edit Assessments', 'Edit clinical assessments', 'Clinical Assessment', 'edit', 'assessment', 'assessment', 'tenant', 'confidential', true, false, false, null, null, true, NOW(), NOW(), 'confidential', 'tenant', 'assessment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'clinical.assessments.delete', 'Delete Assessments', 'Delete clinical assessments', 'Clinical Assessment', 'delete', 'assessment', 'assessment', 'tenant', 'confidential', true, false, false, null, null, true, NOW(), NOW(), 'confidential', 'tenant', 'assessment', true),

-- Appointments (4 basic permissions)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'appointments.view', 'View Appointments', 'View appointment schedules', 'Appointments', 'view', 'appointment', 'appointment', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'appointment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'appointments.create', 'Create Appointments', 'Create new appointments', 'Appointments', 'create', 'appointment', 'appointment', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'appointment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'appointments.edit', 'Edit Appointments', 'Edit appointment details', 'Appointments', 'edit', 'appointment', 'appointment', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'appointment', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'appointments.delete', 'Delete Appointments', 'Cancel appointments', 'Appointments', 'delete', 'appointment', 'appointment', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'appointment', true),

-- Admin permissions (4 basic permissions)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'admin.users.view', 'View Users', 'View user accounts', 'Administration', 'view', 'user', 'user_account', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'user', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'admin.users.create', 'Create Users', 'Create user accounts', 'Administration', 'create', 'user', 'user_account', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'user', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'admin.users.edit', 'Edit Users', 'Edit user accounts', 'Administration', 'edit', 'user', 'user_account', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'user', true),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'admin.users.delete', 'Delete Users', 'Delete user accounts', 'Administration', 'delete', 'user', 'user_account', 'tenant', 'internal', true, false, false, null, null, true, NOW(), NOW(), 'internal', 'tenant', 'user', true);

-- Verification
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT "Module", COUNT(*) as permission_count FROM permissions GROUP BY "Module" ORDER BY "Module";