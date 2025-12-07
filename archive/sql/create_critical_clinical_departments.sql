-- =============================================
-- CREATE CRITICAL CLINICAL DEPARTMENTS
-- Generated: November 11, 2025
-- Purpose: Create foundational patient care departments
-- Total: 4 Parent Departments + 14 Sub-Departments
-- =============================================
-- CRITICAL MISSING DEPARTMENTS:
--   1. Outpatient (OPD) - 3 sub-departments
--   2. Inpatient (IPD) - 7 sub-departments
--   3. Emergency/Casualty - 3 sub-departments
--   4. Operation Theatre (Central) - 1 sub-department
-- =============================================

SET app.current_tenant_id = '11111111-1111-1111-1111-111111111111';

BEGIN;

-- Get the default branch for the tenant
DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_user_id UUID := 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4';
    v_branch_id UUID;
    v_opd_parent_id UUID;
    v_ipd_parent_id UUID;
    v_emergency_parent_id UUID;
    v_ot_parent_id UUID;
BEGIN
    -- Get any branch for this tenant
    SELECT id INTO v_branch_id 
    FROM branch 
    WHERE tenant_id = v_tenant_id 
    AND deleted_at IS NULL
    LIMIT 1;
    
    IF v_branch_id IS NULL THEN
        RAISE EXCEPTION 'No branch found for tenant %', v_tenant_id;
    END IF;

    RAISE NOTICE 'Using branch_id: %', v_branch_id;

    -- ============================================
    -- 1. OUTPATIENT (OPD) DEPARTMENT
    -- ============================================
    RAISE NOTICE 'Creating Outpatient (OPD) Department...';
    
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        'OPD',
        'Outpatient Department',
        'Clinical',
        'General outpatient services and consultations',
        'Active',
        NULL,  -- Parent department
        INTERVAL '8 hours',
        INTERVAL '18 hours',
        FALSE,
        FALSE,
        NOW(), v_admin_user_id,
        NOW(), v_admin_user_id
    ) RETURNING id INTO v_opd_parent_id;

    RAISE NOTICE 'Created OPD parent (ID: %)', v_opd_parent_id;

    -- OPD Sub-Departments
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    -- 1.1 New Registration Desk
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-REG', 'New Registration Desk', 'Administrative',
        'Patient registration for first-time visits', 'Active', v_opd_parent_id,
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 1.2 Follow-Up/Review Desk
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-FOLLOWUP', 'Follow-Up Review Desk', 'Administrative',
        'Patient check-in for follow-up appointments', 'Active', v_opd_parent_id,
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 1.3 Triage / Preliminary Assessment
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'OPD-TRIAGE', 'Triage and Preliminary Assessment', 'Clinical',
        'Initial patient assessment and vital signs check', 'Active', v_opd_parent_id,
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    );

    RAISE NOTICE 'Created 3 OPD sub-departments';

    -- ============================================
    -- 2. INPATIENT (IPD) / WARD MANAGEMENT
    -- ============================================
    RAISE NOTICE 'Creating Inpatient (IPD) Department...';
    
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        'IPD',
        'Inpatient Department',
        'Clinical',
        'Inpatient care and ward management',
        'Active',
        NULL,  -- Parent department
        INTERVAL '0 hours',
        INTERVAL '24 hours',
        TRUE,  -- 24x7 operation
        FALSE,
        NOW(), v_admin_user_id,
        NOW(), v_admin_user_id
    ) RETURNING id INTO v_ipd_parent_id;

    RAISE NOTICE 'Created IPD parent (ID: %)', v_ipd_parent_id;

    -- IPD Sub-Departments
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    -- 2.1 General Ward
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-GENERAL', 'General Ward', 'Clinical',
        'General inpatient ward for standard admissions', 'Active', v_ipd_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.2 Private Room
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-PRIVATE', 'Private Room', 'Clinical',
        'Private single-occupancy patient rooms', 'Active', v_ipd_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.3 Semi-Private
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-SEMI', 'Semi-Private Room', 'Clinical',
        'Semi-private double-occupancy patient rooms', 'Active', v_ipd_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.4 ICU/Eye ICU
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-ICU', 'Eye ICU', 'Clinical',
        'Intensive care unit for critical eye conditions (adult)', 'Active', v_ipd_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, TRUE,  -- Requires approval
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.5 Day Care
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-DAYCARE', 'Day Care Ward', 'Clinical',
        'Short-stay day care for minor procedures', 'Active', v_ipd_parent_id,
        INTERVAL '8 hours', INTERVAL '18 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.6 Pre-Operative Ward
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-PREOP', 'Pre-Operative Ward', 'Surgical',
        'Pre-surgery patient preparation and holding area', 'Active', v_ipd_parent_id,
        INTERVAL '7 hours', INTERVAL '19 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 2.7 Post-Operative Ward
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'IPD-POSTOP', 'Post-Operative Ward', 'Surgical',
        'Post-surgery recovery and monitoring', 'Active', v_ipd_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    );

    RAISE NOTICE 'Created 7 IPD sub-departments';

    -- ============================================
    -- 3. EMERGENCY / CASUALTY DEPARTMENT
    -- ============================================
    RAISE NOTICE 'Creating Emergency/Casualty Department...';
    
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        'EMERGENCY',
        'Emergency and Casualty',
        'Emergency',
        '24x7 emergency eye care services',
        'Active',
        NULL,  -- Parent department
        INTERVAL '0 hours',
        INTERVAL '24 hours',
        TRUE,  -- 24x7 operation
        FALSE,
        NOW(), v_admin_user_id,
        NOW(), v_admin_user_id
    ) RETURNING id INTO v_emergency_parent_id;

    RAISE NOTICE 'Created Emergency parent (ID: %)', v_emergency_parent_id;

    -- Emergency Sub-Departments
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    -- 3.1 Eye Trauma Unit
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'EMERG-TRAUMA', 'Eye Trauma Unit', 'Emergency',
        'Specialized unit for eye trauma and injuries', 'Active', v_emergency_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 3.2 Initial Assessment Desk
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'EMERG-ASSESS', 'Initial Assessment Desk', 'Emergency',
        'Emergency patient triage and initial evaluation', 'Active', v_emergency_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    ),
    -- 3.3 Emergency OT
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'EMERG-OT', 'Emergency Operation Theatre', 'Surgical',
        'Emergency surgery facility for urgent cases', 'Active', v_emergency_parent_id,
        INTERVAL '0 hours', INTERVAL '24 hours', TRUE, TRUE,  -- Requires approval
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    );

    RAISE NOTICE 'Created 3 Emergency sub-departments';

    -- ============================================
    -- 4. OPERATION THEATRE (CENTRAL)
    -- ============================================
    RAISE NOTICE 'Creating Central Operation Theatre Department...';
    
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_branch_id,
        'OT-CENTRAL',
        'Operation Theatre (Central)',
        'Surgical',
        'Central operation theatre management',
        'Active',
        NULL,  -- Parent department
        INTERVAL '7 hours',
        INTERVAL '19 hours',
        FALSE,
        TRUE,  -- Requires approval
        NOW(), v_admin_user_id,
        NOW(), v_admin_user_id
    ) RETURNING id INTO v_ot_parent_id;

    RAISE NOTICE 'Created OT Central parent (ID: %)', v_ot_parent_id;

    -- OT Sub-Department (Anesthesia Unit)
    INSERT INTO department (
        id, tenant_id, branch_id, department_code, department_name, department_type,
        description, status, parent_department_id,
        operating_hours_start, operating_hours_end, is_24x7, requires_approval,
        created_at, created_by, updated_at, updated_by
    ) VALUES 
    -- 4.1 Anesthesia Unit
    (
        gen_random_uuid(), v_tenant_id, v_branch_id, 'OT-ANESTH', 'Anesthesia Unit', 'Surgical',
        'Anesthesia services and pre-anesthetic evaluation', 'Active', v_ot_parent_id,
        INTERVAL '7 hours', INTERVAL '19 hours', FALSE, FALSE,
        NOW(), v_admin_user_id, NOW(), v_admin_user_id
    );

    RAISE NOTICE 'Created 1 OT Central sub-department';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREATION COMPLETE!';
    RAISE NOTICE 'Total Parent Departments Created: 4';
    RAISE NOTICE 'Total Sub-Departments Created: 14';
    RAISE NOTICE '========================================';

