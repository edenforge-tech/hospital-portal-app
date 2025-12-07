-- =====================================================
-- COMPLETE SAMPLE DATA - TENANTS, ORGS, BRANCHES, DEPTS, ROLES, PERMISSIONS
-- =====================================================
-- This script inserts complete sample data matching actual schema
-- =====================================================

BEGIN;

-- ============================================
-- INSERT SAMPLE TENANTS (uses 'name', not 'tenant_name')
-- ============================================
INSERT INTO tenant (
    name, tenant_code, status, tier, primary_region, 
    regions_supported, default_currency, supported_currencies,
    default_language, supported_languages, company_email, company_phone,
    hipaa_compliant, nabh_accredited, dpa_compliant,
    subscription_start_date, subscription_end_date, max_users, max_branches
) VALUES
(
    'USA Healthcare Hospital', 'USA_HEALTH_HOSP', 'Active', 'professional', 'US',
    ARRAY['US'], 'USD', ARRAY['USD'],
    'en', ARRAY['en'], 'contact@usahealthcare.com', '+1-555-0100',
    TRUE, FALSE, FALSE,
    '2025-01-01'::DATE, '2026-12-31'::DATE, 500, 50
),
(
    'India Eye Hospital Network', 'INDIA_EYE_NET', 'Active', 'professional', 'INDIA',
    ARRAY['INDIA'], 'INR', ARRAY['INR', 'USD'],
    'en', ARRAY['en', 'hi'], 'contact@indiaeye.com', '+91-98765-43210',
    FALSE, TRUE, FALSE,
    '2025-01-01'::DATE, '2026-12-31'::DATE, 300, 20
),
(
    'UAE Medical Center', 'UAE_MED_CENTER', 'Active', 'professional', 'UAE',
    ARRAY['UAE'], 'AED', ARRAY['AED', 'USD'],
    'en', ARRAY['en', 'ar'], 'contact@uaemedical.ae', '+971-4-999-0000',
    FALSE, FALSE, TRUE,
    '2025-01-01'::DATE, '2026-12-31'::DATE, 200, 10
)
ON CONFLICT (tenant_code) DO NOTHING;

-- ============================================
-- INSERT SAMPLE ORGANIZATIONS
-- ============================================
INSERT INTO organization (tenant_id, name, organization_code, organization_type, description, status)
SELECT t.id, 'Main Hospital', 'MAIN_HOSP', 'Hospital', 'Primary hospital organization', 'Active'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Eye Care Network', 'EYE_CARE_NET', 'Chain', 'Multi-branch eye care network', 'Active'
FROM tenant t WHERE t.tenant_code = 'INDIA_EYE_NET'
UNION ALL
SELECT t.id, 'Medical Center UAE', 'MED_CENTER_UAE', 'Hospital', 'Primary medical center', 'Active'
FROM tenant t WHERE t.tenant_code = 'UAE_MED_CENTER'
ON CONFLICT (organization_code) DO NOTHING;

-- ============================================
-- INSERT SAMPLE BRANCHES
-- ============================================
INSERT INTO branch (
    tenant_id, organization_id, name, branch_code, region, timezone,
    currency_code, language_primary, address_line_1, city, state_province,
    postal_code, country, phone, email, operational_hours_start,
    operational_hours_end, emergency_support_24_7, status
)
SELECT t.id, o.id, 
    'Downtown Hospital', 'DOWNTOWN_HOSP', 'US', 'America/New_York',
    'USD', 'en', '123 Main Street', 'New York', 'NY',
    '10001', 'United States', '+1-555-0100', 'downtown@hospital.com',
    '08:00'::TIME, '18:00'::TIME, TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND o.organization_code = 'MAIN_HOSP'
UNION ALL
SELECT t.id, o.id,
    'Delhi Eye Center', 'DELHI_EYE_CENTER', 'INDIA', 'Asia/Kolkata',
    'INR', 'en', '456 Hospital Road', 'Delhi', 'Delhi',
    '110005', 'India', '+91-11-2345-6789', 'delhi@eyecare.in',
    '09:00'::TIME, '20:00'::TIME, TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND o.organization_code = 'EYE_CARE_NET'
