-- ============================================
-- Seed Patient Management Permissions (24)
-- Hospital Portal - RBAC Implementation
-- Uses PascalCase column names for Azure DB
-- Created: November 10, 2025
-- ============================================

-- Insert 24 Patient Management Permissions
INSERT INTO permission (
    "Id", "Code", "Name", "Module", "Action", "ResourceType", "Scope", "Description",
    "IsSystemPermission", "DepartmentSpecific", "IsCustom", "IsActive",
    "CreatedAt", "UpdatedAt", "TenantId", "CreatedBy", "UpdatedBy"
) VALUES
-- Patient Records (4 permissions)
(gen_random_uuid(), 'patient.patient_record.create', 'Create Patient Record', 'patient_management', 'create', 'patient_record', 'branch', 'Create new patient records in the system', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_record.read', 'View Patient Record', 'patient_management', 'read', 'patient_record', 'own', 'View patient records with department-level access', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_record.update', 'Update Patient Record', 'patient_management', 'update', 'patient_record', 'own', 'Update patient records with department-level access', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_record.delete', 'Delete Patient Record', 'patient_management', 'delete', 'patient_record', 'branch', 'Soft delete patient records', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),

-- Patient Demographics (4 permissions)
(gen_random_uuid(), 'patient.patient_demographics.create', 'Create Patient Demographics', 'patient_management', 'create', 'patient_demographics', 'branch', 'Create patient demographic information', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_demographics.read', 'View Patient Demographics', 'patient_management', 'read', 'patient_demographics', 'own', 'View patient demographic information', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_demographics.update', 'Update Patient Demographics', 'patient_management', 'update', 'patient_demographics', 'own', 'Update patient demographic information', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_demographics.delete', 'Delete Patient Demographics', 'patient_management', 'delete', 'patient_demographics', 'branch', 'Delete patient demographic information', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),

-- Patient Contact (4 permissions)
(gen_random_uuid(), 'patient.patient_contact.create', 'Create Patient Contact', 'patient_management', 'create', 'patient_contact', 'branch', 'Create patient contact information', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_contact.read', 'View Patient Contact', 'patient_management', 'read', 'patient_contact', 'own', 'View patient contact information', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_contact.update', 'Update Patient Contact', 'patient_management', 'update', 'patient_contact', 'own', 'Update patient contact information', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_contact.delete', 'Delete Patient Contact', 'patient_management', 'delete', 'patient_contact', 'branch', 'Delete patient contact information', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),

-- Patient Consent (4 permissions)
(gen_random_uuid(), 'patient.patient_consent.create', 'Create Patient Consent', 'patient_management', 'create', 'patient_consent', 'branch', 'Create patient consent forms', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_consent.read', 'View Patient Consent', 'patient_management', 'read', 'patient_consent', 'own', 'View patient consent forms', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_consent.update', 'Update Patient Consent', 'patient_management', 'update', 'patient_consent', 'own', 'Update patient consent forms', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_consent.delete', 'Delete Patient Consent', 'patient_management', 'delete', 'patient_consent', 'branch', 'Delete patient consent forms', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),

-- Patient Documents (4 permissions)
(gen_random_uuid(), 'patient.patient_document.upload', 'Upload Patient Document', 'patient_management', 'upload', 'patient_document', 'own', 'Upload patient documents and records', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_document.read', 'View Patient Document', 'patient_management', 'read', 'patient_document', 'own', 'View patient documents', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_document.download', 'Download Patient Document', 'patient_management', 'download', 'patient_document', 'own', 'Download patient documents', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_document.delete', 'Delete Patient Document', 'patient_management', 'delete', 'patient_document', 'branch', 'Delete patient documents', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),

-- Patient Preferences (4 permissions)
(gen_random_uuid(), 'patient.patient_preferences.create', 'Create Patient Preferences', 'patient_management', 'create', 'patient_preferences', 'own', 'Create patient preferences and settings', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_preferences.read', 'View Patient Preferences', 'patient_management', 'read', 'patient_preferences', 'own', 'View patient preferences', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_preferences.update', 'Update Patient Preferences', 'patient_management', 'update', 'patient_preferences', 'own', 'Update patient preferences', true, true, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL),
(gen_random_uuid(), 'patient.patient_preferences.delete', 'Delete Patient Preferences', 'patient_management', 'delete', 'patient_preferences', 'own', 'Delete patient preferences', true, false, false, true, NOW(), NOW(), '00000000-0000-0000-0000-000000000000'::uuid, NULL, NULL)

ON CONFLICT ("TenantId", "Code") DO NOTHING;

-- Verification
DO $$
DECLARE
    patient_mgmt_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_mgmt_count 
    FROM permission 
    WHERE "Module" = 'patient_management';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Patient Management Permissions: %', patient_mgmt_count;
    RAISE NOTICE '============================================';
END $$;
