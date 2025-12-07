-- ============================================
-- Seed Script: Patient Management Permissions (24)
-- Module: patient_management
-- Created: November 10, 2025
-- Description: Granular CRUD permissions for patient records, demographics, 
--              contact, consent, documents, preferences
-- ============================================

-- Insert Patient Management Permissions
INSERT INTO permissions (
    id, code, name, module, action, resource_type, scope, description, 
    is_system_permission, is_active, created_at, updated_at
) VALUES
-- Patient Record Permissions (4)
(gen_random_uuid(), 'patient.patient_record.create', 'Create Patient Record', 'patient_management', 'create', 'patient_record', 'tenant', 'Create new patient records in the system', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_record.read', 'Read Patient Record', 'patient_management', 'read', 'patient_record', 'branch', 'View patient records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_record.update', 'Update Patient Record', 'patient_management', 'update', 'patient_record', 'department', 'Modify existing patient records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_record.delete', 'Delete Patient Record', 'patient_management', 'delete', 'patient_record', 'tenant', 'Soft delete patient records (HIPAA compliant)', true, true, NOW(), NOW()),

-- Patient Demographics Permissions (4)
(gen_random_uuid(), 'patient.patient_demographics.create', 'Create Patient Demographics', 'patient_management', 'create', 'patient_demographics', 'tenant', 'Add demographic information for patients', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_demographics.read', 'Read Patient Demographics', 'patient_management', 'read', 'patient_demographics', 'branch', 'View patient demographic details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_demographics.update', 'Update Patient Demographics', 'patient_management', 'update', 'patient_demographics', 'department', 'Modify patient demographic information', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_demographics.delete', 'Delete Patient Demographics', 'patient_management', 'delete', 'patient_demographics', 'tenant', 'Remove patient demographic data', true, true, NOW(), NOW()),

-- Patient Contact Permissions (4)
(gen_random_uuid(), 'patient.patient_contact.create', 'Create Patient Contact', 'patient_management', 'create', 'patient_contact', 'tenant', 'Add patient contact information', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_contact.read', 'Read Patient Contact', 'patient_management', 'read', 'patient_contact', 'branch', 'View patient contact details', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_contact.update', 'Update Patient Contact', 'patient_management', 'update', 'patient_contact', 'department', 'Modify patient contact information', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_contact.delete', 'Delete Patient Contact', 'patient_management', 'delete', 'patient_contact', 'tenant', 'Remove patient contact records', true, true, NOW(), NOW()),

-- Patient Consent Permissions (4)
(gen_random_uuid(), 'patient.patient_consent.create', 'Create Patient Consent', 'patient_management', 'create', 'patient_consent', 'tenant', 'Record patient consent for treatment', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_consent.read', 'Read Patient Consent', 'patient_management', 'read', 'patient_consent', 'branch', 'View patient consent records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_consent.update', 'Update Patient Consent', 'patient_management', 'update', 'patient_consent', 'department', 'Modify patient consent status', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_consent.delete', 'Delete Patient Consent', 'patient_management', 'delete', 'patient_consent', 'tenant', 'Revoke patient consent', true, true, NOW(), NOW()),

-- Patient Document Permissions (4)
(gen_random_uuid(), 'patient.patient_document.upload', 'Upload Patient Document', 'patient_management', 'upload', 'patient_document', 'department', 'Upload documents for patient records', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_document.read', 'Read Patient Document', 'patient_management', 'read', 'patient_document', 'branch', 'View patient documents', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_document.update', 'Update Patient Document', 'patient_management', 'update', 'patient_document', 'department', 'Modify patient document metadata', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_document.delete', 'Delete Patient Document', 'patient_management', 'delete', 'patient_document', 'tenant', 'Remove patient documents', true, true, NOW(), NOW()),

-- Patient Preferences Permissions (4)
(gen_random_uuid(), 'patient.patient_preferences.create', 'Create Patient Preferences', 'patient_management', 'create', 'patient_preferences', 'own', 'Set patient communication and treatment preferences', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_preferences.read', 'Read Patient Preferences', 'patient_management', 'read', 'patient_preferences', 'branch', 'View patient preferences', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_preferences.update', 'Update Patient Preferences', 'patient_management', 'update', 'patient_preferences', 'own', 'Modify patient preferences', true, true, NOW(), NOW()),
(gen_random_uuid(), 'patient.patient_preferences.delete', 'Delete Patient Preferences', 'patient_management', 'delete', 'patient_preferences', 'own', 'Remove patient preferences', true, true, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;

-- Verify insertion
DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count 
    FROM permissions 
    WHERE module = 'patient_management';
    
    RAISE NOTICE '✓ Patient Management: % permissions inserted', inserted_count;
END $$;
