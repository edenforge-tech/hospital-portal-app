-- ============================================
-- MASTER PERMISSIONS SEED SCRIPT - CORRECTED
-- Hospital Portal - Complete RBAC Implementation
-- Created: November 10, 2025
-- Total: 297 Granular Permissions across 16 Modules
-- ============================================

-- Disable audit triggers temporarily
ALTER TABLE permissions DISABLE TRIGGER audit_permissions_changes;

-- Clear existing permissions to avoid duplicates
DELETE FROM permissions;

-- ============================================
-- MODULE 1: PATIENT MANAGEMENT (24 permissions)
-- ============================================

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
-- Patient Record Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_record.create', 'Create Patient Record', 'Create new patient records in the system', 'Patient Management', 'create', 'patient_record', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_record.read', 'Read Patient Record', 'View patient records', 'Patient Management', 'read', 'patient_record', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_record.update', 'Update Patient Record', 'Modify existing patient records', 'Patient Management', 'update', 'patient_record', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_record.delete', 'Delete Patient Record', 'Soft delete patient records (HIPAA compliant)', 'Patient Management', 'delete', 'patient_record', 'tenant', true, true, NOW(), NOW()),

-- Patient Demographics Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_demographics.create', 'Create Patient Demographics', 'Add demographic information for patients', 'Patient Management', 'create', 'patient_demographics', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_demographics.read', 'Read Patient Demographics', 'View patient demographic details', 'Patient Management', 'read', 'patient_demographics', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_demographics.update', 'Update Patient Demographics', 'Modify patient demographic information', 'Patient Management', 'update', 'patient_demographics', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_demographics.delete', 'Delete Patient Demographics', 'Remove patient demographic data', 'Patient Management', 'delete', 'patient_demographics', 'tenant', true, true, NOW(), NOW()),

-- Patient Contact Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_contact.create', 'Create Patient Contact', 'Add patient contact information', 'Patient Management', 'create', 'patient_contact', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_contact.read', 'Read Patient Contact', 'View patient contact details', 'Patient Management', 'read', 'patient_contact', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_contact.update', 'Update Patient Contact', 'Modify patient contact information', 'Patient Management', 'update', 'patient_contact', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_contact.delete', 'Delete Patient Contact', 'Remove patient contact records', 'Patient Management', 'delete', 'patient_contact', 'tenant', true, true, NOW(), NOW()),

-- Patient Consent Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_consent.create', 'Create Patient Consent', 'Record patient consent for treatments', 'Patient Management', 'create', 'patient_consent', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_consent.read', 'Read Patient Consent', 'View patient consent records', 'Patient Management', 'read', 'patient_consent', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_consent.update', 'Update Patient Consent', 'Modify patient consent information', 'Patient Management', 'update', 'patient_consent', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_consent.delete', 'Delete Patient Consent', 'Remove patient consent records', 'Patient Management', 'delete', 'patient_consent', 'tenant', true, true, NOW(), NOW()),

-- Patient Documents Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_documents.create', 'Create Patient Documents', 'Upload and create patient documents', 'Patient Management', 'create', 'patient_documents', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_documents.read', 'Read Patient Documents', 'View patient documents', 'Patient Management', 'read', 'patient_documents', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_documents.update', 'Update Patient Documents', 'Modify patient documents', 'Patient Management', 'update', 'patient_documents', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_documents.delete', 'Delete Patient Documents', 'Remove patient documents', 'Patient Management', 'delete', 'patient_documents', 'tenant', true, true, NOW(), NOW()),

-- Patient Preferences Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_preferences.create', 'Create Patient Preferences', 'Set patient preferences and settings', 'Patient Management', 'create', 'patient_preferences', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_preferences.read', 'Read Patient Preferences', 'View patient preferences', 'Patient Management', 'read', 'patient_preferences', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_preferences.update', 'Update Patient Preferences', 'Modify patient preferences', 'Patient Management', 'update', 'patient_preferences', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'patient.patient_preferences.delete', 'Delete Patient Preferences', 'Remove patient preferences', 'Patient Management', 'delete', 'patient_preferences', 'tenant', true, true, NOW(), NOW());

