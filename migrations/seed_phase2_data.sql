-- Add missing sort_order columns and seed data

ALTER TABLE onboarding_checklist_item ADD COLUMN IF NOT EXISTS sort_order INTEGER;
ALTER TABLE filter_preset ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Seed 24 onboarding checklist items
DO $$
DECLARE v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    INSERT INTO onboarding_checklist_item (tenant_id, step_number, item_name, item_description, item_type, is_required, sort_order) VALUES
    (v_tenant_id, 1, 'Upload Photo ID', 'Aadhaar Card / PAN Card / Passport', 'Document Upload', true, 1),
    (v_tenant_id, 1, 'Upload Address Proof', 'Utility Bill / Rental Agreement', 'Document Upload', true, 2),
    (v_tenant_id, 1, 'Bank Account Details', 'Account Number and IFSC for salary', 'Form Submission', true, 3),
    (v_tenant_id, 1, 'Emergency Contact Form', 'Name, Relationship, Phone Number', 'Form Submission', true, 4),
    (v_tenant_id, 2, 'Sign Employment Contract', 'Review and sign digital contract', 'Manager Approval', true, 5),
    (v_tenant_id, 2, 'Tax Declaration (Form 12BB)', 'Income tax deductions declaration', 'Form Submission', true, 6),
    (v_tenant_id, 2, 'Previous Employment Details', 'Experience letters and relieving letters', 'Document Upload', false, 7),
    (v_tenant_id, 2, 'Background Verification Consent', 'Consent for BGV process', 'Form Submission', true, 8),
    (v_tenant_id, 3, 'Medical Fitness Certificate', 'Health check-up from approved panel', 'Document Upload', true, 9),
    (v_tenant_id, 3, 'COVID Vaccination Certificate', 'Upload vaccination proof', 'Document Upload', false, 10),
    (v_tenant_id, 3, 'Blood Group Declaration', 'For emergency medical records', 'Form Submission', true, 11),
    (v_tenant_id, 3, 'Medical Insurance Enrollment', 'Enroll family members if applicable', 'Form Submission', false, 12),
    (v_tenant_id, 4, 'Upload Educational Certificates', 'Degree, diploma, or professional qualifications', 'Document Upload', true, 13),
    (v_tenant_id, 4, 'Upload Professional License', 'Medical Council registration for doctors/nurses', 'Document Upload', true, 14),
    (v_tenant_id, 4, 'Skill Certifications', 'BLS, ACLS, or specialty certifications', 'Document Upload', false, 15),
    (v_tenant_id, 4, 'Continuing Medical Education (CME)', 'Last 2 years CME certificates', 'Document Upload', false, 16),
    (v_tenant_id, 5, 'Create Email Account', 'Hospital email account setup', 'System Access', true, 17),
    (v_tenant_id, 5, 'Hospital Portal Training', 'Complete system orientation', 'Training Completion', true, 18),
    (v_tenant_id, 5, 'EMR System Access', 'Electronic Medical Records access', 'System Access', true, 19),
    (v_tenant_id, 5, 'Biometric Enrollment', 'Register fingerprint for attendance', 'Task Completion', true, 20),
    (v_tenant_id, 6, 'HIPAA Compliance Training', 'Patient privacy and data security', 'Training Completion', true, 21),
    (v_tenant_id, 6, 'Fire Safety & Emergency Procedures', 'Building evacuation and safety protocols', 'Training Completion', true, 22),
    (v_tenant_id, 6, 'Infection Control Training', 'Hand hygiene, PPE, waste disposal', 'Training Completion', true, 23),
    (v_tenant_id, 6, 'Department-Specific Orientation', 'Team introduction and workflow training', 'Manager Approval', true, 24);
    
    RAISE NOTICE '✓ Seeded 24 onboarding checklist items';
END $$;