UNION ALL
SELECT t.id, o.id,
    'Dubai Medical Center', 'DUBAI_MED_CENTER', 'UAE', 'Asia/Dubai',
    'AED', 'en', 'Plot 789, Business Bay', 'Dubai', 'Dubai',
    '0000', 'United Arab Emirates', '+971-4-999-0000', 'dubai@medical.ae',
    '07:00'::TIME, '19:00'::TIME, TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'UAE_MED_CENTER' AND o.organization_code = 'MED_CENTER_UAE'
ON CONFLICT (organization_id, branch_code) DO NOTHING;

-- ============================================
-- INSERT SAMPLE DEPARTMENTS (USA)
-- ============================================
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type,
    working_hours_start, working_hours_end, requires_approval_workflow,
    annual_budget, currency, status
)
SELECT t.id, b.id,
    'Ophthalmology', 'OPHTHALMOLOGY', 'Clinical',
    '08:00'::TIME, '18:00'::TIME, TRUE,
    500000.00, 'USD', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Optometry', 'OPTOMETRY', 'Clinical',
    '08:00'::TIME, '18:00'::TIME, FALSE,
    300000.00, 'USD', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Pharmacy', 'PHARMACY', 'Support',
    '08:00'::TIME, '20:00'::TIME, FALSE,
    200000.00, 'USD', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Front Office', 'FRONT_OFFICE', 'Administrative',
    '08:00'::TIME, '18:00'::TIME, FALSE,
    150000.00, 'USD', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Billing', 'BILLING', 'Financial',
    '09:00'::TIME, '17:00'::TIME, FALSE,
    250000.00, 'USD', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
ON CONFLICT (branch_id, department_code) DO NOTHING;

-- ============================================
-- INSERT SAMPLE DEPARTMENTS (INDIA)
-- ============================================
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type,
    working_hours_start, working_hours_end, requires_approval_workflow,
    annual_budget, currency, status
)
SELECT t.id, b.id,
    'Ophthalmology', 'OPHTHALMOLOGY_IN', 'Clinical',
    '09:00'::TIME, '20:00'::TIME, TRUE,
    3000000.00, 'INR', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND b.branch_code = 'DELHI_EYE_CENTER'
UNION ALL
SELECT t.id, b.id,
    'Front Office', 'FRONT_OFFICE_IN', 'Administrative',
    '09:00'::TIME, '20:00'::TIME, FALSE,
    1000000.00, 'INR', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND b.branch_code = 'DELHI_EYE_CENTER'
UNION ALL
SELECT t.id, b.id,
    'Laboratory', 'LABORATORY_IN', 'Laboratory',
    '08:00'::TIME, '19:00'::TIME, FALSE,
    2000000.00, 'INR', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND b.branch_code = 'DELHI_EYE_CENTER'
UNION ALL
SELECT t.id, b.id,
    'Imaging', 'IMAGING_IN', 'Imaging',
    '08:00'::TIME, '19:00'::TIME, FALSE,
    2500000.00, 'INR', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND b.branch_code = 'DELHI_EYE_CENTER'
ON CONFLICT (branch_id, department_code) DO NOTHING;

-- ============================================
-- INSERT SAMPLE DEPARTMENTS (UAE)
-- ============================================
INSERT INTO department (
    tenant_id, branch_id, name, department_code, department_type,
    working_hours_start, working_hours_end, requires_approval_workflow,
    annual_budget, currency, status
)
SELECT t.id, b.id,
    'Emergency', 'EMERGENCY_UAE', 'Emergency',
    '00:00'::TIME, '23:59'::TIME, FALSE,
    500000.00, 'AED', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'UAE_MED_CENTER' AND b.branch_code = 'DUBAI_MED_CENTER'
UNION ALL
SELECT t.id, b.id,
    'Pharmacy', 'PHARMACY_UAE', 'Pharmacy',
    '07:00'::TIME, '19:00'::TIME, FALSE,
    300000.00, 'AED', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'UAE_MED_CENTER' AND b.branch_code = 'DUBAI_MED_CENTER'
