-- =====================================================
-- MISSING PERMISSIONS ADDITION SCRIPT
-- Adding 26 missing permissions to reach target of 297
-- =====================================================

-- Add missing permissions to existing modules and new modules
INSERT INTO permissions (id, tenant_id, code, name, module, resource, action, scope, data_classification, description, is_system_permission) VALUES
-- EMERGENCY DEPARTMENT (12 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.view_patients', 'View Emergency Patients', 'Emergency', 'emergency_patients', 'view', 'tenant', 'confidential', 'View emergency department patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.admit_patients', 'Admit Emergency Patients', 'Emergency', 'emergency_patients', 'admit', 'tenant', 'confidential', 'Admit patients to emergency', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.triage_patients', 'Triage Emergency Patients', 'Emergency', 'emergency_patients', 'triage', 'tenant', 'confidential', 'Triage emergency patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.stabilize_patients', 'Stabilize Emergency Patients', 'Emergency', 'emergency_patients', 'stabilize', 'tenant', 'confidential', 'Stabilize emergency patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.transfer_patients', 'Transfer Emergency Patients', 'Emergency', 'emergency_patients', 'transfer', 'tenant', 'confidential', 'Transfer patients from emergency', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.view_equipment', 'View Emergency Equipment', 'Emergency', 'emergency_equipment', 'view', 'tenant', 'internal', 'View emergency equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.manage_equipment', 'Manage Emergency Equipment', 'Emergency', 'emergency_equipment', 'manage', 'tenant', 'internal', 'Manage emergency equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.view_protocols', 'View Emergency Protocols', 'Emergency', 'emergency_protocols', 'view', 'tenant', 'internal', 'View emergency protocols', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.update_protocols', 'Update Emergency Protocols', 'Emergency', 'emergency_protocols', 'update', 'tenant', 'internal', 'Update emergency protocols', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.view_reports', 'View Emergency Reports', 'Emergency', 'emergency_reports', 'view', 'tenant', 'confidential', 'View emergency reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.create_reports', 'Create Emergency Reports', 'Emergency', 'emergency_reports', 'create', 'tenant', 'confidential', 'Create emergency reports', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'emergency.view_all_emergency_data', 'View All Emergency Data', 'Emergency', 'all_emergency_data', 'view', 'tenant', 'confidential', 'View all emergency data', true),

-- ICU (INTENSIVE CARE UNIT) (10 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.view_patients', 'View ICU Patients', 'ICU', 'icu_patients', 'view', 'tenant', 'confidential', 'View ICU patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.admit_patients', 'Admit ICU Patients', 'ICU', 'icu_patients', 'admit', 'tenant', 'confidential', 'Admit patients to ICU', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.monitor_patients', 'Monitor ICU Patients', 'ICU', 'icu_patients', 'monitor', 'tenant', 'confidential', 'Monitor ICU patients', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.manage_ventilators', 'Manage Ventilators', 'ICU', 'ventilators', 'manage', 'tenant', 'confidential', 'Manage ventilator equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.administer_medications', 'Administer ICU Medications', 'ICU', 'icu_medications', 'administer', 'tenant', 'confidential', 'Administer ICU medications', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.view_equipment', 'View ICU Equipment', 'ICU', 'icu_equipment', 'view', 'tenant', 'internal', 'View ICU equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.calibrate_equipment', 'Calibrate ICU Equipment', 'ICU', 'icu_equipment', 'calibrate', 'tenant', 'internal', 'Calibrate ICU equipment', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.view_protocols', 'View ICU Protocols', 'ICU', 'icu_protocols', 'view', 'tenant', 'internal', 'View ICU protocols', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.update_protocols', 'Update ICU Protocols', 'ICU', 'icu_protocols', 'update', 'tenant', 'internal', 'Update ICU protocols', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'icu.view_all_icu_data', 'View All ICU Data', 'ICU', 'all_icu_data', 'view', 'tenant', 'confidential', 'View all ICU data', true),

-- Additional permissions for existing modules (4 permissions)
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.cancel', 'Cancel Appointments', 'Appointments', 'appointments', 'cancel', 'tenant', 'internal', 'Cancel appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'appointments.reschedule', 'Reschedule Appointments', 'Appointments', 'appointments', 'reschedule', 'tenant', 'internal', 'Reschedule appointments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'clinical_assessment.reject', 'Reject Clinical Assessments', 'Clinical Assessment', 'assessment', 'reject', 'tenant', 'confidential', 'Reject clinical assessments', true),
(gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 'prescriptions.reject', 'Reject Prescriptions', 'Prescriptions', 'prescription', 'reject', 'tenant', 'confidential', 'Reject prescriptions', true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Missing permissions added successfully!';
    RAISE NOTICE '✓ Added Emergency Department module (12 permissions)';
    RAISE NOTICE '✓ Added ICU module (10 permissions)';
    RAISE NOTICE '✓ Added 4 additional permissions to existing modules';
    RAISE NOTICE '✓ Total added: 26 permissions';
END $$;