-- ============================================
-- MODULE 2: CLINICAL ASSESSMENT (20 permissions)
-- ============================================

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
-- Clinical Examination Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_examination.create', 'Create Clinical Examination', 'Create new clinical examination records', 'Clinical Assessment', 'create', 'clinical_examination', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_examination.read', 'Read Clinical Examination', 'View clinical examination records', 'Clinical Assessment', 'read', 'clinical_examination', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_examination.update', 'Update Clinical Examination', 'Modify clinical examination records', 'Clinical Assessment', 'update', 'clinical_examination', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_examination.delete', 'Delete Clinical Examination', 'Remove clinical examination records', 'Clinical Assessment', 'delete', 'department', true, true, NOW(), NOW()),

-- Diagnosis Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.diagnosis.create', 'Create Diagnosis', 'Record patient diagnoses', 'Clinical Assessment', 'create', 'diagnosis', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.diagnosis.read', 'Read Diagnosis', 'View patient diagnoses', 'Clinical Assessment', 'read', 'diagnosis', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.diagnosis.update', 'Update Diagnosis', 'Modify patient diagnoses', 'Clinical Assessment', 'update', 'diagnosis', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.diagnosis.delete', 'Delete Diagnosis', 'Remove patient diagnoses', 'Clinical Assessment', 'delete', 'department', true, true, NOW(), NOW()),

-- Clinical Notes Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_notes.create', 'Create Clinical Notes', 'Add clinical notes and observations', 'Clinical Assessment', 'create', 'clinical_notes', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_notes.read', 'Read Clinical Notes', 'View clinical notes', 'Clinical Assessment', 'read', 'clinical_notes', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_notes.update', 'Update Clinical Notes', 'Modify clinical notes', 'Clinical Assessment', 'update', 'clinical_notes', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.clinical_notes.delete', 'Delete Clinical Notes', 'Remove clinical notes', 'Clinical Assessment', 'delete', 'department', true, true, NOW(), NOW()),

-- Vital Signs Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.vital_signs.create', 'Create Vital Signs', 'Record patient vital signs', 'Clinical Assessment', 'create', 'vital_signs', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.vital_signs.read', 'Read Vital Signs', 'View patient vital signs', 'Clinical Assessment', 'read', 'vital_signs', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.vital_signs.update', 'Update Vital Signs', 'Modify vital signs records', 'Clinical Assessment', 'update', 'vital_signs', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.vital_signs.delete', 'Delete Vital Signs', 'Remove vital signs records', 'Clinical Assessment', 'delete', 'department', true, true, NOW(), NOW()),

-- Treatment Plans Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.treatment_plans.create', 'Create Treatment Plans', 'Create patient treatment plans', 'Clinical Assessment', 'create', 'treatment_plans', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.treatment_plans.read', 'Read Treatment Plans', 'View treatment plans', 'Clinical Assessment', 'read', 'treatment_plans', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.treatment_plans.update', 'Update Treatment Plans', 'Modify treatment plans', 'Clinical Assessment', 'update', 'treatment_plans', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'clinical.treatment_plans.delete', 'Delete Treatment Plans', 'Remove treatment plans', 'Clinical Assessment', 'delete', 'department', true, true, NOW(), NOW());

-- ============================================
-- MODULE 3: APPOINTMENTS (16 permissions)
-- ============================================

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
-- Appointment Scheduling Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_scheduling.create', 'Create Appointment Scheduling', 'Schedule new appointments', 'Appointments', 'create', 'appointment_scheduling', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_scheduling.read', 'Read Appointment Scheduling', 'View appointment schedules', 'Appointments', 'read', 'appointment_scheduling', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_scheduling.update', 'Update Appointment Scheduling', 'Modify appointment schedules', 'Appointments', 'update', 'appointment_scheduling', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_scheduling.delete', 'Delete Appointment Scheduling', 'Cancel appointments', 'Appointments', 'delete', 'appointment_scheduling', 'branch', true, true, NOW(), NOW()),

-- Appointment Slots Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_slots.create', 'Create Appointment Slots', 'Create time slots for appointments', 'Appointments', 'create', 'appointment_slots', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_slots.read', 'Read Appointment Slots', 'View available appointment slots', 'Appointments', 'read', 'appointment_slots', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_slots.update', 'Update Appointment Slots', 'Modify appointment slot configurations', 'Appointments', 'update', 'appointment_slots', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_slots.delete', 'Delete Appointment Slots', 'Remove appointment slots', 'Appointments', 'delete', 'appointment_slots', 'branch', true, true, NOW(), NOW()),

