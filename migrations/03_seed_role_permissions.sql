-- =====================================================
-- MIGRATION 03: MAP 297 PERMISSIONS TO 78 ROLES
-- =====================================================
-- Hospital Portal - Comprehensive Role-Permission Mapping
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 21, 2026
-- Phase: 1 - Critical Foundation
-- 
-- This migration maps all 297 permissions to 78 roles using
-- least-privilege principle and separation of duties
-- =====================================================

-- Helper function to assign permissions to role by name
CREATE OR REPLACE FUNCTION assign_permissions_to_role(
    p_role_name VARCHAR,
    p_permissions TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
    v_role_id UUID;
    v_permission_id UUID;
    v_permission_name TEXT;
    v_count INTEGER := 0;
BEGIN
    -- Get role ID
    SELECT "Id" INTO v_role_id FROM "AspNetRoles" WHERE "NormalizedName" = UPPER(p_role_name);
    
    IF v_role_id IS NULL THEN
        RAISE WARNING 'Role not found: %', p_role_name;
        RETURN 0;
    END IF;
    
    -- Loop through permissions
    FOREACH v_permission_name IN ARRAY p_permissions
    LOOP
        -- Get permission ID
        SELECT id INTO v_permission_id FROM permission WHERE name = v_permission_name;
        
        IF v_permission_id IS NOT NULL THEN
            -- Insert role-permission mapping
            INSERT INTO role_permission (role_id, permission_id, created_at)
            VALUES (v_role_id, v_permission_id, CURRENT_TIMESTAMP)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
            
            v_count := v_count + 1;
        ELSE
            RAISE WARNING 'Permission not found: %', v_permission_name;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PLATFORM & SYSTEM ROLES
-- =====================================================

-- Super Admin: ALL permissions
SELECT assign_permissions_to_role('Super Admin', ARRAY(SELECT name FROM permission));

-- Platform Admin: Administrative permissions (no patient data access)
SELECT assign_permissions_to_role('Platform Admin', ARRAY[
    'tenant:view', 'tenant:create', 'tenant:edit', 'tenant:delete',
    'organization:view', 'organization:create', 'organization:edit', 'organization:delete',
    'branch:view', 'branch:create', 'branch:edit', 'branch:delete',
    'user:view', 'user:create', 'user:edit', 'user:delete', 'user:manage-roles',
    'role:view', 'role:create', 'role:edit', 'role:delete',
    'permission:view', 'permission:assign',
    'audit-log:view', 'audit-log:export',
    'system-settings:view', 'system-settings:edit'
]);

-- Support Engineer: Read-only + troubleshooting
SELECT assign_permissions_to_role('Support Engineer', ARRAY[
    'user:view', 'audit-log:view', 'system-settings:view',
    'session:view', 'session:terminate', 'device:view',
    'error-log:view', 'error-log:export'
]);

-- System Auditor: Comprehensive audit access
SELECT assign_permissions_to_role('System Auditor', ARRAY[
    'audit-log:view', 'audit-log:export', 'audit-log:advanced-search',
    'compliance-report:view', 'compliance-report:generate',
    'phi-access-log:view', 'emergency-access:audit'
]);

-- =====================================================
-- HOSPITAL LEADERSHIP
-- =====================================================

-- Hospital Owner: Near-complete access (exclude system administration)
SELECT assign_permissions_to_role('Hospital Owner', ARRAY(
    SELECT name FROM permission 
    WHERE module NOT IN ('system', 'platform')
));

-- Chief Executive Officer: Strategic + operational oversight
SELECT assign_permissions_to_role('Chief Executive Officer', ARRAY[
    'dashboard:view', 'analytics:view', 'report:view', 'report:generate',
    'tenant:view', 'organization:view', 'organization:edit',
    'branch:view', 'branch:create', 'branch:edit',
    'department:view', 'department:create', 'department:edit',
    'user:view', 'user:create', 'user:edit',
    'financial-report:view', 'revenue-report:view',
    'audit-log:view', 'compliance-report:view'
]);

-- Chief Medical Officer: Clinical oversight + quality
SELECT assign_permissions_to_role('Chief Medical Officer', ARRAY[
    'dashboard:view', 'patient:view', 'appointment:view',
    'clinical-note:view', 'prescription:view',
    'department:view', 'department:create', 'department:edit',
    'user:view', 'doctor:assign', 'doctor:supervise',
    'quality-metric:view', 'clinical-audit:view',
    'protocol:view', 'protocol:create', 'protocol:edit'
]);

-- Chief Operating Officer: Operations + workflows
SELECT assign_permissions_to_role('Chief Operating Officer', ARRAY[
    'dashboard:view', 'branch:view', 'branch:edit',
    'department:view', 'department:edit',
    'appointment:view', 'appointment:manage',
    'user:view', 'shift:view', 'shift:manage',
    'inventory:view', 'equipment:view',
    'workflow:view', 'workflow:configure'
]);

-- Chief Financial Officer: Financial operations
SELECT assign_permissions_to_role('Chief Financial Officer', ARRAY[
    'dashboard:view', 'financial-report:view', 'financial-report:generate',
    'revenue-report:view', 'expense-report:view',
    'invoice:view', 'payment:view', 'insurance-claim:view',
    'budget:view', 'budget:create', 'budget:edit',
    'billing:view', 'billing:configure'
]);

-- =====================================================
-- HR & ADMIN
-- =====================================================

-- HR Manager: Complete employee lifecycle
SELECT assign_permissions_to_role('HR Manager', ARRAY[
    'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
    'employment-contract:view', 'employment-contract:create', 'employment-contract:edit',
    'license:view', 'license:verify', 'license:manage',
    'probation:view', 'probation:manage', 'probation:review',
    'user:view', 'user:create', 'user:edit',
    'role:view', 'role:assign',
    'attendance:view', 'leave:view', 'leave:approve',
    'payroll:view', 'payroll:process',
    'onboarding:view', 'onboarding:manage',
    'performance:view', 'performance:review'
]);

-- HR Executive: Day-to-day HR operations
SELECT assign_permissions_to_role('HR Executive', ARRAY[
    'employee:view', 'employee:create', 'employee:edit',
    'user:view', 'user:create',
    'attendance:view', 'attendance:edit',
    'leave:view', 'leave:process',
    'onboarding:view', 'onboarding:execute'
]);

-- Admin Manager: Office administration
SELECT assign_permissions_to_role('Admin Manager', ARRAY[
    'user:view', 'department:view',
    'inventory:view', 'inventory:order',
    'equipment:view', 'equipment:maintain',
    'facility:view', 'facility:maintain'
]);

-- Compliance Officer: Regulatory compliance
SELECT assign_permissions_to_role('Compliance Officer', ARRAY[
    'audit-log:view', 'audit-log:export', 'audit-log:advanced-search',
    'compliance-report:view', 'compliance-report:generate',
    'phi-access-log:view', 'breach-detection:view',
    'emergency-access:audit', 'emergency-access:review',
    'license:view', 'license:verify',
    'protocol:view', 'protocol:audit',
    'training:view', 'training:track'
]);

-- =====================================================
-- FINANCE & BILLING
-- =====================================================

-- Finance Manager
SELECT assign_permissions_to_role('Finance Manager', ARRAY[
    'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete',
    'payment:view', 'payment:process', 'payment:refund',
    'insurance-claim:view', 'insurance-claim:create', 'insurance-claim:submit',
    'financial-report:view', 'financial-report:generate',
    'revenue-report:view', 'expense-report:view',
    'budget:view', 'budget:create', 'budget:edit'
]);

-- Accountant
SELECT assign_permissions_to_role('Accountant', ARRAY[
    'invoice:view', 'payment:view',
    'financial-report:view', 'financial-report:generate',
    'expense:view', 'expense:create', 'expense:edit',
    'ledger:view', 'ledger:reconcile'
]);

-- Billing Manager
SELECT assign_permissions_to_role('Billing Manager', ARRAY[
    'invoice:view', 'invoice:create', 'invoice:edit',
    'payment:view', 'payment:process',
    'insurance-claim:view', 'insurance-claim:create',
    'charge-item:view', 'charge-item:edit',
    'billing-report:view', 'revenue-report:view'
]);

-- Billing Executive
SELECT assign_permissions_to_role('Billing Executive', ARRAY[
    'invoice:view', 'invoice:create',
    'payment:view', 'payment:process',
    'charge-item:view',
    'patient:view'
]);

-- Insurance Coordinator
SELECT assign_permissions_to_role('Insurance Coordinator', ARRAY[
    'insurance-claim:view', 'insurance-claim:create', 'insurance-claim:submit',
    'insurance-verification:view', 'insurance-verification:process',
    'pre-authorization:view', 'pre-authorization:request',
    'patient:view', 'appointment:view'
]);

-- Cashier
SELECT assign_permissions_to_role('Cashier', ARRAY[
    'payment:view', 'payment:process',
    'invoice:view',
    'patient:view',
    'receipt:generate'
]);

-- Revenue Cycle Analyst
SELECT assign_permissions_to_role('Revenue Cycle Analyst', ARRAY[
    'revenue-report:view', 'billing-report:view',
    'analytics:view', 'analytics:advanced',
    'invoice:view', 'payment:view',
    'insurance-claim:view'
]);

-- Collections Specialist
SELECT assign_permissions_to_role('Collections Specialist', ARRAY[
    'invoice:view', 'payment:view',
    'collections:view', 'collections:manage',
    'patient:view', 'patient:contact'
]);

-- =====================================================
-- PATIENT COUNSELLING
-- =====================================================

-- Patient Counsellor
SELECT assign_permissions_to_role('Patient Counsellor', ARRAY[
    'patient:view', 'patient:create', 'patient:edit',
    'appointment:view', 'appointment:create', 'appointment:edit',
    'treatment-plan:view', 'cost-estimate:view', 'cost-estimate:generate',
    'consent:view', 'consent:manage',
    'insurance-verification:view'
]);

-- Patient Care Coordinator
SELECT assign_permissions_to_role('Patient Care Coordinator', ARRAY[
    'patient:view', 'appointment:view', 'appointment:manage',
    'referral:view', 'referral:create',
    'follow-up:view', 'follow-up:schedule',
    'care-plan:view'
]);

-- Patient Advocate
SELECT assign_permissions_to_role('Patient Advocate', ARRAY[
    'patient:view', 'grievance:view', 'grievance:manage',
    'feedback:view', 'feedback:respond',
    'insurance-issue:view', 'insurance-issue:resolve'
]);

-- Social Worker
SELECT assign_permissions_to_role('Social Worker', ARRAY[
    'patient:view', 'social-assessment:view', 'social-assessment:create',
    'support-service:view', 'support-service:refer',
    'counselling:view', 'counselling:document'
]);

-- =====================================================
-- CLINICAL LEADERSHIP
-- =====================================================

-- Medical Director
SELECT assign_permissions_to_role('Medical Director', ARRAY[
    'patient:view', 'clinical-note:view',
    'quality-metric:view', 'clinical-audit:view',
    'protocol:view', 'protocol:create', 'protocol:edit',
    'doctor:view', 'doctor:supervise',
    'department:view', 'department:manage',
    'clinical-report:view'
]);

-- Department Head
SELECT assign_permissions_to_role('Department Head', ARRAY[
    'patient:view', 'appointment:view',
    'department:view', 'department:edit',
    'user:view', 'shift:view', 'shift:manage',
    'equipment:view', 'inventory:view',
    'quality-metric:view'
]);

-- Clinical Manager
SELECT assign_permissions_to_role('Clinical Manager', ARRAY[
    'patient:view', 'appointment:view', 'appointment:manage',
    'shift:view', 'shift:manage',
    'user:view', 'user:schedule',
    'quality-metric:view', 'workflow:view'
]);

-- Infection Control Officer
SELECT assign_permissions_to_role('Infection Control Officer', ARRAY[
    'infection-control:view', 'infection-control:monitor',
    'hygiene-audit:view', 'hygiene-audit:conduct',
    'protocol:view', 'protocol:enforce',
    'incident:view', 'incident:investigate'
]);

-- =====================================================
-- CORE EYE DOCTORS (All get similar clinical permissions)
-- =====================================================

DO $$
DECLARE
    doctor_roles TEXT[] := ARRAY[
        'Ophthalmologist', 'Cataract Surgeon', 'Retina Specialist',
        'Glaucoma Specialist', 'Cornea Specialist', 'Pediatric Ophthalmologist',
        'Oculoplastic Surgeon', 'Neuro-Ophthalmologist', 'Vitreoretinal Surgeon'
    ];
    role_name TEXT;
BEGIN
    FOREACH role_name IN ARRAY doctor_roles
    LOOP
        PERFORM assign_permissions_to_role(role_name, ARRAY[
            'patient:view', 'patient:create', 'patient:edit',
            'appointment:view', 'appointment:create', 'appointment:edit',
            'clinical-note:view', 'clinical-note:create', 'clinical-note:edit',
            'clinical-examination:view', 'clinical-examination:create',
            'prescription:view', 'prescription:create', 'prescription:edit',
            'lab-order:view', 'lab-order:create',
            'imaging-study:view', 'imaging-study:create', 'imaging-study:view-results',
            'diagnosis:view', 'diagnosis:create',
            'treatment-plan:view', 'treatment-plan:create', 'treatment-plan:edit',
            'surgery:view', 'surgery:schedule', 'surgery:perform',
            'consent:view', 'consent:obtain',
            'referral:view', 'referral:create',
            'follow-up:view', 'follow-up:schedule'
        ]);
    END LOOP;
END $$;

-- =====================================================
-- OPTOMETRY
-- =====================================================

-- Optometrist
SELECT assign_permissions_to_role('Optometrist', ARRAY[
    'patient:view', 'patient:create', 'patient:edit',
    'appointment:view', 'appointment:create',
    'vision-test:view', 'vision-test:perform',
    'refraction:view', 'refraction:create',
    'prescription:view', 'prescription:create',
    'optical-order:view', 'optical-order:create'
]);

-- Optician
SELECT assign_permissions_to_role('Optician', ARRAY[
    'patient:view', 'optical-order:view', 'optical-order:process',
    'eyeglass:view', 'eyeglass:dispense',
    'fitting:view', 'fitting:perform',
    'inventory:view'
]);

-- Contact Lens Specialist
SELECT assign_permissions_to_role('Contact Lens Specialist', ARRAY[
    'patient:view', 'contact-lens:view', 'contact-lens:fit',
    'follow-up:view', 'follow-up:schedule',
    'optical-order:view', 'optical-order:create'
]);

-- =====================================================
-- NURSING
-- =====================================================

-- Chief Nursing Officer
SELECT assign_permissions_to_role('Chief Nursing Officer', ARRAY[
    'patient:view', 'nurse:view', 'nurse:supervise',
    'shift:view', 'shift:manage',
    'quality-metric:view', 'nursing-audit:view',
    'protocol:view', 'protocol:enforce',
    'training:view', 'training:schedule'
]);

-- Nursing Manager
SELECT assign_permissions_to_role('Nursing Manager', ARRAY[
    'patient:view', 'nurse:view',
    'shift:view', 'shift:manage',
    'medication:view', 'medication:administer',
    'vital-signs:view', 'vital-signs:record',
    'nursing-note:view', 'nursing-note:create'
]);

-- Registered Nurse
SELECT assign_permissions_to_role('Registered Nurse', ARRAY[
    'patient:view',
    'vital-signs:view', 'vital-signs:record',
    'medication:view', 'medication:administer',
    'nursing-note:view', 'nursing-note:create',
    'lab-order:view', 'specimen:collect'
]);

-- Ophthalmic Nurse
SELECT assign_permissions_to_role('Ophthalmic Nurse', ARRAY[
    'patient:view', 'surgery:view', 'surgery:assist',
    'pre-op:view', 'pre-op:prepare',
    'post-op:view', 'post-op:monitor',
    'medication:view', 'medication:administer',
    'vital-signs:view', 'vital-signs:record',
    'nursing-note:view', 'nursing-note:create'
]);

-- Nurse Practitioner
SELECT assign_permissions_to_role('Nurse Practitioner', ARRAY[
    'patient:view', 'patient:assess',
    'clinical-examination:view', 'clinical-examination:create',
    'diagnosis:view', 'diagnosis:suggest',
    'prescription:view', 'prescription:create',
    'lab-order:view', 'lab-order:create',
    'treatment-plan:view', 'treatment-plan:assist'
]);

-- =====================================================
-- DIAGNOSTIC & TESTING
-- =====================================================

-- Diagnostic Technician
SELECT assign_permissions_to_role('Diagnostic Technician', ARRAY[
    'patient:view',
    'diagnostic-test:view', 'diagnostic-test:perform',
    'oct-scan:view', 'oct-scan:perform',
    'visual-field:view', 'visual-field:perform',
    'fundus-photo:view', 'fundus-photo:capture',
    'test-result:view', 'test-result:upload'
]);

-- Lab Technician
SELECT assign_permissions_to_role('Lab Technician', ARRAY[
    'patient:view',
    'lab-order:view', 'lab-order:process',
    'specimen:view', 'specimen:process',
    'lab-result:view', 'lab-result:enter'
]);

-- Radiology Technician
SELECT assign_permissions_to_role('Radiology Technician', ARRAY[
    'patient:view',
    'imaging-study:view', 'imaging-study:perform',
    'xray:view', 'xray:capture',
    'ct-scan:view', 'ct-scan:perform',
    'imaging-result:view', 'imaging-result:upload'
]);

-- Anesthesia Technician
SELECT assign_permissions_to_role('Anesthesia Technician', ARRAY[
    'patient:view', 'surgery:view',
    'anesthesia:view', 'anesthesia:assist',
    'equipment:view', 'equipment:setup',
    'vital-signs:view', 'vital-signs:monitor'
]);

-- =====================================================
-- PHARMACY & OPTICAL
-- =====================================================

-- Pharmacist
SELECT assign_permissions_to_role('Pharmacist', ARRAY[
    'prescription:view', 'prescription:dispense',
    'medication:view', 'medication:manage',
    'inventory:view', 'inventory:manage',
    'drug-interaction:check', 'allergy:check',
    'counselling:view', 'counselling:provide'
]);

-- Pharmacy Technician
SELECT assign_permissions_to_role('Pharmacy Technician', ARRAY[
    'prescription:view', 'prescription:prepare',
    'medication:view', 'inventory:view', 'inventory:update'
]);

-- Optical Manager
SELECT assign_permissions_to_role('Optical Manager', ARRAY[
    'optical-order:view', 'optical-order:manage',
    'inventory:view', 'inventory:manage',
    'eyeglass:view', 'eyeglass:order',
    'sales:view', 'sales:report'
]);

-- Optical Sales Executive
SELECT assign_permissions_to_role('Optical Sales Executive', ARRAY[
    'patient:view', 'optical-order:view', 'optical-order:create',
    'eyeglass:view', 'eyeglass:sell',
    'payment:view', 'payment:process'
]);

-- Inventory Manager
SELECT assign_permissions_to_role('Inventory Manager', ARRAY[
    'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete',
    'stock:view', 'stock:adjust',
    'order:view', 'order:create',
    'vendor:view', 'vendor:manage',
    'inventory-report:view'
]);

-- =====================================================
-- FRONT DESK & RECEPTION
-- =====================================================

-- Front Desk Manager
SELECT assign_permissions_to_role('Front Desk Manager', ARRAY[
    'patient:view', 'patient:create', 'patient:edit',
    'appointment:view', 'appointment:create', 'appointment:edit', 'appointment:cancel',
    'registration:view', 'registration:manage',
    'receptionist:view', 'receptionist:supervise',
    'queue:view', 'queue:manage'
]);

-- Receptionist
SELECT assign_permissions_to_role('Receptionist', ARRAY[
    'patient:view', 'patient:create', 'patient:edit',
    'appointment:view', 'appointment:create', 'appointment:edit',
    'check-in:view', 'check-in:process',
    'payment:view', 'payment:collect',
    'invoice:view'
]);

-- Appointment Coordinator
SELECT assign_permissions_to_role('Appointment Coordinator', ARRAY[
    'patient:view',
    'appointment:view', 'appointment:create', 'appointment:edit', 'appointment:cancel',
    'doctor:view-schedule', 'availability:view',
    'reminder:view', 'reminder:send'
]);

-- Patient Registration Clerk
SELECT assign_permissions_to_role('Patient Registration Clerk', ARRAY[
    'patient:view', 'patient:create', 'patient:edit',
    'registration:view', 'registration:process',
    'insurance-verification:view', 'insurance-verification:initiate',
    'demographic:view', 'demographic:update'
]);

-- =====================================================
-- MEDICAL RECORDS
-- =====================================================

-- Medical Records Manager
SELECT assign_permissions_to_role('Medical Records Manager', ARRAY[
    'medical-record:view', 'medical-record:manage',
    'release-of-information:view', 'release-of-information:approve',
    'record-retention:view', 'record-retention:manage',
    'hipaa-compliance:view', 'audit-log:view'
]);

-- Medical Records Clerk
SELECT assign_permissions_to_role('Medical Records Clerk', ARRAY[
    'medical-record:view', 'medical-record:file',
    'record-request:view', 'record-request:process',
    'scanning:view', 'scanning:perform'
]);

-- Health Information Technician
SELECT assign_permissions_to_role('Health Information Technician', ARRAY[
    'medical-record:view',
    'coding:view', 'coding:perform',
    'diagnosis-code:view', 'procedure-code:view',
    'billing-code:view', 'billing-code:assign'
]);

-- Transcriptionist
SELECT assign_permissions_to_role('Transcriptionist', ARRAY[
    'dictation:view', 'dictation:transcribe',
    'clinical-note:view', 'clinical-note:create',
    'report:view', 'report:type'
]);

-- =====================================================
-- OPERATIONS & SUPPORT
-- =====================================================

-- Facility Manager
SELECT assign_permissions_to_role('Facility Manager', ARRAY[
    'facility:view', 'facility:manage',
    'maintenance:view', 'maintenance:schedule',
    'equipment:view', 'equipment:maintain',
    'vendor:view', 'vendor:manage'
]);

-- IT Administrator
SELECT assign_permissions_to_role('IT Administrator', ARRAY[
    'user:view', 'user:create', 'user:edit',
    'system-settings:view', 'system-settings:edit',
    'backup:view', 'backup:perform',
    'security:view', 'security:configure',
    'audit-log:view', 'error-log:view'
]);

-- Security Officer
SELECT assign_permissions_to_role('Security Officer', ARRAY[
    'access-control:view', 'access-control:manage',
    'incident:view', 'incident:report',
    'surveillance:view', 'visitor:view', 'visitor:manage'
]);

-- Housekeeping Supervisor
SELECT assign_permissions_to_role('Housekeeping Supervisor', ARRAY[
    'cleaning:view', 'cleaning:schedule',
    'sanitation:view', 'sanitation:audit',
    'staff:view', 'staff:supervise'
]);

-- =====================================================
-- EXTERNAL & SPECIAL ROLES
-- =====================================================

-- Vendor: Limited access
SELECT assign_permissions_to_role('Vendor', ARRAY[
    'order:view', 'invoice:view', 'payment:view'
]);

-- Consultant: Read-only clinical
SELECT assign_permissions_to_role('Consultant', ARRAY[
    'patient:view', 'clinical-note:view',
    'report:view', 'analytics:view'
]);

-- Emergency Access: Broad temporary access
SELECT assign_permissions_to_role('Emergency Access', ARRAY[
    'patient:view', 'clinical-note:view',
    'medication:view', 'allergy:view',
    'emergency:access', 'emergency:document'
]);

-- Guest User: Demo/trial access
SELECT assign_permissions_to_role('Guest User', ARRAY[
    'dashboard:view', 'demo-patient:view',
    'demo-appointment:view'
]);

-- =====================================================
-- SYSTEM ROLES
-- =====================================================

-- API Integration: API-specific permissions
SELECT assign_permissions_to_role('API Integration', ARRAY[
    'api:authenticate', 'api:read', 'api:write',
    'webhook:receive', 'webhook:send'
]);

-- Background Job: Automated task permissions
SELECT assign_permissions_to_role('Background Job', ARRAY[
    'job:execute', 'notification:send',
    'report:generate', 'cleanup:perform'
]);

-- =====================================================
-- EYE HOSPITAL SPECIFIC (similar to other doctors)
-- =====================================================

DO $$
DECLARE
    specialist_roles TEXT[] := ARRAY[
        'Lasik Surgeon', 'Low Vision Specialist', 'Orthoptist',
        'Ocular Oncologist', 'Uveitis Specialist', 'Genetic Counselor', 'Vision Therapist'
    ];
    role_name TEXT;
BEGIN
    FOREACH role_name IN ARRAY specialist_roles
    LOOP
        PERFORM assign_permissions_to_role(role_name, ARRAY[
            'patient:view', 'patient:create', 'patient:edit',
            'appointment:view', 'appointment:create',
            'clinical-examination:view', 'clinical-examination:create',
            'diagnosis:view', 'diagnosis:create',
            'treatment-plan:view', 'treatment-plan:create',
            'prescription:view', 'prescription:create',
            'referral:view', 'referral:create'
        ]);
    END LOOP;
END $$;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

DO $$
DECLARE
    v_mapping_count INTEGER;
    v_role_count INTEGER;
    v_avg_permissions NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_mapping_count FROM role_permission;
    SELECT COUNT(*) INTO v_role_count FROM "AspNetRoles";
    SELECT AVG(perm_count) INTO v_avg_permissions FROM (
        SELECT COUNT(*) as perm_count 
        FROM role_permission 
        GROUP BY role_id
    ) sub;
    
    RAISE NOTICE '✅ Created % role-permission mappings', v_mapping_count;
    RAISE NOTICE '✅ Average permissions per role: %', ROUND(v_avg_permissions, 2);
    RAISE NOTICE '✅ Total roles: %', v_role_count;
END $$;

-- Display roles with permission counts
SELECT 
    r."Name" as role_name,
    COUNT(rp.permission_id) as permission_count
FROM "AspNetRoles" r
LEFT JOIN role_permission rp ON r."Id" = rp.role_id
GROUP BY r."Name"
ORDER BY permission_count DESC
LIMIT 20;

-- Clean up helper function
DROP FUNCTION assign_permissions_to_role(VARCHAR, TEXT[]);

-- =====================================================
-- MIGRATION 03 COMPLETE
-- =====================================================
-- Next: 04_seed_test_users.sql
-- =====================================================
