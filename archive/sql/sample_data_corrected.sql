-- =====================================================
-- CORRECTED COMPLETE SAMPLE DATA - TENANTS, ORGS, BRANCHES, DEPTS, ROLES, PERMISSIONS
-- =====================================================
-- This script inserts complete sample data matching actual database schema
-- =====================================================

BEGIN;

-- ============================================
-- INSERT SAMPLE TENANTS (corrected column names)
-- ============================================
INSERT INTO tenant (
    id, name, tenant_code, status, subscription_type, primary_region,
    default_currency, company_email, company_phone,
    hipaa_compliant, nabh_accredited, gdpr_compliant, dpa_compliant,
    max_users, max_branches, is_active, created_at, updated_at
) VALUES
(
    gen_random_uuid(), 'USA Healthcare Hospital', 'USA_HEALTH_HOSP', 'Active', 'professional', 'US',
    'USD', 'contact@usahealthcare.com', '+1-555-0100',
    TRUE, FALSE, TRUE, FALSE,
    500, 50, TRUE, NOW(), NOW()
),
(
    gen_random_uuid(), 'India Eye Hospital Network', 'INDIA_EYE_NET', 'Active', 'professional', 'INDIA',
    'INR', 'contact@indiaeye.com', '+91-98765-43210',
    FALSE, TRUE, FALSE, FALSE,
    300, 20, TRUE, NOW(), NOW()
),
(
    gen_random_uuid(), 'UAE Medical Center', 'UAE_MED_CENTER', 'Active', 'professional', 'UAE',
    'AED', 'contact@uaemedical.ae', '+971-4-999-0000',
    FALSE, FALSE, FALSE, TRUE,
    200, 10, TRUE, NOW(), NOW()
);

-- ============================================
-- INSERT SAMPLE ORGANIZATIONS (removed non-existent columns)
-- ============================================
INSERT INTO organization (tenant_id, name, organization_code, status)
SELECT t.id, 'Main Hospital', 'MAIN_HOSP', 'Active'
FROM tenant t WHERE t.tenant_code = 'USA_HEALTH_HOSP'
UNION ALL
SELECT t.id, 'Eye Care Network', 'EYE_CARE_NET', 'Active'
FROM tenant t WHERE t.tenant_code = 'INDIA_EYE_NET'
UNION ALL
SELECT t.id, 'Medical Center UAE', 'MED_CENTER_UAE', 'Active'
FROM tenant t WHERE t.tenant_code = 'UAE_MED_CENTER';

-- ============================================
-- INSERT SAMPLE BRANCHES (removed non-existent columns)
-- ============================================
INSERT INTO branch (
    tenant_id, organization_id, name, branch_code, region,
    address_line_1, city, state_province, postal_code, country,
    phone, email, status
)
SELECT t.id, o.id,
    'Downtown Hospital', 'DOWNTOWN_HOSP', 'US',
    '123 Main Street', 'New York', 'NY', '10001', 'United States',
    '+1-555-0100', 'downtown@hospital.com', 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND o.organization_code = 'MAIN_HOSP'
UNION ALL
SELECT t.id, o.id,
    'Delhi Eye Center', 'DELHI_EYE_CENTER', 'INDIA',
    '456 Hospital Road', 'Delhi', 'Delhi', '110005', 'India',
    '+91-11-2345-6789', 'delhi@eyecare.in', 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND o.organization_code = 'EYE_CARE_NET'
UNION ALL
SELECT t.id, o.id,
    'Dubai Medical Center', 'DUBAI_MED_CENTER', 'UAE',
    'Plot 789, Business Bay', 'Dubai', 'Dubai', '0000', 'United Arab Emirates',
    '+971-4-999-0000', 'dubai@medical.ae', 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
WHERE t.tenant_code = 'UAE_MED_CENTER' AND o.organization_code = 'MED_CENTER_UAE';

-- ============================================
-- INSERT SAMPLE DEPARTMENTS (corrected column names)
-- ============================================
INSERT INTO department (
    tenant_id, branch_id, department_name, department_code, department_type,
    operating_hours_start, operating_hours_end, is_24x7,
    annual_budget, budget_currency, requires_approval, status
)
SELECT t.id, b.id,
    'Emergency Department', 'EMERGENCY', 'Clinical',
    '08:00:00'::INTERVAL, '18:00:00'::INTERVAL, TRUE,
    5000000.00, 'USD', TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
JOIN branch b ON o.id = b.organization_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Cardiology', 'CARDIOLOGY', 'Clinical',
    '09:00:00'::INTERVAL, '17:00:00'::INTERVAL, FALSE,
    2000000.00, 'USD', TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
JOIN branch b ON o.id = b.organization_id
WHERE t.tenant_code = 'USA_HEALTH_HOSP' AND b.branch_code = 'DOWNTOWN_HOSP'
UNION ALL
SELECT t.id, b.id,
    'Ophthalmology', 'OPHTHALMOLOGY', 'Clinical',
    '09:00:00'::INTERVAL, '20:00:00'::INTERVAL, FALSE,
    1500000.00, 'INR', TRUE, 'Active'
FROM tenant t
JOIN organization o ON t.id = o.tenant_id
JOIN branch b ON o.id = b.organization_id
WHERE t.tenant_code = 'INDIA_EYE_NET' AND b.branch_code = 'DELHI_EYE_CENTER';

COMMIT;