UNION ALL
SELECT t.id, b.id,
    'Billing', 'BILLING_UAE', 'Financial',
    '07:00'::TIME, '19:00'::TIME, FALSE,
    400000.00, 'AED', 'Active'
FROM tenant t
JOIN branch b ON t.id = b.tenant_id
WHERE t.tenant_code = 'UAE_MED_CENTER' AND b.branch_code = 'DUBAI_MED_CENTER'
ON CONFLICT (branch_id, department_code) DO NOTHING;

-- ============================================
-- INSERT SYSTEM ROLES (20 Roles per tenant)
-- SKIPPED - Roles already exist from previous script execution
-- ============================================
/*
INSERT INTO roles (
    id, tenant_id, name, "NormalizedName", role_code, "Description", "RoleLevel", role_type, 
    role_category, scope_level, status, "IsSystemRole", is_deletable, "IsActive", "CreatedAt", "UpdatedAt"
)
SELECT gen_random_uuid(), t.id, 
    'System Admin - ' || t.name, 
    UPPER('SYSTEM ADMIN - ' || t.name), 
    t.tenant_code || '_system_admin', 
    'Full system access', 100, 'system', 'administrative', 'global', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Hospital Administrator - ' || t.name, 
    UPPER('HOSPITAL ADMINISTRATOR - ' || t.name), 
    t.tenant_code || '_hospital_admin', 
    'Hospital-wide administration', 90, 'system', 'administrative', 'organization', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Finance Manager - ' || t.name, 
    UPPER('FINANCE MANAGER - ' || t.name), 
    t.tenant_code || '_finance_manager', 
    'Financial management', 80, 'system', 'finance', 'organization', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'HR Manager - ' || t.name, 
    UPPER('HR MANAGER - ' || t.name), 
    t.tenant_code || '_hr_manager', 
    'Human resources management', 80, 'system', 'hr', 'organization', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'IT Manager - ' || t.name, 
    UPPER('IT MANAGER - ' || t.name), 
    t.tenant_code || '_it_manager', 
    'Information technology management', 80, 'system', 'it', 'organization', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Quality Manager - ' || t.name, 
    UPPER('QUALITY MANAGER - ' || t.name), 
    t.tenant_code || '_quality_manager', 
    'Quality and compliance management', 80, 'system', 'administrative', 'organization', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Doctor - ' || t.name, 
    UPPER('DOCTOR - ' || t.name), 
    t.tenant_code || '_doctor', 
    'Medical doctor role', 70, 'system', 'clinical', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Optometrist - ' || t.name, 
    UPPER('OPTOMETRIST - ' || t.name), 
    t.tenant_code || '_optometrist', 
    'Optometry specialist', 70, 'system', 'clinical', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Nurse - ' || t.name, 
    UPPER('NURSE - ' || t.name), 
    t.tenant_code || '_nurse', 
    'Nursing staff', 60, 'system', 'clinical', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Pharmacist - ' || t.name, 
    UPPER('PHARMACIST - ' || t.name), 
    t.tenant_code || '_pharmacist', 
    'Pharmacy staff', 60, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Technician - ' || t.name, 
    UPPER('TECHNICIAN - ' || t.name), 
    t.tenant_code || '_technician', 
    'Medical technician', 50, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Receptionist - ' || t.name, 
    UPPER('RECEPTIONIST - ' || t.name), 
    t.tenant_code || '_receptionist', 
    'Front office reception', 40, 'system', 'administrative', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Counselor - ' || t.name, 
    UPPER('COUNSELOR - ' || t.name), 
    t.tenant_code || '_counselor', 
    'Patient counselor', 50, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Admin Staff - ' || t.name, 
    UPPER('ADMIN STAFF - ' || t.name), 
    t.tenant_code || '_admin_staff', 
    'Administrative support', 40, 'system', 'administrative', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Finance Officer - ' || t.name, 
    UPPER('FINANCE OFFICER - ' || t.name), 
    t.tenant_code || '_finance_officer', 
    'Finance operations', 50, 'system', 'finance', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Department Head - ' || t.name, 
    UPPER('DEPARTMENT HEAD - ' || t.name), 
    t.tenant_code || '_department_head', 
    'Department leadership', 75, 'system', 'administrative', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Lab Manager - ' || t.name, 
    UPPER('LAB MANAGER - ' || t.name), 
    t.tenant_code || '_lab_manager', 
    'Laboratory operations', 65, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Ward Manager - ' || t.name, 
    UPPER('WARD MANAGER - ' || t.name), 
    t.tenant_code || '_ward_manager', 
    'Ward/IPD operations', 65, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'OT Manager - ' || t.name, 
    UPPER('OT MANAGER - ' || t.name), 
    t.tenant_code || '_ot_manager', 
    'Operating theatre operations', 70, 'system', 'support', 'department', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 
    'Patient - ' || t.name, 
    UPPER('PATIENT - ' || t.name), 
    t.tenant_code || '_patient', 
    'Patient role', 10, 'system', 'clinical', 'global', 'active', TRUE, FALSE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
    AND NOT EXISTS (
        SELECT 1 FROM roles r WHERE r.role_code = t.tenant_code || '_system_admin'
    );
*/