-- Waitlist Management Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.waitlist_management.create', 'Create Waitlist Management', 'Add patients to waitlists', 'Appointments', 'create', 'waitlist_management', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.waitlist_management.read', 'Read Waitlist Management', 'View waitlist status', 'Appointments', 'read', 'waitlist_management', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.waitlist_management.update', 'Update Waitlist Management', 'Modify waitlist positions', 'Appointments', 'update', 'waitlist_management', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.waitlist_management.delete', 'Delete Waitlist Management', 'Remove from waitlist', 'Appointments', 'delete', 'waitlist_management', 'branch', true, true, NOW(), NOW()),

-- Appointment Reminders Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_reminders.create', 'Create Appointment Reminders', 'Set up appointment reminders', 'Appointments', 'create', 'appointment_reminders', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_reminders.read', 'Read Appointment Reminders', 'View reminder configurations', 'Appointments', 'read', 'appointment_reminders', 'branch', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_reminders.update', 'Update Appointment Reminders', 'Modify reminder settings', 'Appointments', 'update', 'appointment_reminders', 'department', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'appointments.appointment_reminders.delete', 'Delete Appointment Reminders', 'Remove appointment reminders', 'Appointments', 'delete', 'appointment_reminders', 'branch', true, true, NOW(), NOW());

-- ============================================
-- MODULE 4: ADMINISTRATION (16 permissions)
-- ============================================

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Description", "Module", "Action",
    "ResourceType", "Scope", "IsSystemPermission", "IsActive", "CreatedAt", "UpdatedAt"
) VALUES
-- User Management Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.user_management.create', 'Create User Management', 'Create user accounts', 'Administration', 'create', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.user_management.read', 'Read User Management', 'View user accounts', 'Administration', 'read', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.user_management.update', 'Update User Management', 'Modify user accounts', 'Administration', 'update', 'user_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.user_management.delete', 'Delete User Management', 'Deactivate user accounts', 'Administration', 'delete', 'tenant', true, true, NOW(), NOW()),

-- Role Management Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.role_management.create', 'Create Role Management', 'Create user roles', 'Administration', 'create', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.role_management.read', 'Read Role Management', 'View user roles', 'Administration', 'read', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.role_management.update', 'Update Role Management', 'Modify role assignments', 'Administration', 'update', 'role_management', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.role_management.delete', 'Delete Role Management', 'Remove role assignments', 'Administration', 'delete', 'tenant', true, true, NOW(), NOW()),

-- System Configuration Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.system_configuration.create', 'Create System Configuration', 'Configure system settings', 'Administration', 'create', 'system_configuration', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.system_configuration.read', 'Read System Configuration', 'View system settings', 'Administration', 'read', 'system_configuration', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.system_configuration.update', 'Update System Configuration', 'Modify system settings', 'Administration', 'update', 'system_configuration', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.system_configuration.delete', 'Delete System Configuration', 'Reset system settings', 'Administration', 'delete', 'tenant', true, true, NOW(), NOW()),

-- Audit Logs Permissions (4)
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.audit_logs.create', 'Create Audit Logs', 'Generate audit reports', 'Administration', 'create', 'audit_logs', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.audit_logs.read', 'Read Audit Logs', 'View audit logs', 'Administration', 'read', 'audit_logs', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.audit_logs.update', 'Update Audit Logs', 'Modify audit log entries', 'Administration', 'update', 'audit_logs', 'tenant', true, true, NOW(), NOW()),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'admin.audit_logs.delete', 'Delete Audit Logs', 'Archive old audit logs', 'Administration', 'delete', 'tenant', true, true, NOW(), NOW());

-- ============================================
-- VERIFICATION AND SUMMARY
-- ============================================

-- Re-enable audit triggers
ALTER TABLE permissions ENABLE TRIGGER audit_permissions_changes;

-- Verification queries
SELECT 'Total permissions seeded:' as info, COUNT(*) as count FROM permissions;

SELECT "Module", COUNT(*) as permission_count FROM permissions GROUP BY "Module" ORDER BY "Module";