END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show newly created parent departments
SELECT 
    department_code,
    department_name,
    department_type,
    is_24x7,
    status
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND department_code IN ('OPD', 'IPD', 'EMERGENCY', 'OT-CENTRAL')
    AND deleted_at IS NULL
ORDER BY department_code;

-- Show all sub-departments created under new parents
SELECT 
    p.department_name as parent_department,
    d.department_code,
    d.department_name as sub_department,
    d.department_type,
    d.is_24x7,
    d.requires_approval,
    d.status
FROM department d
JOIN department p ON d.parent_department_id = p.id
WHERE d.tenant_id = '11111111-1111-1111-1111-111111111111'
    AND p.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'OT-CENTRAL')
    AND d.deleted_at IS NULL
ORDER BY p.department_name, d.department_code;

-- Summary count
SELECT 
    'Parent Departments' as category,
    COUNT(*) as count
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND department_code IN ('OPD', 'IPD', 'EMERGENCY', 'OT-CENTRAL')
    AND deleted_at IS NULL
UNION ALL
SELECT 
    'Sub-Departments' as category,
    COUNT(*) as count
FROM department d
JOIN department p ON d.parent_department_id = p.id
WHERE d.tenant_id = '11111111-1111-1111-1111-111111111111'
    AND p.department_code IN ('OPD', 'IPD', 'EMERGENCY', 'OT-CENTRAL')
    AND d.deleted_at IS NULL;

-- Total department count after creation
SELECT 
    COUNT(CASE WHEN parent_department_id IS NULL THEN 1 END) as total_parent_departments,
    COUNT(CASE WHEN parent_department_id IS NOT NULL THEN 1 END) as total_sub_departments,
    COUNT(*) as total_departments
FROM department
WHERE tenant_id = '11111111-1111-1111-1111-111111111111'
    AND deleted_at IS NULL;