-- ============================================
-- INSERT SAMPLE PERMISSIONS (30 Core Permissions)
-- Uses PascalCase columns: TenantId, Code, Name, etc.
-- ============================================
INSERT INTO permissions (
    id, "TenantId", "Name", "Code", "Description", "Module", module_name,
    resource_name, "Action", scope, data_classification, is_system_permission, 
    "IsActive", status, "CreatedAt"
)
SELECT gen_random_uuid(), t.id, 'Create Patient Record', 'PATIENT.PATIENT_RECORD.CREATE', 'Create new patient record', 'Patient', 'patient', 'patient_record', 'create', 'global', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Patient Record', 'PATIENT.PATIENT_RECORD.READ', 'Read patient record', 'Patient', 'patient', 'patient_record', 'read', 'global', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Update Patient Record', 'PATIENT.PATIENT_RECORD.UPDATE', 'Update patient record', 'Patient', 'patient', 'patient_record', 'update', 'own_records_only', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Delete Patient Record', 'PATIENT.PATIENT_RECORD.DELETE', 'Delete patient record', 'Patient', 'patient', 'patient_record', 'delete', 'own_records_only', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Upload Patient Document', 'PATIENT.PATIENT_DOCUMENT.UPLOAD', 'Upload patient document', 'Patient', 'patient', 'patient_document', 'upload', 'own_records_only', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Patient Document', 'PATIENT.PATIENT_DOCUMENT.READ', 'Read patient document', 'Patient', 'patient', 'patient_document', 'read', 'global', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Create Clinical Assessment', 'CLINICAL.ASSESSMENT.CREATE', 'Create clinical assessment', 'Clinical', 'clinical', 'assessment', 'create', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Clinical Assessment', 'CLINICAL.ASSESSMENT.READ', 'Read clinical assessment', 'Clinical', 'clinical', 'assessment', 'read', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Update Clinical Assessment', 'CLINICAL.ASSESSMENT.UPDATE', 'Update clinical assessment', 'Clinical', 'clinical', 'assessment', 'update', 'own_records_only', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Create Prescription', 'PHARMACY.PRESCRIPTION.CREATE', 'Create prescription', 'Pharmacy', 'pharmacy', 'prescription', 'create', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Prescription', 'PHARMACY.PRESCRIPTION.READ', 'Read prescription', 'Pharmacy', 'pharmacy', 'prescription', 'read', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Update Prescription', 'PHARMACY.PRESCRIPTION.UPDATE', 'Update prescription', 'Pharmacy', 'pharmacy', 'prescription', 'update', 'own_records_only', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Create Lab Order', 'LABORATORY.TEST_ORDER.CREATE', 'Create lab test order', 'Laboratory', 'laboratory', 'test_order', 'create', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Lab Result', 'LABORATORY.TEST_RESULT.READ', 'Read lab test result', 'Laboratory', 'laboratory', 'test_result', 'read', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Create Appointment', 'APPOINTMENT.APPOINTMENT.CREATE', 'Create appointment', 'Appointment', 'appointment', 'appointment', 'create', 'department', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Appointment', 'APPOINTMENT.APPOINTMENT.READ', 'Read appointment', 'Appointment', 'appointment', 'appointment', 'read', 'department', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Create Invoice', 'BILLING.INVOICE.CREATE', 'Create billing invoice', 'Billing', 'billing', 'invoice', 'create', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Invoice', 'BILLING.INVOICE.READ', 'Read billing invoice', 'Billing', 'billing', 'invoice', 'read', 'department', 'confidential', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Manage Users', 'ADMIN.USER_MANAGEMENT.CREATE', 'Create new users', 'Admin', 'admin', 'user_management', 'create', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Users', 'ADMIN.USER_MANAGEMENT.READ', 'Read user information', 'Admin', 'admin', 'user_management', 'read', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Update Users', 'ADMIN.USER_MANAGEMENT.UPDATE', 'Update user information', 'Admin', 'admin', 'user_management', 'update', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Manage Roles', 'ADMIN.ROLE_MANAGEMENT.CREATE', 'Create roles', 'Admin', 'admin', 'role_management', 'create', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Roles', 'ADMIN.ROLE_MANAGEMENT.READ', 'Read role information', 'Admin', 'admin', 'role_management', 'read', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Update Roles', 'ADMIN.ROLE_MANAGEMENT.UPDATE', 'Update role information', 'Admin', 'admin', 'role_management', 'update', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Manage Permissions', 'ADMIN.PERMISSION_MANAGEMENT.CREATE', 'Create permissions', 'Admin', 'admin', 'permission_management', 'create', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Read Permissions', 'ADMIN.PERMISSION_MANAGEMENT.READ', 'Read permission information', 'Admin', 'admin', 'permission_management', 'read', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'View Audit Logs', 'ADMIN.AUDIT_LOG.READ', 'Read audit logs', 'Admin', 'admin', 'audit_log', 'read', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'Export Reports', 'REPORT.REPORT.EXPORT', 'Export reports', 'Report', 'report', 'report', 'export', 'department', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'System Configuration', 'ADMIN.SYSTEM_CONFIGURATION.READ', 'Read system configuration', 'Admin', 'admin', 'system_configuration', 'read', 'organization', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT gen_random_uuid(), t.id, 'View Dashboard', 'ADMIN.DASHBOARD.READ', 'View dashboard', 'Admin', 'admin', 'dashboard', 'read', 'global', 'internal', TRUE, TRUE, 'active', CURRENT_TIMESTAMP
FROM tenant t WHERE t.tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
ON CONFLICT ("TenantId", "Code") DO NOTHING;