-- Seed 23 system filter presets
DO $$
DECLARE v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    INSERT INTO filter_preset (tenant_id, preset_code, preset_name, module_name, filter_criteria, icon, badge_color, is_system_preset, sort_order) VALUES
    (v_tenant_id, 'ACTIVE_EMPLOYEES', 'Active Employees', 'Employees', '{"filters":[{"field":"status","operator":"equals","value":"active"}]}'::JSONB, 'users', 'green', true, 1),
    (v_tenant_id, 'NEW_HIRES_30', 'New Hires (Last 30 Days)', 'Employees', '{"filters":[{"field":"created_at","operator":"gte","value":"NOW() - INTERVAL ''30 days''"}]}'::JSONB, 'user-plus', 'blue', true, 2),
    (v_tenant_id, 'ON_PROBATION', 'On Probation', 'Employees', '{"filters":[{"field":"employment_status","operator":"equals","value":"probation"}]}'::JSONB, 'clock', 'yellow', true, 3),
    (v_tenant_id, 'TERMINATED', 'Terminated Employees', 'Employees', '{"filters":[{"field":"status","operator":"equals","value":"terminated"}]}'::JSONB, 'user-x', 'red', true, 4),
    (v_tenant_id, 'LICENSE_EXPIRY_30', 'Licenses Expiring (30 Days)', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''30 days''"]}]}'::JSONB, 'alert-circle', 'red', true, 5),
    (v_tenant_id, 'LICENSE_EXPIRY_90', 'Licenses Expiring (90 Days)', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''90 days''"]}]}'::JSONB, 'alert-triangle', 'yellow', true, 6),
    (v_tenant_id, 'LICENSE_EXPIRED', 'Expired Licenses', 'Licenses', '{"filters":[{"field":"expiry_date","operator":"lt","value":"NOW()"}]}'::JSONB, 'x-circle', 'red', true, 7),
    (v_tenant_id, 'LICENSE_SUSPENDED', 'Suspended Licenses', 'Licenses', '{"filters":[{"field":"license_status","operator":"equals","value":"suspended"}]}'::JSONB, 'pause-circle', 'orange', true, 8),
    (v_tenant_id, 'CONTRACT_EXPIRY_60', 'Contracts Expiring (60 Days)', 'Contracts', '{"filters":[{"field":"end_date","operator":"between","value":["NOW()","NOW() + INTERVAL ''60 days''"]}]}'::JSONB, 'file-text', 'red', true, 9),
    (v_tenant_id, 'CONTRACT_AUTO_RENEW', 'Auto-Renew Contracts', 'Contracts', '{"filters":[{"field":"auto_renew","operator":"equals","value":true}]}'::JSONB, 'repeat', 'green', true, 10),
    (v_tenant_id, 'CONTRACT_RENEWAL_PENDING', 'Pending Renewal Decision', 'Contracts', '{"filters":[{"field":"renewal_status","operator":"equals","value":"pending"}]}'::JSONB, 'help-circle', 'yellow', true, 11),
    (v_tenant_id, 'APPOINTMENTS_TODAY', 'Today Appointments', 'Appointments', '{"filters":[{"field":"appointment_date","operator":"equals","value":"TODAY"}]}'::JSONB, 'calendar', 'blue', true, 12),
    (v_tenant_id, 'APPOINTMENTS_PENDING', 'Pending Appointments', 'Appointments', '{"filters":[{"field":"appointment_status","operator":"equals","value":"scheduled"}]}'::JSONB, 'clock', 'yellow', true, 13),
    (v_tenant_id, 'APPOINTMENTS_CANCELLED', 'Cancelled Appointments', 'Appointments', '{"filters":[{"field":"appointment_status","operator":"equals","value":"cancelled"}]}'::JSONB, 'x', 'red', true, 14),
    (v_tenant_id, 'PATIENTS_ACTIVE', 'Active Patients', 'Patients', '{"filters":[{"field":"status","operator":"equals","value":"active"}]}'::JSONB, 'user-check', 'green', true, 15),
    (v_tenant_id, 'PATIENTS_ADMITTED', 'Admitted Patients', 'Patients', '{"filters":[{"field":"admission_status","operator":"equals","value":"admitted"}]}'::JSONB, 'bed', 'blue', true, 16),
    (v_tenant_id, 'PATIENTS_HIGH_RISK', 'High-Risk Patients', 'Patients', '{"filters":[{"field":"risk_level","operator":"equals","value":"high"}]}'::JSONB, 'alert-triangle', 'red', true, 17),
    (v_tenant_id, 'ONBOARDING_IN_PROGRESS', 'Onboarding In Progress', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"In Progress"}]}'::JSONB, 'user-plus', 'blue', true, 18),
    (v_tenant_id, 'ONBOARDING_PENDING_REVIEW', 'Pending Review', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"Pending Review"}]}'::JSONB, 'eye', 'yellow', true, 19),
    (v_tenant_id, 'ONBOARDING_COMPLETED', 'Completed Onboarding', 'Onboarding', '{"filters":[{"field":"onboarding_status","operator":"equals","value":"Completed"}]}'::JSONB, 'check-circle', 'green', true, 20),
    (v_tenant_id, 'AUDIT_PHI_TODAY', 'PHI Access Today', 'Audit Logs', '{"filters":[{"field":"event_type","operator":"equals","value":"PHI_ACCESS"},{"field":"event_timestamp","operator":"gte","value":"TODAY"}]}'::JSONB, 'shield', 'blue', true, 21),
    (v_tenant_id, 'AUDIT_FAILED_LOGINS', 'Failed Login Attempts', 'Audit Logs', '{"filters":[{"field":"event_type","operator":"equals","value":"FAILED_LOGIN"}]}'::JSONB, 'lock', 'red', true, 22),
    (v_tenant_id, 'AUDIT_EMERGENCY_ACCESS', 'Emergency Access Logs', 'Audit Logs', '{"filters":[{"field":"access_type","operator":"equals","value":"emergency"}]}'::JSONB, 'zap', 'red', true, 23);
    
    RAISE NOTICE '✓ Seeded 23 filter presets';
END $$;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 2 MIGRATIONS - SEEDING COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ Added sort_order columns';
    RAISE NOTICE '✓ 24 onboarding checklist items';
    RAISE NOTICE '✓ 23 system filter presets';
    RAISE NOTICE '✓ 3 progressive access rules';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PHASE 2 SUMMARY (Migrations 08, 09, 11):';
    RAISE NOTICE '- 9 tables created';
    RAISE NOTICE '- 3 functions created';
    RAISE NOTICE '- 1 view created';
    RAISE NOTICE '- 50 records seeded';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REMAINING: Migrations 10, 12, 13, 14, 15, 16';
    RAISE NOTICE '(Require schema adjustments for existing tables)';
    RAISE NOTICE '========================================';
END $$;