COMMIT;

-- ============================================
-- DISPLAY SUMMARY
-- ============================================
SELECT 'Tenants' as Entity, COUNT(*) as Total FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER')
UNION ALL
SELECT 'Organizations', COUNT(*) FROM organization WHERE tenant_id IN (SELECT id FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER'))
UNION ALL
SELECT 'Branches', COUNT(*) FROM branch WHERE tenant_id IN (SELECT id FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER'))
UNION ALL
SELECT 'Departments', COUNT(*) FROM department WHERE tenant_id IN (SELECT id FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER'))
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles WHERE tenant_id IN (SELECT id FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER'))
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions WHERE "TenantId" IN (SELECT id FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER'));

-- Show sample data
SELECT 'SAMPLE TENANTS:' as info;
SELECT name, tenant_code, tier, primary_region, status FROM tenant WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER');

SELECT 'SAMPLE ROLES (per tenant):' as info;
SELECT r.role_code, r.name, r."RoleLevel", t.name as tenant 
FROM roles r 
JOIN tenant t ON r.tenant_id = t.id 
WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ORDER BY r."RoleLevel" DESC
LIMIT 10;

SELECT 'SAMPLE PERMISSIONS (per tenant):' as info;
SELECT p."Code", p."Name", p.module_name, t.name as tenant 
FROM permissions p 
JOIN tenant t ON p."TenantId" = t.id 
WHERE t.tenant_code = 'USA_HEALTH_HOSP'
ORDER BY p."Code"
LIMIT 10;
